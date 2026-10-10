-- ============================================================================
-- DAVE TECHS ACADEMY — COMPLETE PRODUCTION DATABASE SETUP & SEED
-- Project: mmbsjkcnmjrrzgvykeqk
-- Description: Consolidated, idempotent migration script (Schema + RLS + Storage + Triggers + Seed)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: EXTENSIONS & ENUMS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('student', 'instructor', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status_enum AS ENUM ('draft', 'submitted', 'payment_pending', 'payment_processing', 'paid', 'confirmed', 'enrolled', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'successful', 'failed', 'refunded', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE learning_mode_enum AS ENUM ('online', 'physical', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- SECTION 2: RELATIONAL TABLES
-- ----------------------------------------------------------------------------

-- 1. Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role_enum NOT NULL DEFAULT 'student',
    bio TEXT,
    title TEXT,
    state_of_residence TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Branches / Campuses
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    capacity INTEGER NOT NULL DEFAULT 100,
    facilities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Course Categories
CREATE TABLE IF NOT EXISTS public.course_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Instructors
CREATE TABLE IF NOT EXISTS public.instructors (
    id TEXT PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT NOT NULL,
    image TEXT NOT NULL,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    students_count INTEGER NOT NULL DEFAULT 0,
    courses_count INTEGER NOT NULL DEFAULT 1,
    experience_years INTEGER NOT NULL DEFAULT 5,
    credentials JSONB DEFAULT '[]'::jsonb,
    specialties JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    category_id TEXT REFERENCES public.course_categories(id) ON DELETE SET NULL,
    level TEXT NOT NULL,
    duration TEXT NOT NULL,
    format TEXT NOT NULL,
    badge TEXT,
    popular BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    price NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2) NOT NULL,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    instructor_id TEXT REFERENCES public.instructors(id) ON DELETE SET NULL,
    syllabus JSONB DEFAULT '[]'::jsonb,
    weekly_objectives JSONB DEFAULT '[]'::jsonb,
    capstone_projects JSONB DEFAULT '[]'::jsonb,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    learning_outcomes JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Course Modules & Lessons (LMS)
CREATE TABLE IF NOT EXISTS public.course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    duration TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    video_url TEXT,
    content TEXT,
    resources JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Cohorts
CREATE TABLE IF NOT EXISTS public.cohorts (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    schedule_type TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 40,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Applications & Emergency Contacts
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    course_id TEXT NOT NULL REFERENCES public.courses(id),
    learning_mode learning_mode_enum NOT NULL,
    branch_id TEXT REFERENCES public.branches(id),
    cohort_id TEXT REFERENCES public.cohorts(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    state_of_residence TEXT NOT NULL,
    education_level TEXT NOT NULL,
    employment_status TEXT NOT NULL,
    programming_experience TEXT NOT NULL,
    technical_goals TEXT,
    weekly_commitment_hours TEXT,
    motivation_essay TEXT,
    preferred_schedule TEXT,
    tuition_amount NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status application_status_enum NOT NULL DEFAULT 'draft',
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    referral_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email_address TEXT,
    physical_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Payments & Invoices
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference TEXT UNIQUE NOT NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    original_amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    gateway TEXT NOT NULL DEFAULT 'paystack',
    channel TEXT,
    status payment_status_enum NOT NULL DEFAULT 'pending',
    paystack_transaction_id TEXT,
    paystack_signature TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    amount_paid NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid',
    issued_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Enrollments & LMS Progress
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    cohort_id TEXT REFERENCES public.cohorts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'enrolled',
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id TEXT REFERENCES public.course_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 100,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    score NUMERIC(5,2),
    feedback TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id TEXT NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'present',
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cohort_id, student_id, session_date)
);

-- 11. Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number TEXT UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    grade TEXT DEFAULT 'Distinction',
    verification_code TEXT UNIQUE NOT NULL,
    qr_code_url TEXT,
    pdf_url TEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.certificate_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number TEXT NOT NULL REFERENCES public.certificates(certificate_number) ON DELETE CASCADE,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- 12. Affiliate & Referrals
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    total_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    paid_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    pending_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'registered',
    click_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
    commission_amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved',
    payout_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CRM, Notifications & Analytics
CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    lead_source TEXT NOT NULL DEFAULT 'website',
    course_interest TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'email',
    subject TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_cohorts_course_branch ON public.cohorts(course_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON public.lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events(event_name, created_at);

-- ----------------------------------------------------------------------------
-- SECTION 3: HELPER FUNCTIONS & RLS POLICIES
-- ----------------------------------------------------------------------------

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

-- Enable RLS
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

-- Idempotent RLS Policies
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public read for active branches" ON public.branches;
CREATE POLICY "Public read for active branches" ON public.branches FOR SELECT TO public USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage branches" ON public.branches;
CREATE POLICY "Admin manage branches" ON public.branches FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public read for course categories" ON public.course_categories;
CREATE POLICY "Public read for course categories" ON public.course_categories FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin manage course categories" ON public.course_categories;
CREATE POLICY "Admin manage course categories" ON public.course_categories FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public read for instructors" ON public.instructors;
CREATE POLICY "Public read for instructors" ON public.instructors FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin manage instructors" ON public.instructors;
CREATE POLICY "Admin manage instructors" ON public.instructors FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public read for active courses" ON public.courses;
CREATE POLICY "Public read for active courses" ON public.courses FOR SELECT TO public USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage courses" ON public.courses;
CREATE POLICY "Admin manage courses" ON public.courses FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public read for course modules" ON public.course_modules;
CREATE POLICY "Public read for course modules" ON public.course_modules FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin manage course modules" ON public.course_modules;
CREATE POLICY "Admin manage course modules" ON public.course_modules FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public read for free preview lessons" ON public.course_lessons;
CREATE POLICY "Public read for free preview lessons" ON public.course_lessons FOR SELECT TO public USING (
  is_free_preview = true OR public.is_admin() OR EXISTS (
    SELECT 1 FROM public.enrollments WHERE enrollments.student_id = auth.uid() AND enrollments.course_id = course_lessons.course_id AND enrollments.status IN ('enrolled', 'active', 'completed')
  )
);

DROP POLICY IF EXISTS "Admin manage course lessons" ON public.course_lessons;
CREATE POLICY "Admin manage course lessons" ON public.course_lessons FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public read for cohorts" ON public.cohorts;
CREATE POLICY "Public read for cohorts" ON public.cohorts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin manage cohorts" ON public.cohorts;
CREATE POLICY "Admin manage cohorts" ON public.cohorts FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Applicants can create applications" ON public.applications;
CREATE POLICY "Applicants can create applications" ON public.applications FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users view their own applications" ON public.applications;
CREATE POLICY "Users view their own applications" ON public.applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users update their own applications" ON public.applications;
CREATE POLICY "Users update their own applications" ON public.applications FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Public create emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Public create emergency contacts" ON public.emergency_contacts FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users view their application emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Users view their application emergency contacts" ON public.emergency_contacts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.applications WHERE applications.id = emergency_contacts.application_id AND (applications.user_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage payments and invoices" ON public.payments;
CREATE POLICY "Admin manage payments and invoices" ON public.payments FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manage payment events" ON public.payment_events;
CREATE POLICY "Admin manage payment events" ON public.payment_events FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Students view their own enrollments" ON public.enrollments;
CREATE POLICY "Students view their own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin() OR public.is_instructor());

DROP POLICY IF EXISTS "Students manage their lesson progress" ON public.lesson_progress;
CREATE POLICY "Students manage their lesson progress" ON public.lesson_progress FOR ALL TO authenticated USING (student_id = auth.uid() OR public.is_admin()) WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Enrolled students view assignments" ON public.assignments;
CREATE POLICY "Enrolled students view assignments" ON public.assignments FOR SELECT TO authenticated USING (
  public.is_admin() OR public.is_instructor() OR EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.student_id = auth.uid() AND enrollments.course_id = assignments.course_id)
);

DROP POLICY IF EXISTS "Admin and instructors manage assignments" ON public.assignments;
CREATE POLICY "Admin and instructors manage assignments" ON public.assignments FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

DROP POLICY IF EXISTS "Students view and submit their own assignment submissions" ON public.assignment_submissions;
CREATE POLICY "Students view and submit their own assignment submissions" ON public.assignment_submissions FOR ALL TO authenticated USING (student_id = auth.uid() OR public.is_admin() OR public.is_instructor()) WITH CHECK (student_id = auth.uid() OR public.is_admin() OR public.is_instructor());

DROP POLICY IF EXISTS "Students view their attendance" ON public.attendance;
CREATE POLICY "Students view their attendance" ON public.attendance FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin() OR public.is_instructor());

DROP POLICY IF EXISTS "Instructors and admin manage attendance" ON public.attendance;
CREATE POLICY "Instructors and admin manage attendance" ON public.attendance FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

DROP POLICY IF EXISTS "Public verification of certificates" ON public.certificates;
CREATE POLICY "Public verification of certificates" ON public.certificates FOR SELECT TO public USING (is_revoked = false);

DROP POLICY IF EXISTS "Public can log certificate verifications" ON public.certificate_verifications;
CREATE POLICY "Public can log certificate verifications" ON public.certificate_verifications FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage certificates" ON public.certificates;
CREATE POLICY "Admin manage certificates" ON public.certificates FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Users view own affiliate profile" ON public.affiliate_profiles;
CREATE POLICY "Users view own affiliate profile" ON public.affiliate_profiles FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Affiliates view their referrals" ON public.referrals;
CREATE POLICY "Affiliates view their referrals" ON public.referrals FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.affiliate_profiles WHERE affiliate_profiles.id = referrals.affiliate_id AND (affiliate_profiles.user_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Affiliates view their commissions" ON public.affiliate_commissions;
CREATE POLICY "Affiliates view their commissions" ON public.affiliate_commissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.affiliate_profiles WHERE affiliate_profiles.id = affiliate_commissions.affiliate_id AND (affiliate_profiles.user_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Users view and manage their notifications" ON public.notifications;
CREATE POLICY "Users view and manage their notifications" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Public can create CRM lead contacts" ON public.crm_contacts;
CREATE POLICY "Public can create CRM lead contacts" ON public.crm_contacts FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage CRM contacts and logs" ON public.crm_contacts;
CREATE POLICY "Admin manage CRM contacts and logs" ON public.crm_contacts FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manage communication logs" ON public.communication_logs;
CREATE POLICY "Admin manage communication logs" ON public.communication_logs FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Public and authenticated can submit analytics events" ON public.analytics_events;
CREATE POLICY "Public and authenticated can submit analytics events" ON public.analytics_events FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view analytics telemetry" ON public.analytics_events;
CREATE POLICY "Admin view analytics telemetry" ON public.analytics_events FOR SELECT TO authenticated USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- SECTION 4: STORAGE BUCKETS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('course-resources', 'course-resources', false, 52428800, ARRAY['application/pdf', 'application/zip', 'text/plain', 'image/jpeg', 'image/png']),
  ('assignment-submissions', 'assignment-submissions', false, 52428800, ARRAY['application/pdf', 'application/zip', 'text/plain', 'application/json']),
  ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Students can upload assignment files" ON storage.objects;
CREATE POLICY "Students can upload assignment files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'assignment-submissions' AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Students can read their own submission files" ON storage.objects;
CREATE POLICY "Students can read their own submission files" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'assignment-submissions' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.is_admin() OR public.is_instructor()
  )
);

DROP POLICY IF EXISTS "Certificates are publicly readable" ON storage.objects;
CREATE POLICY "Certificates are publicly readable" ON storage.objects FOR SELECT TO public USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Enrolled students can read course resources" ON storage.objects;
CREATE POLICY "Enrolled students can read course resources" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'course-resources' AND (
    public.is_admin() OR public.is_instructor() OR EXISTS (
      SELECT 1 FROM public.enrollments WHERE enrollments.student_id = auth.uid() AND enrollments.course_id = (storage.foldername(name))[1] AND enrollments.status IN ('enrolled', 'active', 'completed')
    )
  )
);

DROP POLICY IF EXISTS "Admins can manage all storage objects" ON storage.objects;
CREATE POLICY "Admins can manage all storage objects" ON storage.objects FOR ALL TO authenticated USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- SECTION 5: FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role_enum := 'student';
BEGIN
  IF NEW.email = 'admin@davetechs.com' THEN
    v_role := 'super_admin';
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, phone, avatar_url, role, created_at, updated_at
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

  INSERT INTO public.affiliate_profiles (
    user_id, referral_code, commission_rate_percentage, created_at
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic Enrollment Fulfillment Procedure
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

  -- 3. Fetch course details
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

  -- 6. Create enrollment if not exists
  SELECT id INTO v_enrollment_id
  FROM public.enrollments
  WHERE (student_id = v_application.user_id AND course_id = v_application.course_id)
     OR application_id = v_application.id;

  IF v_enrollment_id IS NULL THEN
    INSERT INTO public.enrollments (
      student_id, course_id, application_id, payment_id, branch_id, cohort_id, status, progress_percentage, enrolled_at, created_at
    )
    VALUES (
      v_application.user_id, v_application.course_id, v_application.id, v_payment.id, v_application.branch_id, v_application.cohort_id, 'enrolled', 0.00, NOW(), NOW()
    )
    RETURNING id INTO v_enrollment_id;

    IF v_application.cohort_id IS NOT NULL THEN
      UPDATE public.cohorts
      SET enrolled_count = enrolled_count + 1
      WHERE id = v_application.cohort_id;
    END IF;
  END IF;

  -- 7. Generate invoice
  SELECT id INTO v_invoice_id
  FROM public.invoices
  WHERE payment_id = v_payment.id;

  IF v_invoice_id IS NULL THEN
    v_invoice_number := 'DTA-INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    INSERT INTO public.invoices (
      invoice_number, application_id, payment_id, user_id, course_id, amount_paid, total_amount, status, issued_date, created_at
    )
    VALUES (
      v_invoice_number, v_application.id, v_payment.id, v_application.user_id, v_application.course_id, v_payment.amount, v_payment.amount, 'paid', NOW(), NOW()
    )
    RETURNING id INTO v_invoice_id;
  END IF;

  -- 8. In-app student notification
  IF v_application.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id, title, message, type, link, created_at
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

  -- 9. Referral commission
  IF v_application.referral_code IS NOT NULL THEN
    SELECT id INTO v_affiliate_id
    FROM public.affiliate_profiles
    WHERE referral_code = v_application.referral_code
      AND user_id != v_application.user_id;

    IF v_affiliate_id IS NOT NULL THEN
      v_commission_amount := ROUND((v_payment.amount * 0.10), 2);

      INSERT INTO public.affiliate_commissions (
        affiliate_id, payment_id, enrollment_id, commission_amount, status, created_at
      )
      VALUES (
        v_affiliate_id, v_payment.id, v_enrollment_id, v_commission_amount, 'approved', NOW()
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

-- Timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_courses_timestamp ON public.courses;
CREATE TRIGGER update_courses_timestamp BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_applications_timestamp ON public.applications;
CREATE TRIGGER update_applications_timestamp BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- SECTION 6: INITIAL SEED DATA (Courses, Campuses, Instructors, Modules, Cohorts)
-- ----------------------------------------------------------------------------

-- Course Categories
INSERT INTO public.course_categories (id, name, slug, icon, description, sort_order)
VALUES
  ('software-engineering', 'Software Engineering', 'software-engineering', 'Code', 'Modern frontend, backend, and full-stack software development.', 1),
  ('data-ai', 'Data & Artificial Intelligence', 'data-ai', 'Database', 'Data science, analytics, machine learning, and AI application engineering.', 2),
  ('design-product', 'Design & Product', 'design-product', 'Layout', 'User experience, product design, wireframing, and design systems.', 3),
  ('cybersecurity-cloud', 'Cybersecurity & Cloud', 'cybersecurity-cloud', 'Shield', 'Cloud architecture, infrastructure security, and penetration testing.', 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- Branches
INSERT INTO public.branches (id, name, slug, city, state, address, phone, email, capacity, facilities)
VALUES
  (
    'branch-abeokuta-main',
    'Abeokuta Main Campus',
    'abeokuta-main',
    'Abeokuta',
    'Ogun State',
    'Plot 14, Tech Innovation Boulevard, Ibara, Abeokuta',
    '+234 812 345 6789',
    'abeokuta@davetechs.com',
    120,
    '["High-Speed Fiber Internet", "Air-Conditioned Labs", "24/7 Solar Power Backup", "Collaborative Lounge", "Hardware Sandbox"]'::jsonb
  ),
  (
    'branch-vi-executive',
    'Victoria Island Executive Campus',
    'vi-executive',
    'Lagos',
    'Lagos State',
    'Suite 400, Bishop Aboyade Cole Street, Victoria Island, Lagos',
    '+234 809 111 2233',
    'vi@davetechs.com',
    80,
    '["Executive Boardroom Labs", "Ultra-Fast Starlink Uplink", "Catering & Coffee Lounge", "Private Podcasting Studio"]'::jsonb
  ),
  (
    'branch-ikeja-hub',
    'Ikeja Tech Hub',
    'ikeja-hub',
    'Ikeja',
    'Lagos State',
    '28 Allen Avenue, Ikeja, Lagos',
    '+234 802 333 4455',
    'ikeja@davetechs.com',
    100,
    '["Dual-Monitor Coding Stations", "Testing Device Lab", "Quiet Study Zone", "Auditorium"]'::jsonb
  ),
  (
    'branch-ibadan-innovation',
    'Ibadan Innovation Center',
    'ibadan-innovation',
    'Ibadan',
    'Oyo State',
    '5 Ring Road, Opposite High Court, Ibadan',
    '+234 803 777 8899',
    'ibadan@davetechs.com',
    90,
    '["Fiber WiFi", "Maker Space", "Dedicated Mentorship Rooms", "Recreational Zone"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  capacity = EXCLUDED.capacity,
  facilities = EXCLUDED.facilities;

-- Instructors
INSERT INTO public.instructors (id, name, role, bio, image, rating, students_count, courses_count, experience_years, credentials, specialties)
VALUES
  (
    'inst-david-og',
    'David Ogundepo',
    'Lead Solutions Architect & Founder',
    'Principal architect with 12+ years building enterprise fintech, cloud solutions, and training 5,000+ engineers across Africa.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    4.98,
    2840,
    4,
    12,
    '["AWS Certified Solutions Architect", "Google Cloud Fellow", "MSc Computer Science"]'::jsonb,
    '["Distributed Systems", "Full-Stack Architecture", "PostgreSQL", "Cloud Security"]'::jsonb
  ),
  (
    'inst-sarah-adebayo',
    'Sarah Adebayo',
    'Senior Frontend Engineer',
    'Ex-Paystack UI engineer specialized in React, TypeScript, design systems, and web performance optimization.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    4.95,
    1920,
    2,
    8,
    '["Meta Certified Frontend Developer", "Design Systems Specialist"]'::jsonb,
    '["React", "TypeScript", "TailwindCSS & Modern CSS", "State Management", "Micro-frontends"]'::jsonb
  ),
  (
    'inst-michael-chukwu',
    'Michael Chukwu',
    'Head of Data Science & AI',
    'Machine learning researcher and consultant with extensive experience deploying predictive models for African financial institutions.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    4.92,
    1450,
    2,
    9,
    '["TensorFlow Certified Developer", "PhD Applied Statistics"]'::jsonb,
    '["Python", "Pandas", "Scikit-Learn", "Deep Learning", "LLMs & GenAI"]'::jsonb
  ),
  (
    'inst-grace-ekong',
    'Grace Ekong',
    'Product Design Lead',
    'Senior UI/UX designer and product strategist crafting delightful digital products for international tech startups.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    4.97,
    1780,
    2,
    7,
    '["NN/g UX Master Certified", "Figma Design Advocate"]'::jsonb,
    '["User Research", "Wireframing & Prototyping", "Design Systems", "Usability Testing"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  rating = EXCLUDED.rating,
  students_count = EXCLUDED.students_count;

-- Courses
INSERT INTO public.courses (
  id, slug, title, tagline, description, full_description, category_id,
  level, duration, format, badge, popular, featured, price, original_price,
  rating, reviews_count, instructor_id, syllabus, weekly_objectives, capstone_projects, prerequisites, faqs, learning_outcomes
)
VALUES
  (
    'course-frontend-dev',
    'frontend-development',
    'Frontend Web Development (React & TypeScript)',
    'Master modern web engineering from semantic UI to production React applications.',
    'Comprehensive hands-on training in HTML5, CSS3, modern JavaScript (ES6+), TypeScript, React 18, State Management, and Next.js foundations.',
    'Master the art of building responsive, production-ready frontend web applications. In this course, you will learn HTML5, CSS3, modern JavaScript (ES6+), TypeScript, React, state management, and modern component architecture with rigorous real-world capstone projects.',
    'software-engineering',
    'Beginner to Intermediate',
    '12 Weeks',
    'Online & Physical',
    'Most Popular',
    true,
    true,
    120000.00,
    180000.00,
    4.95,
    342,
    'inst-sarah-adebayo',
    '[
      {"week": 1, "title": "Modern HTML5 & Semantic Web Architecture", "topics": ["Semantic elements", "Accessibility (a11y)", "SEO meta standards", "DOM structures"]},
      {"week": 2, "title": "Advanced CSS3, Flexbox & Grid Systems", "topics": ["CSS Grid layout", "Flexbox mastery", "Responsive design", "CSS custom properties"]},
      {"week": 3, "title": "Modern JavaScript (ES6+) Fundamentals", "topics": ["Scoping & closures", "Async/Await & Promises", "Array methods", "DOM manipulation"]},
      {"week": 4, "title": "TypeScript for Web Developers", "topics": ["Type annotations & interfaces", "Generics", "Type narrowing", "Strict mode tooling"]},
      {"week": 5, "title": "React 18 Core & Component Lifecycles", "topics": ["JSX syntax", "Props & state", "Hooks (useState, useEffect, useMemo)", "Custom hooks"]},
      {"week": 6, "title": "State Management & React Router DOM", "topics": ["Context API", "Client-side routing", "Data loaders", "Zustand"]},
      {"week": 7, "title": "API Integration, TanStack Query & Supabase", "topics": ["REST APIs", "Supabase Client", "Real-time subscriptions", "Optimistic updates"]},
      {"week": 8, "title": "Frontend Testing & CI/CD Pipelines", "topics": ["Vitest & React Testing Library", "Unit tests", "Vercel deployments", "Lighthouse audits"]}
    ]'::jsonb,
    '[
      "Build complex, accessible responsive UIs from Figma specs",
      "Write robust, type-safe code using TypeScript and modern ES standards",
      "Architect clean React component hierarchies with custom hooks",
      "Deploy production applications with continuous integration and automated testing"
    ]'::jsonb,
    '[
      {"title": "Multi-Vendor Marketplace SPA", "description": "Interactive commerce store with filtering, cart state, and real-time checkout simulation."},
      {"title": "Academy LMS Student Dashboard", "description": "Full-featured learning portal with lesson tracking, video progress, and dark/light themes."}
    ]'::jsonb,
    '["Basic computer literacy", "Dedication of 10-15 hours per week", "Personal laptop (Windows/Mac/Linux with min. 8GB RAM)"]'::jsonb,
    '[
      {"question": "Is this course beginner-friendly?", "answer": "Yes! We start from absolute web fundamentals before advancing into React and TypeScript."},
      {"question": "Do I receive a certificate upon completion?", "answer": "Yes, all students who complete assignments and their capstone project receive a cryptographically verifiable certificate."}
    ]'::jsonb,
    '["Semantic HTML5 & responsive CSS", "TypeScript & modern JavaScript", "React 18 & Hook ecosystem", "Production build optimization"]'::jsonb
  ),
  (
    'course-backend-eng',
    'backend-engineering',
    'Backend Engineering & Cloud Architecture',
    'Build high-throughput APIs, scalable databases, and cloud infrastructure.',
    'Master server-side development with Node.js/TypeScript, PostgreSQL, Redis caching, Supabase Edge Functions, RESTful design, and containerization with Docker.',
    'Dive deep into backend engineering. Master relational database modeling with PostgreSQL, high-concurrency microservices, JWT authentication, caching with Redis, Edge Functions, automated CI/CD, and Docker containerization.',
    'software-engineering',
    'Intermediate to Advanced',
    '14 Weeks',
    'Online & Physical',
    'High Demand',
    true,
    true,
    140000.00,
    200000.00,
    4.98,
    215,
    'inst-david-og',
    '[
      {"week": 1, "title": "Server Architecture & Protocol Fundamentals", "topics": ["HTTP/2 & HTTP/3", "RESTful patterns", "Node.js runtime", "TypeScript server setup"]},
      {"week": 2, "title": "Relational Databases & PostgreSQL Mastery", "topics": ["Schema design & normalization", "Foreign keys & indexes", "Triggers & stored procedures", "Query planning"]},
      {"week": 3, "title": "Row Level Security (RLS) & Supabase Backend", "topics": ["Supabase architecture", "RLS policies", "Edge Functions (Deno)", "Webhooks"]},
      {"week": 4, "title": "Authentication, JWT & Cryptographic Security", "topics": ["OAuth2 & Supabase Auth", "Bcrypt & Argon2", "Session handling", "RBAC authorization"]},
      {"week": 5, "title": "Financial Gateways & Paystack Integration", "topics": ["Server-side checkout", "HMAC verification", "Idempotency keys", "Ledger accounting"]},
      {"week": 6, "title": "Caching with Redis & Background Queues", "topics": ["In-memory caching", "Rate limiting", "BullMQ / Job queues", "Pub/Sub messaging"]},
      {"week": 7, "title": "Containerization & Docker Orchestration", "topics": ["Dockerfile optimization", "Docker Compose", "Multi-stage builds", "Volume management"]},
      {"week": 8, "title": "Production Deployment, CI/CD & Monitoring", "topics": ["GitHub Actions", "Prometheus & Grafana", "Logging & Sentry", "Zero-downtime rollouts"]}
    ]'::jsonb,
    '[
      "Design normalized PostgreSQL relational databases with strict RLS policies",
      "Build high-throughput REST APIs and serverless Edge Functions",
      "Integrate Paystack checkout and idempotent payment verification webhooks",
      "Deploy containerized microservices to cloud environments"
    ]'::jsonb,
    '[
      {"title": "Core Banking Ledger & Payment Engine", "description": "High-concurrency financial service with double-entry accounting and Paystack integration."},
      {"title": "Distributed Cloud File Storage Service", "description": "S3-compatible file storage engine with chunked uploads and signed access URLs."}
    ]'::jsonb,
    '["Basic programming knowledge in JavaScript or Python", "Understanding of terminal / command line", "Laptop with 8GB+ RAM"]'::jsonb,
    '[
      {"question": "Will we learn Paystack payment integration?", "answer": "Yes, full server-side initialization, webhook signature verification, and atomic fulfillment are covered in depth."}
    ]'::jsonb,
    '["PostgreSQL modeling & optimization", "Node.js & Supabase Edge Functions", "Paystack payment processing", "Docker containerization"]'::jsonb
  ),
  (
    'course-fullstack-dev',
    'fullstack-software-engineering',
    'Full-Stack Software Engineering Bootcamp',
    'The complete end-to-end software engineering program from UI to database and cloud deployment.',
    'Transform into an elite full-stack engineer. Master React, TypeScript, PostgreSQL, Supabase, Node.js, Cloud Deployment, and DevOps in one comprehensive immersive program.',
    'The premier comprehensive software engineering bootcamp in Africa. Designed to take dedicated learners from fundamentals to production-grade full-stack software architects capable of building scalable web platforms.',
    'software-engineering',
    'Beginner to Advanced',
    '24 Weeks',
    'Online & Physical',
    'Flagship Program',
    true,
    true,
    220000.00,
    320000.00,
    4.99,
    512,
    'inst-david-og',
    '[
      {"week": 1, "title": "Frontend Engineering Foundations", "topics": ["HTML5/CSS3", "JavaScript ES6+", "TypeScript", "Modern tooling"]},
      {"week": 2, "title": "React 18 & Advanced Web UIs", "topics": ["Hooks", "Context", "Routing", "Design systems"]},
      {"week": 3, "title": "Server Engineering & PostgreSQL", "topics": ["Relational architecture", "SQL performance", "Supabase", "Edge Functions"]},
      {"week": 4, "title": "Full-Stack Integrations & Payment Gateways", "topics": ["Paystack API", "Webhooks", "Auth lifecycle", "File storage"]},
      {"week": 5, "title": "DevOps, Testing & Cloud Deployments", "topics": ["Docker", "CI/CD", "Cloud infrastructure", "Production hardening"]}
    ]'::jsonb,
    '[
      "Build and deploy full-stack commercial web applications independently",
      "Implement secure authentication, role-based access control, and PostgreSQL RLS",
      "Integrate online payments and real-time data pipelines",
      "Lead technical engineering teams and ace senior developer interviews"
    ]'::jsonb,
    '[
      {"title": "Enterprise Academy Management Platform", "description": "Complete multi-campus school management SaaS with student admissions, payments, and LMS."}
    ]'::jsonb,
    '["Commitment to 15-20 hours weekly", "Laptop with minimum 8GB RAM", "Passionate problem-solving mindset"]'::jsonb,
    '[
      {"question": "Is job placement support included?", "answer": "Yes! We offer CV reviews, portfolio workshops, mock technical interviews, and hiring partner referrals."}
    ]'::jsonb,
    '["Full-stack React & TypeScript", "PostgreSQL database mastery", "Payment gateway engineering", "Cloud deployment & CI/CD"]'::jsonb
  ),
  (
    'course-ui-ux-design',
    'ui-ux-product-design',
    'UI/UX & Digital Product Design',
    'Design intuitive, practical digital products and industry-standard design systems.',
    'Learn user research, wireframing, interactive prototyping in Figma, visual design hierarchy, accessibility (a11y), and design system architecture.',
    'Master user-centered product design. Learn how to conduct user interviews, translate user insights into user journeys, create high-fidelity responsive UI mockups in Figma, and build scalable design systems.',
    'design-product',
    'Beginner to Intermediate',
    '10 Weeks',
    'Online & Physical',
    'Trending',
    true,
    false,
    95000.00,
    150000.00,
    4.96,
    188,
    'inst-grace-ekong',
    '[
      {"week": 1, "title": "Design Thinking & User Research", "topics": ["User interviews", "Personas", "Empathy maps", "Competitive analysis"]},
      {"week": 2, "title": "Information Architecture & Wireframing", "topics": ["Site maps", "User flows", "Low-fidelity wireframes", "Figma shortcuts"]},
      {"week": 3, "title": "Visual Design Principles & Typography", "topics": ["Color theory", "Typography hierarchy", "Spacing grids", "Visual balance"]},
      {"week": 4, "title": "Figma Mastery & Component Libraries", "topics": ["Auto-layout", "Variants & component properties", "Interactive components", "Design tokens"]},
      {"week": 5, "title": "Design Systems & Developer Handoff", "topics": ["Design system architecture", "Figma variables", "Handoff specs", "Token export"]}
    ]'::jsonb,
    '[
      "Create high-fidelity interactive prototypes in Figma",
      "Construct comprehensive design systems with auto-layout and component variants",
      "Conduct usability tests and iterate based on data",
      "Prepare professional design portfolios for top tech roles"
    ]'::jsonb,
    '[
      {"title": "Fintech Mobile Banking App UX", "description": "End-to-end mobile design with onboarding, KYC, and transfer flows."},
      {"title": "Multi-Brand Design System", "description": "Atomic design system with Figma variables and light/dark theme tokens."}
    ]'::jsonb,
    '["Creative interest in digital interfaces", "Figma account (Free)", "Laptop with 8GB+ RAM"]'::jsonb,
    '[
      {"question": "Do I need coding skills?", "answer": "No coding required! This course is 100% focused on product design, research, and Figma."}
    ]'::jsonb,
    '["Figma mastery & Auto-layout", "Design system construction", "User research methodologies", "Interactive prototyping"]'::jsonb
  ),
  (
    'course-data-science',
    'data-science-machine-learning',
    'Data Science, Analytics & Machine Learning',
    'Analyze data, uncover strategic insights, and deploy predictive ML models.',
    'Hands-on training in Python, Pandas, NumPy, SQL, data visualization with Seaborn/Plotly, machine learning with Scikit-Learn, and introductory Deep Learning.',
    'Unlock the power of data. From data wrangling and statistical analysis to predictive machine learning models and data storytelling, this course equips you with the skills to solve business problems with data.',
    'data-ai',
    'Beginner to Intermediate',
    '14 Weeks',
    'Online & Physical',
    'Featured',
    false,
    true,
    160000.00,
    240000.00,
    4.94,
    165,
    'inst-michael-chukwu',
    '[
      {"week": 1, "title": "Python for Data Analysis", "topics": ["Python syntax", "Data structures", "NumPy arrays", "Vectorized calculations"]},
      {"week": 2, "title": "Data Wrangling with Pandas", "topics": ["DataFrames", "Cleaning & imputing", "Grouping & aggregations", "Merging datasets"]},
      {"week": 3, "title": "SQL for Analytics & PostgreSQL", "topics": ["Complex queries", "Window functions", "Common Table Expressions (CTEs)", "Database indexing"]},
      {"week": 4, "title": "Data Visualization & Storytelling", "topics": ["Matplotlib & Seaborn", "Plotly interactive charts", "Dashboarding with Streamlit"]},
      {"week": 5, "title": "Machine Learning Fundamentals", "topics": ["Regression models", "Classification algorithms", "Model evaluation metrics", "Feature engineering"]}
    ]'::jsonb,
    '[
      "Clean, transform, and analyze complex datasets with Python and Pandas",
      "Write advanced SQL queries for business intelligence and reporting",
      "Train, evaluate, and fine-tune supervised machine learning algorithms",
      "Deploy interactive ML dashboards with Streamlit and cloud APIs"
    ]'::jsonb,
    '[
      {"title": "Customer Churn Prediction Engine", "description": "Machine learning model predicting customer turnover with 92% precision."},
      {"title": "Real Estate Valuation Predictor", "description": "Regression pipeline estimating housing prices across Nigerian metropolitan areas."}
    ]'::jsonb,
    '["Basic math and algebra comprehension", "Laptop with 8GB+ RAM", "Interest in analytical problem solving"]'::jsonb,
    '[
      {"question": "Do we work with real datasets?", "answer": "Yes, you will analyze real African fintech, e-commerce, and logistics datasets."}
    ]'::jsonb,
    '["Python data ecosystem", "Advanced SQL queries", "Machine learning modeling", "Business data visualization"]'::jsonb
  ),
  (
    'course-cybersecurity-cloud',
    'cybersecurity-cloud-engineering',
    'Cybersecurity & Cloud Security Engineering',
    'Protect digital assets, configure secure networks, and defend cloud infrastructure.',
    'Comprehensive training in network security, Linux administration, ethical hacking, vulnerability assessments, AWS security, and incident response.',
    'Learn to defend against cyber threats and build resilient cloud systems. Covers network defense, Linux server hardening, penetration testing, SIEM monitoring, and cloud security architecture.',
    'cybersecurity-cloud',
    'Intermediate',
    '12 Weeks',
    'Online & Physical',
    'Critical Skill',
    false,
    false,
    180000.00,
    250000.00,
    4.97,
    140,
    'inst-david-og',
    '[
      {"week": 1, "title": "Networking & Linux Administration", "topics": ["TCP/IP protocols", "Subnetting", "Linux commands", "Permissions & SSH hardening"]},
      {"week": 2, "title": "Vulnerability Assessment & Penetration Testing", "topics": ["Nmap scanning", "OWASP Top 10", "Burp Suite", "Web app security testing"]},
      {"week": 3, "title": "Cloud Security Architecture (AWS)", "topics": ["IAM policies", "VPC security groups", "Encryption at rest/transit", "AWS GuardDuty"]},
      {"week": 4, "title": "Incident Response & SIEM Monitoring", "topics": ["Log analysis", "Splunk / Elastic SIEM", "Threat detection", "Incident mitigation"]}
    ]'::jsonb,
    '[
      "Identify and patch critical vulnerabilities across web and server applications",
      "Architect secure virtual private clouds (VPCs) on AWS",
      "Implement multi-layer defense mechanisms and continuous security monitoring",
      "Prepare for industry certifications including CompTIA Security+ and AWS Security Specialty"
    ]'::jsonb,
    '[
      {"title": "Automated Cloud Vulnerability Scanner", "description": "Custom security scanning suite auditing AWS infrastructure configurations."}
    ]'::jsonb,
    '["Basic networking fundamentals", "Familiarity with terminal commands", "Laptop with 8GB+ RAM"]'::jsonb,
    '[
      {"question": "Is ethical hacking taught responsibly?", "answer": "Yes, all offensive security labs are strictly performed inside controlled, isolated environments."}
    ]'::jsonb,
    '["Linux server hardening", "OWASP Top 10 mitigation", "Cloud IAM & VPC architecture", "Incident response operations"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  syllabus = EXCLUDED.syllabus;

-- Course Modules & Lessons
INSERT INTO public.course_modules (id, course_id, title, description, sort_order, duration)
VALUES
  ('mod-fe-1', 'course-frontend-dev', 'Module 1: Web Architecture & HTML5 Semantic Standards', 'Deep dive into web standards, DOM trees, semantic markup, and accessibility.', 1, '2 Weeks'),
  ('mod-fe-2', 'course-frontend-dev', 'Module 2: Advanced CSS3, Flexbox & Grid Systems', 'Building modern responsive layouts from scratch with vanilla CSS and design tokens.', 2, '2 Weeks'),
  ('mod-fe-3', 'course-frontend-dev', 'Module 3: JavaScript ES6+ & TypeScript', 'Modern JavaScript mastery, closures, asynchronous programming, and strict TypeScript types.', 3, '3 Weeks'),
  ('mod-fe-4', 'course-frontend-dev', 'Module 4: React 18 & State Management', 'Component hierarchies, Hooks, Context, React Router DOM, and production deployment.', 4, '5 Weeks')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.course_lessons (id, module_id, course_id, title, duration, video_url, content, sort_order, is_free_preview)
VALUES
  ('les-fe-101', 'mod-fe-1', 'course-frontend-dev', 'Welcome to Dave Techs Academy & Frontend Orientation', '15 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Overview of the frontend curriculum, development environment setup (VS Code, Git, Node.js), and community guidelines.', 1, true),
  ('les-fe-102', 'mod-fe-1', 'course-frontend-dev', 'Semantic HTML5 & Accessibility Best Practices', '45 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Structuring pages using header, nav, main, section, article, aside, and footer tags with proper ARIA attributes.', 2, true),
  ('les-fe-201', 'mod-fe-2', 'course-frontend-dev', 'Mastering CSS Flexbox for UI Components', '60 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Main axis, cross axis, justify-content, align-items, flex-grow, and responsive card lists.', 3, false),
  ('les-fe-202', 'mod-fe-2', 'course-frontend-dev', 'Building Complex Grid Systems & Responsive Breakpoints', '75 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'CSS Grid template areas, repeat(), minmax(), autofill, and fluid typography.', 4, false),
  ('les-fe-301', 'mod-fe-3', 'course-frontend-dev', 'Async JavaScript: Promises, Fetch API & Async/Await', '90 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Handling network latency, error boundaries, try/catch, and parsing REST JSON responses.', 5, false),
  ('les-fe-401', 'mod-fe-4', 'course-frontend-dev', 'React 18 Component Thinking & Custom Hooks', '90 mins', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'Building atomic React components, lifting state up, and creating reusable custom hooks.', 6, false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  duration = EXCLUDED.duration;

-- Cohorts
INSERT INTO public.cohorts (id, course_id, branch_id, name, code, start_date, end_date, schedule_type, capacity, enrolled_count, status)
VALUES
  ('cohort-fe-abk-2026-q4', 'course-frontend-dev', 'branch-abeokuta-main', 'Abeokuta Q4 Weekend Cohort', 'DTA-FE-ABK-2026-Q4', '2026-10-15', '2027-01-15', 'Saturdays & Sundays (10:00 AM - 3:00 PM)', 35, 12, 'open'),
  ('cohort-fe-vi-2026-q4', 'course-frontend-dev', 'branch-vi-executive', 'VI Executive Evening Cohort', 'DTA-FE-VI-2026-Q4', '2026-10-20', '2027-01-20', 'Tuesdays & Thursdays (6:00 PM - 9:00 PM)', 25, 8, 'open'),
  ('cohort-fe-online-2026-q4', 'course-frontend-dev', NULL, 'Global Online Interactive Cohort', 'DTA-FE-ONL-2026-Q4', '2026-10-15', '2027-01-15', 'Flexible Live Streams + Mentor Office Hours', 150, 48, 'open'),
  ('cohort-be-abk-2026-q4', 'course-backend-eng', 'branch-abeokuta-main', 'Abeokuta Backend Intensive', 'DTA-BE-ABK-2026-Q4', '2026-10-20', '2027-01-30', 'Mondays & Wednesdays (10:00 AM - 2:00 PM)', 30, 9, 'open'),
  ('cohort-be-online-2026-q4', 'course-backend-eng', NULL, 'Online Backend Engineering Cohort', 'DTA-BE-ONL-2026-Q4', '2026-10-20', '2027-01-30', 'Mondays & Thursdays (7:00 PM - 9:30 PM)', 100, 31, 'open'),
  ('cohort-fs-ikeja-2026-q4', 'course-fullstack-dev', 'branch-ikeja-hub', 'Ikeja Full-Stack Immersion', 'DTA-FS-IKJ-2026-Q4', '2026-11-01', '2027-04-30', 'Weekdays Full-Time (9:00 AM - 4:00 PM)', 40, 18, 'open'),
  ('cohort-ui-ibd-2026-q4', 'course-ui-ux-design', 'branch-ibadan-innovation', 'Ibadan Product Design Cohort', 'DTA-UI-IBD-2026-Q4', '2026-10-25', '2027-01-05', 'Fridays & Saturdays (11:00 AM - 3:00 PM)', 30, 14, 'open')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  schedule_type = EXCLUDED.schedule_type,
  capacity = EXCLUDED.capacity;

-- Confirmation output
SELECT 
  'DATABASE INITIALIZATION COMPLETE' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  (SELECT COUNT(*) FROM public.courses) as total_courses,
  (SELECT COUNT(*) FROM public.branches) as total_branches,
  (SELECT COUNT(*) FROM public.instructors) as total_instructors,
  (SELECT COUNT(*) FROM public.cohorts) as total_cohorts;
