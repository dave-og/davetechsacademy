import React from "react";
import { cn } from "../../utils";

type BadgeVariant = "gold" | "success" | "error" | "warning" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "gold",
  children,
  className,
}) => {
  return (
    <span className={cn("badge", `badge--${variant}`, className)}>
      {children}
    </span>
  );
};
