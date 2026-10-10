# Dave Techs Academy — Supabase API & Data Contract Specification

**Specification Version:** `v2.0.0` (Supabase Architecture)  
**Backend Engine:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Supabase Edge Functions)  
**Authentication Strategy:** Supabase Auth with JWT Bearer Token & Session Hydration  
**Data Exchange Format:** `application/json; charset=utf-8`  
**Timezone / Datetime Standard:** ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`)  
**Currency Standard:** Nigerian Naira (NGN / ₦) — Stored internally as numeric decimal or kobo integers in PostgreSQL, validated in Edge Functions.

---

## 1. Global Architectural Conventions

### 1.1. Access Layers

Dave Techs uses a high-performance Supabase architecture:

1. **Direct Data Access (PostgreSQL via Supabase Client):**
   - Public entities (courses, branches, cohorts, public instructors) and user-scoped data (profiles, student enrollments, applications, lesson progress, submissions) are queried directly from the frontend using the official `@supabase/supabase-js` client.
   - All access is strictly governed by **PostgreSQL Row Level Security (RLS)** policies.
2. **Serverless Edge Functions (Deno / TypeScript):**
   - High-security transactions (Paystack payment initialization, payment verification, webhook ingestion, affiliate commission accounting) execute exclusively via Supabase Edge Functions where the secret key (`PAYSTACK_SECRET_KEY`) is securely held.
3. **Supabase Storage:**
   - Course assets, student project submissions, certificates, and profile avatars are served from protected and public buckets via signed URLs and Storage RLS.

```text
React 18 + Vite (Frontend)
   │
   ├── (1) Direct RLS-Enforced Client Queries ───> PostgreSQL (Supabase)
   │
   ├── (2) File Uploads / Downloads ──────────────> Supabase Storage
   │
   └── (3) Secure Financial / Business Logic ────> Supabase Edge Functions
                                                            │
                                                     Paystack Gateway
```

---

## 2. Supabase Edge Functions Contract

### 2.1. Initialize Payment (`POST /functions/v1/initialize-payment`)
- **Caller:** Authenticated student
- **Headers:** `Authorization: Bearer <user_jwt>`, `Content-Type: application/json`
- **Request Payload:**
  ```json
  {
    "application_id": "app_8f1a23bc-...",
    "callback_url": "https://davetechs.com/payment/callback"
  }
  ```
- **Server Execution:**
  - Validates user ownership of `application_id`.
  - Queries authoritative tuition fee from `courses` table in PostgreSQL.
  - Generates unique reference `DTA_PAY_[TIMESTAMP]_[HEX]`.
  - Calls Paystack API (`https://api.paystack.co/transaction/initialize`) with `PAYSTACK_SECRET_KEY`.
  - Creates record in `payments` with status `pending`.
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "authorization_url": "https://checkout.paystack.com/0123456789",
      "access_code": "0123456789",
      "reference": "DTA_PAY_1760000000_A1B2C3D4"
    }
  }
  ```

### 2.2. Verify Payment (`POST /functions/v1/verify-payment`)
- **Caller:** Frontend callback handler or Admin reconciliation
- **Headers:** `Authorization: Bearer <user_jwt>`, `Content-Type: application/json`
- **Request Payload:**
  ```json
  {
    "reference": "DTA_PAY_1760000000_A1B2C3D4"
  }
  ```
- **Server Execution:**
  - Calls Paystack Verify API (`https://api.paystack.co/transaction/verify/{reference}`).
  - Validates amount, currency (NGN), and transaction status (`success`).
  - Calls atomic database procedure `fulfill_enrollment_on_payment(reference)`.
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "status": "success",
      "reference": "DTA_PAY_1760000000_A1B2C3D4",
      "amount": 120000,
      "enrollment_id": "enr_999a888b-...",
      "invoice_number": "DTA-INV-2026-00124"
    }
  }
  ```

### 2.3. Paystack Webhook (`POST /functions/v1/payment-webhook`)
- **Caller:** Paystack Webhook Dispatcher
- **Headers:** `x-paystack-signature: <hmac_sha512>`
- **Server Execution:**
  - Verifies HMAC SHA-512 signature using `PAYSTACK_WEBHOOK_SECRET`.
  - On `charge.success`, executes atomic database enrollment fulfillment.
  - Idempotent: duplicate webhook events are acknowledged with 200 OK without re-fulfilling.

---

## 3. Frontend Route to Supabase Architecture Mapping

| Route | View Component | Supabase Product & Access Method | Authorization Role |
| :--- | :--- | :--- | :--- |
| `/` | `Home.tsx` | Supabase DB: `courses`, `course_categories`, `branches` | Public (`anon`) |
| `/courses` | `Courses.tsx` | Supabase DB: `courses`, `course_categories` (Filter, Search, Sort) | Public (`anon`) |
| `/courses/:id` | `CourseDetail.tsx` | Supabase DB: `courses`, `course_modules`, `course_lessons`, `instructors` | Public (`anon`) |
| `/apply` | `Apply.tsx` | Supabase DB: `courses`, `branches`, `cohorts`, `applications`, `emergency_contacts` | Public / Student |
| `/payment/callback` | `PaymentCallback.tsx` | Supabase Edge Function: `verify-payment` | Student |
| `/login` | `Login.tsx` | Supabase Auth: `supabase.auth.signInWithPassword` | Public |
| `/signup` | `Signup.tsx` | Supabase Auth: `supabase.auth.signUp` | Public |
| `/dashboard` | `Overview.tsx` | Supabase DB: `enrollments`, `courses`, `notifications` | Student (`auth.uid() = student_id`) |
| `/dashboard/courses` | `MyCourses.tsx` | Supabase DB: `enrollments`, `courses`, `lesson_progress` | Student (`auth.uid() = student_id`) |
| `/dashboard/courses/:id` | `LmsCourseView.tsx` | Supabase DB: `course_modules`, `course_lessons`, `lesson_progress` | Student (Enrolled only) |
| `/dashboard/applications`| `MyApplications.tsx`| Supabase DB: `applications`, `payments`, `cohorts` | Student (`auth.uid() = user_id`) |
| `/dashboard/payments` | `PaymentHistory.tsx`| Supabase DB: `payments`, `invoices` | Student (`auth.uid() = user_id`) |
| `/dashboard/notifications`| `Notifications.tsx` | Supabase DB: `notifications` | Student (`auth.uid() = user_id`) |
| `/dashboard/profile` | `Profile.tsx` | Supabase DB: `profiles`, Supabase Auth: `updateUser` | Student (`auth.uid() = id`) |
| `/dashboard/referrals` | `ReferralDashboard.tsx`| Supabase DB: `affiliate_profiles`, `referrals`, `affiliate_commissions` | Student (`auth.uid() = user_id`) |
| `/verify/:certId` | `VerifyCertificate.tsx`| Supabase DB: `certificates`, `profiles`, `courses` | Public (`anon`) |
| `/admin` | `AdminOverview.tsx` | Supabase DB: `analytics_events`, `enrollments`, `payments` | Admin (`is_admin()`) |
| `/admin/courses` | `CourseManager.tsx` | Supabase DB: `courses`, `course_modules`, `course_lessons` (CRUD) | Admin (`is_admin()`) |
| `/admin/applications`| `ApplicationManager.tsx`| Supabase DB: `applications`, `payments` (CRUD) | Admin (`is_admin()`) |
| `/admin/students` | `StudentManager.tsx` | Supabase DB: `profiles`, `enrollments` (Read/Manage) | Admin (`is_admin()`) |
| `/admin/branches` | `BranchManager.tsx` | Supabase DB: `branches`, `cohorts` (CRUD) | Admin (`is_admin()`) |
| `/admin/crm` | `CrmManager.tsx` | Supabase DB: `crm_contacts`, `communication_logs` (CRUD) | Admin (`is_admin()`) |
| `/admin/analytics` | `AnalyticsHub.tsx` | Supabase DB: `analytics_events` (Aggregations) | Admin (`is_admin()`) |
| `/admin/lms` | `LmsManager.tsx` | Supabase DB: `assignment_submissions`, `instructor_feedback` | Admin / Instructor |

---

## 4. Frontend LocalStorage to PostgreSQL Table Mapping

| LocalStorage Key | Entity | PostgreSQL Target Table | RLS Policy Model |
| :--- | :--- | :--- | :--- |
| `devtechs_registered_users` | User credentials & profiles | `auth.users` + `public.profiles` | User owns own profile; Admins view all |
| `devtechs_courses_store` | Course catalog | `public.courses`, `public.course_modules`, `public.course_lessons` | Public read; Admin write |
| `devtechs_branches_store` | Campuses & facilities | `public.branches` | Public read; Admin write |
| `devtechs_applications_store`| Applications | `public.applications`, `public.emergency_contacts` | Student reads own; Admin reads all |
| `devtechs_payment_transactions`| Paystack records | `public.payments`, `public.payment_events`, `public.invoices` | Student reads own; Edge function writes |
| `devtechs_crm_leads` | CRM leads | `public.crm_contacts` | Public insert; Admin read/manage |
| `devtechs_sent_communications`| Outbound logs | `public.communication_logs` | Admin only |
| `devtechs_analytics_events` | Telemetry events | `public.analytics_events` | Public/Auth insert; Admin aggregate |
| `devtechs_notifications_store`| In-app alerts | `public.notifications` | User owns own notifications |
| `davetechs_lms_progress` | Student progress | `public.lesson_progress`, `public.enrollments` | Enrolled student updates own |
| `davetechs_lms_submissions` | Assignments | `public.assignment_submissions` | Student submits; Instructor grades |
| `davetechs_lms_certificates` | Credentials | `public.certificates` | Public verification; Admin issue |
| `davetechs_lms_referrals` | Affiliates | `public.affiliate_profiles`, `public.referrals` | User views own earnings |

---

*This contract serves as the authoritative blueprint for the Dave Techs Academy Supabase backend architecture.*
