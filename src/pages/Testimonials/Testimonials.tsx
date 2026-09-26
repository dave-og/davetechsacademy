import React from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { Button } from "../../components/ui/Button";
import { testimonials } from "../../data/testimonials";
import { renderStars } from "../../utils";
import "./Testimonials.css";

export const Testimonials: React.FC = () => {
  useSEO({
    title: "Student Reviews & Success Stories — Dave Techs Academy",
    description:
      "Read real reviews and career transformation stories from graduates of Dave Techs Academy across Frontend, Backend, UI/UX, Data Analysis, and Cybersecurity.",
  });

  return (
    <div className="testimonials-page">
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="testimonials-hero">
        <div className="container">
          <span className="testimonials-hero__badge">Alumni Stories</span>
          <h1 className="testimonials-hero__title">
            Student <span className="text-gold">Success Stories</span>
          </h1>
          <p className="testimonials-hero__subtitle">
            Hear how graduates from Dave Techs Academy acquired in-demand skills, built impressive portfolios, and launched high-impact technology careers.
          </p>
        </div>
      </section>

      {/* ─── Grid ──────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card-full" key={t.id}>
                <div>
                  <div className="testimonial-card-full__stars">
                    {renderStars(t.rating)}
                  </div>
                  <p className="testimonial-card-full__quote">
                    "{t.content}"
                  </p>
                </div>

                <div className="testimonial-card-full__author">
                  <img
                    src={t.image}
                    alt={t.studentName}
                    className="testimonial-card-full__avatar"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="testimonial-card-full__name">{t.studentName}</h3>
                    <div className="testimonial-card-full__course">{t.course}</div>
                    {t.location && (
                      <div className="testimonial-card-full__loc">📍 {t.location}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="cta-banner">
            <h2 className="cta-banner__title">
              Ready to Write Your Own <span className="text-gold">Success Story?</span>
            </h2>
            <p className="cta-banner__subtitle">
              Join our next training batch and start building real-world tech capabilities with expert mentors.
            </p>
            <div className="cta-banner__actions">
              <Link to="/courses">
                <Button variant="secondary" size="lg">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/apply">
                <Button variant="primary" size="lg">
                  Apply Today →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
