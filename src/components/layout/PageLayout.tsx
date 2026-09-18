import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAnalytics } from "../../hooks/useAnalytics";
import type { Theme } from "../../types";

interface PageLayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  useAnalytics();
  const isDashboard = location.pathname.startsWith("/dashboard");

  // Scroll to top on route navigation
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  if (isDashboard) {
    return (
      <div className="dashboard-app-root">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="page-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main
        id="main-content"
        key={location.pathname}
        className="page-layout__main animate-fade-in"
        style={{ paddingTop: "var(--header-height)" }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

