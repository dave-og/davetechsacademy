import React from "react";
import { cn } from "../../utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rectangular" | "circular";
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = "rectangular",
  className,
  style,
  ...props
}) => {
  const customStyles: React.CSSProperties = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
    borderRadius: variant === "circular" ? "50%" : variant === "text" ? "var(--radius-sm)" : "var(--radius-md)",
    ...style,
  };

  return (
    <div
      className={cn("skeleton", className)}
      style={customStyles}
      aria-hidden="true"
      {...props}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("card", className)} style={{ padding: "var(--sp-5)", display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
      <Skeleton height={180} style={{ borderRadius: "var(--radius-lg)" }} />
      <Skeleton height={24} width="70%" />
      <Skeleton height={16} width="100%" />
      <Skeleton height={16} width="85%" />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--sp-2)" }}>
        <Skeleton height={28} width="30%" />
        <Skeleton height={32} width="40%" style={{ borderRadius: "var(--radius-full)" }} />
      </div>
    </div>
  );
};
