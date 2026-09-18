import React from "react";
import { Link } from "react-router-dom";
import { getCourseById } from "../../data/courses";
import { Button } from "../ui/Button";
import type { Instructor } from "../../types";
import "./InstructorCard.css";

interface InstructorCardProps {
  instructor: Instructor;
}

export const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  const coursesTaught = instructor.courseIds
    .map((cid) => getCourseById(cid))
    .filter(Boolean);

  return (
    <div className="instructor-card">
      {/* Media & Avatar */}
      <div className="instructor-card__media">
        <img
          src={instructor.image}
          alt={instructor.name}
          className="instructor-card__img"
          loading="lazy"
        />
        <div className="instructor-card__overlay-gradient" />

        {/* Floating Rating Badge */}
        {instructor.rating && (
          <div className="instructor-card__rating">
            <span className="rating-star">★</span>
            <span className="rating-num">{instructor.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Social Links Overlay on Hover */}
        {instructor.socials && (
          <div className="instructor-card__socials">
            {instructor.socials.linkedin && (
              <a
                href={instructor.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-circle-btn"
                aria-label={`${instructor.name} LinkedIn Profile`}
                onClick={(e) => e.stopPropagation()}
              >
                in
              </a>
            )}
            {instructor.socials.github && (
              <a
                href={instructor.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-circle-btn"
                aria-label={`${instructor.name} GitHub`}
                onClick={(e) => e.stopPropagation()}
              >
                git
              </a>
            )}
            {instructor.socials.twitter && (
              <a
                href={instructor.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="social-circle-btn"
                aria-label={`${instructor.name} Twitter / X`}
                onClick={(e) => e.stopPropagation()}
              >
                𝕏
              </a>
            )}
            {instructor.socials.website && (
              <a
                href={instructor.socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="social-circle-btn"
                aria-label={`${instructor.name} Portfolio`}
                onClick={(e) => e.stopPropagation()}
              >
                🌐
              </a>
            )}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="instructor-card__body">
        <div className="instructor-card__role-tag">{instructor.role}</div>
        <h3 className="instructor-card__name">
          <Link to={`/instructors/${instructor.id}`} className="instructor-name-link">
            {instructor.name}
          </Link>
        </h3>

        <div className="instructor-card__exp">
          <span className="exp-icon">💼</span>
          <span>{instructor.experience}</span>
        </div>

        {instructor.studentsTrained && (
          <div className="instructor-card__students">
            <span className="students-icon">🎓</span>
            <span>{instructor.studentsTrained}+ Students Mentored</span>
          </div>
        )}

        {/* Expertise Tags */}
        <div className="instructor-card__expertise-section">
          <span className="expertise-lbl">Core Competencies:</span>
          <div className="instructor-card__tags">
            {instructor.expertise.slice(0, 4).map((tech, idx) => (
              <span key={idx} className="instructor-tag">
                {tech}
              </span>
            ))}
            {instructor.expertise.length > 4 && (
              <span className="instructor-tag instructor-tag--more">
                +{instructor.expertise.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Courses Taught Preview */}
        {coursesTaught.length > 0 && (
          <div className="instructor-card__courses-taught">
            <span className="courses-lbl">Courses Taught:</span>
            <div className="courses-list-mini">
              {coursesTaught.map((c) => (
                <Link
                  key={c!.id}
                  to={`/courses/${c!.slug}`}
                  className="course-pill-link"
                >
                  {c!.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="instructor-card__footer">
          <Link to={`/instructors/${instructor.id}`} style={{ width: "100%" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }}>
              View Profile & Courses →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
