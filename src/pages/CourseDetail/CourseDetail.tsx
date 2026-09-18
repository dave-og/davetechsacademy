import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { CourseCard } from "../../components/common/CourseCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { getCourseBySlug, getRelatedCourses } from "../../data/courses";
import { getInstructorById } from "../../data/instructors";
import { formatPrice, renderStars } from "../../utils";
import { trackCourseInterest } from "../../services/leads";
import { trackCourseView, trackApplyClick } from "../../services/analytics";
import "./CourseDetail.css";

export const CourseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const course = slug ? getCourseBySlug(slug) : undefined;

  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Track course view on mount
  useEffect(() => {
    if (course) {
      trackCourseView(course.id, course.slug, course.title, course.category, course.price);
    }
  }, [course]);

  // Syllabus / Course inquiry lead capture state
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail.trim() || !course) return;
    trackCourseInterest(
      inquiryEmail.trim(),
      course.id,
      course.title,
      inquiryName.trim() || undefined,
      inquiryPhone.trim() || undefined
    );
    setInquirySubmitted(true);
  };

  useSEO({
    title: course ? `${course.title} Course` : "Course Detail",
    description: course?.description,
    ogImage: course?.image,
    ogType: "article",
    schema: course
      ? {
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.description,
          provider: {
            "@type": "EducationalOrganization",
            name: "Dave Techs Academy",
            sameAs: "https://davetechs.academy",
          },
          educationalLevel: course.level,
          timeRequired: `P${course.durationWeeks}W`,
          offers: {
            "@type": "Offer",
            price: course.price,
            priceCurrency: "NGN",
            category: "Tuition",
          },
        }
      : undefined,
  });

  if (!course) {
    return (
      <div className="course-detail-not-found section container">
        <div style={{ textAlign: "center", padding: "var(--sp-20) 0" }}>
          <h1 className="section__title">Course Not Found</h1>
          <p className="section__subtitle" style={{ margin: "var(--sp-4) auto var(--sp-8)" }}>
            The course you are looking for does not exist or has been retired.
          </p>
          <Link to="/courses">
            <Button variant="primary" size="lg">
              ← Browse All Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const instructor = course.instructorIds.length > 0 ? getInstructorById(course.instructorIds[0]) : undefined;
  const relatedCourses = getRelatedCourses(course.id, course.category, 3);

  // Fallback defaults for courses with concise entries
  const outcomes = course.learningOutcomes || [
    `Master foundational and advanced concepts in ${course.title}`,
    "Build real-world production projects to showcase in your engineering portfolio",
    "Collaborate with mentors and peers in hands-on practical lab sessions",
    "Gain deep industry exposure and technical interview preparation",
    "Earn a verified certificate of completion from Dave Techs Academy",
  ];

  const modules = course.curriculum || [
    {
      title: "Module 1: Foundations & Core Principles",
      duration: "Weeks 1-2",
      topics: ["Introduction & Ecosystem Overview", "Core Syntax & Best Practices", "Setting up Developer Tools", "Foundational Lab Exercises"],
    },
    {
      title: "Module 2: Practical Implementation & Architecture",
      duration: "Weeks 3-4",
      topics: ["Architectural Patterns", "State & Data Handling", "API Integration & Async Operations", "Hands-on Project Milestone"],
    },
    {
      title: "Module 3: Advanced Techniques & Security",
      duration: "Weeks 5-6",
      topics: ["Performance Optimization", "Security Best Practices", "Testing & Debugging Strategies", "Cloud & Deployment Workflows"],
    },
    {
      title: "Module 4: Capstone Project & Portfolio Defense",
      duration: "Weeks 7-8",
      topics: ["Final Capstone Project Building", "Code Review & Technical Critique", "Certification & Career Mentorship"],
    },
  ];

  const requirements = course.requirements || [
    "A personal laptop or desktop with at least 8GB RAM",
    "Stable internet connection for live online sessions or attendance at physical branch",
    "Enthusiasm to learn and commitment to completing weekly practical projects",
  ];

  const projects = course.projects || [
    {
      title: `Full-featured ${course.title} Capstone Project`,
      description: `A comprehensive portfolio project demonstrating real-world mastery in ${course.title} designed for employment showcase.`,
      tools: ["Industry Standards", "GitHub", "Live Deployment"],
    },
  ];

  const faqs = course.faqs || [
    {
      question: "Are classes available both online and physically?",
      answer: "Yes, you can choose online live instructor-led classes or in-person sessions at our physical academy branches during your application.",
    },
    {
      question: "Will I receive a certificate upon completion?",
      answer: "Yes, every student who completes the curriculum assignments and submits a passing capstone project receives a verified certificate from Dave Techs Academy.",
    },
    {
      question: "Can I pay in installments?",
      answer: "Yes, flexible tuition payment options and Paystack installment processing are supported during application checkout.",
    },
  ];

  const toggleModule = (index: number) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="course-detail-page">
      {/* ─── Breadcrumb ─────────────────────────────────── */}
      <div className="course-detail__breadcrumb-wrapper">
        <div className="container">
          <nav className="course-detail__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="course-detail__breadcrumb-sep">/</span>
            <Link to="/courses">Courses</Link>
            <span className="course-detail__breadcrumb-sep">/</span>
            <span className="course-detail__breadcrumb-current">{course.title}</span>
          </nav>
        </div>
      </div>

      {/* ─── Hero Banner ────────────────────────────────── */}
      <section className="course-detail__hero">
        <div className="container course-detail__hero-grid">
          <div className="course-detail__hero-main">
            <div className="course-detail__badges">
              <Badge variant="gold">{course.category}</Badge>
              <Badge variant="info">{course.level}</Badge>
              {course.featured && <Badge variant="warning">Featured Track</Badge>}
            </div>

            <h1 className="course-detail__title">{course.title}</h1>

            <p className="course-detail__lead">
              {course.fullDescription || course.description}
            </p>

            <div className="course-detail__meta-bar">
              <div className="course-detail__meta-item">
                <span className="course-detail__meta-stars">{renderStars(course.rating)}</span>
                <span className="course-detail__meta-val">{course.rating.toFixed(1)}</span>
                <span className="course-detail__meta-lbl">({course.reviewCount} student reviews)</span>
              </div>

              <div className="course-detail__meta-item">
                <span className="course-detail__meta-icon">⏱</span>
                <span className="course-detail__meta-val">{course.durationWeeks} Weeks</span>
                <span className="course-detail__meta-lbl">Duration</span>
              </div>

              <div className="course-detail__meta-item">
                <span className="course-detail__meta-icon">📜</span>
                <span className="course-detail__meta-val">Certificate</span>
                <span className="course-detail__meta-lbl">Included</span>
              </div>
            </div>

            <div className="course-detail__learning-modes">
              <span className="course-detail__modes-label">Available Learning Modes:</span>
              <div className="course-detail__modes-list">
                {course.learningModes.map((mode) => (
                  <span key={mode} className="course-detail__mode-chip">
                    {mode === "online" ? "🌐 Live Online Training" : "🏫 Hands-on Physical Class"}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Enrollment Card */}
          <aside className="course-detail__hero-sidebar">
            <div className="enrollment-card">
              <div className="enrollment-card__image-box">
                <img
                  src={course.image}
                  alt={course.title}
                  className="enrollment-card__img"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="enrollment-card__body">
                <div className="enrollment-card__price-row">
                  <span className="enrollment-card__price-label">Tuition Fee</span>
                  <span className="enrollment-card__price">{formatPrice(course.price)}</span>
                </div>

                <Link to={`/apply?course=${course.slug}`} className="enrollment-card__cta-link">
                  <Button
                    variant="primary"
                    size="lg"
                    className="enrollment-card__btn"
                    onClick={() => trackApplyClick(course.id, course.title, "course_detail_sidebar", "primary")}
                  >
                    Apply for this Course →
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="md"
                  className="enrollment-card__btn"
                  style={{ marginTop: "var(--sp-2)", width: "100%" }}
                  onClick={() => {
                    setInquirySubmitted(false);
                    setInquiryModalOpen(true);
                  }}
                >
                  📄 Request Syllabus & Info
                </Button>

                <div className="enrollment-card__guarantee">
                  <span>⚡ Instant admission confirmation with Paystack</span>
                </div>

                <div className="enrollment-card__features">
                  <h4 className="enrollment-card__features-title">This course includes:</h4>
                  <ul className="enrollment-card__features-list">
                    <li>✓ {course.durationWeeks} Weeks of intensive live instruction</li>
                    <li>✓ Real-world practical portfolio capstone projects</li>
                    <li>✓ 1-on-1 mentorship & code reviews</li>
                    <li>✓ Verified Certificate of Completion</li>
                    <li>✓ Physical lab & high-speed Wi-Fi access</li>
                    <li>✓ Dedicated career prep & CV review</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ─── Main Details Body ──────────────────────────── */}
      <section className="course-detail__content-section section">
        <div className="container course-detail__content-layout">
          <div className="course-detail__main-column">
            {/* Learning Outcomes */}
            <div className="course-block">
              <h2 className="course-block__title">What You Will Learn</h2>
              <div className="outcomes-grid">
                {outcomes.map((outcome, i) => (
                  <div key={i} className="outcome-item">
                    <span className="outcome-item__icon">✓</span>
                    <span className="outcome-item__text">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div className="course-block">
              <div className="course-block__header-row">
                <h2 className="course-block__title">Course Curriculum</h2>
                <span className="course-block__meta-count">
                  {modules.length} Modules · {course.durationWeeks} Weeks
                </span>
              </div>

              <div className="curriculum-accordion">
                {modules.map((module, idx) => (
                  <div
                    key={module.title}
                    className={`curriculum-card ${openModuleIndex === idx ? "curriculum-card--open" : ""}`}
                  >
                    <button
                      className="curriculum-card__header"
                      onClick={() => toggleModule(idx)}
                      aria-expanded={openModuleIndex === idx}
                    >
                      <div className="curriculum-card__title-row">
                        <span className="curriculum-card__badge">Module {idx + 1}</span>
                        <h3 className="curriculum-card__title">{module.title}</h3>
                      </div>
                      <div className="curriculum-card__toggle-icon">
                        {openModuleIndex === idx ? "−" : "+"}
                      </div>
                    </button>

                    {openModuleIndex === idx && (
                      <div className="curriculum-card__body">
                        <ul className="curriculum-card__topics-list">
                          {module.topics.map((topic, tIdx) => (
                            <li key={tIdx} className="curriculum-card__topic">
                              <span className="curriculum-card__topic-dot" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Projects */}
            <div className="course-block">
              <h2 className="course-block__title">Practical Projects You'll Build</h2>
              <div className="projects-grid">
                {projects.map((proj, pIdx) => (
                  <div key={pIdx} className="project-card">
                    <div className="project-card__icon">💼</div>
                    <h3 className="project-card__title">{proj.title}</h3>
                    <p className="project-card__desc">{proj.description}</p>
                    {proj.tools && (
                      <div className="project-card__tools">
                        {proj.tools.map((tool) => (
                          <span key={tool} className="project-card__tool-chip">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements & Prerequisites */}
            <div className="course-block">
              <h2 className="course-block__title">Prerequisites & Requirements</h2>
              <ul className="requirements-list">
                {requirements.map((req, rIdx) => (
                  <li key={rIdx} className="requirement-item">
                    <span className="requirement-item__bullet">▸</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructor Profile */}
            {instructor && (
              <div className="course-block">
                <h2 className="course-block__title">Meet Your Instructor</h2>
                <div className="instructor-card">
                  <div className="instructor-card__avatar-wrapper">
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      className="instructor-card__avatar"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="instructor-card__info">
                    <h3 className="instructor-card__name">{instructor.name}</h3>
                    <p className="instructor-card__role">{instructor.role}</p>
                    <p className="instructor-card__exp">🏆 {instructor.experience}</p>
                    <div className="instructor-card__tags">
                      {instructor.expertise.map((skill) => (
                        <span key={skill} className="instructor-card__tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Showcase */}
            <div className="course-block certificate-block">
              <div className="certificate-card">
                <div className="certificate-card__icon">🎓</div>
                <div className="certificate-card__content">
                  <h3 className="certificate-card__title">Recognized Academy Certificate</h3>
                  <p className="certificate-card__desc">
                    Upon successfully completing all course milestones and defending your final capstone project, you will earn an official, digitally verifiable Certificate of Completion from Dave Techs Academy to add to your LinkedIn and resume.
                  </p>
                </div>
              </div>
            </div>

            {/* Course FAQs */}
            <div className="course-block">
              <h2 className="course-block__title">Frequently Asked Questions</h2>
              <div className="faq-accordion">
                {faqs.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    className={`faq-item ${openFaqIndex === fIdx ? "faq-item--open" : ""}`}
                  >
                    <button
                      className="faq-item__question"
                      onClick={() => toggleFaq(fIdx)}
                      aria-expanded={openFaqIndex === fIdx}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-item__icon">{openFaqIndex === fIdx ? "−" : "+"}</span>
                    </button>
                    {openFaqIndex === fIdx && (
                      <div className="faq-item__answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Related Courses ────────────────────────────── */}
      <section className="section related-courses-section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">
              Related <span className="text-gold">Tech Courses</span>
            </h2>
            <p className="section__subtitle">
              Explore complementary skill tracks in {course.category} to expand your career opportunities
            </p>
          </div>

          <div className="grid grid--3">
            {relatedCourses.map((relCourse) => (
              <CourseCard key={relCourse.id} course={relCourse} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mobile Sticky Bottom Bar ───────────────────── */}
      <div className="mobile-apply-bar">
        <div className="mobile-apply-bar__inner container">
          <div className="mobile-apply-bar__price-info">
            <span className="mobile-apply-bar__label">Total Tuition</span>
            <span className="mobile-apply-bar__price">{formatPrice(course.price)}</span>
          </div>
          <Link to={`/apply?course=${course.slug}`}>
            <Button variant="primary" size="md">
              Apply Now →
            </Button>
          </Link>
        </div>
      </div>
      {/* ─── Syllabus / Course Inquiry Modal ─────────────── */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title={`Request Curriculum & Syllabus: ${course.title}`}
      >
        {inquirySubmitted ? (
          <div style={{ textAlign: "center", padding: "var(--sp-4) 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "var(--sp-2)" }}>🎉</div>
            <h3 style={{ color: "var(--color-gold)", margin: "0 0 var(--sp-2) 0" }}>
              Curriculum Info on the Way!
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", lineHeight: 1.6 }}>
              Thank you for your interest. We have logged your course inquiry. An admissions mentor will send the complete <strong>{course.title}</strong> module breakdown and cohort schedule to <strong>{inquiryEmail}</strong>.
            </p>
            <div style={{ marginTop: "var(--sp-6)" }}>
              <Button variant="primary" onClick={() => setInquiryModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
              Receive the complete module breakdown, lab prerequisites, and upcoming cohort timetables for {course.title}.
            </p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                placeholder="Adeosun David"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                placeholder="e.g. student@example.ng"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone / WhatsApp (Optional)</label>
              <input
                type="tel"
                className="form-input"
                value={inquiryPhone}
                onChange={(e) => setInquiryPhone(e.target.value)}
                placeholder="e.g. 08023456789"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-2)", marginTop: "var(--sp-2)" }}>
              <Button variant="secondary" type="button" onClick={() => setInquiryModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                📥 Send Me Curriculum
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
