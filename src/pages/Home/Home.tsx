import React from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { CourseCard } from "../../components/common/CourseCard";
import { TestimonialsCarousel } from "../../components/common/TestimonialsCarousel";
import { Button } from "../../components/ui/Button";
import { featuredCourses } from "../../data/courses";
import { testimonials } from "../../data/testimonials";
import "./Home.css";

export const Home: React.FC = () => {
  useSEO({
    title: "Practical Technology Training Online & Physical",
    description:
      "Learn practical technology skills from experienced instructors through flexible online training or hands-on physical classes in Nigeria. Courses in Full-Stack, AI, Cybersecurity, Data Analysis, and more.",
    schema: {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Dave Techs Academy",
      url: "https://davetechs.academy",
      logo: "https://davetechs.academy/img/file_0000000044488243bc68f0e3a2f0c1cd.png",
      sameAs: [
        "https://twitter.com/davetechs",
        "https://linkedin.com/company/davetechs",
        "https://facebook.com/davetechs",
      ],
      description:
        "Leading practical technology education academy offering hands-on physical classes and interactive online training programs.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Abeokuta",
        addressRegion: "Ogun State",
        addressCountry: "NG",
      },
    },
  });

  return (
    <>
      {/* ─── Hero Section ──────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero__bg-grid" aria-hidden="true" />
        <div className="hero__glow hero__glow--1" aria-hidden="true" />
        <div className="hero__glow hero__glow--2" aria-hidden="true" />

        <div className="hero__inner container">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              <span>Admissions Open for Next Cohort</span>
            </div>

            <h1 className="hero__title">
              Build the Skills.{" "}
              <span className="text-gold">Build the Future.</span>
            </h1>

            <p className="hero__subtitle">
              Learn practical technology skills from experienced instructors
              through flexible online training or hands-on physical classes at
              our academy branches.
            </p>

            <div className="hero__ctas">
              <Link to="/courses">
                <Button variant="primary" size="lg" className="hero__cta-primary">
                  Explore Courses →
                </Button>
              </Link>
              <Link to="/apply">
                <Button variant="secondary" size="lg" className="hero__cta-secondary">
                  Apply Now
                </Button>
              </Link>
            </div>

            <div className="hero__indicators">
              <span className="hero__indicator">
                <span className="hero__indicator-icon">🌐</span> Online Learning
              </span>
              <span className="hero__indicator">
                <span className="hero__indicator-icon">🏫</span> Physical Classes
              </span>
              <span className="hero__indicator">
                <span className="hero__indicator-icon">📜</span> Recognized Certificate
              </span>
              <span className="hero__indicator">
                <span className="hero__indicator-icon">💼</span> Career Mentorship
              </span>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__image-wrapper">
              <img
                src="/img/file_0000000044488243bc68f0e3a2f0c1cd.png"
                alt="Students learning technology at Dave Techs Academy"
                className="hero__image"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="hero__floating-card hero__floating-card--1">
                <span className="hero__floating-icon">⭐</span>
                <div>
                  <div className="hero__floating-val">4.9 / 5.0</div>
                  <div className="hero__floating-lbl">Student Rating</div>
                </div>
              </div>
              <div className="hero__floating-card hero__floating-card--2">
                <span className="hero__floating-icon">🚀</span>
                <div>
                  <div className="hero__floating-val">95%</div>
                  <div className="hero__floating-lbl">Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="hero__stats container">
          <div className="stat-card">
            <div className="stat-card__number">2,500+</div>
            <div className="stat-card__label">Students Trained</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__number">50+</div>
            <div className="stat-card__label">Expert Instructors</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__number">20+</div>
            <div className="stat-card__label">Industry Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__number">100%</div>
            <div className="stat-card__label">Practical Project Work</div>
          </div>
        </div>
      </section>

      {/* ─── Popular Courses Section ───────────────────── */}
      <section className="section courses-section" id="courses">
        <div className="container">
          <div className="section__header">
            <div className="section__badge">Featured Curriculum</div>
            <h2 className="section__title">
              Explore Our <span className="text-gold">Popular Courses</span>
            </h2>
            <p className="section__subtitle">
              Industry-aligned curriculum designed to take you from complete
              beginner to job-ready professional
            </p>
          </div>

          <div className="grid grid--4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="section__cta-wrapper">
            <Link to="/courses">
              <Button variant="secondary" size="lg">
                View All 20+ Courses →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Dave Techs Section ──────────────── */}
      <section className="section why-section" id="why-choose">
        <div className="container">
          <div className="section__header">
            <div className="section__badge">The Dave Techs Advantage</div>
            <h2 className="section__title">
              Why Choose <span className="text-gold">Dave Techs?</span>
            </h2>
            <p className="section__subtitle">
              We don't just teach theory — we build in-demand skills and empower
              tech careers
            </p>
          </div>

          <div className="grid grid--3">
            {WHY_FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Learning Journey Section ──────────────────── */}
      <section className="section journey-section" id="journey">
        <div className="container">
          <div className="section__header">
            <div className="section__badge">Structured Roadmap</div>
            <h2 className="section__title">
              Your <span className="text-gold">Learning Journey</span>
            </h2>
            <p className="section__subtitle">
              From course discovery to career breakthrough in six clear,
              practical steps
            </p>
          </div>

          <div className="journey__grid">
            {JOURNEY_STEPS.map((step, index) => (
              <div className="journey-card" key={step.title}>
                <div className="journey-card__header">
                  <div className="journey-card__step">{index + 1}</div>
                  <span className="journey-card__phase">Step 0{index + 1}</span>
                </div>
                <h3 className="journey-card__title">{step.title}</h3>
                <p className="journey-card__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials Preview Section ──────────────── */}
      <section className="section testimonials-section" id="testimonials">
        <div className="container">
          <div className="section__header">
            <div className="section__badge">Student Success</div>
            <h2 className="section__title">
              What Our <span className="text-gold">Graduates Say</span>
            </h2>
            <p className="section__subtitle">
              Hear directly from students who transformed their skills and
              careers with Dave Techs Academy
            </p>
          </div>

          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* ─── Final Homepage CTA Section ────────────────── */}
      <section className="section cta-section" id="cta">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__glow" aria-hidden="true" />
            <h2 className="cta-banner__title">
              Ready to Start Your{" "}
              <span className="text-gold">Tech Journey?</span>
            </h2>
            <p className="cta-banner__subtitle">
              Join thousands of aspiring professionals building real skills with
              Dave Techs Academy. Apply today for our upcoming cohort.
            </p>
            <div className="cta-banner__actions">
              <Link to="/courses">
                <Button variant="secondary" size="lg">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/apply">
                <Button variant="primary" size="lg">
                  Apply Now →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

/* ─── Data ─────────────────────────────────────────────── */
const WHY_FEATURES = [
  {
    icon: "🛠️",
    title: "Practical Projects",
    description:
      "Build real-world applications for your portfolio. Every single course includes hands-on capstone assignments matching industry requirements.",
  },
  {
    icon: "👨‍🏫",
    title: "Expert Mentors",
    description:
      "Learn from active software engineers, designers, and data professionals who bring current industry practices to every classroom session.",
  },
  {
    icon: "🔄",
    title: "Flexible Learning",
    description:
      "Choose immersive physical training at our physical academy branches or join live interactive online classes from anywhere in the world.",
  },
  {
    icon: "🚀",
    title: "Career Support",
    description:
      "Get CV reviews, GitHub/portfolio audits, mock technical interviews, and guidance on landing freelance and full-time technology roles.",
  },
  {
    icon: "🏢",
    title: "Industry Exposure",
    description:
      "Master tools, workflows, and best practices that top technology employers actively demand in today's digital market.",
  },
  {
    icon: "📜",
    title: "Certificate",
    description:
      "Earn a recognized certificate of completion upon graduation to showcase your technical proficiency to employers worldwide.",
  },
];

const JOURNEY_STEPS = [
  {
    title: "Choose a Course",
    description: "Explore our catalogue, compare curriculum, and find the skill track that aligns with your career goals.",
  },
  {
    title: "Apply",
    description: "Fill our simple application form and choose between online training or hands-on physical classes.",
  },
  {
    title: "Pay",
    description: "Complete your secure payment with Paystack to lock in your slot for the upcoming batch.",
  },
  {
    title: "Learn",
    description: "Attend interactive lectures, participate in live coding sessions, and build practical projects.",
  },
  {
    title: "Graduate",
    description: "Complete your capstone portfolio project and receive your recognized academy certification.",
  },
  {
    title: "Grow",
    description: "Leverage our alumni network, portfolio mentorship, and career resources to advance your tech career.",
  },
];
