import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getApplicationsByStudentId, saveApplication } from "../../data/applications";
import { formatPrice } from "../../utils";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { PaystackModal } from "../../components/common/PaystackModal";
import { ReceiptModal } from "../../components/dashboard/ReceiptModal";
import type { Application } from "../../types";
import "./ApplicationsList.css";

export const ApplicationsList: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedPayApp, setSelectedPayApp] = useState<Application | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedReceiptApp, setSelectedReceiptApp] = useState<Application | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedDetailApp, setSelectedDetailApp] = useState<Application | null>(null);

  const loadApplications = () => {
    if (user?.id) {
      const userApps = getApplicationsByStudentId(user.id);
      setApplications(userApps);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user?.id]);

  // Handle ESC key for application detail modal
  useEffect(() => {
    if (!selectedDetailApp) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDetailApp(null);
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [selectedDetailApp]);

  const handlePayNow = (app: Application) => {
    setSelectedPayApp(app);
    setIsPayModalOpen(true);
  };

  const handlePaymentSuccess = (reference: string) => {
    if (selectedPayApp) {
      const updated: Application = {
        ...selectedPayApp,
        paymentStatus: "successful",
        applicationStatus: "confirmed",
        paymentReference: reference,
      };
      saveApplication(updated);
      loadApplications();
    }
    setIsPayModalOpen(false);
  };

  const handleViewReceipt = (app: Application) => {
    setSelectedReceiptApp(app);
    setIsReceiptModalOpen(true);
  };

  const filteredApps = applications.filter((app) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && app.paymentStatus !== "successful") ||
      (activeTab === "confirmed" && app.paymentStatus === "successful");

    const matchesQuery =
      app.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.branchName && app.branchName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesQuery;
  });

  return (
    <div className="apps-page">
      {/* Header */}
      <div className="apps-page__header">
        <div>
          <h1 className="dash-page-title">Course Applications</h1>
          <p className="dash-page-subtitle">
            View submitted applications, tuition payment records, and admission statuses.
          </p>
        </div>
        <Link to="/courses">
          <Button variant="primary" size="md">
            + New Course Application
          </Button>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="apps-page__controls">
        <div className="apps-page__tabs">
          <button
            className={`apps-tab ${activeTab === "all" ? "apps-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Applications ({applications.length})
          </button>
          <button
            className={`apps-tab ${activeTab === "pending" ? "apps-tab--active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Payment ({applications.filter((a) => a.paymentStatus !== "successful").length})
          </button>
          <button
            className={`apps-tab ${activeTab === "confirmed" ? "apps-tab--active" : ""}`}
            onClick={() => setActiveTab("confirmed")}
          >
            Confirmed Admission ({applications.filter((a) => a.paymentStatus === "successful").length})
          </button>
        </div>

        <div className="apps-page__search">
          <input
            type="text"
            className="apps-search-input"
            placeholder="Search by ID, course, campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Applications Cards / Table */}
      {filteredApps.length > 0 ? (
        <div className="apps-list-container">
          {filteredApps.map((app) => (
            <div key={app.id} className="app-card">
              <div className="app-card__header">
                <div className="app-card__id-group">
                  <span className="app-card__id-lbl">Application No:</span>
                  <span className="app-card__id-val">{app.applicationNumber}</span>
                </div>
                <div className="app-card__badges">
                  {app.paymentStatus === "successful" ? (
                    <Badge variant="success">Confirmed & Paid</Badge>
                  ) : (
                    <Badge variant="warning">Payment Pending</Badge>
                  )}
                  <span className="app-mode-badge">
                    {app.learningMode === "online" ? "🌐 Online" : "🏫 Physical"}
                  </span>
                </div>
              </div>

              <div className="app-card__body">
                <div className="app-card__main-info">
                  <h3 className="app-card__course">{app.courseTitle}</h3>
                  <div className="app-card__cohort">
                    <strong>Batch / Cohort:</strong> {app.cohort}
                  </div>
                  {app.branchName && (
                    <div className="app-card__branch">
                      <strong>Campus Location:</strong> {app.branchName}
                    </div>
                  )}
                  <div className="app-card__date">
                    <strong>Submitted:</strong>{" "}
                    {new Date(app.createdAt).toLocaleDateString("en-NG", {
                      dateStyle: "medium",
                    })}
                  </div>
                </div>

                <div className="app-card__pricing-action">
                  <div className="app-card__tuition-box">
                    <span className="app-card__tuition-lbl">Tuition Fee</span>
                    <span className="app-card__tuition-val">{formatPrice(app.tuitionAmount)}</span>
                  </div>

                  <div className="app-card__action-btns">
                    {app.paymentStatus !== "successful" ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handlePayNow(app)}
                      >
                        💳 Pay Now via Paystack
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleViewReceipt(app)}
                      >
                        🖨️ View Receipt
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDetailApp(app)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="apps-empty">
          <div className="apps-empty-icon">📝</div>
          <h3 className="apps-empty-title">No Applications Found</h3>
          <p className="apps-empty-desc">
            {searchQuery
              ? `No application records matching "${searchQuery}".`
              : "You haven't submitted any course applications yet. Choose your skill and start your tech journey today."}
          </p>
          <Link to="/courses">
            <Button variant="primary" size="md">
              Explore Courses & Apply →
            </Button>
          </Link>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedDetailApp && (
        <div className="app-modal-backdrop" role="dialog" aria-modal="true">
          <div className="app-modal-box">
            <div className="app-modal-header">
              <div>
                <span className="app-modal-tag">APPLICATION SUMMARY</span>
                <h3 className="app-modal-title">{selectedDetailApp.applicationNumber}</h3>
              </div>
              <button
                className="app-modal-close"
                onClick={() => setSelectedDetailApp(null)}
              >
                ✕
              </button>
            </div>

            <div className="app-modal-body">
              <div className="app-detail-section">
                <h4 className="app-detail-section-title">Course Information</h4>
                <div className="app-detail-grid">
                  <div>
                    <label>Course Title</label>
                    <p>{selectedDetailApp.courseTitle}</p>
                  </div>
                  <div>
                    <label>Tuition Fee</label>
                    <p>{formatPrice(selectedDetailApp.tuitionAmount)}</p>
                  </div>
                  <div>
                    <label>Learning Mode</label>
                    <p>{selectedDetailApp.learningMode === "online" ? "Online Live" : "Physical Campus"}</p>
                  </div>
                  <div>
                    <label>Cohort Batch</label>
                    <p>{selectedDetailApp.cohort}</p>
                  </div>
                  {selectedDetailApp.branchName && (
                    <div style={{ gridColumn: "span 2" }}>
                      <label>Campus Location</label>
                      <p>{selectedDetailApp.branchName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="app-detail-section">
                <h4 className="app-detail-section-title">Applicant Details</h4>
                <div className="app-detail-grid">
                  <div>
                    <label>Applicant Name</label>
                    <p>{selectedDetailApp.studentName}</p>
                  </div>
                  <div>
                    <label>Email Address</label>
                    <p>{selectedDetailApp.studentEmail}</p>
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <p>{selectedDetailApp.studentPhone}</p>
                  </div>
                  <div>
                    <label>Preferred Contact</label>
                    <p style={{ textTransform: "capitalize" }}>{selectedDetailApp.preferredContactMethod}</p>
                  </div>
                </div>
              </div>

              <div className="app-detail-section">
                <h4 className="app-detail-section-title">Status & Payment</h4>
                <div className="app-detail-grid">
                  <div>
                    <label>Application Status</label>
                    <p style={{ textTransform: "capitalize" }}>{selectedDetailApp.applicationStatus}</p>
                  </div>
                  <div>
                    <label>Payment Status</label>
                    <p style={{ textTransform: "capitalize" }}>{selectedDetailApp.paymentStatus}</p>
                  </div>
                  {selectedDetailApp.paymentReference && (
                    <div style={{ gridColumn: "span 2" }}>
                      <label>Payment Reference</label>
                      <p style={{ fontFamily: "monospace", color: "var(--gold-primary)" }}>
                        {selectedDetailApp.paymentReference}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="app-modal-footer">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDetailApp(null)}
              >
                Close
              </Button>
              {selectedDetailApp.paymentStatus !== "successful" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const app = selectedDetailApp;
                    setSelectedDetailApp(null);
                    handlePayNow(app);
                  }}
                >
                  Proceed to Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paystack Checkout Modal */}
      {selectedPayApp && (
        <PaystackModal
          isOpen={isPayModalOpen}
          amount={selectedPayApp.tuitionAmount}
          email={selectedPayApp.studentEmail}
          reference={selectedPayApp.paymentReference || `DTA_PAY_${selectedPayApp.id}_${Date.now()}`}
          courseTitle={selectedPayApp.courseTitle}
          onSuccess={handlePaymentSuccess}
          onClose={() => setIsPayModalOpen(false)}
        />
      )}

      {/* Official Receipt Modal */}
      {selectedReceiptApp && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          application={selectedReceiptApp}
        />
      )}
    </div>
  );
};
