import React from "react";
import type { Certificate } from "../../types/lms";
import "./LMSComponents.css";

interface CertificateModalProps {
  certificate: Certificate;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    alert("Verification link copied to clipboard!");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--lg lms-cert-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls */}
        <div className="lms-cert-modal-header no-print">
          <div className="lms-cert-actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={handlePrint}>
              🖨️ Print / Save as PDF
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={handleCopyLink}>
              🔗 Copy Public Verification URL
            </button>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close Certificate"
          >
            ×
          </button>
        </div>

        {/* Certificate Frame (Luxury Black & Royal Gold) */}
        <div className="lms-cert-frame">
          <div className="lms-cert-inner">
            {/* Corner Embellishments */}
            <div className="lms-cert-corner lms-cert-corner--tl" />
            <div className="lms-cert-corner lms-cert-corner--tr" />
            <div className="lms-cert-corner lms-cert-corner--bl" />
            <div className="lms-cert-corner lms-cert-corner--br" />

            {/* Header / Brand */}
            <div className="lms-cert-brand">
              <div className="lms-cert-logo-mark">DTA</div>
              <div className="lms-cert-brand-title">DAVE TECHS ACADEMY</div>
              <div className="lms-cert-brand-sub">INSTITUTE OF PRACTICAL TECHNOLOGY & SOFTWARE ENGINEERING</div>
            </div>

            <div className="lms-cert-award-title">CERTIFICATE OF COMPLETION</div>
            <div className="lms-cert-award-sub">THIS IS PROUDLY PRESENTED TO</div>

            {/* Student Name */}
            <div className="lms-cert-recipient">{certificate.studentName}</div>

            {/* Description */}
            <div className="lms-cert-body">
              for successfully mastering all curriculum modules, practical capstone projects, and examinations in
            </div>

            <div className="lms-cert-course-title">{certificate.courseTitle}</div>

            <div className="lms-cert-honors">
              Awarded with <strong>{certificate.grade} Standing</strong> on{" "}
              {new Date(certificate.issueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            {/* Skills Badges */}
            {certificate.skills && certificate.skills.length > 0 && (
              <div className="lms-cert-skills">
                {certificate.skills.map((skill) => (
                  <span key={skill} className="lms-cert-skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Signatures & Seal */}
            <div className="lms-cert-footer">
              <div className="lms-cert-sig-block">
                <div className="lms-cert-sig-line">{certificate.instructorName}</div>
                <div className="lms-cert-sig-title">{certificate.instructorTitle}</div>
              </div>

              {/* Gold Official Seal */}
              <div className="lms-cert-seal">
                <div className="lms-cert-seal-inner">
                  <span>DAVE TECHS</span>
                  <strong>OFFICIAL SEAL</strong>
                  <span>VERIFIED</span>
                </div>
              </div>

              <div className="lms-cert-sig-block">
                <div className="lms-cert-sig-line">Director of Academics</div>
                <div className="lms-cert-sig-title">Dave Techs Certification Board</div>
              </div>
            </div>

            {/* Serial Number & QR */}
            <div className="lms-cert-serial">
              <span>Credential ID: <strong>{certificate.certificateNumber}</strong></span>
              <span>Verify at: {certificate.verificationUrl}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
