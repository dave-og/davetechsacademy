import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getCourseById } from "../../data/courses";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import type { Branch } from "../../types";
import "./BranchCard.css";

interface BranchCardProps {
  branch: Branch;
}

export const BranchCard: React.FC<BranchCardProps> = ({ branch }) => {
  const [showAllCourses, setShowAllCourses] = useState(false);

  const mappedCourses = branch.courseIds
    .map((cid) => getCourseById(cid))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const displayedCourses = showAllCourses ? mappedCourses : mappedCourses.slice(0, 6);

  return (
    <div className="branch-card">
      {/* Media Image & Status */}
      <div className="branch-card__media">
        <img
          src={branch.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"}
          alt={branch.name}
          className="branch-card__img"
          loading="lazy"
        />
        <div className="branch-card__overlay-gradient" />

        <div className="branch-card__top-badges">
          <Badge variant={branch.active ? "success" : "warning"}>
            {branch.active ? "● Open for Admissions" : "Coming Soon"}
          </Badge>
          <span className="branch-location-pill">📍 {branch.location}</span>
        </div>
      </div>

      {/* Body */}
      <div className="branch-card__body">
        <h3 className="branch-card__title">{branch.name}</h3>

        {/* Address & Contact Info */}
        <div className="branch-meta-list">
          <div className="branch-meta-item">
            <span className="branch-meta-icon">🏢</span>
            <div className="branch-meta-text">
              <strong>Campus Address:</strong>
              <p>{branch.address}</p>
            </div>
          </div>

          <div className="branch-meta-item">
            <span className="branch-meta-icon">📞</span>
            <div className="branch-meta-text">
              <strong>Direct Line & Contact:</strong>
              <p>
                <a href={`tel:${branch.phone}`} className="branch-contact-link">
                  {branch.phone}
                </a>
                {branch.email && (
                  <> · <a href={`mailto:${branch.email}`} className="branch-contact-link">{branch.email}</a></>
                )}
              </p>
            </div>
          </div>

          <div className="branch-meta-item">
            <span className="branch-meta-icon">🕒</span>
            <div className="branch-meta-text">
              <strong>Opening Hours:</strong>
              <p>{branch.openingHours}</p>
            </div>
          </div>
        </div>

        {/* Facilities Preview */}
        {branch.facilities && branch.facilities.length > 0 && (
          <div className="branch-facilities-section">
            <span className="branch-section-lbl">Campus Highlights:</span>
            <div className="branch-facilities-grid">
              {branch.facilities.map((fac, idx) => (
                <div key={idx} className="branch-facility-chip">
                  <span className="facility-check">✓</span>
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Cohorts */}
        <div className="branch-cohorts-section">
          <span className="branch-section-lbl">Available Cohort Schedules:</span>
          <div className="branch-cohorts-list">
            {branch.availableCohorts.map((cohort, idx) => (
              <span key={idx} className="branch-cohort-badge">
                ⏱️ {cohort}
              </span>
            ))}
          </div>
        </div>

        {/* Available Courses */}
        <div className="branch-courses-section">
          <div className="branch-courses-header">
            <span className="branch-section-lbl">
              Physical Programs Offered ({mappedCourses.length}):
            </span>
            {mappedCourses.length > 6 && (
              <button
                type="button"
                className="branch-toggle-courses"
                onClick={() => setShowAllCourses(!showAllCourses)}
              >
                {showAllCourses ? "Show Less ↑" : `View All (${mappedCourses.length}) ↓`}
              </button>
            )}
          </div>

          <div className="branch-courses-tags">
            {displayedCourses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.slug}`}
                className="branch-course-tag"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="branch-card__actions">
          <Link to={`/apply?mode=physical&branch=${branch.id}`} className="branch-apply-cta">
            <Button variant="primary" size="md" style={{ width: "100%" }}>
              Choose This Branch & Apply →
            </Button>
          </Link>

          {branch.mapUrl && (
            <a
              href={branch.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="branch-map-btn"
              title="Open campus in Google Maps"
            >
              🗺️ Open in Google Maps ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
