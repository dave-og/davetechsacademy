import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";
import "./Footer.css";

const ACADEMY_LINKS = [
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/instructors", label: "Instructors" },
  { to: "/branches", label: "Branches" },
  { to: "/community", label: "Student Community" },
  { to: "/careers", label: "Career Marketplace" },
  { to: "/affiliate", label: "Affiliate Program" },
];

const SUPPORT_LINKS = [
  { to: "/verify", label: "Verify Certificate" },
  { to: "/contact", label: "Contact Us" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund-policy", label: "Refund Policy" },
];

const COURSE_CATEGORIES = [
  { to: "/courses?category=Software+Development", label: "Software Development" },
  { to: "/courses?category=Data+%26+AI", label: "Data & AI" },
  { to: "/courses?category=Cybersecurity", label: "Cybersecurity" },
  { to: "/courses?category=Design", label: "Design" },
  { to: "/courses?category=Cloud+%26+DevOps", label: "Cloud & DevOps" },
];

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook", icon: "fb" },
  { href: "#", label: "Instagram", icon: "ig" },
  { href: "#", label: "LinkedIn", icon: "li" },
  { href: "#", label: "X / Twitter", icon: "tw" },
];

const CONTACT_INFO = {
  email: "admissions@davetechs.academy",
  phone: "09070925508, 08110913672",
  location: "Abeokuta, Ogun State, Nigeria",
  hours: "Mon – Sat: 8:00 AM – 6:00 PM",
};

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            <Logo />
            <p className="footer__desc">
              Practical technology training — online and physical. Build the
              skills. Build the future.
            </p>
            <div className="footer__contact-info">
              <p className="footer__contact-item">
                <span className="footer__contact-icon">📍</span>
                <span>{CONTACT_INFO.location}</span>
              </p>
              <p className="footer__contact-item">
                <span className="footer__contact-icon">✉️</span>
                <a href={`mailto:${CONTACT_INFO.email}`} className="footer__contact-link">
                  {CONTACT_INFO.email}
                </a>
              </p>
              <p className="footer__contact-item">
                <span className="footer__contact-icon">📞</span>
                <a href="tel:09070925508" className="footer__contact-link">
                  09070925508
                </a>
                <span style={{ margin: "0 4px", color: "var(--text-muted)" }}>/</span>
                <a href="tel:08110913672" className="footer__contact-link">
                  08110913672
                </a>
              </p>
            </div>
            <div className="footer__social">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                >
                  {s.icon.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Academy Column */}
          <div className="footer__col">
            <h4 className="footer__heading">Academy</h4>
            <ul className="footer__list">
              {ACADEMY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses Column */}
          <div className="footer__col">
            <h4 className="footer__heading">Courses</h4>
            <ul className="footer__list">
              {COURSE_CATEGORIES.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal Column */}
          <div className="footer__col">
            <h4 className="footer__heading">Support & Legal</h4>
            <ul className="footer__list">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} Dave <span className="text-gold">Techs</span> Academy — All
            Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
