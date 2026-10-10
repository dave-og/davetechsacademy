import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { PageFallback } from "../components/common/PageFallback";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { AdminRoute } from "../components/common/AdminRoute";

// Dynamic imports for code splitting
const Home = lazy(() => import("../pages/Home/Home").then((m) => ({ default: m.Home })));
const Courses = lazy(() => import("../pages/Courses/Courses").then((m) => ({ default: m.Courses })));
const CourseDetail = lazy(() => import("../pages/CourseDetail/CourseDetail").then((m) => ({ default: m.CourseDetail })));
const Instructors = lazy(() => import("../pages/Instructors/Instructors").then((m) => ({ default: m.Instructors })));
const InstructorDetail = lazy(() => import("../pages/Instructors/InstructorDetail").then((m) => ({ default: m.InstructorDetail })));
const Branches = lazy(() => import("../pages/Branches/Branches").then((m) => ({ default: m.Branches })));
const Contact = lazy(() => import("../pages/Contact/Contact").then((m) => ({ default: m.Contact })));
const Login = lazy(() => import("../pages/Auth/Login").then((m) => ({ default: m.Login })));
const Signup = lazy(() => import("../pages/Auth/Signup").then((m) => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword").then((m) => ({ default: m.ForgotPassword })));
const AuthCallback = lazy(() => import("../pages/Auth/AuthCallback").then((m) => ({ default: m.AuthCallback })));
const Apply = lazy(() => import("../pages/Apply/Apply").then((m) => ({ default: m.Apply })));
const PaymentCallback = lazy(() => import("../pages/Payment/PaymentCallback").then((m) => ({ default: m.PaymentCallback })));

// LMS, Community & Career pages (Phase 26)
const CourseClassroom = lazy(() => import("../pages/LMS/CourseClassroom").then((m) => ({ default: m.CourseClassroom })));
const VerifyCertificate = lazy(() => import("../pages/VerifyCertificate/VerifyCertificate").then((m) => ({ default: m.VerifyCertificate })));
const Community = lazy(() => import("../pages/Community/Community").then((m) => ({ default: m.Community })));
const JobBoard = lazy(() => import("../pages/Careers/JobBoard").then((m) => ({ default: m.JobBoard })));
const Affiliate = lazy(() => import("../pages/Affiliate/Affiliate").then((m) => ({ default: m.Affiliate })));

// Dashboard pages
const DashboardLayout = lazy(() => import("../pages/Dashboard/DashboardLayout").then((m) => ({ default: m.DashboardLayout })));
const DashboardOverview = lazy(() => import("../pages/Dashboard/DashboardOverview").then((m) => ({ default: m.DashboardOverview })));
const MyCourses = lazy(() => import("../pages/Dashboard/MyCourses").then((m) => ({ default: m.MyCourses })));
const ApplicationsList = lazy(() => import("../pages/Dashboard/ApplicationsList").then((m) => ({ default: m.ApplicationsList })));
const PaymentsHistory = lazy(() => import("../pages/Dashboard/PaymentsHistory").then((m) => ({ default: m.PaymentsHistory })));
const Notifications = lazy(() => import("../pages/Dashboard/Notifications").then((m) => ({ default: m.Notifications })));
const Profile = lazy(() => import("../pages/Dashboard/Profile").then((m) => ({ default: m.Profile })));
const ReferralDashboard = lazy(() => import("../pages/Dashboard/ReferralDashboard").then((m) => ({ default: m.ReferralDashboard })));
const CertificatesList = lazy(() => import("../pages/Dashboard/CertificatesList").then((m) => ({ default: m.CertificatesList })));

// Admin pages
const AdminLayout = lazy(() => import("../pages/Admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import("../pages/Admin/AdminOverview").then((m) => ({ default: m.AdminOverview })));
const CourseManager = lazy(() => import("../pages/Admin/CourseManager").then((m) => ({ default: m.CourseManager })));
const StudentManager = lazy(() => import("../pages/Admin/StudentManager").then((m) => ({ default: m.StudentManager })));
const ApplicationManager = lazy(() => import("../pages/Admin/ApplicationManager").then((m) => ({ default: m.ApplicationManager })));
const BranchManager = lazy(() => import("../pages/Admin/BranchManager").then((m) => ({ default: m.BranchManager })));
const CrmManager = lazy(() => import("../pages/Admin/CrmManager").then((m) => ({ default: m.CrmManager })));
const AnalyticsHub = lazy(() => import("../pages/Admin/AnalyticsHub").then((m) => ({ default: m.AnalyticsHub })));
const LmsManager = lazy(() => import("../pages/Admin/LmsManager").then((m) => ({ default: m.LmsManager })));

// Legal pages
const Terms = lazy(() => import("../pages/Legal/Terms").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("../pages/Legal/Privacy").then((m) => ({ default: m.Privacy })));
const RefundPolicy = lazy(() => import("../pages/Legal/RefundPolicy").then((m) => ({ default: m.RefundPolicy })));

// About, Testimonials & NotFound
const About = lazy(() => import("../pages/About/About").then((m) => ({ default: m.About })));
const Testimonials = lazy(() => import("../pages/Testimonials/Testimonials").then((m) => ({ default: m.Testimonials })));
const NotFound = lazy(() => import("../pages/NotFound/NotFound").then((m) => ({ default: m.NotFound })));

// Helper to wrap route elements in Suspense
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

// Child routes rendered inside PageLayout <Outlet />
export const routes = [
  { index: true, element: withSuspense(<Home />) },
  { path: "courses", element: withSuspense(<Courses />) },
  { path: "courses/:slug", element: withSuspense(<CourseDetail />) },
  { path: "about", element: withSuspense(<About />) },
  { path: "instructors", element: withSuspense(<Instructors />) },
  { path: "instructors/:id", element: withSuspense(<InstructorDetail />) },
  { path: "branches", element: withSuspense(<Branches />) },
  { path: "testimonials", element: withSuspense(<Testimonials />) },
  { path: "contact", element: withSuspense(<Contact />) },
  { path: "login", element: withSuspense(<Login />) },
  { path: "signup", element: withSuspense(<Signup />) },
  { path: "auth/callback", element: withSuspense(<AuthCallback />) },
  { path: "forgot-password", element: withSuspense(<ForgotPassword />) },
  { path: "reset-password", element: withSuspense(<ForgotPassword />) },
  { path: "apply", element: withSuspense(<Apply />) },
  { path: "apply/:courseId", element: withSuspense(<Apply />) },
  { path: "payment/callback", element: withSuspense(<PaymentCallback />) },

  // LMS Interactive Classroom Route
  {
    path: "learn/:courseId",
    element: withSuspense(
      <ProtectedRoute>
        <CourseClassroom />
      </ProtectedRoute>
    ),
  },

  // Public Community, Careers, Verification & Affiliate
  { path: "verify", element: withSuspense(<VerifyCertificate />) },
  { path: "verify/:certId", element: withSuspense(<VerifyCertificate />) },
  { path: "community", element: withSuspense(<Community />) },
  { path: "careers", element: withSuspense(<JobBoard />) },
  { path: "jobs", element: withSuspense(<JobBoard />) },
  { path: "affiliate", element: withSuspense(<Affiliate />) },

  // Dashboard routes
  {
    path: "dashboard",
    element: withSuspense(
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<DashboardOverview />) },
      { path: "courses", element: withSuspense(<MyCourses />) },
      { path: "applications", element: withSuspense(<ApplicationsList />) },
      { path: "payments", element: withSuspense(<PaymentsHistory />) },
      { path: "notifications", element: withSuspense(<Notifications />) },
      { path: "profile", element: withSuspense(<Profile />) },
      { path: "certificates", element: withSuspense(<CertificatesList />) },
      { path: "referrals", element: withSuspense(<ReferralDashboard />) },
    ],
  },

  // Admin routes
  {
    path: "admin",
    element: withSuspense(
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: withSuspense(<AdminOverview />) },
      { path: "overview", element: withSuspense(<AdminOverview />) },
      { path: "courses", element: withSuspense(<CourseManager />) },
      { path: "students", element: withSuspense(<StudentManager />) },
      { path: "applications", element: withSuspense(<ApplicationManager />) },
      { path: "branches", element: withSuspense(<BranchManager />) },
      { path: "crm", element: withSuspense(<CrmManager />) },
      { path: "analytics", element: withSuspense(<AnalyticsHub />) },
      { path: "lms", element: withSuspense(<LmsManager />) },
    ],
  },
  { path: "terms", element: withSuspense(<Terms />) },
  { path: "privacy", element: withSuspense(<Privacy />) },
  { path: "refund-policy", element: withSuspense(<RefundPolicy />) },
  { path: "*", element: withSuspense(<NotFound />) },
];

export { createBrowserRouter };
