import React from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { Button } from "../../components/ui/Button";
import { branches } from "../../data/branches";
import "./About.css";

export const About: React.FC = () => {
  useSEO({
    title: "About Dave Techs Academy — Practical Technology Training",
    description:
      "Learn about Dave Techs Academy's mission, vision, physical campus locations, and practical hands-on approach to empowering Africa's next generation of technology talent.",
  });

  const coreValues = [
    {
      icon: "🎯",
      title: "Hands-on Practicality",
      description: "We focus 100% on real-world projects and industry-grade tools over abstract theory.",
    },
    {
      icon: "⚡",
      title: "Fast-Track Mastery",
      description: "Intensive 6-12 week structured programs designed to get you job-ready quickly.",
    },
    {
      icon: "👨‍🏫",
      title: "Active Mentorship",
      description: "Direct guidance and code reviews from senior engineers and active tech leads.",
    },
    {
      icon: "🌐",
      title: "Hybrid Flexibility",
      description: "Choose live interactive online cohorts or in-person classes at modern physical campuses.",
    },
    {
      icon: "📜",
      title: "Verified Credentials",
      description: "Earn recognized, verifiable digital certificates that showcase verified competence.",
    },
    {
      icon: "🚀",
      title: "Career Acceleration",
      description: "Alumni network, portfolio critiques, resume building, and direct employment pipelines.",
    },
  ];

  return (
    <div className="about-page">
      {/* ─── Hero Section ──────────────────────────────── */}
      <section className="about-hero">
        <div className="container">
          <span className="about-hero__badge">Empowering Tech Talent</span>
          <h1 className="about-hero__title">
            About <span className="text-gold">Dave Techs Academy</span>
          </h1>
          <p className="about-hero__subtitle">
            We are building Nigeria's premier technology education platform — connecting ambitious learners with high-demand tech skills through immersive physical campuses and interactive online training.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/courses">
              <Button variant="primary" size="lg">
                Explore Courses →
              </Button>
            </Link>
            <Link to="/branches">
              <Button variant="secondary" size="lg">
                View Academy Branches
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Mission & Vision ──────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mv-card mv-card--highlight">
              <div className="mv-card__tag">Our Mission</div>
              <h2 className="mv-card__title">Empower practical builders.</h2>
              <p className="mv-card__desc">
                To equip learners with verified, industry-relevant technology skills that enable them to build software, launch tech businesses, and compete effectively in the global digital economy.
              </p>
            </div>
            <div className="mv-card">
              <div className="mv-card__tag">Our Vision</div>
              <h2 className="mv-card__title">Africa's tech innovation engine.</h2>
              <p className="mv-card__desc">
                To become the most trusted technology academy across Africa, known for world-class graduates, transformative career outcomes, and state-of-the-art campus learning hubs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Values ───────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="section__header">
            <div className="section__badge">Our Philosophy</div>
            <h2 className="section__title">
              The Principles That <span className="text-gold">Guide Us</span>
            </h2>
            <p className="section__subtitle">
              Every curriculum, mentor interaction, and learning milestone is anchored in our core standard of excellence.
            </p>
          </div>

          <div className="values-grid">
            {coreValues.map((v) => (
              <div className="value-card" key={v.title}>
                <div className="value-card__icon">{v.icon}</div>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Physical Campus Network ────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div className="section__badge">Campus Network</div>
            <h2 className="section__title">
              Our <span className="text-gold">Physical Locations</span>
            </h2>
            <p className="section__subtitle">
              Experience modern computer labs, high-speed Starlink internet, and uninterrupted 24/7 power at our regional campuses.
            </p>
          </div>

          <div className="campuses-strip">
            {branches.map((b) => (
              <div className="campus-mini-card" key={b.id}>
                <h3 className="campus-mini-card__title">{b.name.replace("Dave Techs — ", "")}</h3>
                <p className="campus-mini-card__loc">📍 {b.location}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "var(--sp-8)" }}>
            <Link to="/branches">
              <Button variant="secondary" size="md">
                View Full Campus Details & Facilities →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="cta-banner">
            <h2 className="cta-banner__title">
              Ready to Join <span className="text-gold">Dave Techs Academy?</span>
            </h2>
            <p className="cta-banner__subtitle">
              Applications are currently open for our upcoming cohorts across all software, data, and design disciplines.
            </p>
            <div className="cta-banner__actions">
              <Link to="/courses">
                <Button variant="secondary" size="lg">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/apply">
                <Button variant="primary" size="lg">
                  Apply for Admission →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
