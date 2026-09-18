import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import "./Auth.css";

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login({ email, password, rememberMe });
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.error || "Login failed. Please verify your credentials.");
    }
  };

  const handleFillDemo = () => {
    setEmail("student@devtechs.ng");
    setPassword("Password123!");
    setErrors({});
    setServerError(null);
  };

  const handleFillAdminDemo = () => {
    setEmail("admin@devtechs.ng");
    setPassword("AdminDevTechs2026!");
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card__header">
            <span className="auth-card__badge">Welcome Back</span>
            <h1 className="auth-card__title">
              Sign In to <span className="text-gold">Dave Techs</span>
            </h1>
            <p className="auth-card__subtitle">
              Access your enrolled courses, application status, and learning dashboard
            </p>
          </div>

          {serverError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <span className="auth-alert__icon">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "form-input--error" : ""}`}
                placeholder="e.g. student@devtechs.ng"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${errors.password ? "form-input--error" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  autoComplete="current-password"
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

            {/* Remember Me & Forgot Password Row */}
            <div className="auth-form__row">
              <label className="checkbox-label" htmlFor="rememberMe">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span>Remember this session</span>
              </label>

              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="auth-submit-btn"
              isLoading={isSubmitting}
            >
              Sign In →
            </Button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="demo-credentials-box" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", alignItems: "stretch" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Student: <strong>student@devtechs.ng</strong></span>
              <button type="button" onClick={handleFillDemo}>
                Fill Student
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--color-border)", paddingTop: "var(--sp-2)" }}>
              <span>Admin: <strong>admin@devtechs.ng</strong></span>
              <button type="button" onClick={handleFillAdminDemo}>
                Fill Admin
              </button>
            </div>
          </div>

          <div className="auth-card__footer">
            <p>
              Don't have an account yet?{" "}
              <Link to="/signup" className="auth-link auth-link--highlight">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
