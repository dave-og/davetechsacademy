import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { ThemeToggle } from "../../components/common/ThemeToggle";
import { Button } from "../../components/ui/Button";
import "./AdminLayout.css";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path.includes("/admin/courses")) return "Course Catalog Management";
    if (path.includes("/admin/students")) return "Student Directory & Enrollment";
    if (path.includes("/admin/applications")) return "Application & Admissions Manager";
    if (path.includes("/admin/branches")) return "Campus & Branch Operations";
    if (path.includes("/admin/crm")) return "CRM & Communication Hub";
    if (path.includes("/admin/lms")) return "LMS & Curriculum Operations";
    if (path.includes("/admin/analytics")) return "Enrollment Analytics & Conversion Funnels";
    return "Academy Analytics & Overview";
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="modal__backdrop"
          style={{ zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__header">
          <Link to="/admin" className="admin-brand" onClick={() => setSidebarOpen(false)}>
            <div className="admin-brand__badge">DTA</div>
            <div>
              <div className="admin-brand__title">Dave Techs</div>
              <span className="admin-brand__subtitle">Admin Console</span>
            </div>
          </Link>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📊</span>
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📚</span>
            <span>Courses</span>
          </NavLink>

          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">👥</span>
            <span>Students</span>
          </NavLink>

          <NavLink
            to="/admin/applications"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📝</span>
            <span>Applications</span>
          </NavLink>

          <NavLink
            to="/admin/branches"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">🏢</span>
            <span>Branches</span>
          </NavLink>

          <NavLink
            to="/admin/crm"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📢</span>
            <span>CRM & Broadcasts</span>
          </NavLink>

          <NavLink
            to="/admin/lms"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">🎓</span>
            <span>LMS & Curriculum</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="admin-nav-icon">📈</span>
            <span>Analytics & Funnels</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" style={{ width: "100%" }}>
              🌐 View Public Website
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            style={{ width: "100%", color: "#ef4444" }}
            onClick={handleLogout}
          >
            🚪 Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)" }}>
            <button
              className="admin-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <h2 className="admin-topbar__title">{getPageTitle()}</h2>
          </div>

          <div className="admin-topbar__actions">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <div className="admin-user-pill">
              <div className="admin-avatar">AD</div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user?.fullName || "Administrator"}</span>
                <span className="admin-user-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
