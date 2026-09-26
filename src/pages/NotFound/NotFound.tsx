import React from "react";
import { Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";
import { Button } from "../../components/ui/Button";
import "./NotFound.css";

export const NotFound: React.FC = () => {
  useSEO({
    title: "Page Not Found — Dave Techs Academy",
    description: "The page you are looking for does not exist or has been moved.",
  });

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          The page you requested could not be found. It may have been moved, renamed, or is temporarily unavailable.
        </p>
        <div className="not-found-actions">
          <Link to="/">
            <Button variant="primary" size="md">
              ← Return Home
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="secondary" size="md">
              Browse Courses
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="md">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
