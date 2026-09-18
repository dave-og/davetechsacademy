import React, { useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { isTokenExpired } from "../../utils/security";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  // Check token expiry on route navigation
  useEffect(() => {
    if (isAuthenticated && user?.token && isTokenExpired(user.token)) {
      logout();
    }
  }, [isAuthenticated, user?.token, logout]);

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

  if (!isAuthenticated || (user?.token && isTokenExpired(user.token))) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
