import React from "react";
import { Link } from "react-router-dom";
import "./Logo.css";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <Link to="/" className={`logo ${className || ""}`} aria-label="Dave Techs — Home">
      <span className="logo__text">
        Dave <span className="logo__accent">Techs</span>
      </span>
    </Link>
  );
};
