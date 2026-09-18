import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { assertNoSecretKey } from "../utils/security";

const BrokenComponent = () => {
  throw new Error("Simulated production runtime fault");
};

describe("Deployment, ErrorBoundary & Security Verification", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-content">Application running smoothly</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("catches runtime errors and renders error fallback UI with recovery buttons", () => {
    // Suppress console.error in test output for intentional error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reload Page/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Return to Home/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  it("verifies security assertion blocks Paystack secret keys from client runtime", () => {
    expect(() => assertNoSecretKey("sk_live_sample_key_123")).toThrow(/SECURITY FAULT/);
    expect(() => assertNoSecretKey("pk_live_sample_key_123")).not.toThrow();
  });
});
