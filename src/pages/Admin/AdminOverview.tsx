import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardStats } from "../../services/admin";
import type { DashboardStats } from "../../services/admin";
import { formatPrice } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import "./AdminOverview.css";

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(getAdminDashboardStats());
  }, []);

  if (!stats) return null;

  const maxPopularApps = Math.max(...stats.popularCourses.map((c) => c.applicationsCount), 1);

  return (
    <div className="admin-overview">
      {/* ── 1. Top Metric Cards ── */}
      <section className="admin-metrics-grid">
        {/* Total Students */}
        <div className="admin-metric-card">
          <div className="admin-metric-card__header">
            <span className="admin-metric-card__title">Total Students</span>
            <div className="admin-metric-card__icon">👥</div>
          </div>
          <div className="admin-metric-card__value">{stats.totalStudents}</div>
          <div className="admin-metric-card__subtext">
            <span className="admin-trend-badge">Active</span>
            <span>Registered learners</span>
          </div>
        </div>

        {/* Total Applications */}
        <div className="admin-metric-card">
          <div className="admin-metric-card__header">
            <span className="admin-metric-card__title">Applications</span>
            <div className="admin-metric-card__icon">📝</div>
          </div>
          <div className="admin-metric-card__value">{stats.totalApplications}</div>
          <div className="admin-metric-card__subtext">
            <span>{stats.pendingApplicationsCount} pending review</span>
          </div>
        </div>

        {/* Successful Payments */}
        <div className="admin-metric-card">
          <div className="admin-metric-card__header">
            <span className="admin-metric-card__title">Confirmed Payments</span>
            <div className="admin-metric-card__icon">💳</div>
          </div>
          <div className="admin-metric-card__value">{stats.successfulPaymentsCount}</div>
          <div className="admin-metric-card__subtext">
            <span className="admin-trend-badge">{stats.conversionRate}%</span>
            <span>Enrollment rate</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="admin-metric-card">
          <div className="admin-metric-card__header">
            <span className="admin-metric-card__title">Total Revenue</span>
            <div className="admin-metric-card__icon">💰</div>
          </div>
          <div className="admin-metric-card__value" style={{ color: "var(--color-gold)" }}>
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className="admin-metric-card__subtext">
            <span>Paystack verified income</span>
          </div>
        </div>
      </section>

      {/* ── 2. Middle Grid: Popular Courses & Upcoming Cohorts ── */}
      <div className="admin-overview-grid">
        {/* Popular Courses */}
        <section className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">
              <span>🔥</span> Popular Course Demand
            </h3>
            <Link to="/admin/courses">
              <Button variant="ghost" size="sm">Manage Courses →</Button>
            </Link>
          </div>

          <div className="popular-courses-list">
            {stats.popularCourses.map((c) => {
              const pct = Math.round((c.applicationsCount / maxPopularApps) * 100);
              return (
                <div key={c.courseId} className="popular-course-item">
                  <div className="popular-course-item__info">
                    <div>
                      <span className="popular-course-name">{c.courseTitle}</span>
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "var(--sp-2)" }}>
                        ({c.category})
                      </span>
                    </div>
                    <div className="popular-course-stats">
                      <strong>{c.applicationsCount}</strong> applications • <span style={{ color: "var(--color-gold)" }}>{formatPrice(c.revenue)}</span>
                    </div>
                  </div>
                  <div className="popular-course-bar-track">
                    <div
                      className="popular-course-bar-fill"
                      style={{ width: `${Math.max(pct, 12)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Cohorts */}
        <section className="admin-panel">
          <div className="admin-panel__header">
            <h3 className="admin-panel__title">
              <span>📅</span> Upcoming Cohorts
            </h3>
            <Link to="/admin/branches">
              <Button variant="ghost" size="sm">Branches →</Button>
            </Link>
          </div>

          <div className="cohorts-summary-list">
            {stats.upcomingCohorts.map((cohort, idx) => (
              <div key={idx} className="cohort-summary-card">
                <span className="cohort-summary-name">{cohort.name}</span>
                <span className="cohort-summary-branch">📍 {cohort.branchName}</span>
                <div className="cohort-summary-footer">
                  <span>Enrolled: <strong>{cohort.enrolledCount} students</strong></span>
                  <span>{cohort.startDate}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── 3. Recent Applications Table ── */}
      <section className="admin-panel">
        <div className="admin-panel__header">
          <h3 className="admin-panel__title">
            <span>📋</span> Recent Student Applications
          </h3>
          <Link to="/admin/applications">
            <Button variant="ghost" size="sm">View All Applications →</Button>
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Applicant</th>
                <th>Course</th>
                <th>Mode / Branch</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentApplications.map((app) => (
                <tr key={app.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--color-gold)" }}>
                    {app.applicationNumber}
                  </td>
                  <td>
                    <div><strong>{app.studentName}</strong></div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{app.studentEmail}</div>
                  </td>
                  <td>{app.courseTitle}</td>
                  <td>
                    {app.learningMode === "physical" ? (
                      <span style={{ fontSize: "12px" }}>🏢 {app.branchName || "Physical"}</span>
                    ) : (
                      <span style={{ fontSize: "12px" }}>🌐 Online</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatPrice(app.tuitionAmount)}</td>
                  <td>
                    <Badge variant={app.paymentStatus === "successful" ? "success" : app.paymentStatus === "pending" ? "warning" : "error"}>
                      {app.paymentStatus}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={app.applicationStatus === "confirmed" ? "success" : app.applicationStatus === "pending" ? "warning" : "info"}>
                      {app.applicationStatus}
                    </Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {new Date(app.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
