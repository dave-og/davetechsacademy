import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { getUnreadNotificationCount } from "../../data/notifications";
import { Button } from "../../components/ui/Button";
import "./DashboardLayout.css";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Refresh unread count on navigation or interval
    const updateCount = () => {
      setUnreadCount(getUnreadNotificationCount(user?.id));
    };
    updateCount();
    const interval = setInterval(updateCount, 4000);
    return () => clearInterval(interval);
  }, [user?.id, location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key for modals & mobile menu
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLogoutConfirm) setShowLogoutConfirm(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showLogoutConfirm, isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Overview", icon: "📊", end: true },
    { to: "/dashboard/courses", label: "My Courses", icon: "📚", end: false },
    { to: "/dashboard/certificates", label: "Certificates", icon: "🎓", end: false },
    { to: "/dashboard/referrals", label: "Referrals & Rewards", icon: "🎁", end: false },
    { to: "/dashboard/applications", label: "Applications", icon: "📝", end: false },
    { to: "/dashboard/payments", label: "Payments", icon: "💳", end: false },
    {
      to: "/dashboard/notifications",
      label: "Notifications",
      icon: "🔔",
      end: false,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { to: "/dashboard/profile", label: "Profile & Security", icon: "👤", end: false },
  ];

  const studentInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <div className="dash-container">
      {/* Mobile Top Bar */}
      <header className="dash-mobile-topbar">
        <button
          className="dash-hamburger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span className="dash-hamburger__line" />
          <span className="dash-hamburger__line" />
          <span className="dash-hamburger__line" />
        </button>

        <Link to="/" className="dash-logo">
          Dave <span className="logo__accent">Techs</span>
        </Link>

        <div className="dash-mobile-actions">
          <button
            className="dash-theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <Link to="/dashboard/notifications" className="dash-mobile-notif-btn">
            🔔
            {unreadCount > 0 && <span className="dash-notif-pill">{unreadCount}</span>}
          </Link>
          <Link to="/dashboard/profile" className="dash-mobile-avatar" title={user?.fullName}>
            {studentInitials}
          </Link>
        </div>
      </header>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="dash-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`dash-sidebar ${isMobileMenuOpen ? "dash-sidebar--open" : ""}`}>
        {/* Sidebar Header */}
        <div className="dash-sidebar__header">
          <Link to="/" className="dash-logo">
            Dave <span className="logo__accent">Techs</span>
          </Link>
          <span className="dash-portal-tag">STUDENT PORTAL</span>
        </div>

        {/* User Card */}
        <div className="dash-user-card">
          <div className="dash-user-avatar">{studentInitials}</div>
          <div className="dash-user-info">
            <h4 className="dash-user-name" title={user?.fullName}>
              {user?.fullName || "Student"}
            </h4>
            <p className="dash-user-email" title={user?.email}>
              {user?.email || "student@davetechs.ng"}
            </p>
          </div>
        </div>

        {user?.role === "admin" && (
          <div style={{ padding: "0 var(--sp-4) var(--sp-3)" }}>
            <Link
              to="/admin"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--sp-2)",
                padding: "var(--sp-2) var(--sp-3)",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "var(--font-sm)",
              }}
            >
              ⚡ Switch to Admin Console
            </Link>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="dash-nav" aria-label="Student Dashboard Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `dash-nav__link ${isActive ? "dash-nav__link--active" : ""}`
              }
            >
              <span className="dash-nav__icon">{item.icon}</span>
              <span className="dash-nav__label">{item.label}</span>
              {item.badge !== undefined && (
                <span className="dash-nav__badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="dash-sidebar__footer">
          <Link to="/courses" className="dash-explore-link">
            🔍 Explore All Courses
          </Link>

          <div className="dash-footer-controls">
            <button
              className="dash-footer-btn"
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              <span>{theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
            </button>

            <button
              className="dash-logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
              title="Sign Out"
            >
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dash-main">
        <div className="dash-content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="dash-modal-overlay" role="dialog" aria-modal="true">
          <div className="dash-modal">
            <h3 className="dash-modal__title">Confirm Sign Out</h3>
            <p className="dash-modal__desc">
              Are you sure you want to sign out of your Dave Techs student portal?
            </p>
            <div className="dash-modal__actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Yes, Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
