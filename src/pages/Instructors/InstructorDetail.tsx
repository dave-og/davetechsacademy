import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { getInstructorById } from "../../data/instructors";
import { getCourseById } from "../../data/courses";
import { CourseCard } from "../../components/common/CourseCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import "./InstructorDetail.css";

export const InstructorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const instructor = id ? getInstructorById(id) : undefined;

  useSEO({
    title: instructor ? `${instructor.name} — ${instructor.role}` : "Instructor Profile",
    description: instructor?.bio,
    ogImage: instructor?.image,
    ogType: "profile",
    schema: instructor
      ? {
          "@context": "https://schema.org",
          "@type": "Person",
          name: instructor.name,
          jobTitle: instructor.role,
          description: instructor.bio,
          image: instructor.image,
          worksFor: {
            "@type": "EducationalOrganization",
            name: "Dave Techs Academy",
          },
        }
      : undefined,
  });

  if (!instructor) {
    return (
      <div className="section container inst-not-found">
        <div className="inst-not-found__card">
          <div className="inst-not-found__icon">👨‍🏫</div>
          <h2>Instructor Profile Not Found</h2>
          <p>The instructor you are searching for does not exist or has been updated.</p>
          <Link to="/instructors">
            <Button variant="primary" size="md">
              ← View All Faculty Mentors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const coursesTaught = instructor.courseIds
    .map((cid) => getCourseById(cid))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="instructor-detail-page">
      {/* Breadcrumb Header */}
      <section className="inst-detail-header">
        <div className="container">
          <nav className="inst-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/instructors">Instructors</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{instructor.name}</span>
          </nav>

          {/* Instructor Hero Banner Card */}
          <div className="inst-profile-banner">
            <div className="inst-profile-media">
              <img
                src={instructor.image}
                alt={instructor.name}
                className="inst-profile-avatar"
              />
              <div className="inst-verified-badge">✓ Verified Faculty</div>
            </div>

            <div className="inst-profile-main">
              <div className="inst-role-tag">{instructor.role}</div>
              <h1 className="inst-profile-name">{instructor.name}</h1>

              <div className="inst-profile-meta-row">
                <div className="inst-meta-pill">
                  <span className="pill-icon">💼</span>
                  <span>{instructor.experience}</span>
                </div>
                {instructor.rating && (
                  <div className="inst-meta-pill">
                    <span className="pill-icon" style={{ color: "var(--gold-primary)" }}>★</span>
                    <span>{instructor.rating.toFixed(2)} / 5.0 Rating</span>
                  </div>
                )}
                {instructor.studentsTrained && (
                  <div className="inst-meta-pill">
                    <span className="pill-icon">🎓</span>
                    <span>{instructor.studentsTrained}+ Alumni Mentored</span>
                  </div>
                )}
              </div>

              {/* Social Channels */}
              {instructor.socials && (
                <div className="inst-social-channels">
                  {instructor.socials.linkedin && (
                    <a
                      href={instructor.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inst-social-btn"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  {instructor.socials.github && (
                    <a
                      href={instructor.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inst-social-btn"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {instructor.socials.twitter && (
                    <a
                      href={instructor.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inst-social-btn"
                    >
                      Twitter / X ↗
                    </a>
                  )}
                  {instructor.socials.website && (
                    <a
                      href={instructor.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inst-social-btn"
                    >
                      Portfolio ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="inst-detail-content-section">
        <div className="container inst-content-grid">
          {/* Left Column: Biography & Courses */}
          <div className="inst-main-col">
            {/* Biography */}
            <div className="inst-section-card">
              <h2 className="inst-section-title">About the Instructor</h2>
              <p className="inst-bio-text">
                {instructor.bio ||
                  `${instructor.name} is a dedicated technology educator at Dave Techs Academy with ${instructor.experience}. They bring deep practical expertise, modern engineering paradigms, and rigorous mentorship to every student cohort.`}
              </p>
            </div>

            {/* Core Tech Stack */}
            <div className="inst-section-card">
              <h2 className="inst-section-title">Areas of Expertise & Technologies</h2>
              <div className="inst-expertise-tags">
                {instructor.expertise.map((item, idx) => (
                  <div key={idx} className="expertise-badge-lg">
                    <span className="expertise-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications & Certifications */}
            {instructor.qualifications && instructor.qualifications.length > 0 && (
              <div className="inst-section-card">
                <h2 className="inst-section-title">Verified Certifications & Credentials</h2>
                <div className="inst-quals-list">
                  {instructor.qualifications.map((qual, idx) => (
                    <div key={idx} className="inst-qual-item">
                      <span className="inst-qual-badge">🏅</span>
                      <span className="inst-qual-text">{qual}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Taught by this Instructor */}
            <div className="inst-section-card">
              <div className="inst-courses-header">
                <div>
                  <h2 className="inst-section-title" style={{ margin: 0 }}>
                    Courses Taught by {instructor.name.split(" ")[0]}
                  </h2>
                  <p className="inst-courses-sub">
                    Explore available courses instructed and mentored by {instructor.name}.
                  </p>
                </div>
                <Badge variant="gold">{coursesTaught.length} Available Programs</Badge>
              </div>

              <div className="inst-courses-grid">
                {coursesTaught.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Mentorship Info & CTA Card */}
          <div className="inst-side-col">
            <div className="inst-sticky-cta-card">
              <div className="cta-card-tag">JOIN NEXT COHORT</div>
              <h3 className="cta-card-title">Study Under {instructor.name}</h3>
              <p className="cta-card-desc">
                Enrolling in any of {instructor.name.split(" ")[0]}'s courses gives you direct access to weekly live classes,
                office hours, and 1-on-1 code reviews.
              </p>

              <div className="cta-card-perks">
                <div className="cta-perk">
                  <span className="cta-perk-icon">🎯</span>
                  <span>Weekly 1-on-1 Mentorship Sessions</span>
                </div>
                <div className="cta-perk">
                  <span className="cta-perk-icon">💻</span>
                  <span>Real-World Capstone Defense</span>
                </div>
                <div className="cta-perk">
                  <span className="cta-perk-icon">📜</span>
                  <span>Dave Techs Verified Certificate</span>
                </div>
              </div>

              <Link to={coursesTaught[0] ? `/apply/${coursesTaught[0].id}` : "/courses"}>
                <Button variant="primary" size="lg" style={{ width: "100%" }}>
                  Apply For Course Now →
                </Button>
              </Link>

              <div className="cta-card-footer">
                <span>Need guidance choosing a course?</span>
                <Link to="/contact" className="cta-contact-link">
                  Speak to Admissions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
