import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { courses } from "../../data/courses";
import { branches } from "../../data/branches";
import { saveContactMessage } from "../../services/leads";
import { trackContactSubmission } from "../../services/analytics";
import { Button } from "../../components/ui/Button";
import { Input, TextArea } from "../../components/ui/Input";
import "./Contact.css";

export const Contact: React.FC = () => {
  useSEO({
    title: "Contact Admissions & Support Team",
    description:
      "Get in touch with Dave Techs Academy admissions advisors for course guidance, campus tour bookings, payment questions, and corporate tech training.",
  });

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Admissions & Course Enrollment");
  const [courseInterest, setCourseInterest] = useState("");
  const [branchInterest, setBranchInterest] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Map Tab
  const [selectedBranchMap, setSelectedBranchMap] = useState(branches[0]);

  // FAQ open state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const res = saveContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject,
      courseInterest: courseInterest || undefined,
      branchInterest: branchInterest || undefined,
      message: message.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitSuccess(true);
      trackContactSubmission(res.messageId || "msg", subject, courseInterest);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCourseInterest("");
      setBranchInterest("");
    } else {
      setErrorMessage(res.error || "Something went wrong while submitting your message. Please try again.");
    }
  };

  const contactFaqs = [
    {
      q: "How soon will an admissions advisor contact me?",
      a: "Our student advisory team typically responds within 1 to 2 hours during normal business hours (Monday through Saturday). Inquiries submitted outside business hours are prioritized first thing the next morning.",
    },
    {
      q: "Can I visit a campus before applying?",
      a: "Yes! You are welcome to walk into any of our physical academy campuses in Abeokuta, Victoria Island, Ikeja, or Ibadan during opening hours for a guided lab tour, curriculum counseling, and workstation inspection.",
    },
    {
      q: "Do you offer weekend or evening cohorts for working professionals?",
      a: "Yes. Most programs provide Saturday Intensive or Weekday Evening cohorts specifically tailored for working professionals and university students.",
    },
    {
      q: "Can I switch between Online and Physical training?",
      a: "Yes. Students can request a mode transfer prior to or during the first two weeks of their cohort by contacting the admissions office.",
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero__badge">GET IN TOUCH</div>
          <h1 className="contact-hero__title">
            We're Here to Help You <span className="logo__accent">Start Your Tech Journey</span>
          </h1>
          <p className="contact-hero__subtitle">
            Have questions about course curricula, physical campus tours, payment options, or corporate training?
            Our admissions and faculty team are ready to assist you.
          </p>

          <div className="contact-response-guarantee">
            <span className="guarantee-dot" />
            <span>⚡ Average response time: Under 2 hours during operational hours</span>
          </div>
        </div>
      </section>

      {/* Main Form & Info Grid */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-grid">
            {/* Left Column: Direct Contact Info & Socials */}
            <div className="contact-info-col">
              <div className="contact-info-card">
                <h3 className="contact-info-title">Admissions & Support Channels</h3>
                <p className="contact-info-desc">
                  Reach out directly via phone, email, or instant WhatsApp messaging for immediate enrollment assistance.
                </p>

                <div className="contact-channels-list">
                  <div className="contact-channel-item">
                    <div className="channel-icon">📞</div>
                    <div className="channel-content">
                      <span className="channel-lbl">Phone Enquiries</span>
                      <a href="tel:09070925508" className="channel-link">
                        09070925508
                      </a>
                      <a href="tel:08110913672" className="channel-link">
                        08110913672
                      </a>
                    </div>
                  </div>

                  <div className="contact-channel-item">
                    <div className="channel-icon">✉️</div>
                    <div className="channel-content">
                      <span className="channel-lbl">Email Support</span>
                      <a href="mailto:admissions@davetechs.ng" className="channel-link">
                        admissions@davetechs.ng
                      </a>
                      <a href="mailto:support@davetechs.ng" className="channel-link">
                        support@davetechs.ng
                      </a>
                    </div>
                  </div>

                  <div className="contact-channel-item">
                    <div className="channel-icon">🕒</div>
                    <div className="channel-content">
                      <span className="channel-lbl">Operational Hours</span>
                      <span className="channel-val">Mon – Fri: 8:00 AM – 6:00 PM</span>
                      <span className="channel-val">Saturday: 9:00 AM – 4:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Direct Chat Banner */}
                <a
                  href="https://wa.me/2348023456789?text=Hello%20Dave%20Techs%20Academy,%20I%20would%20like%20information%20about%20your%20courses."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-direct-btn"
                >
                  <span className="whatsapp-icon">💬</span>
                  <div className="whatsapp-text">
                    <strong>Chat with Admissions on WhatsApp</strong>
                    <span>Instant guidance and cohort reservations</span>
                  </div>
                </a>

                {/* Social Channels */}
                <div className="contact-socials-section">
                  <span className="socials-title">Connect with Dave Techs:</span>
                  <div className="socials-icons-grid">
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-box" aria-label="LinkedIn">
                      in
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-box" aria-label="Twitter / X">
                      𝕏
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-box" aria-label="GitHub">
                      git
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-box" aria-label="Instagram">
                      📸
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-box" aria-label="YouTube">
                      ▶
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Lead Form */}
            <div className="contact-form-col">
              <div className="contact-form-card">
                <h3 className="contact-form-title">Send a Direct Message</h3>
                <p className="contact-form-subtitle">
                  Fill out the form below and an advisor specializing in your course of interest will reach out.
                </p>

                {submitSuccess && (
                  <div className="contact-alert contact-alert--success">
                    <div className="alert-icon">✓</div>
                    <div>
                      <strong>Message Dispatched Successfully!</strong>
                      <p>Thank you for reaching out. An admissions counselor has received your inquiry and will contact you shortly.</p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="contact-alert contact-alert--error">
                    <div className="alert-icon">✕</div>
                    <div>
                      <strong>Submission Error</strong>
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form-body">
                  <div className="contact-form-row">
                    <Input
                      label="Full Legal Name *"
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adeosun David"
                      required
                    />

                    <Input
                      label="Email Address *"
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="david@example.com"
                      required
                    />
                  </div>

                  <div className="contact-form-row">
                    <Input
                      label="Phone Number (WhatsApp Preferred) *"
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      required
                    />

                    <div className="form-group">
                      <label className="form-label" htmlFor="subject">
                        Subject Inquiry
                      </label>
                      <select
                        id="subject"
                        className="form-input"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="Admissions & Course Enrollment">Admissions & Course Enrollment</option>
                        <option value="Physical Campus Tour">Physical Campus Tour / Lab Inspection</option>
                        <option value="Online Live Classes">Online Live Classes Inquiry</option>
                        <option value="Corporate / Group Training">Corporate / Team Training</option>
                        <option value="Career Counseling">Career Counseling & Guidance</option>
                        <option value="General Support">General Support</option>
                      </select>
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="courseInterest">
                        Course of Interest
                      </label>
                      <select
                        id="courseInterest"
                        className="form-input"
                        value={courseInterest}
                        onChange={(e) => setCourseInterest(e.target.value)}
                      >
                        <option value="">-- Select Course (Optional) --</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.title}>
                            {c.title} ({c.level})
                          </option>
                        ))}
                        <option value="Undecided / Need Advice">Undecided / Need Advice</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="branchInterest">
                        Preferred Learning Mode / Campus
                      </label>
                      <select
                        id="branchInterest"
                        className="form-input"
                        value={branchInterest}
                        onChange={(e) => setBranchInterest(e.target.value)}
                      >
                        <option value="">-- Select Location (Optional) --</option>
                        <option value="Online Live Training">🌐 Online Live Training</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.name}>
                            🏫 {b.name} ({b.location})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <TextArea
                    label="How can we help you? *"
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your learning goals, preferred timeline, or questions..."
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    style={{ width: "100%" }}
                  >
                    Send Message →
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Map & Locations Section */}
      <section className="contact-map-section">
        <div className="container">
          <div className="contact-map-header">
            <span className="map-tag">VISIT OUR HUBS</span>
            <h2 className="map-title">Physical Campus Locations</h2>
            <p className="map-subtitle">
              Select a campus to view address, directions, and direct telephone lines.
            </p>
          </div>

          <div className="map-tabs">
            {branches.map((b) => (
              <button
                key={b.id}
                className={`map-tab-btn ${selectedBranchMap.id === b.id ? "map-tab-btn--active" : ""}`}
                onClick={() => setSelectedBranchMap(b)}
              >
                📍 {b.name.replace("Dave Techs — ", "")}
              </button>
            ))}
          </div>

          <div className="map-display-card">
            <div className="map-info-pane">
              <span className="map-pane-tag">CAMPUS DETAILS</span>
              <h3 className="map-pane-title">{selectedBranchMap.name}</h3>
              <p className="map-pane-address">📍 {selectedBranchMap.address}</p>
              <div className="map-pane-contact">
                <div>📞 <strong>Phone:</strong> {selectedBranchMap.phone}</div>
                {selectedBranchMap.email && (
                  <div>✉️ <strong>Email:</strong> {selectedBranchMap.email}</div>
                )}
                <div>🕒 <strong>Hours:</strong> {selectedBranchMap.openingHours}</div>
              </div>
              {selectedBranchMap.transportInfo && (
                <div className="map-pane-transit">
                  <strong>Transit Guide:</strong>
                  <p>{selectedBranchMap.transportInfo}</p>
                </div>
              )}
              <div className="map-pane-actions">
                <a
                  href={selectedBranchMap.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-nav-btn"
                >
                  🗺️ Open in Google Maps ↗
                </a>
                <Link to={`/apply?mode=physical&branch=${selectedBranchMap.id}`}>
                  <Button variant="primary" size="sm">
                    Apply for this Campus →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="map-visual-pane">
              <img
                src={selectedBranchMap.image}
                alt={selectedBranchMap.name}
                className="map-pane-img"
              />
              <div className="map-visual-overlay">
                <div className="map-pin-pulse" />
                <span className="map-pin-label">{selectedBranchMap.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="contact-faq-section">
        <div className="container">
          <div className="contact-faq-header">
            <span className="faq-tag">COMMON INQUIRIES</span>
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-subtitle">
              Quick answers about our courses, enrollment, and physical hubs.
            </p>
          </div>

          <div className="contact-faq-accordion">
            {contactFaqs.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaqIndex === idx ? "faq-item--open" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  aria-expanded={openFaqIndex === idx}
                >
                  <span>{faq.q}</span>
                  <span className="faq-toggle-icon">{openFaqIndex === idx ? "−" : "+"}</span>
                </button>
                {openFaqIndex === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
