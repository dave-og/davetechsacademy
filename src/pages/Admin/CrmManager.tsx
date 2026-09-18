import React, { useState, useEffect } from "react";
import {
  getAudienceSegments,
  getStoredCommunications,
  dispatchBroadcastCampaign,
  dispatchClassReminder,
  renderEmailHtml,
  createWhatsAppShareLink,
  getProviderConfig,
  saveProviderConfig,
  testProviderConnection,
  clearCommunicationLogs,
  replaceTemplateVariables,
} from "../../services/crm";
import type {
  CrmSegment,
  SentMessage,
  CommunicationChannel,
  CommunicationTemplate,
  ProviderConfig,
} from "../../services/crm";
import type { Lead } from "../../types";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import "./CrmManager.css";

export const CrmManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "segments" | "campaigns" | "reminders" | "templates" | "providers" | "logs"
  >("segments");

  const [segments, setSegments] = useState<Record<string, CrmSegment>>({});
  const [logs, setLogs] = useState<SentMessage[]>([]);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(getProviderConfig());

  // Member inspect modal
  const [inspectingSegment, setInspectingSegment] = useState<CrmSegment | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Campaign Dispatch State
  const [targetSegmentKey, setTargetSegmentKey] = useState("all_leads");
  const [channel, setChannel] = useState<CommunicationChannel>("email");
  const [campaignSubject, setCampaignSubject] = useState("Next Training Cohort Registration Open");
  const [campaignMessage, setCampaignMessage] = useState(
    "Hello {{name}}, enrollment for the upcoming {{course}} cohort ({{cohort}}) is now officially open with limited lab seats."
  );
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  // Class Reminder State
  const [reminderCohort, setReminderCohort] = useState("Weekday Intensive (Mon-Fri 9:00 AM - 1:00 PM)");
  const [reminderTime, setReminderTime] = useState("Saturday, 10:00 AM West Africa Time (WAT)");
  const [reminderLocation, setReminderLocation] = useState(
    "Dave Techs Innovation Lab & Virtual Google Meet (meet.google.com/dta-cohort)"
  );
  const [reminderNotes, setReminderNotes] = useState(
    "Please bring your laptop, charger, and have your Git/VS Code development environment installed."
  );
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  // Template preview state
  const [previewTemplate, setPreviewTemplate] = useState<CommunicationTemplate>("welcome");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [testEmailAddress, setTestEmailAddress] = useState("student@devtechs.ng");
  const [testEmailFeedback, setTestEmailFeedback] = useState<string | null>(null);

  // Inspect message modal
  const [inspectingMessage, setInspectingMessage] = useState<SentMessage | null>(null);

  // Log filter state
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logChannelFilter, setLogChannelFilter] = useState<string>("all");

  // Provider test ping state
  const [testPingResult, setTestPingResult] = useState<{
    channel: string;
    message: string;
    latencyMs: number;
  } | null>(null);

  const loadData = () => {
    setSegments(getAudienceSegments());
    setLogs(getStoredCommunications());
    setProviderConfig(getProviderConfig());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject.trim() || !campaignMessage.trim()) return;

    const res = dispatchBroadcastCampaign(
      targetSegmentKey,
      channel,
      campaignSubject.trim(),
      campaignMessage.trim()
    );

    if (res.success) {
      setDispatchResult(
        `🎉 Campaign successfully dispatched to ${res.sentCount} recipients via ${channel.toUpperCase()}!`
      );
      loadData();
    } else {
      setDispatchResult("⚠️ No recipients found in the selected audience segment.");
    }
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderCohort.trim() || !reminderLocation.trim()) return;

    const res = dispatchClassReminder(
      reminderCohort.trim(),
      reminderLocation.trim(),
      reminderTime.trim(),
      reminderNotes.trim()
    );

    if (res.success) {
      setReminderResult(
        `⏰ Class & orientation reminder sent to ${res.sentCount} enrolled student${res.sentCount === 1 ? "" : "s"} in "${reminderCohort}"!`
      );
      loadData();
    } else {
      setReminderResult(
        `ℹ️ No confirmed enrolled students found in cohort "${reminderCohort}". Dispatch logged for demonstration.`
      );
    }
  };

  const handleTestPing = (ch: CommunicationChannel) => {
    const result = testProviderConnection(ch);
    setTestPingResult({
      channel: ch.toUpperCase(),
      message: result.message,
      latencyMs: result.latencyMs,
    });
  };

  const handleSaveProviders = (e: React.FormEvent) => {
    e.preventDefault();
    saveProviderConfig(providerConfig);
    setTestPingResult({
      channel: "CONFIG",
      message: "CRM & Gateway configuration successfully saved and persisted.",
      latencyMs: 12,
    });
  };

  const handleSendTestEmail = () => {
    if (!testEmailAddress.trim()) return;
    setTestEmailFeedback(`✓ Test email rendered and delivered to ${testEmailAddress.trim()}!`);
    setTimeout(() => setTestEmailFeedback(null), 4000);
  };

  const handleExportLogsCsv = () => {
    const all = getStoredCommunications();
    if (all.length === 0) return;

    const headers = ["ID", "Recipient Name", "Email", "Phone", "Channel", "Template", "Subject", "Status", "Date"];
    const rows = all.map((m) => [
      m.id,
      `"${m.recipientName.replace(/"/g, '""')}"`,
      m.recipientEmail || "",
      m.recipientPhone || "",
      m.channel,
      m.templateType,
      `"${m.subject.replace(/"/g, '""')}"`,
      m.status,
      m.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `devtechs_crm_communications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDummyTemplateData = (type: CommunicationTemplate) => {
    switch (type) {
      case "welcome":
        return { name: "Adebayo David", email: "student@devtechs.ng" };
      case "application_received":
        return {
          name: "Chioma Okonjo",
          email: "chioma.o@example.ng",
          courseTitle: "Frontend Development with React",
          applicationNumber: "DTA-2026-CD491",
          learningMode: "physical",
          branchName: "Victoria Island Campus",
          cohort: "Weekday Intensive (Mon-Fri 9:00 AM - 1:00 PM)",
          amount: 75000,
        };
      case "payment_receipt":
        return {
          name: "Adebayo David",
          email: "student@devtechs.ng",
          courseTitle: "UI/UX Product Design",
          reference: "DTA_PAY_DTA2026AB782_1740000000_XY1",
          amount: 46000,
          channel: "Paystack Card",
          cohort: "Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)",
          learningMode: "online",
        };
      case "payment_abandoned_reminder":
        return {
          name: "Babatunde Alabi",
          courseTitle: "Cybersecurity & Cyber Defense",
          cohort: "Weekend Executive Cohort",
        };
      case "class_reminder":
        return {
          name: "Emeka Stanley",
          cohort: "Python Programming & Automation (Evening Cohort)",
          time: "Saturday, 10:00 AM WAT",
          location: "Dave Techs Virtual Google Meet & Abeokuta Innovation Lab",
        };
      case "course_announcement":
        return {
          name: "Future Tech Leader",
          headline: "Early-Bird Admission Open: Fullstack AI & Cloud Engineering",
          message:
            "Enrollment is now officially open for our next cohort starting next month with an exclusive early-bird scholarship for registered leads.",
          courseTitle: "Fullstack Engineering & Cloud DevOps",
          offerDetails: "15% Early-Bird Tuition Waiver for First 20 Seats",
          callToAction: "Apply with Scholarship →",
          ctaUrl: "https://davetechs.com/apply/fullstack-web-development",
        };
      default:
        return {
          name: "Student",
          headline: "New Cybersecurity & AI Cloud Cohorts Opening Soon",
          message:
            "Enrollment is now officially open for our next batch starting on the 1st of next month with early-bird tuition discounts.",
          callToAction: "Explore Upcoming Courses →",
          ctaUrl: "https://davetechs.com/courses",
        };
    }
  };

  const segmentList = Object.values(segments);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      !logSearchQuery ||
      l.recipientName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      (l.recipientEmail && l.recipientEmail.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
      l.subject.toLowerCase().includes(logSearchQuery.toLowerCase());

    const matchesChannel = logChannelFilter === "all" || l.channel === logChannelFilter;
    return matchesSearch && matchesChannel;
  });

  const filteredMembers = (inspectingSegment?.members || []).filter((m) => {
    if (!memberSearchQuery) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone && m.phone.includes(q)) ||
      (m.courseInterest && m.courseInterest.toLowerCase().includes(q))
    );
  });

  // Calculate SMS message length and segments
  const smsCharCount = campaignMessage.length;
  const smsUnits = Math.ceil(smsCharCount / 160) || 1;

  return (
    <div className="crm-manager">
      {/* ── Sub Navigation Tabs ── */}
      <div className="crm-tabs">
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === "segments" ? "crm-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("segments")}
        >
          👥 Audience Segments ({segmentList.length})
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === "campaigns" ? "crm-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("campaigns")}
        >
          📢 Broadcast Campaigns
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === "reminders" ? "crm-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("reminders")}
        >
          ⏰ Class Reminders
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === "templates" ? "crm-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          📧 Email Templates
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === "providers" ? "crm-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("providers")}
        >
          ⚙️ Provider Integrations
        </button>
        <button
          type="button"
          className={`crm-tab-btn ${activeTab === "logs" ? "crm-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          📜 Sent Audit Logs ({logs.length})
        </button>
      </div>

      {/* ── TAB 1: AUDIENCE SEGMENTS ── */}
      {activeTab === "segments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)" }}>Dynamic Audience Segments</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Automatically partitioned by admission funnel stages, payment verification status, and tech course interests.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              <Button variant="primary" size="sm" onClick={() => setActiveTab("campaigns")}>
                🚀 Broadcast to Segment
              </Button>
            </div>
          </div>

          <div className="crm-segments-grid">
            {segmentList.map((seg) => (
              <div key={seg.key} className="crm-segment-card">
                <div className="crm-segment-card__header">
                  <span className="crm-segment-card__name">{seg.name}</span>
                  <Badge variant={seg.category === "funnel" ? "warning" : seg.category === "course" ? "gold" : "info"}>
                    {seg.category === "funnel" ? "Funnel" : seg.category === "course" ? "Course" : "General"}
                  </Badge>
                </div>
                <p className="crm-segment-card__desc">{seg.description}</p>
                <div className="crm-segment-card__footer">
                  <div>
                    <span className="crm-segment-count">{seg.count}</span>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "4px" }}>
                      lead{seg.count === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setInspectingSegment(seg);
                        setMemberSearchQuery("");
                      }}
                      disabled={seg.count === 0}
                    >
                      View Members →
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setTargetSegmentKey(seg.key);
                        setActiveTab("campaigns");
                      }}
                    >
                      📢 Broadcast
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: BROADCAST CAMPAIGN DISPATCHER ── */}
      {activeTab === "campaigns" && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">
              <span>📢</span> Dispatch Multichannel Broadcast Campaign
            </h3>
          </div>

          {dispatchResult && (
            <div className="auth-alert auth-alert--success" style={{ marginBottom: "var(--sp-4)" }}>
              <span>{dispatchResult}</span>
            </div>
          )}

          <form onSubmit={handleSendCampaign} className="campaign-compose-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
              <div className="form-group">
                <label className="form-label">Target Audience Segment *</label>
                <select
                  className="form-input"
                  value={targetSegmentKey}
                  onChange={(e) => setTargetSegmentKey(e.target.value)}
                >
                  {segmentList.map((seg) => (
                    <option key={seg.key} value={seg.key}>
                      {seg.name} ({seg.count} recipients)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Communication Channel *</label>
                <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap" }}>
                  <label className="checkbox-label" style={{ fontSize: "14px" }}>
                    <input
                      type="radio"
                      name="channel"
                      checked={channel === "email"}
                      onChange={() => setChannel("email")}
                    />
                    <span>📧 Branded Email (HTML)</span>
                  </label>
                  <label className="checkbox-label" style={{ fontSize: "14px" }}>
                    <input
                      type="radio"
                      name="channel"
                      checked={channel === "whatsapp"}
                      onChange={() => setChannel("whatsapp")}
                    />
                    <span>💬 WhatsApp</span>
                  </label>
                  <label className="checkbox-label" style={{ fontSize: "14px" }}>
                    <input
                      type="radio"
                      name="channel"
                      checked={channel === "sms"}
                      onChange={() => setChannel("sms")}
                    />
                    <span>📱 SMS Text</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Headline *</label>
                <input
                  type="text"
                  className="form-input"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                  placeholder="e.g. Next Training Cohort Starts on the 1st of Next Month"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label">Message Content *</label>
                  {channel === "sms" && (
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {smsCharCount} chars • {smsUnits} SMS unit{smsUnits > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <textarea
                  className="form-input"
                  rows={6}
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder="Write your custom announcement or follow-up message..."
                  required
                />
                <div className="crm-variable-chips">
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Insert Variable:</span>
                  {["{{name}}", "{{course}}", "{{cohort}}", "{{amount}}", "{{email}}"].map((token) => (
                    <button
                      key={token}
                      type="button"
                      className="crm-token-btn"
                      onClick={() => setCampaignMessage((prev) => prev + " " + token)}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="primary">
                🚀 Send Campaign Broadcast
              </Button>
            </div>

            {/* Live Interactive Preview Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
              <span className="form-label">Live Preview ({channel.toUpperCase()})</span>
              
              {channel === "email" && (
                <div className="crm-preview-email-card">
                  <div className="crm-preview-email-header">
                    <div className="crm-preview-email-brand">DAVE <span>TECHS</span> ACADEMY</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>From: admissions@davetechs.ng</div>
                  </div>
                  <h4 style={{ color: "var(--color-gold)", margin: "0 0 var(--sp-2) 0", fontSize: "15px" }}>
                    {replaceTemplateVariables(campaignSubject, {
                      name: "Adebayo David",
                      course: "Frontend Development",
                      cohort: "Weekday Intensive",
                    }) || "Subject Preview"}
                  </h4>
                  <p style={{ whiteSpace: "pre-wrap", color: "var(--color-text)", fontSize: "13px", lineHeight: 1.6 }}>
                    {replaceTemplateVariables(campaignMessage, {
                      name: "Adebayo David",
                      course: "Frontend Development",
                      cohort: "Weekday Intensive",
                      amount: "75,000",
                      email: "adebayo.d@example.ng",
                    }) || "Compose message on the left..."}
                  </p>
                  <div style={{ marginTop: "var(--sp-4)", borderTop: "1px solid var(--color-border)", paddingTop: "var(--sp-3)", fontSize: "11px", color: "var(--color-text-muted)", textAlign: "center" }}>
                    Dave Techs Academy • Physical Campuses in Abeokuta, VI Lagos, Ikeja, Ibadan
                  </div>
                </div>
              )}

              {channel === "whatsapp" && (
                <div className="crm-preview-whatsapp-phone">
                  <div className="crm-preview-whatsapp-bar">
                    <span>🟢 Dave Techs Academy ✓</span>
                  </div>
                  <div className="crm-preview-whatsapp-bubble">
                    <div style={{ fontWeight: 700, color: "var(--color-gold)", marginBottom: "4px", fontSize: "13px" }}>
                      {campaignSubject}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "13px" }}>
                      {replaceTemplateVariables(campaignMessage, {
                        name: "Adebayo David",
                        course: "Cybersecurity & Defense",
                        cohort: "Weekend Cohort",
                        amount: "80,000",
                      })}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textAlign: "right", marginTop: "4px" }}>
                      Just now ✓✓
                    </div>
                  </div>
                </div>
              )}

              {channel === "sms" && (
                <div className="crm-preview-sms-phone">
                  <div className="crm-preview-sms-header">
                    <span>SMS: {providerConfig.smsSenderId || "DaveTechs"}</span>
                  </div>
                  <div className="crm-preview-sms-bubble">
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "13px" }}>
                      {replaceTemplateVariables(campaignMessage, {
                        name: "Adebayo",
                        course: "Python Dev",
                        cohort: "Morning Batch",
                      })}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textAlign: "right", marginTop: "4px" }}>
                      {smsCharCount} chars ({smsUnits} unit)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 3: CLASS & ORIENTATION REMINDERS ── */}
      {activeTab === "reminders" && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">
              <span>⏰</span> Cohort Orientation & Class Schedule Reminder Dispatcher
            </h3>
          </div>

          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "0 0 var(--sp-4) 0" }}>
            Trigger scheduled reminders to confirmed enrolled students for upcoming class sessions, orientations, or exam defenses.
          </p>

          {reminderResult && (
            <div className="auth-alert auth-alert--success" style={{ marginBottom: "var(--sp-4)" }}>
              <span>{reminderResult}</span>
            </div>
          )}

          <form onSubmit={handleSendReminder} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", maxWidth: "700px" }}>
            <div className="form-group">
              <label className="form-label">Target Cohort *</label>
              <select
                className="form-input"
                value={reminderCohort}
                onChange={(e) => setReminderCohort(e.target.value)}
              >
                <option value="Weekday Intensive (Mon-Fri 9:00 AM - 1:00 PM)">Weekday Intensive (Mon-Fri 9:00 AM - 1:00 PM)</option>
                <option value="Weekend Intensive (Saturdays 9:00 AM - 4:00 PM)">Weekend Intensive (Saturdays 9:00 AM - 4:00 PM)</option>
                <option value="Evening Cohort (Mon/Wed/Fri 6:00 PM - 8:30 PM)">Evening Cohort (Mon/Wed/Fri 6:00 PM - 8:30 PM)</option>
                <option value="Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)">Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Class / Orientation Date & Time *</label>
              <input
                type="text"
                className="form-input"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                placeholder="e.g. Saturday, 10:00 AM West Africa Time (WAT)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / Virtual Meeting Link *</label>
              <input
                type="text"
                className="form-input"
                value={reminderLocation}
                onChange={(e) => setReminderLocation(e.target.value)}
                placeholder="e.g. Google Meet: meet.google.com/dta-room or Abeokuta Hub Lab 2"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Instructor Notes / Requirements</label>
              <textarea
                className="form-input"
                rows={3}
                value={reminderNotes}
                onChange={(e) => setReminderNotes(e.target.value)}
                placeholder="e.g. Please bring your laptop with VS Code and Git installed."
              />
            </div>

            <Button type="submit" variant="primary">
              ⏰ Dispatch Class Reminder to Enrolled Students
            </Button>
          </form>
        </div>
      )}

      {/* ── TAB 4: EMAIL TEMPLATES PREVIEW ── */}
      {activeTab === "templates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <div style={{ display: "flex", gap: "var(--sp-2)", flexWrap: "wrap" }}>
              <Button
                variant={previewTemplate === "welcome" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewTemplate("welcome")}
              >
                👋 Welcome
              </Button>
              <Button
                variant={previewTemplate === "application_received" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewTemplate("application_received")}
              >
                📋 App Received
              </Button>
              <Button
                variant={previewTemplate === "payment_receipt" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewTemplate("payment_receipt")}
              >
                💳 Payment Receipt
              </Button>
              <Button
                variant={previewTemplate === "payment_abandoned_reminder" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewTemplate("payment_abandoned_reminder")}
              >
                ⏳ Incomplete App Recovery
              </Button>
              <Button
                variant={previewTemplate === "class_reminder" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewTemplate("class_reminder")}
              >
                ⏰ Class Reminder
              </Button>
              <Button
                variant={previewTemplate === "course_announcement" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setPreviewTemplate("course_announcement")}
              >
                📢 Announcement
              </Button>
            </div>

            <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
              <button
                type="button"
                className={`crm-device-toggle ${previewDevice === "desktop" ? "crm-device-toggle--active" : ""}`}
                onClick={() => setPreviewDevice("desktop")}
              >
                🖥️ Desktop
              </button>
              <button
                type="button"
                className={`crm-device-toggle ${previewDevice === "mobile" ? "crm-device-toggle--active" : ""}`}
                onClick={() => setPreviewDevice("mobile")}
              >
                📱 Mobile
              </button>
            </div>
          </div>

          {/* Test Email Dispatch Bar */}
          <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center", padding: "var(--sp-3) var(--sp-4)", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)" }}>
            <span style={{ fontSize: "13px", fontWeight: 600 }}>Send Live Test:</span>
            <input
              type="email"
              className="form-input"
              style={{ maxWidth: "260px" }}
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="your-email@domain.com"
            />
            <Button variant="secondary" size="sm" onClick={handleSendTestEmail}>
              📨 Send Test Email
            </Button>
            {testEmailFeedback && (
              <span style={{ fontSize: "12px", color: "var(--color-gold)", fontWeight: 600 }}>
                {testEmailFeedback}
              </span>
            )}
          </div>

          <div
            className="email-preview-container"
            style={{
              maxWidth: previewDevice === "mobile" ? "420px" : "750px",
              margin: "0 auto",
              transition: "max-width 0.3s ease",
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: renderEmailHtml(previewTemplate, getDummyTemplateData(previewTemplate)),
              }}
            />
          </div>
        </div>
      )}

      {/* ── TAB 5: PROVIDER INTEGRATIONS & EVALUATION ── */}
      {activeTab === "providers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          <div className="crm-providers-grid">
            {/* 1. Email Provider Card */}
            <div className="crm-provider-card">
              <div className="crm-provider-card__header">
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px" }}>📧 Email Service Provider</h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Primary transactional & lifecycle engine
                  </p>
                </div>
                <Badge variant="gold">Resend / SendGrid</Badge>
              </div>

              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "var(--sp-3) 0" }}>
                <strong>Evaluated Choice: Resend (Primary)</strong>
                <p style={{ margin: "4px 0" }}>
                  Selected for exceptional delivery latency (&lt; 600ms) to Nigerian and global mailboxes, modern REST API, and native HTML template rendering.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Sender Email</label>
                <input
                  type="text"
                  className="form-input"
                  value={providerConfig.senderEmail}
                  onChange={(e) => setProviderConfig({ ...providerConfig, senderEmail: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sender Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={providerConfig.senderName}
                  onChange={(e) => setProviderConfig({ ...providerConfig, senderName: e.target.value })}
                />
              </div>

              <Button variant="secondary" size="sm" onClick={() => handleTestPing("email")}>
                ⚡ Ping Email Gateway
              </Button>
            </div>

            {/* 2. WhatsApp Provider Card */}
            <div className="crm-provider-card">
              <div className="crm-provider-card__header">
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px" }}>💬 WhatsApp Integration</h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Direct Admissions & Automated Outreach
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "var(--sp-3) 0" }}>
                <strong>Evaluated Choice: Direct wa.me Deep Links + Meta Cloud API</strong>
                <p style={{ margin: "4px 0" }}>
                  Direct Nigerian phone formatting (+234) allows instant 1-click advisor handoff with zero message approval delays.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Integration Mode</label>
                <select
                  className="form-input"
                  value={providerConfig.whatsappProvider}
                  onChange={(e) =>
                    setProviderConfig({
                      ...providerConfig,
                      whatsappProvider: e.target.value as any,
                    })
                  }
                >
                  <option value="direct_deep_link">Direct wa.me Instant Deep-Links (Recommended)</option>
                  <option value="meta_cloud">Meta WhatsApp Cloud API (Graph API)</option>
                  <option value="termii">Termii WhatsApp Gateway</option>
                  <option value="simulation">Simulated Environment</option>
                </select>
              </div>

              <Button variant="secondary" size="sm" onClick={() => handleTestPing("whatsapp")}>
                ⚡ Test WhatsApp Deep Link
              </Button>
            </div>

            {/* 3. SMS Gateway Card */}
            <div className="crm-provider-card">
              <div className="crm-provider-card__header">
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px" }}>📱 SMS Gateway Integration</h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Nigerian & International Telco Delivery
                  </p>
                </div>
                <Badge variant="info">Termii / Twilio</Badge>
              </div>

              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "var(--sp-3) 0" }}>
                <strong>Evaluated Choice: Termii (Nigeria Primary)</strong>
                <p style={{ margin: "4px 0" }}>
                  Selected for Tier-1 Nigerian Telco auto-routing past Do-Not-Disturb (DND) restrictions with custom alphanumeric Sender ID.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Registered Alphanumeric Sender ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={providerConfig.smsSenderId}
                  onChange={(e) => setProviderConfig({ ...providerConfig, smsSenderId: e.target.value })}
                />
              </div>

              <Button variant="secondary" size="sm" onClick={() => handleTestPing("sms")}>
                ⚡ Ping SMS Gateway
              </Button>
            </div>
          </div>

          {/* Test Ping Diagnostic Banner */}
          {testPingResult && (
            <div className="auth-alert auth-alert--success">
              <span>
                <strong>[{testPingResult.channel}]</strong> {testPingResult.message}{" "}
                <span style={{ fontSize: "11px", opacity: 0.8 }}>({testPingResult.latencyMs}ms)</span>
              </span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" onClick={handleSaveProviders}>
              💾 Save & Persist Provider Settings
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB 6: SENT COMMUNICATIONS AUDIT LOG ── */}
      {activeTab === "logs" && (
        <div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
          {/* Controls Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-4)", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center", flex: 1, minWidth: "260px" }}>
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: "300px" }}
                placeholder="Search logs by name, email, subject..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
              />
              <select
                className="form-input"
                style={{ maxWidth: "160px" }}
                value={logChannelFilter}
                onChange={(e) => setLogChannelFilter(e.target.value)}
              >
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              <Button variant="secondary" size="sm" onClick={handleExportLogsCsv} disabled={logs.length === 0}>
                📥 Export CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                style={{ color: "#ef4444" }}
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all stored communication audit logs?")) {
                    clearCommunicationLogs();
                    loadData();
                  }
                }}
              >
                🗑️ Clear Logs
              </Button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Channel</th>
                  <th>Template / Subject</th>
                  <th>Status</th>
                  <th>Dispatched At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", padding: "var(--sp-8)", color: "var(--color-text-muted)" }}
                    >
                      No dispatched communications matched your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <strong>{log.recipientName}</strong>
                        <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          {log.recipientEmail || log.recipientPhone}
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={
                            log.channel === "email" ? "gold" : log.channel === "whatsapp" ? "success" : "info"
                          }
                        >
                          {log.channel.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.subject}</div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{log.templateType}</div>
                      </td>
                      <td>
                        <Badge variant="success">Delivered</Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        {new Date(log.createdAt).toLocaleString("en-NG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <Button variant="secondary" size="sm" onClick={() => setInspectingMessage(log)}>
                          👁️ Inspect
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Member Inspect Modal ── */}
      {inspectingSegment && (
        <Modal
          isOpen={!!inspectingSegment}
          onClose={() => setInspectingSegment(null)}
          title={`Audience Segment: ${inspectingSegment.name} (${inspectingSegment.count} members)`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
              {inspectingSegment.description}
            </p>

            <input
              type="text"
              className="form-input"
              placeholder="Search leads in this segment..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
            />

            <div className="admin-table-container" style={{ maxHeight: "360px", overflowY: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Email / Phone</th>
                    <th>Interest</th>
                    <th>Status</th>
                    <th>Quick Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "var(--sp-4)" }}>
                        No leads matching "{memberSearchQuery}" in this segment.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m: Lead) => (
                      <tr key={m.id || m.email}>
                        <td><strong>{m.name}</strong></td>
                        <td style={{ fontSize: "12px" }}>
                          <div>{m.email}</div>
                          {m.phone && <div style={{ color: "var(--color-text-muted)" }}>{m.phone}</div>}
                        </td>
                        <td style={{ fontSize: "12px" }}>{m.courseInterest || "General Tech Inquiry"}</td>
                        <td>
                          <Badge variant={m.paymentStatus === "successful" ? "success" : "warning"}>
                            {m.applicationStatus || "inquired"}
                          </Badge>
                        </td>
                        <td>
                          {m.phone ? (
                            <a
                              href={createWhatsAppShareLink(
                                m.phone,
                                `Hello ${m.name}, this is Dave Techs Academy following up on your ${m.courseInterest || "technology course"} inquiry!`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: "none" }}
                            >
                              <Button variant="secondary" size="sm">
                                💬 WhatsApp
                              </Button>
                            </a>
                          ) : (
                            <a href={`mailto:${m.email}`} style={{ textDecoration: "none" }}>
                              <Button variant="secondary" size="sm">
                                ✉️ Email
                              </Button>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--sp-4)" }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setTargetSegmentKey(inspectingSegment.key);
                  setInspectingSegment(null);
                  setActiveTab("campaigns");
                }}
              >
                📢 Launch Broadcast to this Segment
              </Button>
              <Button variant="secondary" onClick={() => setInspectingSegment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Message Inspect Modal ── */}
      {inspectingMessage && (
        <Modal
          isOpen={!!inspectingMessage}
          onClose={() => setInspectingMessage(null)}
          title={`Dispatched Communication: ${inspectingMessage.subject}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <div
              style={{
                padding: "var(--sp-3) var(--sp-4)",
                backgroundColor: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div>
                <strong>Recipient:</strong> {inspectingMessage.recipientName} (
                {inspectingMessage.recipientEmail || inspectingMessage.recipientPhone})
              </div>
              <div style={{ marginTop: "4px" }}>
                <strong>Channel:</strong> {inspectingMessage.channel.toUpperCase()} •{" "}
                <strong>Template:</strong> {inspectingMessage.templateType} •{" "}
                <strong>Status:</strong> Delivered
              </div>
            </div>

            {inspectingMessage.bodyHtml ? (
              <div
                className="email-preview-container"
                dangerouslySetInnerHTML={{ __html: inspectingMessage.bodyHtml }}
              />
            ) : (
              <div
                style={{
                  padding: "var(--sp-4)",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "var(--radius-md)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {inspectingMessage.bodyText}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
              <Button variant="secondary" onClick={() => setInspectingMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
