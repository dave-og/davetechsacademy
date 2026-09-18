import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { instructors } from "../../data/instructors";
import { InstructorCard } from "../../components/common/InstructorCard";
import { Button } from "../../components/ui/Button";
import "./Instructors.css";

export const Instructors: React.FC = () => {
  useSEO({
    title: "Expert Tech Mentors & Faculty",
    description:
      "Learn directly from industry-veteran software engineers, product designers, and AI specialists at Dave Techs Academy.",
  });

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const specialties = [
    { id: "all", label: "All Faculty" },
    { id: "software", label: "Software & Web" },
    { id: "design", label: "Design & UX" },
    { id: "data", label: "AI & Data Science" },
    { id: "cyber", label: "Security & Cloud" },
    { id: "mobile", label: "Mobile Engineering" },
    { id: "media", label: "Media & Motion" },
  ];

  const filteredInstructors = useMemo(() => {
    return instructors.filter((inst) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inst.name.toLowerCase().includes(q) ||
        inst.role.toLowerCase().includes(q) ||
        inst.expertise.some((e) => e.toLowerCase().includes(q)) ||
        inst.experience.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedSpecialty === "all") return true;
      if (selectedSpecialty === "software") {
        return (
          inst.courseIds.includes("frontend-development") ||
          inst.courseIds.includes("backend-development") ||
          inst.courseIds.includes("full-stack-development") ||
          inst.courseIds.includes("python-programming")
        );
      }
      if (selectedSpecialty === "design") {
        return (
          inst.courseIds.includes("ui-ux-design") ||
          inst.courseIds.includes("product-design") ||
          inst.courseIds.includes("graphics-design")
        );
      }
      if (selectedSpecialty === "data") {
        return (
          inst.courseIds.includes("data-analysis") ||
          inst.courseIds.includes("data-science") ||
          inst.courseIds.includes("ai-machine-learning") ||
          inst.courseIds.includes("robotics")
        );
      }
      if (selectedSpecialty === "cyber") {
        return (
          inst.courseIds.includes("cybersecurity") ||
          inst.courseIds.includes("ethical-hacking") ||
          inst.courseIds.includes("devops-cloud-computing") ||
          inst.courseIds.includes("computer-networking")
        );
      }
      if (selectedSpecialty === "mobile") {
        return inst.courseIds.includes("app-development");
      }
      if (selectedSpecialty === "media") {
        return (
          inst.courseIds.includes("video-editing") ||
          inst.courseIds.includes("digital-marketing")
        );
      }
      return true;
    });
  }, [selectedSpecialty, searchQuery]);

  return (
    <div className="instructors-page">
      {/* Hero Header */}
      <section className="instructors-hero">
        <div className="container">
          <div className="instructors-hero__badge">EXPERT FACULTY & MENTORS</div>
          <h1 className="instructors-hero__title">
            Learn Directly From <span className="logo__accent">Industry Leaders</span>
          </h1>
          <p className="instructors-hero__subtitle">
            Our instructors are seasoned software architects, design directors, data scientists,
            and security specialists actively working in global technology companies.
          </p>

          {/* Stats Banner */}
          <div className="instructors-stats-grid">
            <div className="inst-stat-item">
              <span className="inst-stat-val">100%</span>
              <span className="inst-stat-lbl">Industry Practitioners</span>
            </div>
            <div className="inst-stat-item">
              <span className="inst-stat-val">15+</span>
              <span className="inst-stat-lbl">Avg. Years Collective Experience</span>
            </div>
            <div className="inst-stat-item">
              <span className="inst-stat-val">6,000+</span>
              <span className="inst-stat-lbl">Students Mentored</span>
            </div>
            <div className="inst-stat-item">
              <span className="inst-stat-val">4.92 ★</span>
              <span className="inst-stat-lbl">Instructor Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Roster Section */}
      <section className="instructors-roster-section">
        <div className="container">
          {/* Controls Bar */}
          <div className="instructors-controls">
            <div className="instructors-specialty-tabs">
              {specialties.map((spec) => (
                <button
                  key={spec.id}
                  className={`specialty-tab ${selectedSpecialty === spec.id ? "specialty-tab--active" : ""}`}
                  onClick={() => setSelectedSpecialty(spec.id)}
                >
                  {spec.label}
                </button>
              ))}
            </div>

            <div className="instructors-search-box">
              <input
                type="text"
                className="instructors-search-input"
                placeholder="Search mentor by name, skill (e.g. React, Figma)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Instructor Cards Grid */}
          {filteredInstructors.length > 0 ? (
            <div className="instructors-grid">
              {filteredInstructors.map((inst) => (
                <InstructorCard key={inst.id} instructor={inst} />
              ))}
            </div>
          ) : (
            <div className="instructors-empty">
              <div className="instructors-empty-icon">👨‍🏫</div>
              <h3 className="instructors-empty-title">No Faculty Mentors Found</h3>
              <p className="instructors-empty-desc">
                No mentors match your current search query "{searchQuery}". Try selecting "All Faculty" or search for another skill.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSelectedSpecialty("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Mentorship Philosophy Section */}
      <section className="instructors-philosophy">
        <div className="container">
          <div className="philosophy-card">
            <div className="philosophy-content">
              <div className="philosophy-tag">OUR MENTORSHIP PROMISE</div>
              <h2 className="philosophy-title">
                More Than Lecturers. Your Lifelong Tech Mentors.
              </h2>
              <p className="philosophy-text">
                At Dave Techs Academy, we believe in hands-on mentorship over passive tutorials.
                Every cohort includes weekly 1-on-1 code reviews, physical lab assistance, portfolio defense sessions,
                and direct career guidance to help you land your first role or scale your tech career.
              </p>
              <div className="philosophy-checks">
                <div className="philosophy-check-item">
                  <span className="check-icon">✓</span>
                  <span>1-on-1 Code and Portfolio Reviews</span>
                </div>
                <div className="philosophy-check-item">
                  <span className="check-icon">✓</span>
                  <span>Real-world client project simulations</span>
                </div>
                <div className="philosophy-check-item">
                  <span className="check-icon">✓</span>
                  <span>Post-graduation career recommendations</span>
                </div>
              </div>
            </div>

            <div className="philosophy-cta-box">
              <h3>Ready to learn with us?</h3>
              <p>Choose a program today and start learning with these world-class instructors.</p>
              <Link to="/courses">
                <Button variant="primary" size="lg">
                  Explore All 20 Courses →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
