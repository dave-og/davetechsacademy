# Dave Techs Academy — Backend Development TODO

## Backend Stack

- Frontend already completed: React 18 + TypeScript + Vite
- Backend: PHP
- Database: MySQL
- Payment: Paystack
- API style: REST API
- Existing product scope: course discovery, application/enrollment, multi-campus learning, student LMS, certificate verification, affiliate/referral, admin management, CRM/communications, analytics

> This TODO is based directly on the Dave Techs Academy Executive Overview & Platform Summary. The backend should be built to power the already-completed frontend rather than redesigning it.

---

# PHASE 0 — Backend Readiness & Frontend/API Contract

## Objective
Prepare the completed frontend for backend integration.

- [ ] Back up/tag the current completed frontend
- [ ] Review every frontend route that requires backend data
- [ ] Review existing mock/seed/localStorage data
- [ ] Identify every frontend form and required field
- [ ] Identify every dashboard data requirement
- [ ] Identify every admin data requirement
- [ ] Identify payment states used by the frontend
- [ ] Identify notification states
- [ ] Identify certificate data requirements
- [ ] Identify affiliate/referral data requirements
- [ ] Identify existing API placeholders
- [ ] Define API base URL
- [ ] Define `/api/v1` versioning convention
- [ ] Define request/response JSON format
- [ ] Define standard error response
- [ ] Define pagination/filter/sort conventions
- [ ] Define authentication/session strategy
- [ ] Define date/time format
- [ ] Define NGN/₦ currency handling
- [ ] Produce an API contract before implementation

### Acceptance
- [ ] Every backend-dependent frontend feature has a planned endpoint
- [ ] Existing frontend routes/components are preserved
- [ ] Temporary frontend persistence is documented for migration

---

# PHASE 1 — PHP Backend Foundation

## Objective
Create the core PHP API architecture.

- [ ] Initialize PHP backend project
- [ ] Configure environment variables
- [ ] Configure development environment
- [ ] Configure production environment
- [ ] Create public API entry point
- [ ] Create API router
- [ ] Create controllers
- [ ] Create services/business logic layer
- [ ] Create repositories/data-access layer
- [ ] Create models/data-transfer structures
- [ ] Create middleware system
- [ ] Create request validation layer
- [ ] Create standardized API response helper
- [ ] Create centralized exception/error handling
- [ ] Create logging
- [ ] Configure CORS appropriately
- [ ] Create API rate limiting
- [ ] Use PDO with prepared statements
- [ ] Create database configuration
- [ ] Create health-check endpoint

### Suggested Structure

```text
backend/
├── public/
├── config/
├── routes/
├── controllers/
├── services/
├── repositories/
├── models/
├── middleware/
├── validators/
├── database/
├── storage/
├── logs/
└── tests/
```

### Acceptance
- [ ] PHP API starts successfully
- [ ] Health endpoint responds
- [ ] Database connection works
- [ ] Standard JSON responses work
- [ ] Errors are handled consistently

---

# PHASE 2 — MySQL Database Architecture

## Objective
Build the persistent data layer required by the platform.

### Core Tables

- [ ] users
- [ ] roles
- [ ] permissions
- [ ] user_roles
- [ ] course_categories
- [ ] courses
- [ ] course_modules
- [ ] course_lessons
- [ ] instructors
- [ ] instructor_courses
- [ ] branches
- [ ] branch_courses
- [ ] cohorts
- [ ] applications
- [ ] application_assessments
- [ ] emergency_contacts
- [ ] enrollments
- [ ] payments
- [ ] payment_events
- [ ] invoices
- [ ] notifications
- [ ] attendance
- [ ] assignments
- [ ] assignment_submissions
- [ ] instructor_feedback
- [ ] certificates
- [ ] certificate_verifications
- [ ] affiliate_profiles
- [ ] referrals
- [ ] affiliate_commissions
- [ ] analytics_events
- [ ] crm_contacts
- [ ] communication_logs

### Database Design

- [ ] Define primary keys
- [ ] Define foreign keys
- [ ] Define unique constraints
- [ ] Define indexes
- [ ] Define created/updated timestamps
- [ ] Define appropriate status fields
- [ ] Define soft-delete/deactivation rules where required
- [ ] Define transactional boundaries
- [ ] Create migrations
- [ ] Create rollback strategy
- [ ] Create seeders
- [ ] Seed course categories
- [ ] Seed initial course records from approved academy data
- [ ] Seed instructor records from approved academy data
- [ ] Seed the currently documented branches
- [ ] Seed cohorts only where approved

### Acceptance
- [ ] Database can be created from a clean installation
- [ ] Migrations run successfully
- [ ] Seed data loads successfully
- [ ] Relationships enforce referential integrity
- [ ] Critical duplicate records are prevented

---

# PHASE 3 — Authentication & Authorization

## Objective
Replace frontend-only authentication with secure PHP/MySQL authentication.

### Student Authentication

- [ ] Register endpoint
- [ ] Login endpoint
- [ ] Logout endpoint
- [ ] Current-user endpoint
- [ ] Forgot-password endpoint
- [ ] Reset-password endpoint
- [ ] Change-password endpoint
- [ ] Get profile endpoint
- [ ] Update profile endpoint

### Security

- [ ] Secure password hashing
- [ ] Never store plain-text passwords
- [ ] Secure session/token mechanism
- [ ] Secure cookie configuration where applicable
- [ ] Authentication middleware
- [ ] Session/token expiration
- [ ] Login rate limiting
- [ ] Input validation
- [ ] Authorization checks
- [ ] Prevent account enumeration where appropriate

### Roles

- [ ] Student role
- [ ] Instructor role
- [ ] Admin role
- [ ] Super Admin role if required

### Acceptance
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Password recovery works
- [ ] Protected API routes reject unauthenticated requests
- [ ] Role-protected routes reject unauthorized users
- [ ] Students cannot access another student's private records

---

# PHASE 4 — Course & Catalog API

## Objective
Power the completed course catalog with MySQL-backed data.

### Public Course API

- [ ] List courses
- [ ] Get course by ID
- [ ] Get course by slug
- [ ] List categories
- [ ] List featured courses
- [ ] List popular courses
- [ ] Search courses
- [ ] Filter by skill level
- [ ] Filter by learning mode
- [ ] Filter by duration
- [ ] Filter by category
- [ ] Sort by price
- [ ] Sort by rating
- [ ] Sort by popularity
- [ ] Sort by newest
- [ ] Paginate course results

### Course Details

- [ ] Description
- [ ] Price
- [ ] Level
- [ ] Duration
- [ ] Learning modes
- [ ] Curriculum
- [ ] Weekly objectives
- [ ] Capstone project
- [ ] Industry tools
- [ ] Prerequisites
- [ ] FAQs
- [ ] Instructor
- [ ] Student satisfaction/rating data
- [ ] Certificate information
- [ ] Related courses

### Admin Course Management

- [ ] Create course
- [ ] Update course
- [ ] Activate/deactivate course
- [ ] Update course price
- [ ] Update duration
- [ ] Update description
- [ ] Manage curriculum
- [ ] Assign instructor
- [ ] Manage category

### Acceptance
- [ ] Frontend course cards load from API
- [ ] Search/filter/sort work
- [ ] Course detail pages load from API
- [ ] Inactive courses are not presented as available for new enrollment

---

# PHASE 5 — Branch / Campus / Cohort API

## Objective
Implement the multi-campus network described in the overview.

### Documented Branches

- [ ] Abeokuta Main Campus — Tech Innovation Corridor, Oke-Mosan
- [ ] Victoria Island Executive Campus — Adeola Odeku Street, VI, Lagos
- [ ] Ikeja Tech Hub — Allen Avenue, Ikeja, Lagos
- [ ] Ibadan Innovation Center — Ring Road, Ibadan, Oyo State

### Branch Data

- [ ] Branch name
- [ ] Address
- [ ] Contact information
- [ ] Opening hours
- [ ] Coordinates/map information
- [ ] Amenities
- [ ] Capacity
- [ ] Availability status

### Amenities Model

- [ ] High-spec labs
- [ ] 24/7 solar power
- [ ] Starlink/fiber internet

Only store/display these as branch facts when the academy confirms them.

### Cohorts

- [ ] Create cohort
- [ ] Assign course
- [ ] Assign branch
- [ ] Morning schedule
- [ ] Afternoon schedule
- [ ] Weekend schedule
- [ ] Start date
- [ ] End date
- [ ] Capacity
- [ ] Current enrollment count
- [ ] Cohort status

### Acceptance
- [ ] Frontend branch page loads from API
- [ ] Branch/course relationships work
- [ ] Cohorts can be selected only for valid course/branch combinations
- [ ] Capacity rules are enforced server-side

---

# PHASE 6 — Application & Enrollment API

## Objective
Implement the interactive multi-step `/apply` workflow.

### Application Fields

- [ ] Program/course selection
- [ ] Campus selection
- [ ] Cohort selection
- [ ] Learning mode
- [ ] Student information
- [ ] Background assessment
- [ ] Emergency contact
- [ ] Application summary
- [ ] Pricing breakdown

### Application States

- [ ] Draft
- [ ] Submitted
- [ ] Payment Pending
- [ ] Payment Processing
- [ ] Paid
- [ ] Confirmed
- [ ] Enrolled
- [ ] Cancelled

### Application API

- [ ] Create application
- [ ] Save draft
- [ ] Update draft
- [ ] Submit application
- [ ] Get application
- [ ] List current user's applications
- [ ] Admin application list
- [ ] Admin application detail
- [ ] Admin status update

### Business Rules

- [ ] Authenticate user before final enrollment
- [ ] Validate active course
- [ ] Get authoritative price from database
- [ ] Require branch for physical learning
- [ ] Validate cohort belongs to selected course/branch
- [ ] Check cohort capacity
- [ ] Prevent invalid application combinations
- [ ] Prevent duplicate active applications where business rules disallow them
- [ ] Generate unique application IDs

### Acceptance
- [ ] User can complete the multi-step application
- [ ] Invalid combinations are rejected by the server
- [ ] Application data persists in MySQL
- [ ] Application summary matches authoritative backend values

---

# PHASE 7 — Paystack Payment Engine

## Objective
Implement the payment engine described in the overview.

### Payment Initialization

- [ ] Create payment initialization endpoint
- [ ] Generate unique payment reference
- [ ] Use `DTA_PAY_*` reference format
- [ ] Load authoritative amount from application/course
- [ ] Confirm application is payable
- [ ] Create pending payment record
- [ ] Initialize Paystack transaction
- [ ] Return checkout details to frontend

### Payment Verification

- [ ] Create payment callback endpoint
- [ ] Verify transaction server-side
- [ ] Validate reference
- [ ] Validate application
- [ ] Validate amount
- [ ] Validate currency
- [ ] Update payment status
- [ ] Record payment event
- [ ] Trigger enrollment only after verified success
- [ ] Make verification idempotent
- [ ] Handle repeat callbacks safely

### Payment States

- [ ] Pending
- [ ] Processing
- [ ] Successful
- [ ] Failed
- [ ] Abandoned
- [ ] Refunded

### Invoice / Receipt

- [ ] Create invoice record
- [ ] Create receipt record/data
- [ ] Store payment metadata
- [ ] Provide receipt/invoice API
- [ ] Provide PDF-ready receipt data/file generation path

### Security

- [ ] Keep Paystack secret credentials server-side
- [ ] Sanitize payment-related payloads
- [ ] Rate-limit payment initialization
- [ ] Prevent duplicate charge processing
- [ ] Avoid exposing sensitive payment data in logs

### Acceptance
- [ ] Successful payment becomes a verified backend event
- [ ] Failed payment does not confirm enrollment
- [ ] Repeated callbacks do not duplicate payment/enrollment records
- [ ] Frontend cannot manipulate course price

---

# PHASE 8 — Enrollment & Student Lifecycle

## Objective
Persist verified enrollments and support the lifecycle defined in the overview.

### Enrollment

- [ ] Create enrollment
- [ ] Link student
- [ ] Link application
- [ ] Link course
- [ ] Link payment
- [ ] Link branch where applicable
- [ ] Link cohort
- [ ] Record enrollment date
- [ ] Record start date
- [ ] Record completion status

### Lifecycle

```text
New Application
→ Payment Pending
→ Enrolled
→ Active Student
→ Alumnus
```

### Acceptance
- [ ] One verified payment creates the correct enrollment
- [ ] Enrollment is visible to the student
- [ ] Enrollment is visible to authorized admin users
- [ ] Lifecycle status can be updated according to business rules

---

# PHASE 9 — Student Dashboard API

## Objective
Power `/dashboard` with persistent student data.

### Dashboard Overview

- [ ] Enrollment status
- [ ] Upcoming classes
- [ ] Attendance metrics
- [ ] Quick links
- [ ] Active courses
- [ ] Applications
- [ ] Payments
- [ ] Notifications
- [ ] Learning progress

### My Courses

- [ ] List enrolled courses
- [ ] Progress
- [ ] Instructor
- [ ] Schedule
- [ ] Learning mode
- [ ] Start date
- [ ] Status

### Applications

- [ ] Application history
- [ ] Application status
- [ ] Course
- [ ] Branch
- [ ] Cohort
- [ ] Payment state

### Payments

- [ ] Transaction history
- [ ] Amount
- [ ] Currency
- [ ] Date
- [ ] Reference
- [ ] Status
- [ ] Invoice/receipt access

### Acceptance
- [ ] Dashboard data comes from backend
- [ ] Student sees only their own private data
- [ ] Refreshing does not lose server-backed data

---

# PHASE 10 — LMS / Learning Portal

## Objective
Implement `/learn` backend support exactly for the learning features defined in the overview.

### Learning Structure

- [ ] Course modules
- [ ] Lessons
- [ ] Weekly objectives
- [ ] Video lecture metadata/integration
- [ ] Markdown lecture notes
- [ ] Downloadable toolkits
- [ ] Code sandbox metadata/configuration
- [ ] Lesson completion
- [ ] Course progress

### Assignments

- [ ] Create assignment
- [ ] Assign assignment to course/module
- [ ] Submit assignment
- [ ] Store submission
- [ ] Track submission status
- [ ] Instructor feedback
- [ ] Grading fields where applicable

### Access Control

- [ ] Enrolled students can access their enrolled course content
- [ ] Students cannot access another student's private submission data
- [ ] Instructors can access assigned course content
- [ ] Admins can manage learning content

### Acceptance
- [ ] `/learn` loads database-backed course content
- [ ] Student progress persists
- [ ] Assignment submissions persist
- [ ] Instructor feedback is visible to the correct student

---

# PHASE 11 — Instructor & Mentor Backend

## Objective
Support instructor-facing data and workflows.

### Instructor Profile

- [ ] Profile
- [ ] Credentials
- [ ] Expertise
- [ ] Experience
- [ ] Assigned courses

### Instructor Functions

- [ ] View assigned courses
- [ ] View enrolled students
- [ ] View assignments
- [ ] Review submissions
- [ ] Provide feedback
- [ ] Manage authorized curriculum content
- [ ] Record attendance where authorized

### Acceptance
- [ ] Instructor access is restricted to authorized content
- [ ] Instructor-course relationships are persisted
- [ ] Feedback is linked to the correct submission/student

---

# PHASE 12 — Attendance Backend

## Objective
Support attendance tracking and dashboard attendance metrics.

- [ ] Create class-session model
- [ ] Assign sessions to cohorts
- [ ] Record attendance
- [ ] Update attendance
- [ ] View attendance history
- [ ] Calculate attendance percentage
- [ ] Student attendance endpoint
- [ ] Instructor attendance endpoint
- [ ] Admin attendance endpoint
- [ ] Enforce authorization

---

# PHASE 13 — Certificate & Verification Backend

## Objective
Implement the graduation and verified-certification flow.

### Certificates

- [ ] Define certificate eligibility rules
- [ ] Generate unique certificate ID
- [ ] Link certificate to student
- [ ] Link certificate to course
- [ ] Record issue date
- [ ] Record completion status
- [ ] Record certificate status

### Verification

- [ ] Create `/verify/:certId` API
- [ ] Public certificate verification endpoint
- [ ] Return verification status
- [ ] Support QR-compatible verification URL
- [ ] Prevent unauthorized certificate changes

### Student

- [ ] View earned certificates
- [ ] View verification link
- [ ] Access certificate data

### Acceptance
- [ ] Valid certificate can be publicly verified
- [ ] Invalid/nonexistent certificate is clearly reported
- [ ] Student certificate access is restricted appropriately

---

# PHASE 14 — Affiliate / Referral Backend

## Objective
Implement `/affiliate` functionality from the overview.

### Affiliate Profile

- [ ] Create affiliate profile
- [ ] Generate unique referral code
- [ ] Generate referral URL
- [ ] Track referred visitors
- [ ] Track referred applications
- [ ] Track qualifying enrollments
- [ ] Calculate commissions
- [ ] Track commission status

### Affiliate Dashboard

- [ ] Referral count
- [ ] Conversion count
- [ ] Commission totals
- [ ] Referral history
- [ ] Promotional asset metadata

### Protection

- [ ] Prevent self-referral
- [ ] Prevent duplicate commissions
- [ ] Define qualifying event before commission creation
- [ ] Protect affiliate records

---

# PHASE 15 — Notifications & Automated Communication

## Objective
Implement the automated communication requirements in the overview.

### Notification Types

- [ ] Welcome onboarding
- [ ] Application submission
- [ ] Payment confirmation
- [ ] Cohort kickoff reminder
- [ ] Class reminder
- [ ] Schedule change
- [ ] Assignment feedback
- [ ] Certificate availability
- [ ] Academy announcements

### In-App Notifications

- [ ] Create notification record
- [ ] Read/unread state
- [ ] Notification list endpoint
- [ ] Mark as read endpoint
- [ ] Notification preferences where required

### Email/Communication Layer

- [ ] Create email service abstraction
- [ ] Create communication templates
- [ ] Log communications
- [ ] Support course-specific communication
- [ ] Support branch-specific communication
- [ ] Support application-status communication

### CRM Segments

- [ ] New leads
- [ ] Course-interest leads
- [ ] Payment-pending applicants
- [ ] Enrolled students
- [ ] Active students
- [ ] Alumni
- [ ] Branch-specific audiences
- [ ] Course-specific audiences

---

# PHASE 16 — Admin Dashboard Backend

## Objective
Power `/admin` with authoritative backend data.

### Executive Analytics

- [ ] Gross revenue
- [ ] Active cohort enrollment
- [ ] Application conversion ratio
- [ ] Popular tech tracks
- [ ] Recent applications
- [ ] Enrollment trends
- [ ] Branch enrollment
- [ ] Cohort capacity/utilization

### Course & Curriculum Management

- [ ] Course CRUD
- [ ] Category CRUD
- [ ] Curriculum management
- [ ] Pricing management
- [ ] Instructor assignment
- [ ] Course activation/deactivation

### Student & Application CRM

- [ ] Student list
- [ ] Search
- [ ] Filtering
- [ ] Student detail
- [ ] Application pipeline
- [ ] Payment status
- [ ] Enrollment status
- [ ] Bulk communication support

### Campus Logistics

- [ ] Branch management
- [ ] Branch capacity
- [ ] Cohort timings
- [ ] Course availability
- [ ] Workstation/seat availability where required

---

# PHASE 17 — Analytics Backend

## Objective
Create the event and reporting system required for product and growth visibility.

### Track Events

- [ ] Page view
- [ ] Course view
- [ ] Course search
- [ ] Course filter
- [ ] Apply click
- [ ] Signup started
- [ ] Signup completed
- [ ] Application started
- [ ] Application submitted
- [ ] Payment started
- [ ] Payment successful
- [ ] Payment failed
- [ ] Enrollment created
- [ ] Lesson completed
- [ ] Assignment submitted
- [ ] Certificate issued

### Reports

- [ ] Popular courses
- [ ] Application funnel
- [ ] Payment totals
- [ ] Enrollment trends
- [ ] Branch performance
- [ ] Cohort utilization
- [ ] Student lifecycle counts

---

# PHASE 18 — Replace Frontend Mock Persistence

## Objective
Move the completed frontend from temporary/mock data to PHP/MySQL-backed data.

- [ ] Replace LocalStorage course source with API
- [ ] Replace LocalStorage user state with backend authentication state
- [ ] Replace mock applications with database records
- [ ] Replace mock payment state with backend payment records
- [ ] Replace mock dashboard data with API data
- [ ] Replace mock admin data with API data
- [ ] Remove obsolete mock persistence where no longer needed
- [ ] Keep appropriate browser-only preferences such as theme locally
- [ ] Confirm no sensitive information is unnecessarily stored in browser storage

### Acceptance
- [ ] Data persists after refresh
- [ ] Same account works across devices
- [ ] Admin changes propagate to the frontend
- [ ] Backend is the source of truth for important records

---

# PHASE 19 — Security Hardening

## Objective
Secure the PHP/MySQL system before production.

### API Security

- [ ] HTTPS in production
- [ ] Authentication middleware
- [ ] Role authorization
- [ ] Server-side validation
- [ ] Prepared SQL statements
- [ ] Output handling
- [ ] CORS restrictions
- [ ] Rate limiting
- [ ] Request-size limits
- [ ] Secure file handling
- [ ] Security logging

### Database Security

- [ ] Least-privilege DB account
- [ ] Environment-based database credentials
- [ ] No secrets committed to source control
- [ ] Database backup strategy
- [ ] Restore test
- [ ] Production database access restrictions

### Payment Security

- [ ] Server-side course price lookup
- [ ] Server-side Paystack verification
- [ ] Idempotency protection
- [ ] Duplicate callback protection
- [ ] Secure callback/webhook handling where applicable
- [ ] No secret Paystack credentials in React

### Authentication Security

- [ ] Secure password hashing
- [ ] Session/token expiry
- [ ] Secure cookies where applicable
- [ ] Password reset safeguards
- [ ] Brute-force protection

---

# PHASE 20 — API Documentation

## Objective
Document the backend so the existing frontend and future developers can integrate reliably.

- [ ] Document auth endpoints
- [ ] Document course endpoints
- [ ] Document branch endpoints
- [ ] Document cohort endpoints
- [ ] Document application endpoints
- [ ] Document payment endpoints
- [ ] Document enrollment endpoints
- [ ] Document dashboard endpoints
- [ ] Document LMS endpoints
- [ ] Document instructor endpoints
- [ ] Document attendance endpoints
- [ ] Document certificate endpoints
- [ ] Document affiliate endpoints
- [ ] Document notification endpoints
- [ ] Document admin endpoints
- [ ] Document analytics endpoints
- [ ] Document authentication requirements
- [ ] Document request/response examples
- [ ] Document error responses
- [ ] Document HTTP status usage

---

# PHASE 21 — Automated Testing

## Unit Tests

- [ ] Validation
- [ ] Authentication logic
- [ ] Authorization logic
- [ ] Course pricing logic
- [ ] Application state logic
- [ ] Enrollment logic
- [ ] Payment state logic
- [ ] Certificate eligibility
- [ ] Affiliate commission logic

## Integration Tests

- [ ] Auth + MySQL
- [ ] Course API + MySQL
- [ ] Branch/cohort API + MySQL
- [ ] Application + MySQL
- [ ] Paystack flow
- [ ] Enrollment flow
- [ ] Student dashboard API
- [ ] LMS API
- [ ] Certificate verification
- [ ] Admin APIs

## Security Tests

- [ ] Unauthorized endpoint access
- [ ] Role bypass attempts
- [ ] Invalid IDs
- [ ] SQL injection protection
- [ ] XSS input handling
- [ ] Rate limiting
- [ ] Duplicate payment callbacks
- [ ] Privilege escalation attempts

---

# PHASE 22 — End-to-End Testing

## Student Flow

- [ ] Browse courses
- [ ] Search/filter courses
- [ ] Open course details
- [ ] Create account
- [ ] Submit application
- [ ] Select learning mode
- [ ] Select branch
- [ ] Select cohort
- [ ] Review application
- [ ] Pay through Paystack
- [ ] Verify payment
- [ ] Confirm enrollment
- [ ] Open dashboard
- [ ] Access learning portal
- [ ] Track progress
- [ ] Submit assignment
- [ ] View feedback
- [ ] Access certificate after eligibility

## Instructor Flow

- [ ] Login
- [ ] View assigned courses
- [ ] View students
- [ ] View assignments
- [ ] Review submissions
- [ ] Give feedback
- [ ] Record attendance

## Admin Flow

- [ ] Login
- [ ] View analytics
- [ ] View applications
- [ ] View payments
- [ ] View students
- [ ] Manage courses
- [ ] Manage curriculum
- [ ] Manage branches
- [ ] Manage cohorts
- [ ] Manage instructors
- [ ] Manage communications
- [ ] Manage certificates

---

# PHASE 23 — Performance & Scalability

- [ ] Add appropriate database indexes
- [ ] Optimize heavy queries
- [ ] Add pagination to large datasets
- [ ] Prevent unnecessary repeated queries
- [ ] Optimize course/catalog API responses
- [ ] Optimize admin analytics queries
- [ ] Add appropriate caching
- [ ] Add rate limiting
- [ ] Monitor API response time
- [ ] Load-test critical endpoints
- [ ] Load-test course catalog
- [ ] Load-test application endpoints
- [ ] Load-test payment initialization
- [ ] Review database growth expectations

---

# PHASE 24 — Production Deployment

## PHP Server

- [ ] Choose production PHP hosting
- [ ] Configure supported PHP runtime
- [ ] Configure web server
- [ ] Configure HTTPS
- [ ] Configure environment variables
- [ ] Configure API domain/subdomain if needed
- [ ] Configure production logs
- [ ] Configure error monitoring

## MySQL

- [ ] Create production database
- [ ] Create restricted database user
- [ ] Run migrations
- [ ] Load approved production data
- [ ] Configure backups
- [ ] Test restore

## Frontend Integration

- [ ] Set production API URL
- [ ] Configure CORS
- [ ] Configure production Paystack settings
- [ ] Configure payment callback URL
- [ ] Test authenticated API requests
- [ ] Test dashboard data
- [ ] Test admin requests

---

# PHASE 25 — Production Data & Business Validation

- [ ] Confirm final course list
- [ ] Confirm final course prices
- [ ] Confirm course descriptions
- [ ] Confirm course durations
- [ ] Confirm learning modes
- [ ] Confirm branch information
- [ ] Confirm branch amenities
- [ ] Confirm cohort schedules
- [ ] Confirm instructor data
- [ ] Confirm Paystack configuration
- [ ] Confirm refund/cancellation policy
- [ ] Confirm communication templates
- [ ] Confirm certificate rules
- [ ] Confirm affiliate rules

> Do not publish unconfirmed business information just because it exists in development seed data.

---

# PHASE 26 — Final Production Release Gate

The backend is ready for production only when:

- [ ] Authentication is secure
- [ ] Authorization is enforced
- [ ] Courses are database-backed
- [ ] Course details are database-backed
- [ ] Branches are database-backed
- [ ] Cohorts are database-backed
- [ ] Applications persist in MySQL
- [ ] Payments persist in MySQL
- [ ] Paystack verification is server-side
- [ ] Enrollment follows verified payment
- [ ] Student dashboard is database-backed
- [ ] LMS content persists
- [ ] Assignments persist
- [ ] Attendance persists
- [ ] Certificates can be issued/verified
- [ ] Affiliate/referral data persists
- [ ] Notifications work
- [ ] Admin dashboard uses live data
- [ ] Analytics work
- [ ] CRM/communication data is queryable
- [ ] Security checks pass
- [ ] Automated tests pass
- [ ] End-to-end tests pass
- [ ] Performance checks pass
- [ ] Backups are working
- [ ] API documentation is complete
- [ ] Frontend-to-backend integration passes

---

# Recommended Build Sequence

```text
Phase 0  → Backend readiness / API contract
Phase 1  → PHP foundation
Phase 2  → MySQL architecture
Phase 3  → Authentication & authorization
Phase 4  → Courses / catalog
Phase 5  → Branches / cohorts
Phase 6  → Applications
Phase 7  → Paystack
Phase 8  → Enrollment
Phase 9  → Student dashboard
Phase 10 → LMS
Phase 11 → Instructor backend
Phase 12 → Attendance
Phase 13 → Certificates
Phase 14 → Affiliate / referral
Phase 15 → Notifications / CRM
Phase 16 → Admin backend
Phase 17 → Analytics
Phase 18 → Frontend data migration
Phase 19 → Security hardening
Phase 20 → API documentation
Phase 21 → Automated tests
Phase 22 → End-to-end tests
Phase 23 → Performance / scalability
Phase 24 → Deployment
Phase 25 → Production data validation
Phase 26 → Production release gate
```

---

# Critical Rules

- [ ] Do not redesign the completed frontend while implementing the backend
- [ ] Do not treat LocalStorage as the source of truth for users, applications, enrollments, payments or other important persistent records after migration
- [ ] Do not trust prices sent by the frontend
- [ ] Verify Paystack transactions server-side
- [ ] Make payment processing idempotent
- [ ] Never expose Paystack secret credentials in frontend code
- [ ] Never store plain-text passwords
- [ ] Never trust role/permission claims supplied by the browser
- [ ] Students must only access their own private records
- [ ] Admin privileges must be enforced server-side
- [ ] Validate business rules on the server
- [ ] Use database transactions for payment-to-enrollment operations
- [ ] Preserve financial/enrollment history appropriately
- [ ] Do not invent academy facts, course prices, branch amenities, schedules or statistics
- [ ] Do not mark an enrollment successful solely because the frontend reaches a success screen
- [ ] Keep the backend as the source of truth for critical business data

---

# Final Backend Target

The completed system should operate as:

```text
                 DAVE TECHS FRONTEND
                   React + TypeScript
                           │
                           │ REST API
                           ▼
                    PHP BACKEND
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
          MySQL                       Paystack
        Database                       Gateway
```

Supporting the complete product lifecycle:

```text
Visitor
   ↓
Course Discovery
   ↓
Account / Authentication
   ↓
Application
   ↓
Branch / Cohort Selection
   ↓
Paystack Payment
   ↓
Verified Enrollment
   ↓
Student Dashboard
   ↓
Learning Portal
   ↓
Assignments / Attendance / Progress
   ↓
Graduation
   ↓
Certificate Verification
```

and the administrative lifecycle:

```text
Admin
 ↓
Courses
 ↓
Curriculum
 ↓
Students
 ↓
Applications
 ↓
Payments
 ↓
Enrollments
 ↓
Branches / Cohorts
 ↓
Communications / CRM
 ↓
Analytics
```

## Definition of Done

The backend phase is complete when the already-built Dave Techs frontend can function as a real, persistent application through the PHP REST API and MySQL database, while Paystack handles the payment flow and the documented student, instructor, certificate, affiliate and admin capabilities are securely supported.
