import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import "./Legal.css";

interface LegalSectionNav {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  badge: string;
  lastUpdated?: string;
  sections: LegalSectionNav[];
  activeDoc: "terms" | "privacy" | "refund";
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  badge,
  lastUpdated = "September 2026",
  sections,
  activeDoc,
  children,
}) => {
  return (
    <div className="legal-page">
      {/* Hero Header */}
      <section className="legal-hero">
        <div className="container">
          <span className="legal-hero__badge">{badge}</span>
          <h1 className="legal-hero__title">{title}</h1>
          <div className="legal-hero__meta">
            <span>Dave Techs Academy</span>
            <span>•</span>
            <span>Effective Date: {lastUpdated}</span>
            <span>•</span>
            <span>Version 1.2 (NDPR & Federal Law of Nigeria)</span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container legal-container">
        {/* Sticky Sidebar Navigation */}
        <aside className="legal-sidebar">
          <h4 className="legal-sidebar__title">On this page</h4>
          <nav className="legal-sidebar__nav">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="legal-sidebar__link">
                {s.title}
              </a>
            ))}
          </nav>

          <div className="legal-sidebar__doc-switcher">
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Academy Policies
            </span>
            <Link
              to="/terms"
              className={`legal-sidebar__link ${activeDoc === "terms" ? "legal-sidebar__link--active" : ""}`}
            >
              📄 Terms & Conditions
            </Link>
            <Link
              to="/privacy"
              className={`legal-sidebar__link ${activeDoc === "privacy" ? "legal-sidebar__link--active" : ""}`}
            >
              🔒 Privacy Policy
            </Link>
            <Link
              to="/refund-policy"
              className={`legal-sidebar__link ${activeDoc === "refund" ? "legal-sidebar__link--active" : ""}`}
            >
              💳 Refund & Cancellation
            </Link>
          </div>

          <div style={{ marginTop: "var(--sp-2)" }}>
            <Button
              variant="secondary"
              size="sm"
              style={{ width: "100%" }}
              onClick={() => window.print()}
            >
              🖨️ Print / Save PDF
            </Button>
          </div>
        </aside>

        {/* Document Content */}
        <article className="legal-content">{children}</article>
      </div>
    </div>
  );
};
