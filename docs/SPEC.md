# Dev Techs Academy --- Product Requirements Document (PRD)

**Product:** Dev Techs Academy Website\
**Document Version:** 1.0\
**Status:** Product Definition / Upgrade Specification\
**Platform:** Responsive Web Application\
**Primary Stack:** TypeScript + React + Vite\
**Payment Provider:** Paystack\
**Brand:** Dev Techs Academy\
**Primary Brand Colors:** Black + Gold\
**Secondary UI Support:** Dark Theme + Light Theme

------------------------------------------------------------------------

## 1. Product Overview

Dev Techs Academy is a modern technology education platform designed to
connect learners with practical technology training both **online and
physically at academy branches**.

The website should function as more than a marketing landing page. It
should become the central digital platform through which a visitor can:

-   Discover technology courses.
-   Compare courses, prices, duration, level and learning mode.
-   Create an account and log in.
-   Apply for a course.
-   Select online or physical learning.
-   Select an available physical branch where applicable.
-   Pay securely through Paystack.
-   Receive confirmation after successful payment.
-   Track their applications/enrollments from a learner dashboard.
-   Receive course-related communication.
-   Contact Dev Techs for assistance.
-   Discover new courses and opportunities.

The upgraded website should feel like a **premium technology academy**,
with strong visual hierarchy, polished animations, responsive layouts
and a clear conversion path from visitor → course discovery →
application → payment → enrollment.

------------------------------------------------------------------------

# 2. Product Vision

### Vision Statement

> Build a trusted, visually impressive and conversion-focused technology
> academy platform that makes it simple for anyone, anywhere to
> discover, pay for and begin practical technology training.

### Core Business Goal

Turn the website into a digital acquisition and enrollment channel for
Dev Techs Academy.

### Primary Success Path

**Discover → Explore → Choose Course → Create/Login → Select Learning
Mode → Apply → Pay with Paystack → Confirmation → Enrollment/Dashboard**

------------------------------------------------------------------------

# 3. Problem Statement

The current website already communicates the academy's purpose and
displays courses, but it behaves primarily like a static promotional
website.

The upgraded product needs to solve the following problems:

1.  Visitors need a clearer way to understand all available courses.
2.  Visitors need to know whether a course is online or physical.
3.  Prospective students need a structured application process.
4.  The academy needs to collect useful learner information.
5.  Payments need to be integrated directly into the enrollment flow.
6.  Learners need accounts instead of relying entirely on manual
    communication.
7.  The academy needs a way to communicate with learners based on their
    selected courses.
8.  The interface needs stronger visual polish, animation and
    interaction.
9.  The website needs to work well on phones, tablets and desktops.
10. The platform should be structured so additional branches, courses
    and features can be added later.

------------------------------------------------------------------------

# 4. Target Users

## 4.1 Prospective Student

A person who wants to learn a technology skill.

### Needs

-   Understand available courses.
-   See price and duration.
-   Compare courses.
-   Know whether training is online or physical.
-   Apply easily.
-   Pay securely.
-   Receive confirmation.

------------------------------------------------------------------------

## 4.2 Existing Student

A learner who has already registered.

### Needs

-   Log in.
-   View enrolled courses.
-   See application/payment status.
-   View course information.
-   Receive announcements.
-   Access relevant learning resources when available.

------------------------------------------------------------------------

## 4.3 Academy Staff / Admin

The internal team managing the academy.

### Needs

-   View applications.
-   View students.
-   View payments.
-   Manage courses.
-   Manage branches.
-   Communicate with students.
-   Monitor enrollments.

------------------------------------------------------------------------

# 5. Product Goals

## Primary Goals

-   Increase course applications.
-   Increase completed online payments.
-   Present the academy as a professional technology institution.
-   Support both online and physical training.
-   Make course discovery fast and intuitive.
-   Create a scalable foundation for future LMS functionality.
-   Improve mobile usability.
-   Build trust through testimonials, statistics, instructor profiles
    and academy information.

## Secondary Goals

-   Collect qualified student information.
-   Reduce manual enrollment work.
-   Enable course-specific communication.
-   Support multiple physical branches in the future.
-   Provide analytics on course interest and enrollment.

------------------------------------------------------------------------

# 6. Non-Goals for Initial Release

The first version does not need to be a complete enterprise Learning
Management System.

The following can be deferred:

-   Full video-hosting infrastructure.
-   Advanced examinations.
-   Automated certificates with verification.
-   Complex instructor payroll.
-   Live classroom video infrastructure.
-   Community/forum system.
-   Advanced AI tutor.
-   Multi-currency international payments beyond what the chosen payment
    setup supports.

These should be considered future phases.

------------------------------------------------------------------------

# 7. Current Interface Analysis

The existing interface provides a useful foundation but should be
upgraded substantially.

## Existing Strengths

-   Clear academy concept.
-   Course cards are already present.
-   Course images create visual differentiation.
-   Navigation includes Home, Courses, About, Instructors and
    Testimonials.
-   Login and Get Started actions already exist.
-   The hero section communicates the academy's value proposition.
-   Course cards display:
    -   Course title.
    -   Level.
    -   Duration.
    -   Rating.
    -   Price.
    -   Enrollment CTA.
-   "Why Choose Dev Techs?" section exists.
-   "Your learning journey" section exists.
-   Dark blue technology-oriented visual direction already exists.

## Existing Problems / Upgrade Opportunities

### 1. Branding is inconsistent

The requested brand identity is **Black + Gold**, while the current
interface relies heavily on blue.

The upgraded design should establish black/gold as the primary identity
while allowing dark blue/neon elements only as controlled secondary
accents where useful.

### 2. The course section is visually repetitive

Every card follows almost the same visual structure.

Improve this with:

-   Hover elevation.
-   Image zoom.
-   Gold border glow.
-   CTA micro-animation.
-   Course badges.
-   Better spacing.
-   Filtering.
-   Search.
-   Category labels.

### 3. The hero section needs stronger conversion

The hero should immediately answer:

-   What is Dev Techs?
-   What can I learn?
-   Why should I trust Dev Techs?
-   Can I learn online?
-   Can I attend physically?
-   What should I do next?

Primary CTA:

**Explore Courses**

Secondary CTA:

**Apply Now**

### 4. The current lower sections need stronger visual hierarchy

"Why Choose Dev Techs?" and "Your Learning Journey" should be redesigned
as polished sections with:

-   Scroll reveal.
-   Icon animations.
-   Number/stat counters.
-   Cards.
-   Timeline effects.
-   Hover interactions.

### 5. The website needs real application functionality

The current course CTA should not simply behave like a visual button.

It should initiate:

**Course → Application → Authentication → Learning Mode →
Branch/Location → Payment → Confirmation**

------------------------------------------------------------------------

# 8. Information Architecture

Recommended navigation:

-   Home
-   Courses
-   Learning
-   About
-   Instructors
-   Branches
-   Testimonials
-   Contact
-   Login
-   Apply Now

After authentication:

-   Dashboard
-   My Courses
-   Applications
-   Payments
-   Profile
-   Notifications
-   Logout

------------------------------------------------------------------------

# 9. Homepage Requirements

## 9.1 Header

Desktop header:

-   Dev Techs logo.
-   Home.
-   Courses.
-   About.
-   Instructors.
-   Testimonials.
-   Contact.
-   Theme toggle.
-   Login.
-   Apply Now.

Mobile header:

-   Logo.
-   Menu icon.
-   Login.
-   Apply Now or a compact CTA.

### Header Behavior

The header should:

-   Become sticky after scrolling.
-   Slightly change background opacity when scrolling.
-   Use a subtle backdrop blur.
-   Animate menu opening/closing.
-   Highlight the active page.
-   Provide smooth navigation.

------------------------------------------------------------------------

# 10. Hero Section

## Content

Suggested headline:

> **Build the Skills. Build the Future.**

Alternative:

> **Master In-Demand Tech Skills and Build Your Future.**

Supporting copy:

> Learn practical technology skills from experienced instructors through
> flexible online training or hands-on physical classes.

### CTA

Primary:

**Explore Courses**

Secondary:

**Apply Now**

Additional trust indicators:

-   Students trained.
-   Expert instructors.
-   Courses available.
-   Online + physical learning.
-   Certificates.

### Animation

Recommended:

-   Text fade-up.
-   Hero image subtle floating animation.
-   Background particles/grid.
-   Gold light sweep.
-   CTA hover glow.
-   Statistics count-up animation.
-   Staggered entrance animations.

Animations must remain lightweight and should respect
`prefers-reduced-motion`.

------------------------------------------------------------------------

# 11. Course Catalog

The course catalog is one of the most important areas of the product.

## Course Card Requirements

Each course card should contain:

-   Image.
-   Course name.
-   Short description.
-   Skill level.
-   Duration.
-   Price.
-   Rating.
-   Number of learners/reviews.
-   Learning modes.
-   Course category.
-   CTA.

Example:

**Frontend Development**

Beginner · 10 Weeks

₦46,000

★★★★★ 4.9

**Online \| Physical**

\[View Details\] \[Apply Now\]

------------------------------------------------------------------------

# 12. Course Search and Filtering

The catalog should support:

### Search

Search by:

-   Course name.
-   Technology.
-   Category.
-   Skill.

Example:

Searching "Python" should return Python-related courses.

### Filters

-   Category.
-   Beginner.
-   Intermediate.
-   Advanced.
-   Online.
-   Physical.
-   Price range.
-   Duration.

### Sorting

-   Popular.
-   Newest.
-   Lowest price.
-   Highest price.
-   Shortest duration.
-   Highest rated.

------------------------------------------------------------------------

# 13. Course Details Page

Every course should have its own dedicated page.

## Required Sections

### Course Overview

-   Course title.
-   Hero image.
-   Description.
-   Price.
-   Duration.
-   Level.
-   Learning modes.
-   Rating.
-   Enrollment count.

### What You Will Learn

A structured list of skills.

### Curriculum

Example:

**Module 1 --- Introduction**

**Module 2 --- Core Concepts**

**Module 3 --- Practical Projects**

**Module 4 --- Advanced Concepts**

**Module 5 --- Final Project**

### Requirements

What the student needs before starting.

### Projects

Show practical projects learners will build.

### Instructor

-   Profile photo.
-   Name.
-   Expertise.
-   Experience.

### Certificate

Explain whether the course includes a certificate.

### FAQ

Course-specific questions.

### CTA

**Apply for this Course**

------------------------------------------------------------------------

# 14. Learning Mode Selection

During application, students should choose:

### Option A --- Online

Suitable for students who cannot attend physically.

Information shown:

-   Online class schedule.
-   Platform used.
-   Class duration.
-   Requirements.
-   How course access works.

### Option B --- Physical

Student selects:

-   Preferred branch.
-   Preferred schedule.
-   Available cohort.

If no suitable branch exists:

**Request a Branch / Contact Us**

------------------------------------------------------------------------

# 15. Branch System

Because the academy intends to have physical branches, the website
should support multiple branches from the beginning.

Each branch should contain:

-   Branch name.
-   Location.
-   Address.
-   Phone/contact.
-   Opening hours.
-   Courses available.
-   Available cohorts.
-   Map location.
-   Availability status.

Example:

**Dev Techs --- Abeokuta Branch**

Location: Abeokuta, Ogun State

Available modes:

-   Physical
-   Online

CTA:

**Choose This Branch**

------------------------------------------------------------------------

# 16. Application Flow

The application process should be simple and multi-step.

## Step 1 --- Select Course

Display:

-   Course.
-   Price.
-   Duration.
-   Learning level.

## Step 2 --- Account

Options:

-   Login.
-   Create Account.

## Step 3 --- Student Information

Collect:

-   Full name.
-   Email.
-   Phone number.
-   Country.
-   State.
-   Preferred contact method.

Do not collect unnecessary information.

## Step 4 --- Learning Mode

Choose:

-   Online.
-   Physical.

## Step 5 --- Branch / Cohort

For physical:

-   Select branch.
-   Select available cohort/time.

For online:

-   Select available cohort.

## Step 6 --- Review

Show:

-   Student information.
-   Course.
-   Learning mode.
-   Branch.
-   Price.
-   Payment summary.

## Step 7 --- Payment

Proceed to Paystack.

## Step 8 --- Confirmation

After successful payment:

> **Application Successful!**

Display:

-   Student name.
-   Course.
-   Application ID.
-   Payment reference.
-   Learning mode.
-   Branch/cohort.
-   Next steps.

Send confirmation through the configured communication channel.

------------------------------------------------------------------------

# 17. Authentication

The platform should provide:

## Create Account

Fields:

-   Full name.
-   Email.
-   Phone.
-   Password.
-   Confirm password.

Optional:

-   Referral code.

### Validation

-   Valid email.
-   Required fields.
-   Strong password.
-   Password confirmation.
-   Duplicate account handling.

## Login

Fields:

-   Email.
-   Password.

Features:

-   Remember session.
-   Forgot password.
-   Show/hide password.
-   Loading state.
-   Error messages.

------------------------------------------------------------------------

# 18. Post-Signup Experience

After successful account creation, display a polished confirmation
modal.

Example:

> **Welcome to Dev Techs! 🎉**
>
> Your account has been created successfully.
>
> You can now explore courses and apply for the training that fits your
> goals.

Buttons:

**Explore Courses**

**Go to Dashboard**

The modal should animate in smoothly.

------------------------------------------------------------------------

# 19. Post-Payment Experience

After successful Paystack payment:

> **Payment Successful!**

Display:

-   Course.
-   Amount paid.
-   Payment reference.
-   Application ID.
-   Learning mode.
-   Next steps.

Actions:

**Go to Dashboard**

**View Application**

**Download Receipt**

The application status should change to:

**Paid / Confirmed**

------------------------------------------------------------------------

# 20. Paystack Integration

Paystack should be used for online payments.

## Payment Requirements

The system should:

1.  Create an application.
2.  Generate a payment transaction.
3.  Redirect/open Paystack checkout.
4.  Complete payment.
5.  Verify the transaction securely.
6.  Update application/payment status.
7.  Display confirmation.
8.  Prevent duplicate enrollment caused by repeated callbacks.

### Important Technical Requirement

Payment verification should be performed server-side.

The frontend must never be treated as the final authority for successful
payment.

### Payment States

-   Pending.
-   Processing.
-   Successful.
-   Failed.
-   Abandoned.
-   Refunded.

------------------------------------------------------------------------

# 21. Student Dashboard

After login, the learner should see a dashboard.

## Dashboard Overview

Show:

-   Welcome message.
-   Active courses.
-   Applications.
-   Payment status.
-   Upcoming classes.
-   Notifications.
-   Progress.

Example:

> Welcome back, David 👋

### My Courses

Each course displays:

-   Course name.
-   Progress.
-   Instructor.
-   Schedule.
-   Learning mode.
-   Start date.
-   Status.

### Applications

Show:

-   Course.
-   Date.
-   Status.
-   Payment.
-   Learning mode.

### Payments

Show:

-   Amount.
-   Date.
-   Course.
-   Reference.
-   Status.
-   Receipt.

------------------------------------------------------------------------

# 22. Instructor Section

Create a dedicated instructor area.

Each instructor card:

-   Image.
-   Name.
-   Role.
-   Expertise.
-   Experience.
-   Courses taught.

Hover:

-   Image scale.
-   Gold border.
-   Social/profile icon reveal.

Instructor details can later include:

-   Biography.
-   Qualifications.
-   Courses.
-   Reviews.

------------------------------------------------------------------------

# 23. Testimonials

The testimonial section should build trust.

Each testimonial can contain:

-   Student photo/avatar.
-   Name.
-   Course.
-   Rating.
-   Testimonial.
-   Optional location.

Add:

-   Carousel.
-   Auto-scroll.
-   Swipe support on mobile.
-   Pause on hover.

Avoid excessive animation.

------------------------------------------------------------------------

# 24. Why Choose Dev Techs?

Redesign the existing section into feature cards.

Recommended benefits:

1.  **Practical Projects**
    -   Build real-world projects for your portfolio.
2.  **Expert Mentors**
    -   Learn from experienced professionals.
3.  **Flexible Learning**
    -   Choose online or physical training.
4.  **Career Support**
    -   Get guidance after training.
5.  **Industry Exposure**
    -   Learn skills relevant to real-world technology work.
6.  **Certificate**
    -   Receive a certificate after completing eligible training.

Each card should have:

-   Icon.
-   Heading.
-   Description.
-   Hover animation.

------------------------------------------------------------------------

# 25. Learning Journey

Create an animated timeline:

### Step 1 --- Choose a Course

Explore courses and choose the right one.

### Step 2 --- Apply

Select online or physical learning.

### Step 3 --- Pay

Complete secure payment through Paystack.

### Step 4 --- Learn

Attend classes and complete practical projects.

### Step 5 --- Graduate

Complete your course and receive your certificate where applicable.

### Step 6 --- Grow

Continue building your portfolio and career.

The timeline should animate as the user scrolls.

------------------------------------------------------------------------

# 26. Course Categories

Recommended categories:

-   Software Development
-   Data & AI
-   Cybersecurity
-   Design
-   Cloud & DevOps
-   Mobile Development
-   Emerging Technology
-   Digital Skills

------------------------------------------------------------------------

# 27. Proposed Course Catalog

The existing screenshot provides the initial price reference.

  Course                            Level                      Duration   Proposed Price
  --------------------------------- ----------------------- ----------- ----------------
  UI/UX Design                      Beginner                    8 weeks          ₦46,000
  Frontend Development              Beginner                   10 weeks          ₦46,000
  Backend Development               Intermediate               12 weeks          ₦46,000
  Full-Stack Development            Beginner                  6 weeks\*          ₦46,000
  Graphics Design                   Beginner                    6 weeks          ₦60,000
  App Development                   Beginner                    6 weeks          ₦90,000
  Data Analysis                     Beginner                    6 weeks          ₦90,000
  Video Editing                     Beginner                    6 weeks          ₦60,000
  DevOps & Cloud Computing          Beginner                    6 weeks          ₦35,000
  Cybersecurity                     Intermediate               12 weeks          ₦50,000
  AI & Machine Learning             Intermediate               12 weeks          ₦85,000
  Data Science                      Intermediate               12 weeks          ₦90,000
  Robotics                          Beginner/Intermediate      10 weeks          ₦85,000
  Python Programming                Beginner                    8 weeks          ₦55,000
  Product Design                    Beginner                    8 weeks          ₦60,000
  Ethical Hacking                   Intermediate               10 weeks          ₦60,000
  Computer Networking               Beginner                    8 weeks          ₦50,000
  Software Testing / QA             Beginner                    8 weeks          ₦50,000
  Digital Marketing                 Beginner                    6 weeks          ₦50,000
  WordPress & No-Code Development   Beginner                    6 weeks          ₦40,000

\*The Full-Stack duration should be reviewed because full-stack training
normally requires substantial coverage.

**Important:** These additional prices are product-design placeholders
based on the current price range. Final academy pricing should be
confirmed before launch.

------------------------------------------------------------------------

# 28. Contact System

Contact page should provide:

-   Contact form.
-   Phone.
-   Email.
-   Social media.
-   Branch locations.
-   Business hours.
-   Map.

Contact form:

-   Name.
-   Email.
-   Phone.
-   Subject.
-   Message.
-   Optional course of interest.

------------------------------------------------------------------------

# 29. Course-Specific Lead Capture

The academy should know what each visitor is interested in.

When a visitor clicks:

**Interested in Cybersecurity**

the system should associate that lead with Cybersecurity.

This enables future communication such as:

-   Cohort announcements.
-   Course reminders.
-   Discounts.
-   New class dates.
-   Related courses.

------------------------------------------------------------------------

# 30. Notifications

Authenticated users should receive notifications for:

-   Application confirmation.
-   Payment confirmation.
-   Course start date.
-   Class schedule.
-   Schedule changes.
-   Academy announcements.
-   Certificate availability.

Notification states:

-   Unread.
-   Read.

------------------------------------------------------------------------

# 31. Theme System

Provide:

### Dark Mode

Primary academy experience.

Suggested palette:

-   Black: `#050505`
-   Near-black: `#0B0B0B`
-   Gold: `#D4AF37`
-   Bright gold: `#F5D76E`
-   White: `#FFFFFF`
-   Muted text: `#B8B8B8`

### Light Mode

Suggested palette:

-   Background: `#FAFAFA`
-   Surface: `#FFFFFF`
-   Text: `#111111`
-   Gold: `#B8860B`
-   Muted text: `#5F5F5F`

The exact palette can be refined during UI implementation.

Theme preference should persist locally.

------------------------------------------------------------------------

# 32. Animation & Motion Design

Animation should communicate hierarchy rather than exist merely for
decoration.

## Global

-   Smooth page transitions.
-   Scroll reveal.
-   Fade-up.
-   Scale-in.
-   Staggered children.
-   Hover transitions.

## Buttons

Hover:

-   Slight scale.
-   Gold glow.
-   Background transition.

Active:

-   Slight press-down effect.

## Course Cards

Hover:

-   Translate upward slightly.
-   Image zoom.
-   Border glow.
-   CTA emphasis.

## Navigation

-   Active underline/gold indicator.
-   Smooth mobile menu.

## Statistics

Animate numbers when entering the viewport.

## Hero

Use:

-   Floating visual elements.
-   Subtle particle/grid background.
-   Light movement.
-   Text entrance.

Avoid:

-   Constant flashing.
-   Excessive bouncing.
-   Long animations.
-   Animations that interfere with reading.

------------------------------------------------------------------------

# 33. Microinteractions

Recommended microinteractions:

-   Button loading spinner.
-   Success checkmark.
-   Form validation animation.
-   Password visibility toggle.
-   Copy payment reference.
-   Toast notifications.
-   Course bookmark/favorite.
-   Hover tooltips.
-   Skeleton loaders.
-   Empty-state illustrations.

------------------------------------------------------------------------

# 34. Loading States

Never leave the user staring at a blank screen.

Use skeleton loaders for:

-   Course cards.
-   Dashboard.
-   Instructor cards.
-   Testimonials.

Buttons should show:

**Processing...**

during:

-   Login.
-   Signup.
-   Application submission.
-   Payment initialization.

------------------------------------------------------------------------

# 35. Error Handling

The platform must provide human-readable errors.

Examples:

### Login

> Email or password is incorrect.

### Payment

> We couldn't complete your payment. Please try again.

### Network

> You're currently offline. Check your internet connection and try
> again.

### Course

> This course is currently unavailable for enrollment.

### Application

> We couldn't submit your application. Please try again.

Avoid exposing technical errors to users.

------------------------------------------------------------------------

# 36. Responsive Design

The website must be designed mobile-first.

## Mobile

-   Single-column layouts.
-   Bottom-friendly CTAs.
-   Collapsible navigation.
-   Touch-friendly buttons.
-   Swipeable testimonials.
-   Horizontally scrollable filters where appropriate.

## Tablet

-   Two-column course grids.
-   Optimized spacing.

## Desktop

-   Four-column course catalog where space allows.
-   Expanded navigation.
-   Larger hero.
-   Multi-column sections.

Target breakpoints should be based on content rather than device names.

------------------------------------------------------------------------

# 37. Accessibility

Requirements:

-   Semantic HTML.
-   Keyboard navigation.
-   Visible focus states.
-   Alt text for meaningful images.
-   Sufficient color contrast.
-   Proper heading hierarchy.
-   Accessible form labels.
-   Accessible modal behavior.
-   `prefers-reduced-motion` support.
-   Buttons must be actual buttons.
-   Links must navigate to meaningful destinations.

Gold text should not be placed on backgrounds where contrast becomes
insufficient.

------------------------------------------------------------------------

# 38. SEO Requirements

Every public course should have a dedicated SEO-friendly URL.

Example:

`/courses/frontend-development`

Each course page should support:

-   Unique title.
-   Meta description.
-   Open Graph metadata.
-   Structured data where appropriate.
-   Search-friendly headings.
-   Descriptive image alt text.

The homepage should target terms around:

-   Tech academy Nigeria.
-   Coding academy.
-   Technology training.
-   Online tech courses.
-   Physical tech training.
-   Programming courses.
-   Cybersecurity training.
-   Data analysis training.

SEO copy should remain natural rather than keyword-stuffed.

------------------------------------------------------------------------

# 39. Performance Requirements

Target:

-   Fast initial page load.
-   Optimized images.
-   Lazy-loaded course images.
-   Code splitting.
-   Minified production assets.
-   Avoid unnecessarily large animation libraries.
-   Avoid blocking scripts.
-   Responsive image sizes.

Animations must not significantly reduce performance on lower-end
devices.

------------------------------------------------------------------------

# 40. Recommended Frontend Architecture

Suggested structure:

``` text
src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── courses/
│   ├── auth/
│   ├── application/
│   ├── dashboard/
│   └── ui/
├── pages/
│   ├── Home/
│   ├── Courses/
│   ├── CourseDetails/
│   ├── About/
│   ├── Instructors/
│   ├── Testimonials/
│   ├── Contact/
│   ├── Login/
│   ├── Signup/
│   ├── Apply/
│   └── Dashboard/
├── hooks/
├── services/
├── data/
├── types/
├── utils/
├── routes/
└── styles/
```

------------------------------------------------------------------------

# 41. Suggested Data Models

## Course

``` ts
type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  learningModes: ("online" | "physical")[];
  instructorIds: string[];
  featured: boolean;
  active: boolean;
};
```

## Student

``` ts
type Student = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state?: string;
  createdAt: string;
};
```

## Application

``` ts
type Application = {
  id: string;
  studentId: string;
  courseId: string;
  learningMode: "online" | "physical";
  branchId?: string;
  cohortId?: string;
  paymentStatus: "pending" | "successful" | "failed" | "refunded";
  applicationStatus: "pending" | "confirmed" | "cancelled";
  paymentReference?: string;
  createdAt: string;
};
```

------------------------------------------------------------------------

# 42. Backend / Integration Requirements

Although the current project may start as a frontend React/Vite
application, the requested functionality cannot safely remain entirely
frontend-only.

The following require a backend or trusted server-side service:

-   Authentication.
-   Password management.
-   Student records.
-   Application records.
-   Payment verification.
-   Paystack secret-key operations.
-   Course enrollment records.
-   Branch/cohort management.
-   Notifications.
-   Admin operations.

A possible future architecture:

**React/Vite Frontend → API/Backend → Database**

with:

**Backend → Paystack**

The frontend should never expose secret API keys.

------------------------------------------------------------------------

# 43. Admin Dashboard --- Recommended Future Feature

An admin dashboard should eventually allow academy staff to manage the
platform.

## Admin Overview

Display:

-   Total students.
-   Total applications.
-   Successful payments.
-   Revenue.
-   Popular courses.
-   Recent applications.
-   Upcoming cohorts.

## Course Management

Admin can:

-   Add course.
-   Edit course.
-   Delete/deactivate course.
-   Change price.
-   Change duration.
-   Upload image.
-   Assign instructors.

## Student Management

Admin can:

-   View students.
-   Search students.
-   Filter by course.
-   View application history.
-   View payment status.

## Branch Management

Admin can:

-   Add branch.
-   Edit branch.
-   Set available courses.
-   Set cohorts.
-   Disable branch.

------------------------------------------------------------------------

# 44. Communication / CRM Requirements

Because the academy wants to reach customers based on their courses, the
system should maintain course-interest information.

Recommended lead attributes:

-   Name.
-   Email.
-   Phone.
-   Course interest.
-   Application status.
-   Payment status.
-   Learning mode.
-   Branch.
-   Cohort.
-   Signup date.

Possible integrations later:

-   Email marketing platform.
-   WhatsApp Business workflow.
-   CRM.
-   SMS provider.

The system should support segmented communication such as:

> Students interested in Cybersecurity

or:

> Students who applied for Frontend Development but have not completed
> payment.

------------------------------------------------------------------------

# 45. Security Requirements

-   Hash passwords using a secure authentication system.
-   Never store plain-text passwords.
-   Keep Paystack secret keys server-side.
-   Validate all submitted data server-side.
-   Protect authenticated routes.
-   Use HTTPS in production.
-   Implement rate limiting where appropriate.
-   Protect against duplicate payments.
-   Do not trust price values submitted by the browser.
-   Server should retrieve the authoritative course price before
    creating payment.

------------------------------------------------------------------------

# 46. Analytics

Recommended events:

-   Page viewed.
-   Course viewed.
-   Course search.
-   Course filter used.
-   Apply button clicked.
-   Signup started.
-   Signup completed.
-   Application started.
-   Application completed.
-   Payment started.
-   Payment successful.
-   Payment failed.
-   Contact form submitted.

This will allow Dev Techs to identify where users drop out of the
enrollment funnel.

------------------------------------------------------------------------

# 47. Conversion Optimization

The website should continuously guide visitors toward enrollment.

Recommended CTAs:

-   Explore Courses.
-   View Course.
-   Apply Now.
-   Start Learning.
-   Choose This Course.
-   Join the Next Cohort.

CTA placement:

-   Hero.
-   Course cards.
-   Course details.
-   Mid-page CTA.
-   End of course catalog.
-   Footer.

Avoid placing too many competing CTAs in one section.

------------------------------------------------------------------------

# 48. Trust Signals

Add:

-   Number of students.
-   Number of courses.
-   Instructor experience.
-   Student testimonials.
-   Project examples.
-   Certificates.
-   Partner logos where legitimate.
-   Branch information.
-   Clear contact information.

Do not display fabricated statistics. All figures must be backed by real
academy data.

------------------------------------------------------------------------

# 49. Footer

Footer should contain:

### Academy

-   About.
-   Courses.
-   Instructors.
-   Branches.
-   Careers.

### Support

-   Contact.
-   FAQs.
-   Payment help.
-   Terms.
-   Privacy.

### Courses

-   Software Development.
-   Data & AI.
-   Cybersecurity.
-   Design.
-   Cloud & DevOps.

### Social

-   Facebook.
-   Instagram.
-   LinkedIn.
-   X/Twitter.
-   YouTube where applicable.

Include:

**© Dev Techs Academy --- All Rights Reserved.**

------------------------------------------------------------------------

# 50. Legal Pages

Before accepting payments, the platform should include:

-   Terms & Conditions.
-   Privacy Policy.
-   Refund/Cancellation Policy.
-   Payment Terms.

The refund policy should clearly explain what happens after payment and
before a course begins.

------------------------------------------------------------------------

# 51. Recommended Page List

``` text
/
├── /courses
├── /courses/:slug
├── /about
├── /instructors
├── /instructors/:id
├── /branches
├── /testimonials
├── /contact
├── /login
├── /signup
├── /forgot-password
├── /apply/:courseId
├── /payment/callback
├── /dashboard
├── /dashboard/courses
├── /dashboard/applications
├── /dashboard/payments
├── /dashboard/notifications
├── /dashboard/profile
├── /terms
├── /privacy
└── /refund-policy
```

------------------------------------------------------------------------

# 52. Feature Prioritization

## P0 --- Must Have

These are required for the first serious production version:

-   Responsive redesign.
-   Black/gold visual system.
-   Homepage.
-   Course catalog.
-   Course details.
-   Course search/filter.
-   Signup.
-   Login.
-   Password recovery.
-   Application flow.
-   Online/physical selection.
-   Branch selection.
-   Paystack integration.
-   Payment verification.
-   Application confirmation.
-   Student dashboard.
-   Basic notifications.
-   Contact form.
-   Theme toggle.

## P1 --- High Value

-   Instructor profiles.
-   Advanced testimonials.
-   Course favorites.
-   Email notifications.
-   Course-specific lead segmentation.
-   Admin dashboard.
-   Branch management.
-   Cohort management.
-   Analytics.
-   Receipt generation.

## P2 --- Future

-   Full LMS.
-   Video lessons.
-   Quizzes.
-   Exams.
-   Assignments.
-   Certificates.
-   Certificate verification.
-   Student community.
-   AI learning assistant.
-   Referral system.
-   Affiliate system.
-   Job board.
-   Career marketplace.

------------------------------------------------------------------------

# 53. Development Phases

## Phase 1 --- UI/UX Foundation

-   Establish black/gold design system.
-   Redesign header.
-   Redesign hero.
-   Redesign course cards.
-   Redesign Why Choose section.
-   Redesign Learning Journey.
-   Redesign footer.
-   Add responsive layouts.
-   Add light/dark theme.

### Deliverable

A polished responsive marketing website.

------------------------------------------------------------------------

## Phase 2 --- Course Experience

-   Course catalog.
-   Search.
-   Filters.
-   Course details.
-   Course categories.
-   Course data structure.
-   Course application CTA.

### Deliverable

Users can discover and understand courses.

------------------------------------------------------------------------

## Phase 3 --- Authentication

-   Signup.
-   Login.
-   Logout.
-   Forgot password.
-   Protected routes.
-   User profile.

### Deliverable

Users can create and manage accounts.

------------------------------------------------------------------------

## Phase 4 --- Application System

-   Application form.
-   Online/physical selection.
-   Branch selection.
-   Cohort selection.
-   Application review.
-   Application status.

### Deliverable

Users can submit structured applications.

------------------------------------------------------------------------

## Phase 5 --- Paystack

-   Payment initialization.
-   Checkout.
-   Server-side verification.
-   Payment status.
-   Application confirmation.
-   Receipt/reference.

### Deliverable

Users can pay securely and receive enrollment confirmation.

------------------------------------------------------------------------

## Phase 6 --- Student Dashboard

-   Dashboard overview.
-   My Courses.
-   Applications.
-   Payments.
-   Notifications.
-   Profile.

### Deliverable

Students can manage their academy relationship.

------------------------------------------------------------------------

## Phase 7 --- Admin Platform

-   Admin authentication.
-   Course management.
-   Student management.
-   Application management.
-   Payment management.
-   Branch management.
-   Cohort management.

### Deliverable

Staff can operate the academy digitally.

------------------------------------------------------------------------

## Phase 8 --- Growth & Optimization

-   Analytics.
-   CRM integration.
-   Email automation.
-   WhatsApp/SMS integration.
-   SEO optimization.
-   Performance optimization.
-   Conversion optimization.

### Deliverable

A scalable acquisition and retention platform.

------------------------------------------------------------------------

# 54. Core User Stories

## Visitor

> As a visitor, I want to browse courses so that I can find a technology
> skill to learn.

## Visitor

> As a visitor, I want to filter courses by category and level so that I
> can quickly find relevant training.

## Student

> As a student, I want to create an account so that I can apply for
> courses.

## Student

> As a student, I want to choose online or physical learning so that I
> can select the format that works for me.

## Student

> As a student, I want to choose a physical branch so that I know where
> I will attend classes.

## Student

> As a student, I want to pay through Paystack so that I can complete my
> application online.

## Student

> As a student, I want to see my payment and application status so that
> I know whether my enrollment is confirmed.

## Admin

> As an administrator, I want to see applications by course so that I
> can follow up with prospective students.

## Admin

> As an administrator, I want to manage course prices so that the
> website remains current.

------------------------------------------------------------------------

# 55. Acceptance Criteria

A feature is considered complete when:

### Course Catalog

-   Courses load correctly.
-   Prices are visible.
-   Search works.
-   Filters work.
-   Mobile layout works.

### Authentication

-   Signup validates input.
-   Login works.
-   Incorrect credentials produce a clear error.
-   Authenticated pages are protected.

### Application

-   User cannot complete enrollment without required information.
-   Learning mode is mandatory.
-   Physical learning requires a branch.
-   Application summary is correct.

### Payment

-   Correct course price is sent to the payment system.
-   Payment is verified server-side.
-   Successful payment changes the application status.
-   Failed payment does not confirm enrollment.
-   Duplicate callbacks do not create duplicate enrollment records.

### Dashboard

-   User sees only their own data.
-   Applications display accurate statuses.
-   Payment information is accurate.

### Theme

-   Theme changes instantly.
-   Preference persists.
-   Both themes remain readable and accessible.

------------------------------------------------------------------------

# 56. Definition of Done

The product upgrade is ready for production when:

-   All P0 features work.
-   Mobile, tablet and desktop layouts are tested.
-   Authentication is secure.
-   Paystack payment verification is working.
-   Application records are persisted.
-   No secret keys are exposed in frontend code.
-   Main pages have proper SEO metadata.
-   Forms have validation and error states.
-   Accessibility basics are satisfied.
-   Animations work smoothly without blocking interaction.
-   `prefers-reduced-motion` is supported.
-   Production build succeeds.
-   Critical flows have been tested end-to-end.

------------------------------------------------------------------------

# 57. Final Product Experience

The desired experience should be:

**Premium → Modern → Trustworthy → Fast → Interactive → Simple**

The user should never feel lost.

A visitor should be able to enter the homepage and understand within
seconds:

1.  What Dev Techs is.
2.  What they can learn.
3.  How much courses cost.
4.  Whether they can learn online or physically.
5.  How to apply.
6.  How to pay.
7.  What happens after payment.

The design should use animation and interaction to make the product feel
modern, but functionality must always take priority over visual effects.

------------------------------------------------------------------------

# 58. Recommended Next Step

After this PRD, the implementation should be broken into:

1.  **Design system**
2.  **Component architecture**
3.  **Homepage redesign**
4.  **Course catalog**
5.  **Course details**
6.  **Authentication**
7.  **Application flow**
8.  **Paystack integration**
9.  **Student dashboard**
10. **Admin dashboard**
11. **CRM/communication**
12. **Testing and deployment**

The existing static website should therefore evolve from a **course
showcase website** into a **complete technology academy enrollment
platform**.
