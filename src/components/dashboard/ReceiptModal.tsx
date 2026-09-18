import React, { useEffect } from "react";
import { formatPrice } from "../../utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import type { Application } from "../../types";
import "./ReceiptModal.css";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  transactionRef?: string;
  amount?: number;
  date?: string;
  courseTitle?: string;
  studentName?: string;
  studentEmail?: string;
  learningMode?: string;
  branchName?: string;
  cohort?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  application,
  transactionRef,
  amount,
  date,
  courseTitle,
  studentName,
  studentEmail,
  learningMode,
  branchName,
  cohort,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayRef = transactionRef || application?.paymentReference || "DTA_TX_OFFICIAL";
  const displayAmount = amount ?? application?.tuitionAmount ?? 0;
  const displayCourse = courseTitle || application?.courseTitle || "Tech Skill Program";
  const displayName = studentName || application?.studentName || "Student";
  const displayEmail = studentEmail || application?.studentEmail || "";
  const displayDate = date || application?.createdAt || new Date().toISOString();
  const displayMode = learningMode || application?.learningMode || "online";
  const displayBranch = branchName || application?.branchName;
  const displayCohort = cohort || application?.cohort || "Upcoming Batch";
  const displayAppId = application?.applicationNumber || `DTA-${new Date().getFullYear()}-ENR`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="receipt-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Official Tuition Receipt"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="receipt-modal-content">
        <div className="receipt-modal-actions-top">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            🖨️ Print Receipt
          </Button>
          <button
            className="receipt-modal-close-btn"
            onClick={onClose}
            aria-label="Close receipt modal"
          >
            ✕
          </button>
        </div>

        {/* Printable Sheet */}
        <div className="receipt-modal-sheet" id="print-area">
          <div className="receipt-sheet-header">
            <div className="receipt-sheet-brand">
              <h2 className="receipt-sheet-brand-name">
                Dave <span className="receipt-brand-accent">Techs</span> Academy
              </h2>
              <p className="receipt-sheet-brand-sub">Official Tuition & Enrollment Receipt</p>
            </div>
            <div className="receipt-sheet-status">
              <Badge variant="success">PAID & VERIFIED</Badge>
              <div className="receipt-sheet-stamp">OFFICIAL VERIFIED</div>
            </div>
          </div>

          <div className="receipt-sheet-divider" />

          <div className="receipt-sheet-details-grid">
            <div className="receipt-meta-item">
              <label>Receipt / Tx Reference</label>
              <span className="receipt-meta-val receipt-meta-val--code">{displayRef}</span>
            </div>
            <div className="receipt-meta-item">
              <label>Application ID</label>
              <span className="receipt-meta-val">{displayAppId}</span>
            </div>
            <div className="receipt-meta-item">
              <label>Student Name</label>
              <span className="receipt-meta-val">{displayName}</span>
            </div>
            <div className="receipt-meta-item">
              <label>Student Email</label>
              <span className="receipt-meta-val">{displayEmail}</span>
            </div>
            <div className="receipt-meta-item">
              <label>Enrolled Program</label>
              <span className="receipt-meta-val receipt-meta-val--highlight">{displayCourse}</span>
            </div>
            <div className="receipt-meta-item">
              <label>Learning Mode</label>
              <span className="receipt-meta-val">
                {displayMode === "online" ? "🌐 Online Live Training" : "🏫 Hands-on Physical Class"}
              </span>
            </div>
            {displayBranch && (
              <div className="receipt-meta-item">
                <label>Academy Branch</label>
                <span className="receipt-meta-val">{displayBranch}</span>
              </div>
            )}
            <div className="receipt-meta-item">
              <label>Cohort Batch</label>
              <span className="receipt-meta-val">{displayCohort}</span>
            </div>
            <div className="receipt-meta-item">
              <label>Payment Gateway</label>
              <span className="receipt-meta-val">Paystack Financial Services</span>
            </div>
            <div className="receipt-meta-item">
              <label>Payment Date</label>
              <span className="receipt-meta-val">
                {new Date(displayDate).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>

          <div className="receipt-sheet-total-block">
            <span className="receipt-sheet-total-label">Total Tuition Paid</span>
            <span className="receipt-sheet-total-value">{formatPrice(displayAmount)}</span>
          </div>

          <div className="receipt-sheet-footer">
            <p>
              This is an authentic, computer-generated receipt issued by Dave Techs Academy.
              For inquiries or student onboarding support, contact{" "}
              <strong>support@davetechs.ng</strong> or visit any of our physical academy hubs.
            </p>
          </div>
        </div>

        <div className="receipt-modal-footer-btns">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" onClick={handlePrint}>
            🖨️ Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
