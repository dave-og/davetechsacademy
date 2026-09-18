import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { trackSignupStart } from "../../services/analytics";
import "./Auth.css";

export const Signup: React.FC = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    trackSignupStart("signup_page");
  }, []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !showWelcomeModal) {
    navigate("/dashboard", { replace: true });
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = "Full name is required";
    } else if (fullName.trim().split(" ").length < 2) {
      errs.fullName = "Please enter both your first and last name";
    }

    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[+0-9\s-]{10,15}$/.test(phone.trim())) {
      errs.phone = "Please enter a valid phone number (e.g. +234 801 234 5678)";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      errs.password = "Password must include uppercase, lowercase, and numeric characters";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (!agreedTerms) {
      errs.agreedTerms = "You must agree to the Terms of Service & Privacy Policy";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await signup({
      fullName,
      email,
      phone,
      password,
      referralCode: referralCode.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowWelcomeModal(true);
    } else {
      setServerError(result.error || "Signup failed. Please check your information.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card__header">
            <span className="auth-card__badge">Start Your Tech Journey</span>
            <h1 className="auth-card__title">
              Create Your <span className="text-gold">Account</span>
            </h1>
            <p className="auth-card__subtitle">
              Join thousands of aspiring tech talents building high-demand skills at Dave Techs Academy
            </p>
          </div>

          {serverError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <span className="auth-alert__icon">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name <span className="text-gold">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                className={`form-input ${errors.fullName ? "form-input--error" : ""}`}
                placeholder="Adeosun David"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: "" });
                }}
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address <span className="text-gold">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "form-input--error" : ""}`}
                placeholder="e.g. adebayo@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number <span className="text-gold">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                className={`form-input ${errors.phone ? "form-input--error" : ""}`}
                placeholder="e.g. +234 801 234 5678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span className="text-gold">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${errors.password ? "form-input--error" : ""}`}
                  placeholder="Min 8 characters (letters & numbers)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password <span className="text-gold">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-input ${errors.confirmPassword ? "form-input--error" : ""}`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            {/* Referral Code (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="referralCode">
                Referral / Discount Code <span className="form-label__optional">(Optional)</span>
              </label>
              <input
                id="referralCode"
                type="text"
                className="form-input"
                placeholder="e.g. COHORT2026"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              />
            </div>

            {/* Terms Checkbox */}
            <div className="form-group form-group--checkbox">
              <label className="checkbox-label" htmlFor="terms">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => {
                    setAgreedTerms(e.target.checked);
                    if (errors.agreedTerms) setErrors({ ...errors, agreedTerms: "" });
                  }}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-text">
                  I agree to Dave Techs Academy's{" "}
                  <Link to="/terms" className="auth-link" target="_blank">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="auth-link" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreedTerms && <span className="form-error">{errors.agreedTerms}</span>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="auth-submit-btn"
              isLoading={isSubmitting}
            >
              Create Account →
            </Button>
          </form>

          <div className="auth-card__footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link auth-link--highlight">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Post-Signup Welcome Modal ────────────────────── */}
      <Modal
        isOpen={showWelcomeModal}
        onClose={() => navigate("/dashboard")}
        title="Welcome to Dave Techs! 🎉"
      >
        <div className="welcome-modal__body">
          <div className="welcome-modal__icon-badge">✨</div>
          <p className="welcome-modal__text">
            Your student account has been created successfully!
          </p>
          <p className="welcome-modal__subtext">
            You can now explore courses, select your preferred learning mode (online or in-person), and complete your enrollment seamlessly.
          </p>
          <div className="welcome-modal__actions">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate("/courses")}
            >
              Explore Courses
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard →
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
