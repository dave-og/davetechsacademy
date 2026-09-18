import React from "react";
import { Navigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

interface AdminRouteProps {
  children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="section container"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="btn__spinner"
          style={{ width: "40px", height: "40px", borderWidth: "3px" }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    return (
      <div
        className="section container"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--sp-12) var(--sp-4)",
        }}
      >
        <div
          style={{
            maxWidth: "540px",
            textAlign: "center",
            padding: "var(--sp-8)",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              margin: "0 auto var(--sp-4)",
            }}
          >
            🔒
          </div>
          <span
            style={{
              display: "inline-block",
              padding: "var(--sp-1) var(--sp-3)",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "var(--sp-3)",
            }}
          >
            403 Forbidden
          </span>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 800,
              color: "var(--color-text)",
              marginBottom: "var(--sp-3)",
            }}
          >
            Admin Privileges Required
          </h1>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
              marginBottom: "var(--sp-6)",
            }}
          >
            Your current account (<strong>{user?.email || "Student Account"}</strong>) does not have administrative permissions to access the Dave Techs management console.
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--sp-3)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/dashboard">
              <Button variant="secondary">Go to Student Dashboard</Button>
            </Link>
            <Link to="/login" state={{ from: location }}>
              <Button variant="primary">Switch Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
