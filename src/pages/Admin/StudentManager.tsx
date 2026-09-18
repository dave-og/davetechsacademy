import React, { useState, useEffect } from "react";
import { getAllStudents } from "../../services/admin";
import type { StudentWithHistory } from "../../services/admin";
import { formatPrice } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import "./StudentManager.css";

export const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<StudentWithHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStateFilter, setSelectedStateFilter] = useState("all");

  // Profile Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentWithHistory | null>(null);

  const loadStudents = () => {
    setStudents(getAllStudents());
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const uniqueStates = Array.from(
    new Set(students.map((s) => s.state).filter(Boolean))
  ) as string[];

  const filtered = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchState = selectedStateFilter === "all" || s.state === selectedStateFilter;
    return matchSearch && matchState;
  });

  return (
    <div className="student-manager">
      {/* Toolbar */}
      <div className="manager-toolbar">
        <div className="manager-search-group">
          <input
            type="text"
            className="manager-search-input"
            placeholder="🔍 Search student by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="manager-select"
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
          >
            <option value="all">All Locations / States</option>
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
          Showing <strong>{filtered.length}</strong> registered students
        </div>
      </div>

      {/* Student List Table */}
      <div className="admin-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Applications</th>
                <th>Total Paid</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id || s.email}>
                  <td>
                    <div><strong>{s.fullName}</strong></div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{s.email}</div>
                  </td>
                  <td>{s.phone || "—"}</td>
                  <td>{s.state ? `${s.state}, ${s.country}` : s.country}</td>
                  <td>
                    <Badge variant={s.applications.length > 0 ? "gold" : "info"}>
                      {s.applications.length} Course{s.applications.length === 1 ? "" : "s"}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--color-gold)" }}>
                    {formatPrice(s.totalSpent)}
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {new Date(s.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <Button variant="secondary" size="sm" onClick={() => setSelectedStudent(s)}>
                      👁️ View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Student Profile & History Modal ── */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="Student Profile & Enrollment Record"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
            {/* Header / Info */}
            <div className="student-profile-header">
              <div className="student-profile-avatar">
                {selectedStudent.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--text-lg)" }}>{selectedStudent.fullName}</h3>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                  {selectedStudent.email} • {selectedStudent.phone}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-gold)", marginTop: "2px" }}>
                  📍 {selectedStudent.state ? `${selectedStudent.state}, ` : ""}{selectedStudent.country}
                </div>
              </div>
            </div>

            {/* Application History */}
            <div className="student-history-section">
              <h4 className="student-history-title">📚 Course Application History ({selectedStudent.applications.length})</h4>
              {selectedStudent.applications.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>No applications on record.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Mode / Branch</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.applications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>{app.courseTitle}</strong>
                            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{app.applicationNumber}</div>
                          </td>
                          <td style={{ fontSize: "12px" }}>
                            {app.learningMode === "physical" ? `🏢 ${app.branchName || "Physical"}` : "🌐 Online"}
                          </td>
                          <td style={{ fontWeight: 600 }}>{formatPrice(app.tuitionAmount)}</td>
                          <td>
                            <Badge variant={app.applicationStatus === "confirmed" ? "success" : "warning"}>
                              {app.applicationStatus}
                            </Badge>
                          </td>
                          <td style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="student-history-section">
              <h4 className="student-history-title">💳 Payment Transactions</h4>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--sp-3) var(--sp-4)", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <span>Lifetime Tuition Invested:</span>
                <strong style={{ color: "var(--color-gold)" }}>{formatPrice(selectedStudent.totalSpent)}</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
              <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
