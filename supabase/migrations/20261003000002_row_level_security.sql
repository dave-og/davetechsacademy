-- ============================================================================
-- DAVE TECHS ACADEMY — MIGRATION 02: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper functions to verify user roles without infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'instructor'
  );
$$;

-- Enable RLS across all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- PUBLIC CATALOG POLICIES (Courses, Categories, Branches, Cohorts, Instructors)
-- ----------------------------------------------------------------------------
CREATE POLICY "Public read for active branches"
  ON public.branches FOR SELECT
  TO public
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage branches"
  ON public.branches FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read for course categories"
  ON public.course_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage course categories"
  ON public.course_categories FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read for instructors"
  ON public.instructors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage instructors"
  ON public.instructors FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read for active courses"
  ON public.courses FOR SELECT
  TO public
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read for course modules"
  ON public.course_modules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage course modules"
  ON public.course_modules FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read for free preview lessons"
  ON public.course_lessons FOR SELECT
  TO public
  USING (
    is_free_preview = true
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.student_id = auth.uid()
        AND enrollments.course_id = course_lessons.course_id
        AND enrollments.status IN ('enrolled', 'active', 'completed')
    )
  );

CREATE POLICY "Admin manage course lessons"
  ON public.course_lessons FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read for cohorts"
  ON public.cohorts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage cohorts"
  ON public.cohorts FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- APPLICATIONS & EMERGENCY CONTACTS
-- ----------------------------------------------------------------------------
CREATE POLICY "Applicants can create applications"
  ON public.applications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users view their own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users update their own applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Public create emergency contacts"
  ON public.emergency_contacts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users view their application emergency contacts"
  ON public.emergency_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = emergency_contacts.application_id
        AND (applications.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ----------------------------------------------------------------------------
-- PAYMENTS & INVOICES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin manage payments and invoices"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin manage payment events"
  ON public.payment_events FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- ENROLLMENTS & LMS
-- ----------------------------------------------------------------------------
CREATE POLICY "Students view their own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin() OR public.is_instructor());

CREATE POLICY "Students manage their lesson progress"
  ON public.lesson_progress FOR ALL
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin())
  WITH CHECK (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Enrolled students view assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR public.is_instructor()
    OR EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.student_id = auth.uid()
        AND enrollments.course_id = assignments.course_id
    )
  );

CREATE POLICY "Admin and instructors manage assignments"
  ON public.assignments FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "Students view and submit their own assignment submissions"
  ON public.assignment_submissions FOR ALL
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin() OR public.is_instructor())
  WITH CHECK (student_id = auth.uid() OR public.is_admin() OR public.is_instructor());

CREATE POLICY "Students view their attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR public.is_admin() OR public.is_instructor());

CREATE POLICY "Instructors and admin manage attendance"
  ON public.attendance FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_instructor());

-- ----------------------------------------------------------------------------
-- CERTIFICATES
-- ----------------------------------------------------------------------------
CREATE POLICY "Public verification of certificates"
  ON public.certificates FOR SELECT
  TO public
  USING (is_revoked = false);

CREATE POLICY "Public can log certificate verifications"
  ON public.certificate_verifications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin manage certificates"
  ON public.certificates FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- AFFILIATE & REFERRALS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users view own affiliate profile"
  ON public.affiliate_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Affiliates view their referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_profiles
      WHERE affiliate_profiles.id = referrals.affiliate_id
        AND (affiliate_profiles.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Affiliates view their commissions"
  ON public.affiliate_commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_profiles
      WHERE affiliate_profiles.id = affiliate_commissions.affiliate_id
        AND (affiliate_profiles.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS, CRM & ANALYTICS
-- ----------------------------------------------------------------------------
CREATE POLICY "Users view and manage their notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Public can create CRM lead contacts"
  ON public.crm_contacts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin manage CRM contacts and logs"
  ON public.crm_contacts FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin manage communication logs"
  ON public.communication_logs FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public and authenticated can submit analytics events"
  ON public.analytics_events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin view analytics telemetry"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.is_admin());
