import React, { useState, useEffect } from "react";
import { getStoredApplications } from "../../data/applications";
import { getStoredCourses } from "../../data/courses";
import { getStoredBranches } from "../../data/branches";
import { updateApplicationStatus, deleteApplicationRecord } from "../../services/admin";
import { formatPrice } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { Application, ApplicationStatus, PaymentStatus } from "../../types";
import "./ApplicationManager.css";

export const ApplicationManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [coursesList, setCoursesList] = useState(getStoredCourses());
  const [branchesList, setBranchesList] = useState(getStoredBranches());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  // Selected Application for Status Edit or View Details
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("confirmed");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("successful");

  const loadData = () => {
    setApplications(getStoredApplications());
    setCoursesList(getStoredCourses());
    setBranchesList(getStoredBranches());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenStatusModal = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.applicationStatus);
    setNewPaymentStatus(app.paymentStatus);
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    updateApplicationStatus(selectedApp.id, newStatus, newPaymentStatus);
    setSelectedApp(null);
    loadData();
  };

  const handleDelete = (app: Application) => {
    if (window.confirm(`Delete application ${app.applicationNumber} for ${app.studentName}?`)) {
      deleteApplicationRecord(app.id);
      loadData();
    }
  };

  // Filter logic
  const filtered = applications.filter((app) => {
    const matchSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCourse = courseFilter === "all" || app.courseId === courseFilter;
    const matchStatus = statusFilter === "all" || app.applicationStatus === statusFilter;
    const matchPayment = paymentFilter === "all" || app.paymentStatus === paymentFilter;
    const matchBranch = branchFilter === "all" || app.branchId === branchFilter;
    const matchMode = modeFilter === "all" || app.learningMode === modeFilter;

    return matchSearch && matchCourse && matchStatus && matchPayment && matchBranch && matchMode;
  });

  return (
    <div className="application-manager">
      {/* ── Filter Controls Bar ── */}
      <div className="filters-bar">
        <div className="filters-row">
          <input
            type="text"
            className="manager-search-input"
            placeholder="🔍 Search applicant name, email, or application number (DTA-...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 2 }}
          />

          <select
            className="manager-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all">All Courses</option>
            {coursesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            className="manager-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All App Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filters-row">
          <select
            className="manager-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending Payment</option>
            <option value="failed">Failed</option>
            <option value="abandoned">Abandoned</option>
          </select>

          <select
            className="manager-select"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="all">All Branches</option>
            {branchesList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            className="manager-select"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">All Modes</option>
            <option value="online">Online Training</option>
            <option value="physical">Physical Training</option>
          </select>

          <div style={{ marginLeft: "auto", fontSize: "13px", color: "var(--color-text-muted)" }}>
            Found <strong>{filtered.length}</strong> matching application{filtered.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* ── Applications Table ── */}
      <div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>App Number</th>
                <th>Applicant</th>
                <th>Course</th>
                <th>Mode / Branch</th>
                <th>Cohort</th>
                <th>Tuition</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--color-gold)" }}>
                    {app.applicationNumber}
                  </td>
                  <td>
                    <div><strong>{app.studentName}</strong></div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{app.studentEmail}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>📞 {app.studentPhone}</div>
                  </td>
                  <td>
                    <strong>{app.courseTitle}</strong>
                  </td>
                  <td>
                    {app.learningMode === "physical" ? (
                      <span style={{ fontSize: "12px" }}>🏢 {app.branchName || "Physical Campus"}</span>
                    ) : (
                      <span style={{ fontSize: "12px" }}>🌐 Online</span>
                    )}
                  </td>
                  <td style={{ fontSize: "12px" }}>{app.cohort}</td>
                  <td style={{ fontWeight: 700 }}>{formatPrice(app.tuitionAmount)}</td>
                  <td>
                    <Badge variant={app.paymentStatus === "successful" ? "success" : app.paymentStatus === "pending" ? "warning" : "error"}>
                      {app.paymentStatus}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={app.applicationStatus === "confirmed" ? "success" : app.applicationStatus === "pending" ? "warning" : "error"}>
                      {app.applicationStatus}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenStatusModal(app)}>
                        ⚙️ Update
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(app)}
                        style={{ color: "#ef4444" }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Status Update Modal ── */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Update Application: ${selectedApp.applicationNumber}`}
        >
          <form onSubmit={handleUpdateStatusSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <div style={{ padding: "var(--sp-3) var(--sp-4)", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <div><strong>Applicant:</strong> {selectedApp.studentName} ({selectedApp.studentEmail})</div>
              <div><strong>Course:</strong> {selectedApp.courseTitle} ({formatPrice(selectedApp.tuitionAmount)})</div>
            </div>

            <div className="form-group">
              <label className="form-label">Application Status</label>
              <select
                className="form-input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
              >
                <option value="pending">Pending Review</option>
                <option value="confirmed">Confirmed / Admitted</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-input"
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
              >
                <option value="pending">Pending</option>
                <option value="successful">Successful (Paid)</option>
                <option value="failed">Failed</option>
                <option value="abandoned">Abandoned</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
              <Button type="button" variant="secondary" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Status
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
