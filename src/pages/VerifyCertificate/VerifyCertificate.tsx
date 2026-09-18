import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { lmsService } from "../../services/lmsService";
import { useSEO } from "../../hooks/useSEO";
import { CertificateModal } from "../../components/lms/CertificateModal";
import type { Certificate } from "../../types/lms";
import "./VerifyCertificate.css";

export const VerifyCertificate: React.FC = () => {
  const { certId } = useParams<{ certId: string }>();
  const [searchParams] = useSearchParams();
  const queryId = certId || searchParams.get("id") || "";

  const [inputCertNumber, setInputCertNumber] = useState(queryId);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useSEO({
    title: "Verify Student Certificate | Dave Techs Academy",
    description: "Official credential verification portal for Dave Techs Academy graduates. Validate certificate authenticity and honors standing.",
  });

  useEffect(() => {
    if (queryId) {
      handleSearch(queryId);
    }
  }, [queryId]);

  const handleSearch = (numberToSearch?: string) => {
    const target = (numberToSearch || inputCertNumber).trim();
    if (!target) return;

    setSearched(true);
    const found = lmsService.verifyCertificate(target);
    setCertificate(found || null);
  };

  return (
    <div className="verify-page section container">
      <div className="verify-hero">
        <span className="badge badge--active">Official Credential Verification</span>
        <h1 className="section__title" style={{ marginTop: "var(--sp-2)" }}>
          Verify Certificate of Completion
        </h1>
        <p className="section__subtitle">
          Confirm the authenticity, academic honors, and verified practical competencies of Dave Techs Academy graduates.
        </p>

        {/* Search Input */}
        <form
          className="verify-search-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="verify-input-group">
            <input
              type="text"
              className="form-input verify-input"
              placeholder="e.g. DTA-2026-78492"
              value={inputCertNumber}
              onChange={(e) => setInputCertNumber(e.target.value)}
              required
            />
            <button type="submit" className="btn btn--primary btn--glow">
              Verify Credential
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result */}
      {searched && (
        <div className="verify-result-container">
          {certificate ? (
            <div className="verify-card card verify-card--valid">
              <div className="verify-status-badge verify-status-badge--valid">
                <span className="verify-status-icon">✓</span>
                <span>AUTHENTIC CREDENTIAL VERIFIED</span>
              </div>

              <div className="verify-details-grid">
                <div className="verify-detail-item">
                  <span className="verify-label">Graduate Name</span>
                  <strong className="verify-value">{certificate.studentName}</strong>
                </div>

                <div className="verify-detail-item">
                  <span className="verify-label">Program Completed</span>
                  <strong className="verify-value">{certificate.courseTitle}</strong>
                </div>

                <div className="verify-detail-item">
                  <span className="verify-label">Academic Honors</span>
                  <strong className="verify-value text-gold">{certificate.grade} Standing</strong>
                </div>

                <div className="verify-detail-item">
                  <span className="verify-label">Date of Conferral</span>
                  <strong className="verify-value">
                    {new Date(certificate.issueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>
                </div>

                <div className="verify-detail-item">
                  <span className="verify-label">Credential Number</span>
                  <strong className="verify-value verify-mono">{certificate.certificateNumber}</strong>
                </div>

                <div className="verify-detail-item">
                  <span className="verify-label">Authorized Signatory</span>
                  <strong className="verify-value">{certificate.instructorName}</strong>
                </div>
              </div>

              {certificate.skills && (
                <div className="verify-skills-block">
                  <span className="verify-label">Verified Competencies:</span>
                  <div className="verify-skills-chips">
                    {certificate.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="verify-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="verify-actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  👁️ View Full Official Certificate
                </button>
                <Link to="/courses" className="btn btn--secondary">
                  Explore Academy Programs
                </Link>
              </div>
            </div>
          ) : (
            <div className="verify-card card verify-card--invalid">
              <div className="verify-status-badge verify-status-badge--invalid">
                <span className="verify-status-icon">✕</span>
                <span>CREDENTIAL NOT FOUND</span>
              </div>
              <p style={{ marginTop: "var(--sp-4)", color: "var(--text-secondary)" }}>
                No verified certificate was found matching the credential ID:{" "}
                <strong>"{inputCertNumber}"</strong>.
              </p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", marginTop: "var(--sp-2)" }}>
                Please check the spelling of the certificate serial number or contact Dave Techs Registrar at{" "}
                <a href="mailto:support@davetechs.com" style={{ color: "var(--color-gold-bright)" }}>
                  support@davetechs.com
                </a>
                .
              </p>
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {certificate && (
        <CertificateModal
          certificate={certificate}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
