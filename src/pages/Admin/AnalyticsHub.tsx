import React, { useState } from "react";
import {
  getAnalyticsOverviewStats,
  getFunnelMetrics,
  getSearchAnalytics,
  getCoursePerformanceStats,
  getStoredAnalyticsEvents,
  getAnalyticsSettings,
  saveAnalyticsSettings,
  clearAnalyticsEvents,
} from "../../services/analytics";
import type {
  AnalyticsEvent,
  AnalyticsOverviewStats,
  FunnelStageMetrics,
  AnalyticsSettings,
} from "../../services/analytics";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import "./AnalyticsHub.css";

export const AnalyticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"funnel" | "courses" | "search" | "events" | "settings">("funnel");

  // Initial state derived from service getters
  const [stats, setStats] = useState<AnalyticsOverviewStats>(() => getAnalyticsOverviewStats());
  const [funnel, setFunnel] = useState<FunnelStageMetrics[]>(() => getFunnelMetrics());
  const [searchTerms, setSearchTerms] = useState<{ query: string; count: number }[]>(() => getSearchAnalytics());
  const [courseStats, setCourseStats] = useState(() => getCoursePerformanceStats());
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => getStoredAnalyticsEvents());
  const [settings, setSettings] = useState<AnalyticsSettings>(() => getAnalyticsSettings());

  // Event stream search & filter
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [inspectingEvent, setInspectingEvent] = useState<AnalyticsEvent | null>(null);

  // Settings feedback
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  const refreshData = () => {
    setStats(getAnalyticsOverviewStats());
    setFunnel(getFunnelMetrics());
    setSearchTerms(getSearchAnalytics());
    setCourseStats(getCoursePerformanceStats());
    setEvents(getStoredAnalyticsEvents());
    setSettings(getAnalyticsSettings());
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveAnalyticsSettings(settings);
    setSettingsSavedMessage("✓ Analytics settings & telemetry providers successfully updated!");
    setTimeout(() => setSettingsSavedMessage(null), 4000);
  };

  const handleExportCsv = () => {
    const all = getStoredAnalyticsEvents();
    if (all.length === 0) return;

    const headers = ["ID", "Event Type", "Path", "Device", "Timestamp", "Payload"];
    const rows = all.map((ev) => [
      ev.id,
      ev.type,
      `"${ev.path || ""}"`,
      ev.device,
      ev.timestamp,
      `"${JSON.stringify(ev.payload).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `devtechs_analytics_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to reset all stored analytics telemetry events?")) {
      clearAnalyticsEvents();
      refreshData();
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesType = eventTypeFilter === "all" || ev.type === eventTypeFilter;
    const matchesSearch =
      !eventSearchQuery ||
      ev.type.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      (ev.path && ev.path.toLowerCase().includes(eventSearchQuery.toLowerCase())) ||
      JSON.stringify(ev.payload).toLowerCase().includes(eventSearchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEventBadgeVariant = (type: string) => {
    if (type.includes("payment_success")) return "success";
    if (type.includes("payment_failed") || type.includes("abandoned")) return "warning";
    if (type.includes("apply") || type.includes("application")) return "gold";
    if (type.includes("signup")) return "warning";
    return "info";
  };

  return (
    <div className="analytics-hub">
      {/* ── 1. Top KPI Summary Grid ── */}
      <section className="analytics-kpi-grid">
        {/* Total Pageviews */}
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Total Pageviews</span>
            <span className="analytics-kpi-card__icon">👁️</span>
          </div>
          <div className="analytics-kpi-card__value">{stats.totalPageviews}</div>
          <div className="analytics-kpi-card__subtext">
            <span>~{stats.totalUniqueSessions} unique visitors</span>
          </div>
        </div>

        {/* Searches & Intent */}
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Catalog Searches</span>
            <span className="analytics-kpi-card__icon">🔍</span>
          </div>
          <div className="analytics-kpi-card__value">{stats.totalSearches}</div>
          <div className="analytics-kpi-card__subtext">
            <span>{stats.totalApplyClicks} Apply clicks</span>
          </div>
        </div>

        {/* Applications Submitted */}
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Applications</span>
            <span className="analytics-kpi-card__icon">📝</span>
          </div>
          <div className="analytics-kpi-card__value">{stats.totalApplications}</div>
          <div className="analytics-kpi-card__subtext">
            <span style={{ color: "var(--color-gold)" }}>{stats.totalPaidEnrollments} paid enrollments</span>
          </div>
        </div>

        {/* Funnel Conversion Rate */}
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">App-to-Paid Rate</span>
            <span className="analytics-kpi-card__icon">📈</span>
          </div>
          <div className="analytics-kpi-card__value" style={{ color: "var(--color-gold)" }}>
            {stats.applicationToPaidRate}%
          </div>
          <div className="analytics-kpi-card__subtext">
            <span className="analytics-trend-badge">{stats.overallConversionRate}% overall visitor rate</span>
          </div>
        </div>

        {/* Abandonment Rate */}
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Abandonment Rate</span>
            <span className="analytics-kpi-card__icon">⏳</span>
          </div>
          <div className="analytics-kpi-card__value" style={{ color: stats.abandonmentRate > 40 ? "#f87171" : "var(--color-text)" }}>
            {stats.abandonmentRate}%
          </div>
          <div className="analytics-kpi-card__subtext">
            <span>Incomplete / Pending checkout</span>
          </div>
        </div>
      </section>

      {/* ── Sub Tabs Bar ── */}
      <div className="analytics-tabs">
        <button
          type="button"
          className={`analytics-tab-btn ${activeTab === "funnel" ? "analytics-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("funnel")}
        >
          📊 Enrollment Funnel
        </button>
        <button
          type="button"
          className={`analytics-tab-btn ${activeTab === "courses" ? "analytics-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          📚 Course Demand Matrix
        </button>
        <button
          type="button"
          className={`analytics-tab-btn ${activeTab === "search" ? "analytics-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          🔍 Search & Discovery
        </button>
        <button
          type="button"
          className={`analytics-tab-btn ${activeTab === "events" ? "analytics-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          ⚡ Live Event Stream ({events.length})
        </button>
        <button
          type="button"
          className={`analytics-tab-btn ${activeTab === "settings" ? "analytics-tab-btn--active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Telemetry & GA4 Setup
        </button>
      </div>

      {/* ── TAB 1: ENROLLMENT FUNNEL ── */}
      {activeTab === "funnel" && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">
                <span>📊</span> Multi-Stage Enrollment Conversion Funnel
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
                Tracks student progression from initial website discovery down to Paystack verified payment.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={refreshData}>
              🔄 Refresh Funnel
            </Button>
          </div>

          <div className="funnel-container">
            {funnel.map((stage, idx) => {
              const maxCount = funnel[0]?.count || 1;
              const widthPct = Math.max(Math.round((stage.count / maxCount) * 100), 16);

              return (
                <div key={stage.stage} className="funnel-stage-row">
                  <div className="funnel-stage-meta">
                    <span className="funnel-stage-name">{stage.name}</span>
                    <div className="funnel-stage-counts">
                      <strong>{stage.count}</strong>
                      {idx > 0 && (
                        <span className="funnel-stage-rate">
                          ({stage.conversionFromPrevious}% from previous step)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="funnel-bar-track">
                    <div
                      className="funnel-bar-fill"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: idx === funnel.length - 1 ? "#10b981" : idx === 0 ? "var(--color-gold)" : "#3b82f6",
                      }}
                    >
                      <span className="funnel-bar-label">{stage.count}</span>
                    </div>
                  </div>

                  {idx > 0 && stage.dropoffRate > 0 && (
                    <div className="funnel-dropoff-indicator">
                      <span>🔻 {stage.dropoffRate}% drop-off</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Traffic Device & Top Pages Breakdown */}
          <div className="funnel-breakdown-grid" style={{ marginTop: "var(--sp-6)" }}>
            <div className="funnel-subpanel">
              <h4 style={{ margin: "0 0 var(--sp-3) 0", fontSize: "14px", color: "var(--color-gold)" }}>
                📱 Traffic by Device Category
              </h4>
              <div style={{ display: "flex", gap: "var(--sp-4)" }}>
                <div className="device-stat-chip">
                  <span className="device-icon">💻</span>
                  <div>
                    <div className="device-name">Desktop</div>
                    <strong>{stats.deviceBreakdown.desktop} views</strong>
                  </div>
                </div>
                <div className="device-stat-chip">
                  <span className="device-icon">📱</span>
                  <div>
                    <div className="device-name">Mobile Phone</div>
                    <strong>{stats.deviceBreakdown.mobile} views</strong>
                  </div>
                </div>
                <div className="device-stat-chip">
                  <span className="device-icon">📟</span>
                  <div>
                    <div className="device-name">Tablet</div>
                    <strong>{stats.deviceBreakdown.tablet} views</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="funnel-subpanel">
              <h4 style={{ margin: "0 0 var(--sp-3) 0", fontSize: "14px", color: "var(--color-gold)" }}>
                🌐 Top Viewed URL Routes
              </h4>
              <div className="top-pages-list">
                {stats.topPages.map((p) => (
                  <div key={p.path} className="top-page-item">
                    <span className="top-page-path">{p.path}</span>
                    <strong className="top-page-views">{p.views} views</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COURSE DEMAND MATRIX ── */}
      {activeTab === "courses" && (
        <div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "var(--sp-4)", borderBottom: "1px solid var(--color-border)" }}>
            <h3 className="admin-panel__title" style={{ margin: 0 }}>
              <span>📚</span> Individual Course Demand & Conversion Matrix
            </h3>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Page Views</th>
                  <th>Apply Clicks</th>
                  <th>Applications</th>
                  <th>Paid Enrollments</th>
                  <th>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map((c) => (
                  <tr key={c.courseId}>
                    <td>
                      <strong>{c.title}</strong>
                    </td>
                    <td>{c.views}</td>
                    <td>{c.applyClicks}</td>
                    <td>
                      <Badge variant="info">{c.applications}</Badge>
                    </td>
                    <td>
                      <Badge variant="success">{c.paidCount}</Badge>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: c.conversionRate >= 50 ? "#10b981" : "var(--color-gold)" }}>
                        {c.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: SEARCH & DISCOVERY ANALYTICS ── */}
      {activeTab === "search" && (
        <div className="analytics-search-grid">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <h3 className="admin-panel__title">
                <span>🔍</span> Most Searched Technology Terms
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "0 0 var(--sp-4) 0" }}>
              Identifies top skills and programming keywords prospective students are seeking.
            </p>

            <div className="search-terms-list">
              {searchTerms.map((t, idx) => (
                <div key={t.query} className="search-term-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                    <span className="search-term-rank">#{idx + 1}</span>
                    <span className="search-term-text">"{t.query}"</span>
                  </div>
                  <Badge variant="gold">{t.count} searches</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <h3 className="admin-panel__title">
                <span>💡</span> Search Optimization Recommendations
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", fontSize: "13px", color: "var(--color-text-muted)" }}>
              <div style={{ padding: "var(--sp-3)", backgroundColor: "var(--color-surface-hover)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ color: "var(--color-text)" }}>High Interest: Python & Automation</strong>
                <p style={{ margin: "4px 0 0 0" }}>Python remains the #1 searched technology. Consider highlighting backend scripting and automation cohorts on the homepage hero.</p>
              </div>
              <div style={{ padding: "var(--sp-3)", backgroundColor: "var(--color-surface-hover)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ color: "var(--color-text)" }}>Growing Demand: Cybersecurity & Ethical Hacking</strong>
                <p style={{ margin: "4px 0 0 0" }}>High search query volume with strong conversion to physical hub applications in Abeokuta and VI Lagos.</p>
              </div>
              <div style={{ padding: "var(--sp-3)", backgroundColor: "var(--color-surface-hover)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ color: "var(--color-text)" }}>Zero-Result Query Reduction</strong>
                <p style={{ margin: "4px 0 0 0" }}>Automatic fuzzy search matching ensures misspellings like "react js" or "figma ui" cleanly route to relevant courses.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: LIVE EVENT TELEMETRY STREAM ── */}
      {activeTab === "events" && (
        <div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-4)", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap", gap: "var(--sp-3)" }}>
            <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center", flex: 1, minWidth: "260px" }}>
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: "300px" }}
                placeholder="Filter events by type or path..."
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
              />
              <select
                className="form-input"
                style={{ maxWidth: "200px" }}
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
              >
                <option value="all">All Event Types</option>
                <option value="page_view">page_view</option>
                <option value="course_view">course_view</option>
                <option value="course_search">course_search</option>
                <option value="course_filter">course_filter</option>
                <option value="apply_now_click">apply_now_click</option>
                <option value="signup_start">signup_start</option>
                <option value="signup_complete">signup_complete</option>
                <option value="application_start">application_start</option>
                <option value="application_complete">application_complete</option>
                <option value="payment_start">payment_start</option>
                <option value="payment_success">payment_success</option>
                <option value="payment_failed">payment_failed</option>
                <option value="payment_abandoned">payment_abandoned</option>
                <option value="contact_submit">contact_submit</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "var(--sp-2)" }}>
              <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={events.length === 0}>
                📥 Export CSV
              </Button>
              <Button variant="ghost" size="sm" style={{ color: "#ef4444" }} onClick={handleClearData}>
                🗑️ Clear Stream
              </Button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Path / URL</th>
                  <th>Device</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "var(--sp-8)", color: "var(--color-text-muted)" }}>
                      No analytics events found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <Badge variant={getEventBadgeVariant(ev.type)}>
                          {ev.type}
                        </Badge>
                      </td>
                      <td style={{ fontSize: "13px", fontFamily: "monospace" }}>
                        {ev.path || "/"}
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", textTransform: "capitalize" }}>
                          {ev.device === "desktop" ? "💻 Desktop" : ev.device === "mobile" ? "📱 Mobile" : "📟 Tablet"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        {new Date(ev.timestamp).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td>
                        <Button variant="secondary" size="sm" onClick={() => setInspectingEvent(ev)}>
                          👁️ Inspect Payload
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

      {/* ── TAB 5: TELEMETRY & GA4 SETUP ── */}
      {activeTab === "settings" && (
        <div className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">
              <span>⚙️</span> Analytics & Telemetry Provider Configuration
            </h3>
          </div>

          {settingsSavedMessage && (
            <div className="auth-alert auth-alert--success" style={{ marginBottom: "var(--sp-4)" }}>
              <span>{settingsSavedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)", maxWidth: "680px" }}>
            <div className="form-group">
              <label className="checkbox-label" style={{ fontSize: "14px" }}>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                />
                <span>Enable Real-time Telemetry & Conversion Funnel Tracking</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Google Analytics 4 (GA4) Measurement ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. G-DTA2026NG99"
                value={settings.googleAnalyticsId || ""}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
              />
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px", display: "block" }}>
                When configured, events are automatically mirrored to Google Analytics 4 via `gtag.js`.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">PostHog / Plausible API Key (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. phc_dta_live_telemetry_key"
                value={settings.posthogApiKey || ""}
                onChange={(e) => setSettings({ ...settings, posthogApiKey: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Local Telemetry Buffer Retention Limit</label>
              <select
                className="form-input"
                value={settings.retentionLimit}
                onChange={(e) => setSettings({ ...settings, retentionLimit: Number(e.target.value) })}
              >
                <option value={200}>Latest 200 events</option>
                <option value={500}>Latest 500 events (Recommended)</option>
                <option value={1000}>Latest 1,000 events</option>
              </select>
            </div>

            <Button type="submit" variant="primary">
              💾 Save Telemetry Configuration
            </Button>
          </form>
        </div>
      )}

      {/* ── Event Payload Inspect Modal ── */}
      {inspectingEvent && (
        <Modal
          isOpen={!!inspectingEvent}
          onClose={() => setInspectingEvent(null)}
          title={`Telemetry Event: ${inspectingEvent.type}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <div style={{ padding: "var(--sp-3)", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <div><strong>Event ID:</strong> {inspectingEvent.id}</div>
              <div><strong>Device:</strong> {inspectingEvent.device} • <strong>Path:</strong> {inspectingEvent.path}</div>
              <div><strong>Recorded At:</strong> {new Date(inspectingEvent.timestamp).toLocaleString("en-NG")}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
              <span className="form-label">Payload Data (JSON):</span>
              <pre
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--sp-4)",
                  fontSize: "12px",
                  overflowX: "auto",
                  color: "var(--color-gold)",
                }}
              >
                {JSON.stringify(inspectingEvent.payload, null, 2)}
              </pre>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--sp-2)" }}>
              <Button variant="secondary" onClick={() => setInspectingEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
