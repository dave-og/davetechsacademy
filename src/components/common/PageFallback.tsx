import React from "react";

export const PageFallback: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--sp-4)",
        padding: "var(--sp-12)",
      }}
      aria-busy="true"
      aria-label="Loading page content"
    >
      <div
        className="btn__spinner"
        style={{
          width: "42px",
          height: "42px",
          borderWidth: "3px",
          borderTopColor: "var(--gold)",
        }}
      />
      <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
        Loading content...
      </p>
    </div>
  );
};
