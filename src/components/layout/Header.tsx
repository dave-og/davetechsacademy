import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Logo } from "../common/Logo";
import { ThemeToggle } from "../common/ThemeToggle";
import { Button } from "../ui/Button";
import type { Theme } from "../../types";
import "./Header.css";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/instructors", label: "Instructors" },
  { to: "/branches", label: "Branches" },
  { to: "/community", label: "Community" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="header__inner container">
        <Logo />

        {/* Desktop Nav */}
        <nav className="header__nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `header__link ${isActive ? "header__link--active" : ""}`
              }
              end={link.to === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="header__actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">
                  👤 {user?.fullName.split(" ")[0] || "Dashboard"}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/apply">
                <Button variant="primary" size="sm">
                  Apply Now
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`header__hamburger ${mobileMenuOpen ? "header__hamburger--open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Backdrop & Menu */}
      <div
        className={`header__mobile-backdrop ${mobileMenuOpen ? "header__mobile-backdrop--open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`header__mobile ${mobileMenuOpen ? "header__mobile--open" : ""}`}
      >
        <nav className="header__mobile-nav" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `header__mobile-link ${isActive ? "header__mobile-link--active" : ""}`
              }
              end={link.to === "/"}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="header__mobile-actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm">
                    Dashboard ({user?.fullName})
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/apply" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm">
                    Apply Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
