import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { lmsService } from "../../services/lmsService";
import type { ReferralProfile } from "../../types/lms";

export const ReferralDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const prof = lmsService.getReferralProfile(user.id, user.fullName);
      setProfile(prof);
    }
  }, [user]);

  const handleCopyLink = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    if (!profile) return;
    const msg = encodeURIComponent(
      `Hey! I'm learning practical tech skills at Dave Techs Academy. Join using my referral link for a discount on tuition: ${profile.referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  const handleShareTwitter = () => {
    if (!profile) return;
    const msg = encodeURIComponent(
      `Master software engineering and tech skills with @DaveTechsAcademy! Use my referral link to get started: ${profile.referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${msg}`, "_blank");
  };

  if (!profile) return null;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Student Referral Program</h1>
          <p className="dashboard-subtitle">
            Earn <strong>₦10,000 cash or tuition discount</strong> for every friend or colleague who enrolls through your link.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid--4" style={{ marginBottom: "var(--sp-8)" }}>
        <div className="card" style={{ padding: "var(--sp-6)" }}>
          <span className="text-muted" style={{ fontSize: "var(--fs-xs)", textTransform: "uppercase" }}>
            Total Referrals
          </span>
          <div style={{ fontSize: "var(--fs-3xl)", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
            {profile.totalReferrals}
          </div>
        </div>

        <div className="card" style={{ padding: "var(--sp-6)" }}>
          <span className="text-muted" style={{ fontSize: "var(--fs-xs)", textTransform: "uppercase" }}>
            Paid Enrollments
          </span>
          <div style={{ fontSize: "var(--fs-3xl)", fontWeight: 900, color: "#22c55e", marginTop: "4px" }}>
            {profile.successfulEnrollments}
          </div>
        </div>

        <div className="card" style={{ padding: "var(--sp-6)" }}>
          <span className="text-muted" style={{ fontSize: "var(--fs-xs)", textTransform: "uppercase" }}>
            Pending Rewards
          </span>
          <div style={{ fontSize: "var(--fs-3xl)", fontWeight: 900, color: "#f59e0b", marginTop: "4px" }}>
            ₦{profile.pendingRewards.toLocaleString()}
          </div>
        </div>

        <div className="card" style={{ padding: "var(--sp-6)" }}>
          <span className="text-muted" style={{ fontSize: "var(--fs-xs)", textTransform: "uppercase" }}>
            Total Earned
          </span>
          <div style={{ fontSize: "var(--fs-3xl)", fontWeight: 900, color: "var(--color-gold-bright)", marginTop: "4px" }}>
            ₦{profile.totalEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Referral Link & Share Box */}
      <div className="card" style={{ padding: "var(--sp-8)", marginBottom: "var(--sp-8)" }}>
        <h3 style={{ marginBottom: "var(--sp-2)" }}>Your Unique Referral Link & Code</h3>
        <p className="text-muted" style={{ fontSize: "var(--fs-sm)", marginBottom: "var(--sp-6)" }}>
          Share this link across social media, WhatsApp groups, or campus networks.
        </p>

        <div
          style={{
            display: "flex",
            gap: "var(--sp-3)",
            background: "var(--bg-input)",
            border: "1px dashed var(--border-gold)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--sp-4)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, fontFamily: "monospace", color: "var(--color-gold-bright)", fontSize: "var(--fs-base)" }}>
            {profile.referralLink}
          </div>

          <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
            <button type="button" className="btn btn--primary btn--sm" onClick={handleCopyLink}>
              {copied ? "✓ Copied!" : "📋 Copy Link"}
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={handleShareWhatsApp}>
              📱 WhatsApp
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={handleShareTwitter}>
              🐦 Twitter
            </button>
          </div>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="card" style={{ padding: "var(--sp-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-4)" }}>
          <h3>Referral & Reward History</h3>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={payoutRequested || profile.pendingRewards === 0}
            onClick={() => setPayoutRequested(true)}
          >
            {payoutRequested ? "✓ Payout Requested" : "Request Payout / Tuition Credit"}
          </button>
        </div>

        {payoutRequested && (
          <div className="alert alert--success" style={{ marginBottom: "var(--sp-4)" }}>
            Payout request submitted to Finance! Funds will be transferred to your registered bank account within 24 hours.
          </div>
        )}

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Referred Student</th>
                <th>Course</th>
                <th>Reward Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {profile.history.map((h) => (
                <tr key={h.id}>
                  <td>
                    <strong>{h.referredName || h.referredEmail}</strong>
                    <div className="text-muted" style={{ fontSize: "11px" }}>{h.referredEmail}</div>
                  </td>
                  <td>{h.courseTitle || "Applied Course"}</td>
                  <td className="text-gold" style={{ fontWeight: 700 }}>
                    ₦{h.rewardAmount.toLocaleString()}
                  </td>
                  <td>{h.date}</td>
                  <td>
                    <span
                      className={`badge ${
                        h.status === "paid"
                          ? "badge--active"
                          : h.status === "confirmed"
                          ? "badge--outline text-success"
                          : "badge--pending"
                      }`}
                    >
                      {h.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
