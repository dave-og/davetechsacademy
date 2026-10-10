# Dave Techs Academy — Supabase Backend Architecture & Development Roadmap

## Official Backend Stack

- **Frontend:** React 18 + TypeScript + Vite *(completed, frozen UI & design system)*
- **Backend Infrastructure:** Supabase
  - **Database:** PostgreSQL (with RLS, Indexes, Constraints, Triggers & RPCs)
  - **Authentication:** Supabase Auth (JWT, email/password, session persistence, role claims)
  - **Storage:** Supabase Storage (Buckets for course resources, submissions, certificates, avatars)
  - **Serverless Compute:** Supabase Edge Functions (Deno / TypeScript for secure Paystack operations, webhooks, CRM triggers)
- **Payment Gateway:** Paystack (Secure server-to-server initialization & HMAC webhook verification via Supabase Edge Functions)
- **Official Product Name:** DAVE TECHS
- **Existing Product Scope:** Course discovery & catalog, 6-step multi-campus application flow, Paystack payment processing, enrollment fulfillment, student LMS & dashboard, instructor grading, cryptographic certificate verification, affiliate/referral tracking, CRM communications, admin portals, and analytics telemetry.

```text
React 18 + TypeScript + Vite (Client)
                 ↓
             Supabase
 ┌──────────────┬────────────────┬────────────────┐
 │              │                │                │
Auth         PostgreSQL       Storage       Edge Functions
 │              │                │                │
 └──────────────┴────────────────┴────────────────┘
                                      │
                                  Paystack
```

---

# PHASE 0 — Frontend Audit & Architecture Contract

## Objective
Establish the authoritative integration contract between the completed React 18 frontend and the Supabase backend.

- [x] Review all frontend routes (`/`, `/courses`, `/courses/:id`, `/apply`, `/payment/callback`, `/login`, `/signup`, `/dashboard/*`, `/admin/*`, `/verify/*`, `/referral`)
- [x] Audit all existing localStorage keys (`devtechs_applications_store`, `devtechs_payment_transactions`, `devtechs_lms_*`, `devtechs_notifications`, `devtechs_affiliate_profile`, `devtechs_crm_leads`)
- [x] Map frontend data types (`src/types/`) to PostgreSQL schemas
- [x] Establish environment variable conventions (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PAYSTACK_PUBLIC_KEY`)
- [x] Establish backend Edge Function secrets strategy (`PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`)
- [x] Define NGN / ₦ currency precision rules (Store as numeric/cents in PostgreSQL, validate exact price in Edge Functions)

---

# PHASE 1 — Supabase Foundation & Client Architecture

## Objective
Initialize the centralized Supabase client module and directory layout.

- [ ] Install `@supabase/supabase-js` client library
- [ ] Create centralized client singleton in `src/lib/supabase.ts`
- [ ] Configure environment variables with type-safe fallbacks
- [ ] Create Supabase local project configuration in `supabase/config.toml`
- [ ] Establish directory structure:
  ```text
  supabase/
  ├── config.toml
  ├── migrations/
  │   ├── 20261003000001_initial_schema.sql
  │   ├── 20261003000002_row_level_security.sql
  │   ├── 20261003000003_storage_buckets.sql
  │   └── 20261003000004_functions_and_triggers.sql
  ├── seed.sql
  └── functions/
      ├── initialize-payment/
      │   └── index.ts
      ├── verify-payment/
      │   └── index.ts
      └── payment-webhook/
          └── index.ts
  ```
- [ ] Configure CORS and allowed origins for Edge Functions

### Acceptance Criteria
- Centralized Supabase client exports type-safe instance
- Zero service-role or secret keys leaked to frontend client bundle
- Environment variables properly validated

---

# PHASE 2 — PostgreSQL Database Architecture & Schema

## Objective
Design and implement the full relational database schema in PostgreSQL migrations.

### Core Tables
1. **User Identity & Roles:**
   - `profiles` (id references `auth.users(id)` on delete cascade, full_name, email, phone, avatar_url, role, bio, title, created_at, updated_at)
   - `user_roles` (user_id, role enum: `student`, `instructor`, `admin`, `super_admin`)
2. **Campuses & Cohorts:**
   - `branches` (id, name, slug, address, city, state, phone, email, is_active, capacity, created_at)
   - `cohorts` (id, course_id, branch_id, name, code, start_date, end_date, schedule_type, capacity, enrolled_count, status, created_at)
3. **Course Catalog & Curriculum:**
   - `course_categories` (id, name, slug, icon, description, sort_order)
   - `courses` (id, slug, title, tagline, description, full_description, category_id, level, duration, format, badge, popular, featured, price, original_price, rating, reviews_count, instructor_id, syllabus JSONB, weekly_objectives JSONB, prerequisites JSONB, faqs JSONB, learning_outcomes JSONB, is_active, created_at, updated_at)
   - `course_modules` (id, course_id, title, description, sort_order, duration, created_at)
   - `course_lessons` (id, module_id, course_id, title, duration, video_url, content, resources JSONB, sort_order, is_free_preview, created_at)
4. **Instructors & Assignments:**
   - `instructors` (id, profile_id references profiles, name, title, bio, avatar, rating, students_count, courses_count, experience_years, credentials JSONB, social_links JSONB)
   - `instructor_courses` (instructor_id, course_id, role, assigned_at)
5. **Applications & Assessments:**
   - `applications` (id, application_number, user_id references auth.users, course_id, learning_mode, branch_id, cohort_id, first_name, last_name, email, phone, state_of_residence, education_level, employment_status, programming_experience, tuition_amount, discount_amount, total_amount, currency, status, payment_status, created_at, updated_at)
   - `application_assessments` (id, application_id, programming_experience, technical_goals, weekly_commitment_hours, motivation_essay, preferred_schedule, status)
   - `emergency_contacts` (id, application_id, contact_name, relationship, phone_number, email_address, physical_address)
6. **Payments & Invoicing:**
   - `payments` (id, payment_reference, application_id, user_id, course_id, amount, original_amount, currency, gateway, channel, status, paystack_transaction_id, metadata JSONB, paid_at, verified_at, created_at)
   - `payment_events` (id, payment_id, reference, event_type, payload JSONB, created_at)
   - `invoices` (id, invoice_number, application_id, payment_id, user_id, course_id, amount_paid, total_amount, status, issued_date, pdf_url, created_at)
7. **Enrollments & Student Progress:**
   - `enrollments` (id, student_id references auth.users, course_id, application_id, payment_id, branch_id, cohort_id, status, progress_percentage, enrolled_at, completed_at, certificate_issued, created_at)
   - `lesson_progress` (id, enrollment_id, lesson_id, student_id, is_completed, completed_at, last_position_seconds)
   - `attendance` (id, cohort_id, session_date, student_id, status, notes, recorded_by, created_at)
   - `assignments` (id, course_id, module_id, title, description, max_score, due_date, created_at)
   - `assignment_submissions` (id, assignment_id, student_id, submission_text, file_url, score, feedback, status, submitted_at, graded_at, graded_by)
8. **Certificates & Verification:**
   - `certificates` (id, certificate_number, student_id, course_id, enrollment_id, issue_date, grade, verification_code, qr_code_url, pdf_url, is_revoked, created_at)
   - `certificate_verifications` (id, certificate_number, verified_at, ip_address, user_agent)
9. **Affiliate & Referral Tracking:**
   - `affiliate_profiles` (id, user_id references auth.users, referral_code, commission_rate_percentage, total_earnings, paid_earnings, pending_earnings, created_at)
   - `referrals` (id, affiliate_id, referred_user_id, application_id, referral_code, status, click_count, created_at)
   - `affiliate_commissions` (id, affiliate_id, referral_id, payment_id, enrollment_id, commission_amount, status, payout_reference, created_at)
10. **CRM, Communications & Notifications:**
    - `crm_contacts` (id, full_name, email, phone, lead_source, course_interest, status, notes, last_contacted_at, created_at)
    - `communication_logs` (id, contact_id, channel, subject, message_body, status, sent_at)
    - `notifications` (id, user_id, title, message, type, link, is_read, read_at, created_at)
11. **Analytics Telemetry:**
    - `analytics_events` (id, event_name, user_id, session_id, properties JSONB, created_at)

### Acceptance Criteria
- All 11 table domains implemented with foreign keys, constraints, and timestamps.
- Authoritative seed data loads courses, branches, cohorts, instructors, and categories.
- Migrations apply idempotently without errors.

---

# PHASE 3 — Supabase Authentication & User Profiles

## Objective
Connect frontend authentication flows to Supabase Auth with automatic profile provisioning.

- [x] Configure Supabase Auth with Email / Password and Google OAuth provider:
  - Google Client ID: `<YOUR_GOOGLE_CLIENT_ID>`
  - Google Client Secret: `<YOUR_GOOGLE_CLIENT_SECRET>`
- [x] Create PostgreSQL trigger function `public.handle_new_user()` to automatically create a `public.profiles` record upon `auth.users` insert
- [x] Connect `src/context/AuthContext.tsx` and `src/hooks/useAuth.tsx` to `supabase.auth`
- [x] Support flows:
  - User Sign Up (`supabase.auth.signUp`)
  - User Sign In (`supabase.auth.signInWithPassword`)
  - Google Social Login & Sign Up (`supabase.auth.signInWithOAuth({ provider: 'google' })`)
  - User Sign Out (`supabase.auth.signOut`)
  - Session Hydration & Auto-Refresh (`supabase.auth.onAuthStateChange`)
  - Password Reset Request (`supabase.auth.resetPasswordForEmail`)
  - Password Update (`supabase.auth.updateUser`)
  - Profile Retrieval & Editing (`public.profiles`)
- [x] Maintain exact existing frontend UI forms and validation styles with Google Auth button integration

### Acceptance Criteria
- Signup & Login support both Email/Password and Google OAuth
- Profile creation trigger automatically activates on Google OAuth authentication
- Session state updates reactively across dashboard components

---

# PHASE 4 — PostgreSQL Row Level Security (RLS) Policies

## Objective
Enforce strict multi-tenant authorization at the database level.

- [ ] Enable RLS on ALL public schema tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`)
- [ ] Define helper functions:
  - `public.is_admin()`: checks if `auth.uid()` has `admin` or `super_admin` in `public.profiles`
  - `public.is_instructor()`: checks if `auth.uid()` is in `public.instructors`
- [ ] **Public Read Policies:**
  - `courses`, `course_categories`, `course_modules`, `course_lessons` (where free preview), `branches`, `cohorts`, `instructors` → Accessible to `anon` and `authenticated`
- [ ] **Student Isolation Policies:**
  - `profiles`: Users can select/update only where `id = auth.uid()`
  - `applications`: Users can select/insert/update where `user_id = auth.uid()`
  - `payments`, `invoices`: Users can select where `user_id = auth.uid()`
  - `enrollments`: Students can select where `student_id = auth.uid()`
  - `lesson_progress`: Students can select/upsert where `student_id = auth.uid()`
  - `assignment_submissions`: Students can insert/select where `student_id = auth.uid()`
  - `notifications`: Users can select/update where `user_id = auth.uid()`
  - `certificates`: Students can view their own; Public can view verified certificates by certificate number
- [ ] **Instructor Access Policies:**
  - Instructors can view students enrolled in their assigned courses
  - Instructors can view submissions and update scores/feedback for their courses
  - Instructors can record attendance for their cohort sessions
- [ ] **Admin Access Policies:**
  - Full CRUD on courses, branches, cohorts, instructors, applications, enrollments, analytics, CRM, and system settings via `is_admin()` policy

### Acceptance Criteria
- Unauthorized users receive zero rows on sensitive queries
- Students cannot read or mutate other students' applications, payments, or grades
- Admins possess comprehensive administrative query rights

---

# PHASE 5 — Course Catalog & Multi-Campus Data Services

## Objective
Replace local static course and campus data with live PostgreSQL queries.

- [ ] Create `src/services/courseService.ts`:
  - `getCourses(filters, sort, pagination)`
  - `getCourseBySlug(slug)`
  - `getCategories()`
  - `getFeaturedCourses()`
  - `getPopularCourses()`
- [ ] Create `src/services/branchService.ts`:
  - `getBranches()`
  - `getBranchBySlug(slug)`
  - `getCohortsByCourseAndBranch(courseId, branchId)`
- [ ] Connect `src/pages/Courses/`, `src/pages/CourseDetail/`, and `src/pages/Home/` to the services with graceful offline fallback to initial academy data

### Acceptance Criteria
- Course catalog loads dynamically from Supabase
- Filtering by level, category, format, and search query works seamlessly
- Multi-campus branch and cohort availability display live capacities

---

# PHASE 6 — Application & Assessment Submission Flow

## Objective
Wire the 6-step application wizard to Supabase with server-authoritative pricing validation.

- [ ] Connect `src/pages/Apply/Apply.tsx` to Supabase:
  - Validate selected course, branch, and cohort against database records
  - Retrieve authoritative tuition amount directly from PostgreSQL `courses` table (never trust client-submitted price)
  - Generate unique `application_number` (`DTA-APP-YYYY-XXXXX`)
  - Create transaction record in `applications`, `application_assessments`, and `emergency_contacts`
- [ ] Store draft state and support application resumption
- [ ] Trigger CRM contact lead creation on application initiation

### Acceptance Criteria
- Full 6-step wizard persists applications directly to Supabase
- Pricing is guaranteed against database catalog values
- Applications link correctly to authenticated user accounts

---

# PHASE 7 — Paystack Integration via Supabase Edge Functions

## Objective
Implement secure server-side Paystack payment processing using Supabase Edge Functions (Deno / TypeScript).

- [ ] Create Edge Function: `supabase/functions/initialize-payment/index.ts`
  - Accepts `application_id` and `user_id` from authenticated client
  - Fetches authoritative amount from `applications` and `courses`
  - Generates unique reference format: `DTA_PAY_[TIMESTAMP]_[HEX]`
  - Calls Paystack Initialize API (`https://api.paystack.co/transaction/initialize`) with `sk_live_...` or `sk_test_...` from Edge Function secret
  - Creates pending `payments` row in PostgreSQL
  - Returns `authorization_url`, `access_code`, and `reference`
- [ ] Create Edge Function: `supabase/functions/verify-payment/index.ts`
  - Accepts `reference`
  - Calls Paystack Verify API (`https://api.paystack.co/transaction/verify/{reference}`)
  - Validates amount, currency (NGN), and transaction status (`success`)
  - Atomically updates payment record and invokes enrollment fulfillment
- [ ] Create Edge Function: `supabase/functions/payment-webhook/index.ts`
  - Validates Paystack HMAC SHA-512 signature (`x-paystack-signature`) against `PAYSTACK_WEBHOOK_SECRET`
  - Implements idempotent transaction processing: deduplicates repeated webhook events
  - On `charge.success`, fulfills enrollment and generates invoice atomically

### Acceptance Criteria
- Paystack secret key is NEVER exposed to the frontend
- Payments are strictly idempotent
- Spoofed frontend amounts are rejected by server-side verification

---

# PHASE 8 — Enrollment Lifecycle & Invoicing Engine

## Objective
Create atomic enrollment fulfillment upon verified payment.

- [ ] Create PostgreSQL stored procedure / function `public.fulfill_enrollment_on_payment(p_payment_reference TEXT)`:
  - Locks payment record (`FOR UPDATE`) to prevent race conditions
  - Verifies payment status is `paid`
  - Checks if enrollment already exists for `application_id` (idempotency check)
  - Creates `enrollments` record with status `enrolled` and `progress_percentage = 0`
  - Updates `applications` status to `enrolled`
  - Increments `cohorts.enrolled_count`
  - Generates `invoices` record with unique invoice number (`DTA-INV-YYYY-XXXXX`)
  - Creates welcome notification in `notifications`
  - If referral code was attached, logs `affiliate_commissions` record
- [ ] Update `src/pages/Payment/PaymentCallback.tsx` to call verification Edge Function and redirect to `/dashboard` upon confirmation

### Acceptance Criteria
- Verified payments immediately create active enrollments and invoices
- Duplicate webhook or callback triggers do NOT duplicate enrollments or invoices
- Student dashboard immediately reflects newly enrolled courses

---

# PHASE 9 — Student Dashboard & LMS Learning Portal

## Objective
Power the student portal and LMS with live Supabase database and storage data.

- [ ] Connect `src/pages/Dashboard/` overview:
  - Fetch active enrollments, course progress, upcoming cohort schedules, and unread notifications
- [ ] Connect `src/pages/LMS/` Classroom:
  - Fetch curriculum modules and lessons for enrolled courses
  - Track lesson completion with `lesson_progress` upserts
  - Load video links, lecture notes, and downloadable assets
- [ ] Create Supabase Storage buckets:
  - `course-resources` (Public read for enrolled students, admin write)
  - `assignment-submissions` (Authenticated student write, instructor read)
  - `certificates` (Public read for verified certificates, admin write)
  - `avatars` (Public read, authenticated user write for own profile)
- [ ] Connect assignment submissions and instructor grading feedback

### Acceptance Criteria
- Students can only access LMS modules for courses they have active enrollments in
- Lesson progress is saved in real-time to PostgreSQL
- File uploads for assignments persist securely in Supabase Storage

---

# PHASE 10 — Certificates, Attendance & Instructor Portals

## Objective
Implement cryptographic certificate verification, attendance tracking, and instructor dashboards.

- [ ] Certificate Generation:
  - Generate certificate record upon course completion (100% lessons + passing assignment scores)
  - Unique verification code format: `DTA-CERT-[YEAR]-[RANDOM]`
- [ ] Public Certificate Verification Route (`/verify/:certId`):
  - Queries `certificates` joined with `courses` and `profiles`
  - Publicly displays student name, course title, completion date, and credential status without exposing private student email or phone
- [ ] Attendance Tracking:
  - Instructors mark attendance for cohort sessions
  - Calculates attendance percentage dynamically on student dashboard
- [ ] Instructor Portal:
  - View assigned cohorts, student submissions, and submit feedback with score grades

### Acceptance Criteria
- Public certificate verification works for valid certificates and returns 404 for invalid codes
- Only instructors and admins can grade submissions and take attendance

---

# PHASE 11 — Affiliate / Referral Tracking Engine

## Objective
Implement database-backed referral tracking, qualification, and commission accounting.

- [ ] Create `affiliate_profiles` for registered users with unique referral codes
- [ ] Connect referral landing links (`/apply?ref=CODE`) to capture affiliate tracking in session/cookies
- [ ] On application submission, link `referrals.affiliate_id`
- [ ] On successful payment verification, calculate commission (e.g., 10%) and insert `affiliate_commissions` record
- [ ] Prevent self-referrals (`affiliate.user_id != applicant.user_id`)
- [ ] Connect Affiliate Dashboard (`/dashboard/referrals`) to display total referrals, conversion rate, and commission payouts

### Acceptance Criteria
- Referral tracking persists across application and checkout flows
- Commissions are credited only on verified enrollments
- Self-referrals are rejected by database constraints and Edge Function logic

---

# PHASE 12 — CRM, Notifications & Admin Management Hubs

## Objective
Wire the comprehensive admin management portals and CRM communications to Supabase.

- [ ] **Admin Course Management (`/admin/courses`):** Create, edit, toggle visibility, update pricing and curriculum modules
- [ ] **Admin Student & Application Management (`/admin/students`, `/admin/applications`):** Filter by status, campus branch, payment state, export data
- [ ] **Admin Hubs & Cohorts (`/admin/hubs`):** Manage branch details, cohort capacities, and active schedules
- [ ] **CRM Contacts & Broadcasts (`/admin/crm`):** View leads captured from contact forms, WhatsApp clicks, and unfinished applications; record communication logs
- [ ] **In-App Notifications:** Real-time notification feed for students (application updates, payment receipts, class announcements)

### Acceptance Criteria
- All admin portals enforce `is_admin()` server-side via PostgreSQL RLS
- CRUD actions persist reliably to Supabase database
- Leads and communications logged for CRM visibility

---

# PHASE 13 — Analytics Telemetry Layer

## Objective
Implement a privacy-respecting analytics event telemetry pipeline in Supabase.

- [ ] Create `src/services/analytics.ts` Supabase telemetry sink:
  - Track course views, catalog search/filters, application step progress, payment initiations, checkout completions, LMS engagement
- [ ] Provide aggregated query views for the Admin Analytics Dashboard (`/admin/analytics`):
  - Daily/weekly application conversion rates
  - Revenue breakdown by course and campus branch
  - Student learning retention and completion metrics

### Acceptance Criteria
- Telemetry events stream asynchronously to `analytics_events` table without blocking UI thread
- Admin analytics dashboard renders live metrics from PostgreSQL aggregations

---

# PHASE 14 — Security Hardening, RLS Audit & Cleanup

## Objective
Audit the entire system for zero secret leaks, airtight RLS policies, and remove all obsolete legacy backend artifacts.

- [ ] Complete RLS audit across all 11 table domains
- [ ] Verify Storage bucket security policies
- [ ] Verify zero occurrences of `SUPABASE_SERVICE_ROLE_KEY` or Paystack Secret Key in frontend code
- [ ] Clean up and delete obsolete legacy `backend/` scaffolding (PHP/PDO files)
- [ ] Update documentation files (`docs/api_contract.md`, `README.md`, `.env.example`, `docs/deployment.md`)

### Acceptance Criteria
- All tests passing cleanly (`npm test`)
- TypeScript compiles without errors (`npx tsc --noEmit`)
- Single unified backend architecture: **Supabase + Paystack**
