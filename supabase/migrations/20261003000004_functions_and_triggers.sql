-- ============================================================================
-- DAVE TECHS ACADEMY — MIGRATION 04: FUNCTIONS, TRIGGERS & PROCEDURES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUTOMATIC PROFILE CREATION ON USER SIGNUP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role_enum := 'student';
BEGIN
  -- Super admin bootstrap check if needed
  IF NEW.email = 'admin@davetechs.com' THEN
    v_role := 'super_admin';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    v_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();

  -- Create affiliate profile for the user
  INSERT INTO public.affiliate_profiles (
    user_id,
    referral_code,
    commission_rate_percentage,
    created_at
  )
  VALUES (
    NEW.id,
    UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8)),
    10.00,
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to hook into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. ATOMIC ENROLLMENT FULFILLMENT ON VERIFIED PAYMENT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fulfill_enrollment_on_payment(
  p_payment_reference TEXT,
  p_paystack_tx_id TEXT DEFAULT NULL,
  p_channel TEXT DEFAULT 'card'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_application RECORD;
  v_course RECORD;
  v_enrollment_id UUID;
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_affiliate_id UUID;
  v_commission_amount NUMERIC(12,2);
BEGIN
  -- 1. Lock and fetch payment record
  SELECT * INTO v_payment
  FROM public.payments
  WHERE payment_reference = p_payment_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment reference % not found.', p_payment_reference;
  END IF;

  -- 2. Fetch associated application
  SELECT * INTO v_application
  FROM public.applications
  WHERE id = v_payment.application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application associated with payment % not found.', p_payment_reference;
  END IF;

  -- 3. Fetch course details for authoritative confirmation
  SELECT * INTO v_course
  FROM public.courses
  WHERE id = v_application.course_id;

  -- 4. Mark payment as successful
  UPDATE public.payments
  SET 
    status = 'successful',
    paystack_transaction_id = COALESCE(p_paystack_tx_id, paystack_transaction_id),
    channel = COALESCE(p_channel, channel),
    paid_at = COALESCE(paid_at, NOW()),
    verified_at = NOW()
  WHERE id = v_payment.id;

  -- 5. Update application status
  UPDATE public.applications
  SET 
    status = 'enrolled',
    payment_status = 'successful',
    updated_at = NOW()
  WHERE id = v_application.id;

  -- 6. Check if enrollment already exists (Idempotent check)
  SELECT id INTO v_enrollment_id
  FROM public.enrollments
  WHERE (student_id = v_application.user_id AND course_id = v_application.course_id)
     OR application_id = v_application.id;

  IF v_enrollment_id IS NULL THEN
    -- Create new enrollment
    INSERT INTO public.enrollments (
      student_id,
      course_id,
      application_id,
      payment_id,
      branch_id,
      cohort_id,
      status,
      progress_percentage,
      enrolled_at,
      created_at
    )
    VALUES (
      v_application.user_id,
      v_application.course_id,
      v_application.id,
      v_payment.id,
      v_application.branch_id,
      v_application.cohort_id,
      'enrolled',
      0.00,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_enrollment_id;

    -- Increment cohort enrolled count if attached
    IF v_application.cohort_id IS NOT NULL THEN
      UPDATE public.cohorts
      SET enrolled_count = enrolled_count + 1
      WHERE id = v_application.cohort_id;
    END IF;
  END IF;

  -- 7. Generate invoice (Idempotent)
  SELECT id INTO v_invoice_id
  FROM public.invoices
  WHERE payment_id = v_payment.id;

  IF v_invoice_id IS NULL THEN
    v_invoice_number := 'DTA-INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    INSERT INTO public.invoices (
      invoice_number,
      application_id,
      payment_id,
      user_id,
      course_id,
      amount_paid,
      total_amount,
      status,
      issued_date,
      created_at
    )
    VALUES (
      v_invoice_number,
      v_application.id,
      v_payment.id,
      v_application.user_id,
      v_application.course_id,
      v_payment.amount,
      v_payment.amount,
      'paid',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_invoice_id;
  END IF;

  -- 8. Create in-app notification for the student
  IF v_application.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      link,
      created_at
    )
    VALUES (
      v_application.user_id,
      'Enrollment Confirmed: ' || v_course.title,
      'Your payment of ₦' || TO_CHAR(v_payment.amount, 'FM999,999,999.00') || ' was verified. Welcome to Dave Techs Academy!',
      'payment',
      '/dashboard/courses',
      NOW()
    );
  END IF;

  -- 9. Check referral tracking & credit affiliate commission
  IF v_application.referral_code IS NOT NULL THEN
    SELECT id INTO v_affiliate_id
    FROM public.affiliate_profiles
    WHERE referral_code = v_application.referral_code
      AND user_id != v_application.user_id; -- Prevent self-referral

    IF v_affiliate_id IS NOT NULL THEN
      v_commission_amount := ROUND((v_payment.amount * 0.10), 2);

      INSERT INTO public.affiliate_commissions (
        affiliate_id,
        payment_id,
        enrollment_id,
        commission_amount,
        status,
        created_at
      )
      VALUES (
        v_affiliate_id,
        v_payment.id,
        v_enrollment_id,
        v_commission_amount,
        'approved',
        NOW()
      )
      ON CONFLICT DO NOTHING;

      UPDATE public.affiliate_profiles
      SET 
        total_earnings = total_earnings + v_commission_amount,
        pending_earnings = pending_earnings + v_commission_amount
      WHERE id = v_affiliate_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'enrollment_id', v_enrollment_id,
    'payment_reference', p_payment_reference,
    'invoice_number', v_invoice_number,
    'status', 'enrolled'
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. TIMESTAMP REFRESH TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_courses_timestamp
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_applications_timestamp
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
