import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import "./Auth.css";

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initial step determination from URL query (if reset token provided in link)
  const initialToken = searchParams.get("token") || "";

  const [step, setStep] = useState<"request" | "reset" | "complete">(initialToken ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    const res = await forgotPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      setServerSuccess(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setStep("reset");
      }
    } else {
      setServerError("Unable to process password reset request. Please try again.");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const errs: Record<string, string> = {};
    if (!resetToken.trim()) {
      errs.resetToken = "Reset token is required";
    }
    if (!newPassword || newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters long";
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(resetToken, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setStep("complete");
    } else {
      setServerError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card__header">
            <span className="auth-card__badge">Account Security</span>
            <h1 className="auth-card__title">
              {step === "request" && (
                <>
                  Forgot <span className="text-gold">Password?</span>
                </>
              )}
              {step === "reset" && (
                <>
                  Reset Your <span className="text-gold">Password</span>
                </>
              )}
              {step === "complete" && (
                <>
                  Password <span className="text-gold">Updated!</span>
                </>
              )}
            </h1>
            <p className="auth-card__subtitle">
              {step === "request" && "Enter your registered email address to receive password reset instructions."}
              {step === "reset" && "Create a secure new password for your Dave Techs student account."}
              {step === "complete" && "Your password has been successfully reset. You can now sign in."}
            </p>
          </div>

          {serverError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <span className="auth-alert__icon">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          {serverSuccess && step === "request" && (
            <div className="auth-alert auth-alert--success" role="status">
              <span className="auth-alert__icon">✓</span>
              <span>{serverSuccess}</span>
            </div>
          )}

          {/* ─── Step 1: Request Email ─────────────────────── */}
          {step === "request" && (
            <form onSubmit={handleRequestSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="resetEmail">
                  Registered Email Address
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  className={`form-input ${errors.email ? "form-input--error" : ""}`}
                  placeholder="e.g. student@davetechs.ng"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="auth-submit-btn"
                isLoading={isSubmitting}
              >
                Send Reset Link →
              </Button>
            </form>
          )}

          {/* ─── Step 2: Set New Password ─────────────────── */}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="token">
                  Reset Token
                </label>
                <input
                  id="token"
                  type="text"
                  className={`form-input ${errors.resetToken ? "form-input--error" : ""}`}
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  readOnly={!!initialToken}
                />
                {errors.resetToken && <span className="form-error">{errors.resetToken}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  New Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    className={`form-input ${errors.newPassword ? "form-input--error" : ""}`}
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
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
                {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmNewPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  className={`form-input ${errors.confirmPassword ? "form-input--error" : ""}`}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                  }}
                />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="auth-submit-btn"
                isLoading={isSubmitting}
              >
                Set New Password →
              </Button>
            </form>
          )}

          {/* ─── Step 3: Complete ─────────────────────────── */}
          {step === "complete" && (
            <div className="welcome-modal__body">
              <div className="welcome-modal__icon-badge">🎉</div>
              <p className="welcome-modal__text">Password Changed Successfully!</p>
              <p className="welcome-modal__subtext">
                Your account credentials have been updated securely. You can now sign in with your new password.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="auth-submit-btn"
                onClick={() => navigate("/login")}
              >
                Sign In Now →
              </Button>
            </div>
          )}

          <div className="auth-card__footer">
            <p>
              Remember your password?{" "}
              <Link to="/login" className="auth-link auth-link--highlight">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
