import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { courses, getCourseBySlug } from "../../data/courses";
import { branches, getBranchesForCourse } from "../../data/branches";
import { saveApplication, generateApplicationNumber } from "../../data/applications";
import {
  generatePaymentReference,
  recordFailedOrAbandonedPayment,
} from "../../services/paystack";
import { formatPrice } from "../../utils";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { PaystackModal } from "../../components/common/PaystackModal";
import type { Course, LearningMode, Branch, Application } from "../../types";
import "./Apply.css";

import { validateApplicationPayload } from "../../utils/validation";
import { triggerApplicationReceived, triggerPaymentAbandoned } from "../../services/crm";
import {
  trackApplicationStart,
  trackApplicationComplete,
  trackPaymentStart,
  trackPaymentAbandoned as trackPaymentAbandonedAnalytics,
  trackPaymentFailure,
} from "../../services/analytics";

const STEPS = [
  { number: 1, label: "Course" },
  { number: 2, label: "Account" },
  { number: 3, label: "Personal Info" },
  { number: 4, label: "Mode" },
  { number: 5, label: "Branch & Cohort" },
  { number: 6, label: "Review" },
];

export const Apply: React.FC = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, signup } = useAuth();


  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [createdApplication, setCreatedApplication] = useState<Application | null>(null);
  const [showPaystackModal, setShowPaystackModal] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>("");

  // Form State
  const initialCourseSlug = courseId || searchParams.get("course") || "frontend-development";
  const [selectedCourse, setSelectedCourse] = useState<Course>(
    getCourseBySlug(initialCourseSlug) || courses[0]
  );

  // Auth form state (if unauthenticated at Step 2)
  const [authTab, setAuthTab] = useState<"login" | "signup">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Student Info State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "Nigeria");
  const [state, setState] = useState(user?.state || "Ogun State");
  const [preferredContact, setPreferredContact] = useState<"email" | "whatsapp" | "phone">("whatsapp");

  // Learning Mode State
  const [learningMode, setLearningMode] = useState<LearningMode>("online");

  // Branch & Cohort State
  const availableBranches = getBranchesForCourse(selectedCourse.id);
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(
    availableBranches.length > 0 ? availableBranches[0] : branches[0]
  );
  const [selectedCohort, setSelectedCohort] = useState<string>(
    "Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)"
  );

  // Review & Confirmation State
  const [confirmedTerms, setConfirmedTerms] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync when user logs in or course param changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone);
      if (user.country) setCountry(user.country);
      if (user.state) setState(user.state);
    }
  }, [user]);

  useEffect(() => {
    const slug = courseId || searchParams.get("course");
    if (slug) {
      const match = getCourseBySlug(slug);
      if (match) {
        setSelectedCourse(match);
        trackApplicationStart(match.id, match.title);
      }
    } else {
      trackApplicationStart();
    }
  }, [courseId, searchParams]);

  // Step Navigators
  const canGoNext = (): boolean => {
    setErrors({});

    if (currentStep === 1) {
      return !!selectedCourse;
    }

    if (currentStep === 2) {
      return true; // Can proceed whether authenticated or filling details
    }

    if (currentStep === 3) {
      const errs: Record<string, string> = {};
      if (!fullName.trim()) errs.fullName = "Full name is required";
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errs.email = "Valid email is required";
      }
      if (!phone.trim()) errs.phone = "Phone number is required";
      if (!country.trim()) errs.country = "Country is required";
      if (!state.trim()) errs.state = "State is required";

      setErrors(errs);
      return Object.keys(errs).length === 0;
    }

    if (currentStep === 4) {
      return !!learningMode;
    }

    if (currentStep === 5) {
      if (learningMode === "physical" && !selectedBranch) {
        setErrors({ branch: "Please select an academy branch for physical learning" });
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleJumpToStep = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  // Inline Auth Handlers
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const res = await login({ email: authEmail, password: authPassword });
    setAuthLoading(false);
    if (res.success && res.user) {
      setFullName(res.user.fullName);
      setEmail(res.user.email);
      setPhone(res.user.phone);
      handleNext();
    } else {
      setAuthError(res.error || "Login failed");
    }
  };

  const handleInlineSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authFullName || !authEmail || !authPhone || !authPassword) {
      setAuthError("All fields are required");
      return;
    }
    setAuthLoading(true);
    const res = await signup({
      fullName: authFullName,
      email: authEmail,
      phone: authPhone,
      password: authPassword,
    });
    setAuthLoading(false);
    if (res.success && res.user) {
      setFullName(res.user.fullName);
      setEmail(res.user.email);
      setPhone(res.user.phone);
      handleNext();
    } else {
      setAuthError(res.error || "Signup failed");
    }
  };

  // Final Application Submission
  const handleSubmitApplication = async () => {
    if (!confirmedTerms) {
      setErrors({ terms: "Please check the box to confirm your application details and agree to enrollment terms." });
      return;
    }

    // Authoritative payload validation
    const validation = validateApplicationPayload({
      studentName: fullName,
      studentEmail: email,
      studentPhone: phone,
      studentCountry: country,
      studentState: state,
      preferredContactMethod: preferredContact,
      courseId: selectedCourse.id,
      learningMode,
      branchId: learningMode === "physical" ? selectedBranch?.id : undefined,
      cohort: selectedCohort,
    });

    if (!validation.isValid || !validation.data) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const appNumber = generateApplicationNumber();
    const newApp: Application = {
      id: `app_${Date.now()}`,
      applicationNumber: appNumber,
      studentId: user?.id || `stu_guest_${Date.now()}`,
      studentName: validation.data.studentName,
      studentEmail: validation.data.studentEmail,
      studentPhone: validation.data.studentPhone,
      studentCountry: validation.data.studentCountry,
      studentState: validation.data.studentState,
      preferredContactMethod: validation.data.preferredContactMethod,
      courseId: validation.data.courseId,
      courseTitle: validation.data.courseTitle,
      tuitionAmount: validation.data.tuitionAmount, // Authoritative price from catalog
      learningMode: validation.data.learningMode,
      branchId: validation.data.branchId,
      branchName: validation.data.branchName,
      cohort: validation.data.cohort,
      paymentStatus: "pending",
      applicationStatus: "pending",
      createdAt: new Date().toISOString(),
    };

    saveApplication(newApp);
    setCreatedApplication(newApp);

    // Trigger CRM & Notification for Application Received
    triggerApplicationReceived(newApp);

    const ref = generatePaymentReference(newApp.applicationNumber);
    setPaymentReference(ref);

    // Telemetry Analytics
    trackApplicationComplete(
      newApp.id,
      newApp.applicationNumber,
      newApp.courseId,
      newApp.tuitionAmount,
      newApp.cohort
    );
    trackPaymentStart(newApp.id, ref, newApp.tuitionAmount, newApp.courseTitle);

    setIsCompleted(true);
    setIsSubmitting(false);
    setShowPaystackModal(true);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handlePaystackSuccess = (ref: string) => {
    setShowPaystackModal(false);
    if (createdApplication) {
      navigate(`/payment/callback?reference=${ref}&appId=${createdApplication.id}`);
    }
  };

  const handlePaystackClose = () => {
    setShowPaystackModal(false);
    if (createdApplication && paymentReference) {
      recordFailedOrAbandonedPayment(createdApplication.id, paymentReference, "abandoned");
      triggerPaymentAbandoned(createdApplication);
      trackPaymentAbandonedAnalytics(createdApplication.id, paymentReference, createdApplication.courseTitle);
    }
  };

  const handlePaystackFail = () => {
    setShowPaystackModal(false);
    if (createdApplication && paymentReference) {
      recordFailedOrAbandonedPayment(createdApplication.id, paymentReference, "failed");
      trackPaymentFailure(createdApplication.id, paymentReference, "User cancelled or gateway transaction failed");
    }
  };

  return (
    <div className="apply-page">
      <div className="container">
        {/* Header */}
        <div className="apply-header">
          <span className="apply-header__badge">Application Portal</span>
          <h1 className="apply-header__title">
            Course <span className="text-gold">Application</span>
          </h1>
          <p className="apply-header__subtitle">
            Complete the 6-step form below to secure your admission for the upcoming training cohort
          </p>
        </div>

        {/* ─── Confirmation Screen (When Application Created) ── */}
        {isCompleted && createdApplication ? (
          <div className="apply-card confirmation-card">
            <div className="confirmation-card__icon">🎉</div>
            <h2 className="section__title">
              Application <span className="text-gold">Submitted Successfully!</span>
            </h2>
            <p className="section__subtitle" style={{ marginBottom: "var(--sp-6)" }}>
              Your application has been registered. Please complete your tuition payment with Paystack to finalize your admission.
            </p>

            <div className="confirmation-card__badge">
              Application ID: {createdApplication.applicationNumber}
            </div>

            <div className="confirmation-details-grid">
              <div className="confirmation-detail-item">
                <label>Applicant Name</label>
                <span>{createdApplication.studentName}</span>
              </div>
              <div className="confirmation-detail-item">
                <label>Selected Course</label>
                <span>{createdApplication.courseTitle}</span>
              </div>
              <div className="confirmation-detail-item">
                <label>Learning Mode</label>
                <span>{createdApplication.learningMode === "online" ? "🌐 Online Live Training" : "🏫 Hands-on Physical"}</span>
              </div>
              {createdApplication.branchName && (
                <div className="confirmation-detail-item">
                  <label>Campus / Branch</label>
                  <span>{createdApplication.branchName}</span>
                </div>
              )}
              <div className="confirmation-detail-item">
                <label>Cohort Schedule</label>
                <span>{createdApplication.cohort}</span>
              </div>
              <div className="confirmation-detail-item">
                <label>Total Tuition</label>
                <span className="text-gold" style={{ fontSize: "var(--fs-lg)" }}>
                  {formatPrice(createdApplication.tuitionAmount)}
                </span>
              </div>
              <div className="confirmation-detail-item">
                <label>Payment Status</label>
                <span style={{ color: "var(--warning)", fontWeight: "bold" }}>Pending Paystack Payment</span>
              </div>
              <div className="confirmation-detail-item">
                <label>Next Step</label>
                <span>Complete Tuition Payment via Paystack</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  const ref = paymentReference || generatePaymentReference(createdApplication.applicationNumber);
                  setPaymentReference(ref);
                  setShowPaystackModal(true);
                }}
              >
                💳 Pay {formatPrice(createdApplication.tuitionAmount)} via Paystack →
              </Button>
              <Link to="/dashboard">
                <Button variant="secondary" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* ─── Multi-step Wizard ───────────────────────────── */
          <div className="apply-card">
            {/* Stepper Bar */}
            <div className="apply-stepper">
              <div className="apply-stepper__line">
                <div
                  className="apply-stepper__line-progress"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STEPS.map((s) => {
                const isActive = currentStep === s.number;
                const isPassed = currentStep > s.number;
                return (
                  <button
                    key={s.number}
                    className={`apply-step-item ${isActive ? "apply-step-item--active" : ""} ${isPassed ? "apply-step-item--completed" : ""}`}
                    onClick={() => handleJumpToStep(s.number)}
                    type="button"
                  >
                    <div className="apply-step-circle">
                      {isPassed ? "✓" : s.number}
                    </div>
                    <span className="apply-step-label">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ─── Step 1: Course Selection ─────────────────── */}
            {currentStep === 1 && (
              <div className="apply-step-content">
                <div className="apply-card__step-header">
                  <h2 className="apply-card__step-title">Step 1: Select Your Course</h2>
                  <p className="apply-card__step-desc">
                    Choose the skill program you want to master. You can compare prices and durations below.
                  </p>
                </div>

                <div className="course-selection-grid">
                  {courses.map((c) => {
                    const isSelected = selectedCourse.id === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`course-select-card ${isSelected ? "course-select-card--selected" : ""}`}
                        onClick={() => setSelectedCourse(c)}
                      >
                        <img src={c.image} alt={c.title} className="course-select-card__img" />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Badge variant="gold">{c.level}</Badge>
                          <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                            ⏱ {c.durationWeeks} Wks
                          </span>
                        </div>
                        <h3 className="course-select-card__title">{c.title}</h3>
                        <div className="course-select-card__meta">
                          <span className="course-select-card__price">{formatPrice(c.price)}</span>
                          <span style={{ color: isSelected ? "var(--gold)" : "var(--text-muted)" }}>
                            {isSelected ? "● Selected" : "○ Select"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Step 2: Account & Verification ───────────── */}
            {currentStep === 2 && (
              <div className="apply-step-content">
                <div className="apply-card__step-header">
                  <h2 className="apply-card__step-title">Step 2: Student Account Verification</h2>
                  <p className="apply-card__step-desc">
                    Link your application to your Dave Techs student profile for tracking and progress updates.
                  </p>
                </div>

                {isAuthenticated && user ? (
                  <div className="auth-verify-box">
                    <div className="auth-verify-user">
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
                        <div className="auth-verify-user__avatar">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="auth-verify-user__info">
                          <h4>Signed in as {user.fullName}</h4>
                          <p>{user.email} · {user.phone}</p>
                        </div>
                      </div>
                      <Badge variant="success">✓ Verified Student</Badge>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="auth-tabs">
                      <button
                        type="button"
                        className={`auth-tab-btn ${authTab === "signup" ? "auth-tab-btn--active" : ""}`}
                        onClick={() => setAuthTab("signup")}
                      >
                        Create New Account
                      </button>
                      <button
                        type="button"
                        className={`auth-tab-btn ${authTab === "login" ? "auth-tab-btn--active" : ""}`}
                        onClick={() => setAuthTab("login")}
                      >
                        Sign In to Existing Account
                      </button>
                    </div>

                    {authError && (
                      <div className="auth-alert auth-alert--error" role="alert">
                        <span>⚠️ {authError}</span>
                      </div>
                    )}

                    {authTab === "signup" ? (
                      <form onSubmit={handleInlineSignup} className="auth-form">
                        <div className="form-group">
                          <label className="form-label" htmlFor="authName">Full Name</label>
                          <input
                            id="authName"
                            type="text"
                            className="form-input"
                            placeholder="Adeosun David"
                            value={authFullName}
                            onChange={(e) => setAuthFullName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="authMail">Email Address</label>
                          <input
                            id="authMail"
                            type="email"
                            className="form-input"
                            placeholder="e.g. adebayo@example.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="authTel">Phone Number</label>
                          <input
                            id="authTel"
                            type="tel"
                            className="form-input"
                            placeholder="e.g. +234 801 234 5678"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="authPass">Password</label>
                          <input
                            id="authPass"
                            type="password"
                            className="form-input"
                            placeholder="Min 8 characters"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" variant="primary" size="md" isLoading={authLoading}>
                          Create Account & Continue →
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleInlineLogin} className="auth-form">
                        <div className="form-group">
                          <label className="form-label" htmlFor="loginMail">Email Address</label>
                          <input
                            id="loginMail"
                            type="email"
                            className="form-input"
                            placeholder="e.g. student@davetechs.ng"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="loginPass">Password</label>
                          <input
                            id="loginPass"
                            type="password"
                            className="form-input"
                            placeholder="Enter password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" variant="primary" size="md" isLoading={authLoading}>
                          Sign In & Continue →
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── Step 3: Student Information ──────────────── */}
            {currentStep === 3 && (
              <div className="apply-step-content">
                <div className="apply-card__step-header">
                  <h2 className="apply-card__step-title">Step 3: Applicant Details</h2>
                  <p className="apply-card__step-desc">
                    Provide accurate personal and contact information for your official academy records.
                  </p>
                </div>

                <div className="auth-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="applicantName">
                      Full Legal Name <span className="text-gold">*</span>
                    </label>
                    <input
                      id="applicantName"
                      type="text"
                      className={`form-input ${errors.fullName ? "form-input--error" : ""}`}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adeosun David"
                    />
                    {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="applicantEmail">
                        Email Address <span className="text-gold">*</span>
                      </label>
                      <input
                        id="applicantEmail"
                        type="email"
                        className={`form-input ${errors.email ? "form-input--error" : ""}`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. adebayo@example.com"
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="applicantPhone">
                        Phone Number <span className="text-gold">*</span>
                      </label>
                      <input
                        id="applicantPhone"
                        type="tel"
                        className={`form-input ${errors.phone ? "form-input--error" : ""}`}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +234 801 234 5678"
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="applicantCountry">
                        Country <span className="text-gold">*</span>
                      </label>
                      <input
                        id="applicantCountry"
                        type="text"
                        className="form-input"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="applicantState">
                        State of Residence <span className="text-gold">*</span>
                      </label>
                      <input
                        id="applicantState"
                        type="text"
                        className="form-input"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Ogun State, Lagos State"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Preferred Communication Channel <span className="text-gold">*</span>
                    </label>
                    <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap" }}>
                      {[
                        { id: "whatsapp", label: "💬 WhatsApp" },
                        { id: "email", label: "✉️ Email" },
                        { id: "phone", label: "📞 Phone Call" },
                      ].map((item) => (
                        <label key={item.id} className="checkbox-label" style={{ cursor: "pointer" }}>
                          <input
                            type="radio"
                            name="contactMethod"
                            value={item.id}
                            checked={preferredContact === item.id}
                            onChange={() => setPreferredContact(item.id as "email" | "whatsapp" | "phone")}
                          />
                          <span className="checkbox-custom" />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 4: Learning Mode ────────────────────── */}
            {currentStep === 4 && (
              <div className="apply-step-content">
                <div className="apply-card__step-header">
                  <h2 className="apply-card__step-title">Step 4: Select Learning Mode</h2>
                  <p className="apply-card__step-desc">
                    Choose whether you want to attend online interactive sessions or study physically at one of our branches.
                  </p>
                </div>

                <div className="learning-mode-grid">
                  {/* Option A: Online */}
                  <div
                    className={`learning-mode-card ${learningMode === "online" ? "learning-mode-card--selected" : ""}`}
                    onClick={() => setLearningMode("online")}
                  >
                    <div className="learning-mode-card__icon">🌐</div>
                    <h3 className="learning-mode-card__title">Online Live Training</h3>
                    <p className="learning-mode-card__desc">
                      Ideal for learners studying remotely from anywhere in Nigeria or worldwide.
                    </p>
                    <ul className="learning-mode-card__perks">
                      <li>✓ Live interactive classes via Google Meet / Zoom</li>
                      <li>✓ HD lecture recordings & digital curriculum</li>
                      <li>✓ Dedicated 24/7 mentor Discord / Slack channel</li>
                      <li>✓ Weekly 1-on-1 code critiques & project milestones</li>
                    </ul>
                  </div>

                  {/* Option B: Physical */}
                  <div
                    className={`learning-mode-card ${learningMode === "physical" ? "learning-mode-card--selected" : ""}`}
                    onClick={() => setLearningMode("physical")}
                  >
                    <div className="learning-mode-card__icon">🏫</div>
                    <h3 className="learning-mode-card__title">Hands-on Physical Classes</h3>
                    <p className="learning-mode-card__desc">
                      Ideal for students seeking immersive, in-person campus laboratory training.
                    </p>
                    <ul className="learning-mode-card__perks">
                      <li>✓ Dedicated high-speed Wi-Fi and workstation lab access</li>
                      <li>✓ Face-to-face mentorship and pair programming</li>
                      <li>✓ In-person capstone defenses and tech meetups</li>
                      <li>✓ Physical campus facilities and study lounges</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 5: Branch & Cohort ──────────────────── */}
            {currentStep === 5 && (
              <div className="apply-step-content">
                <div className="apply-card__step-header">
                  <h2 className="apply-card__step-title">
                    Step 5: {learningMode === "physical" ? "Select Branch & Schedule" : "Select Cohort Schedule"}
                  </h2>
                  <p className="apply-card__step-desc">
                    {learningMode === "physical"
                      ? "Choose your nearest Dave Techs campus location and preferred timetable."
                      : "Choose your upcoming online cohort start date and time."}
                  </p>
                </div>

                {errors.branch && (
                  <div className="auth-alert auth-alert--error" role="alert">
                    <span>⚠️ {errors.branch}</span>
                  </div>
                )}

                {/* If physical, show branch cards */}
                {learningMode === "physical" && (
                  <div>
                    <h4 className="form-label" style={{ marginBottom: "var(--sp-3)" }}>
                      Available Physical Campuses
                    </h4>
                    <div className="branch-grid">
                      {availableBranches.map((b) => {
                        const isSelected = selectedBranch?.id === b.id;
                        return (
                          <div
                            key={b.id}
                            className={`branch-card ${isSelected ? "branch-card--selected" : ""}`}
                            onClick={() => {
                              setSelectedBranch(b);
                              if (b.availableCohorts.length > 0) {
                                setSelectedCohort(b.availableCohorts[0]);
                              }
                            }}
                          >
                            <h4 className="branch-card__title">{b.name}</h4>
                            <div className="branch-card__location">📍 {b.location}</div>
                            <p className="branch-card__address">{b.address}</p>
                            <div className="branch-card__hours">⏰ {b.openingHours}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cohort Selector */}
                <div className="form-group" style={{ marginTop: "var(--sp-6)" }}>
                  <label className="form-label" htmlFor="cohortSelect">
                    Preferred Cohort Timetable
                  </label>
                  <select
                    id="cohortSelect"
                    className="form-input"
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                  >
                    {learningMode === "physical" && selectedBranch
                      ? selectedBranch.availableCohorts.map((co) => (
                          <option key={co} value={co}>
                            {co}
                          </option>
                        ))
                      : [
                          "Next Online Cohort: Oct 5, 2026 (Mon/Wed/Fri 7:00 PM - 9:30 PM)",
                          "Weekend Online Intensive: Oct 10, 2026 (Sat/Sun 2:00 PM - 6:00 PM)",
                          "Morning Online Batch: Oct 12, 2026 (Mon/Wed/Fri 10:00 AM - 1:00 PM)",
                        ].map((co) => (
                          <option key={co} value={co}>
                            {co}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            )}

            {/* ─── Step 6: Review & Confirmation ────────────── */}
            {currentStep === 6 && (
              <div className="apply-step-content">
                <div className="apply-card__step-header">
                  <h2 className="apply-card__step-title">Step 6: Review & Final Confirmation</h2>
                  <p className="apply-card__step-desc">
                    Please review your application summary details carefully before proceeding to payment.
                  </p>
                </div>

                <div className="review-summary-box">
                  <div className="review-row">
                    <span className="review-row__label">Selected Course:</span>
                    <span className="review-row__val">
                      {selectedCourse.title} ({selectedCourse.durationWeeks} Weeks)
                    </span>
                  </div>

                  <div className="review-row">
                    <span className="review-row__label">Applicant Name:</span>
                    <span className="review-row__val">{fullName}</span>
                  </div>

                  <div className="review-row">
                    <span className="review-row__label">Contact Details:</span>
                    <span className="review-row__val">
                      {email} · {phone}
                    </span>
                  </div>

                  <div className="review-row">
                    <span className="review-row__label">Location:</span>
                    <span className="review-row__val">{state}, {country}</span>
                  </div>

                  <div className="review-row">
                    <span className="review-row__label">Learning Mode:</span>
                    <span className="review-row__val">
                      {learningMode === "online" ? "🌐 Online Live Training" : "🏫 Hands-on Physical Class"}
                    </span>
                  </div>

                  {learningMode === "physical" && selectedBranch && (
                    <div className="review-row">
                      <span className="review-row__label">Campus Branch:</span>
                      <span className="review-row__val">{selectedBranch.name} ({selectedBranch.location})</span>
                    </div>
                  )}

                  <div className="review-row">
                    <span className="review-row__label">Cohort Schedule:</span>
                    <span className="review-row__val">{selectedCohort}</span>
                  </div>

                  <div className="review-total-row">
                    <span>Total Tuition Fee:</span>
                    <span className="text-gold">{formatPrice(selectedCourse.price)}</span>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="form-group form-group--checkbox">
                  <label className="checkbox-label" htmlFor="confirmTerms">
                    <input
                      id="confirmTerms"
                      type="checkbox"
                      checked={confirmedTerms}
                      onChange={(e) => {
                        setConfirmedTerms(e.target.checked);
                        if (errors.terms) setErrors({ ...errors, terms: "" });
                      }}
                    />
                    <span className="checkbox-custom" />
                    <span>
                      I verify that the above information is accurate and agree to Dave Techs Academy's enrollment policies.
                    </span>
                  </label>
                  {errors.terms && <span className="form-error">{errors.terms}</span>}
                </div>
              </div>
            )}

            {/* ─── Navigation Buttons ────────────────────────── */}
            <div className="apply-actions">
              {currentStep > 1 ? (
                <Button variant="secondary" size="md" onClick={handleBack}>
                  ← Back
                </Button>
              ) : (
                <Link to="/courses">
                  <Button variant="ghost" size="md">
                    Cancel
                  </Button>
                </Link>
              )}

              {currentStep < 6 ? (
                <Button variant="primary" size="md" onClick={handleNext}>
                  Next Step →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmitApplication}
                  isLoading={isSubmitting}
                >
                  Submit Application →
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Paystack Interactive Checkout Modal ────────── */}
      {createdApplication && (
        <PaystackModal
          isOpen={showPaystackModal}
          amount={createdApplication.tuitionAmount}
          email={createdApplication.studentEmail}
          reference={paymentReference}
          courseTitle={createdApplication.courseTitle}
          onSuccess={handlePaystackSuccess}
          onClose={handlePaystackClose}
          onFail={handlePaystackFail}
        />
      )}
    </div>
  );
};
