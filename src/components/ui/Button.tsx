import React from "react";
import { cn } from "../../utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const isCurrentlyLoading = loading || isLoading;

  return (
    <button
      className={cn(
        "btn",
        `btn--${variant}`,
        size !== "md" && `btn--${size}`,
        isCurrentlyLoading && "btn--loading",
        className
      )}
      disabled={disabled || isCurrentlyLoading}
      {...props}
    >
      {isCurrentlyLoading && <span className="btn__spinner" />}
      {children}
    </button>
  );
};
