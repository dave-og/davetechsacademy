import React, { useState } from "react";
import { lmsService } from "../../services/lmsService";
import { useSEO } from "../../hooks/useSEO";
import type { AffiliatePartner } from "../../types/lms";
import "./Affiliate.css";

export const Affiliate: React.FC = () => {
  const [partnerName, setPartnerName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [createdPartner, setCreatedPartner] = useState<AffiliatePartner | null>(null);
  const [copied, setCopied] = useState(false);

  // Commission Calculator
  const [studentsReferred, setStudentsReferred] = useState<number>(5);
  const avgCoursePrice = 120000;
  const estimatedEarnings = Math.round(studentsReferred * avgCoursePrice * 0.15);

  useSEO({
    title: "Affiliate & Ambassador Partner Program | Dave Techs Academy",
    description: "Partner with West Africa's leading technology academy. Earn up to 15% recurring commissions referring students and campus communities.",
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !email.trim()) return;

    const partner = lmsService.registerAffiliate({
      partnerName,
      email,
      website: website.trim() || undefined,
    });
    setCreatedPartner(partner);
  };

  const handleCopyCode = () => {
    if (!createdPartner) return;
    navigator.clipboard.writeText(`${window.location.origin}/apply?aff=${createdPartner.affiliateCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="affiliate-page section container">
      {/* Hero */}
      <div className="affiliate-hero">
        <span className="badge badge--active">Partnership & Growth</span>
        <h1 className="section__title" style={{ marginTop: "var(--sp-2)" }}>
          Dave Techs Affiliate & Ambassador Program
        </h1>
        <p className="section__subtitle">
          Empower learners in your network to master in-demand technology skills while earning **up to 15% commission** on every paid enrollment.
        </p>
      </div>

      {/* Program Benefits Grid */}
      <div className="grid grid--3" style={{ marginBottom: "var(--sp-12)" }}>
        <div className="card affiliate-benefit-card">
          <div className="affiliate-icon">💰</div>
          <h3>15% Instant Commission</h3>
          <p>
            Earn competitive payouts for every learner who enrolls and completes payment through your partner link.
          </p>
        </div>

        <div className="card affiliate-benefit-card">
          <div className="affiliate-icon">📊</div>
          <h3>Real-Time Tracking</h3>
          <p>
            Track referral clicks, active leads, conversions, and verified earnings with transparent reporting.
          </p>
        </div>

        <div className="card affiliate-benefit-card">
          <div className="affiliate-icon">🎓</div>
          <h3>Marketing Assets</h3>
          <p>
            Get access to branded course graphics, brochures, promotional discount codes, and dedicated partner support.
          </p>
        </div>
      </div>

      {/* Commission Earnings Calculator */}
      <div className="card affiliate-calc-card" style={{ marginBottom: "var(--sp-12)" }}>
        <div className="affiliate-calc-header">
          <h2>Estimate Your Monthly Earnings</h2>
          <p className="text-muted">Slide to calculate potential commissions based on student enrollments.</p>
        </div>

        <div className="affiliate-calc-body">
          <div className="affiliate-slider-wrap">
            <label htmlFor="affiliate-slider" className="form-label">
              Monthly Referred Enrollments: <strong>{studentsReferred} students</strong>
            </label>
            <input
              id="affiliate-slider"
              type="range"
              min="1"
              max="50"
              value={studentsReferred}
              onChange={(e) => setStudentsReferred(Number(e.target.value))}
              className="affiliate-slider"
            />
          </div>

          <div className="affiliate-calc-result">
            <span className="affiliate-result-label">Estimated Monthly Payout:</span>
            <div className="affiliate-result-val">₦{estimatedEarnings.toLocaleString()}</div>
            <span className="text-muted" style={{ fontSize: "11px" }}>
              Based on average course tuition of ₦120,000 at 15% commission
            </span>
          </div>
        </div>
      </div>

      {/* Registration Section */}
      <div className="card affiliate-form-card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        {createdPartner ? (
          <div className="affiliate-success-view">
            <div className="badge badge--active">Registration Complete!</div>
            <h2 style={{ margin: "var(--sp-3) 0" }}>Welcome, {createdPartner.partnerName}!</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-6)" }}>
              Your partner account is active. Share your unique affiliate link with your audience to begin earning commissions.
            </p>

            <div className="affiliate-code-box">
              <span className="affiliate-code-label">Your Unique Tracking Link:</span>
              <div className="affiliate-link-display">
                {window.location.origin}/apply?aff={createdPartner.affiliateCode}
              </div>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleCopyCode}
              >
                {copied ? "✓ Copied to Clipboard!" : "📋 Copy Link"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: "var(--sp-2)" }}>Join the Partner Program</h2>
            <p className="text-muted" style={{ marginBottom: "var(--sp-6)" }}>
              Sign up in 30 seconds to generate your affiliate tracking link.
            </p>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label" htmlFor="aff-name">
                  Partner / Organization / Campus Club Name *
                </label>
                <input
                  id="aff-name"
                  type="text"
                  className="form-input"
                  placeholder="Adeosun David"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: "var(--sp-4)" }}>
                <label className="form-label" htmlFor="aff-email">
                  Business / Contact Email *
                </label>
                <input
                  id="aff-email"
                  type="email"
                  className="form-input"
                  placeholder="partner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: "var(--sp-4)" }}>
                <label className="form-label" htmlFor="aff-web">
                  Website / Social Channel URL
                </label>
                <input
                  id="aff-web"
                  type="url"
                  className="form-input"
                  placeholder="https://youtube.com/@yourchannel"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div style={{ marginTop: "var(--sp-6)" }}>
                <button type="submit" className="btn btn--primary btn--glow btn--full">
                  Create Partner Account & Generate Link
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
