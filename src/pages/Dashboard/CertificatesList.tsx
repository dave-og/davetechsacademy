import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { lmsService } from "../../services/lmsService";
import { CertificateModal } from "../../components/lms/CertificateModal";
import type { Certificate } from "../../types/lms";

export const CertificatesList: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (user?.id) {
      const certs = lmsService.getStudentCertificates(user.id);
      setCertificates(certs);
    }
  }, [user]);

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Verified Certificates</h1>
          <p className="dashboard-subtitle">
            Official academic credentials awarded upon 100% course completion and assessment mastery.
          </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="card" style={{ padding: "var(--sp-12)", textAlign: "center" }}>
          <div style={{ fontSize: "var(--fs-4xl)", marginBottom: "var(--sp-4)" }}>🎓</div>
          <h3>No certificates earned yet</h3>
          <p className="text-muted" style={{ maxWidth: "500px", margin: "var(--sp-2) auto var(--sp-6) auto" }}>
            Complete all video lessons, capstone projects, and quizzes in your enrolled courses to automatically unlock your verified certificate.
          </p>
          <Link to="/dashboard/courses" className="btn btn--primary btn--glow">
            Continue Learning →
          </Link>
        </div>
      ) : (
        <div className="grid grid--2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="card"
              style={{
                padding: "var(--sp-6)",
                border: "1px solid var(--border-gold)",
                boxShadow: "0 0 15px rgba(255, 215, 0, 0.1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-4)" }}>
                <div>
                  <span className="badge badge--active">Official DTA Credential</span>
                  <h3 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, marginTop: "var(--sp-2)" }}>
                    {cert.courseTitle}
                  </h3>
                </div>
                <span className="text-gold" style={{ fontWeight: 800, fontSize: "var(--fs-sm)" }}>
                  {cert.grade}
                </span>
              </div>

              <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)", marginBottom: "var(--sp-4)" }}>
                <div>Issued on: <strong>{new Date(cert.issueDate).toLocaleDateString()}</strong></div>
                <div>Credential ID: <strong style={{ fontFamily: "monospace", color: "var(--color-gold-bright)" }}>{cert.certificateNumber}</strong></div>
              </div>

              <div style={{ display: "flex", gap: "var(--sp-3)" }}>
                <button
                  type="button"
                  className="btn btn--primary btn--sm btn--full"
                  onClick={() => setSelectedCert(cert)}
                >
                  👁️ View & Print Certificate
                </button>
                <Link
                  to={`/verify/${cert.certificateNumber}`}
                  className="btn btn--secondary btn--sm"
                  target="_blank"
                >
                  🔗 Public Verification
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
