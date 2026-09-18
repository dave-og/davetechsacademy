import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { Apply } from "../pages/Apply/Apply";
import { PaymentCallback } from "../pages/Payment/PaymentCallback";
import { AdminOverview } from "../pages/Admin/AdminOverview";
import { CourseManager } from "../pages/Admin/CourseManager";
import { StudentManager } from "../pages/Admin/StudentManager";
import { ApplicationManager } from "../pages/Admin/ApplicationManager";
import { BranchManager } from "../pages/Admin/BranchManager";
import { CrmManager } from "../pages/Admin/CrmManager";
import { AnalyticsHub } from "../pages/Admin/AnalyticsHub";

const renderWithProviders = (ui: React.ReactElement, { initialEntries = ["/"] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
};

describe("Application Wizard & Admin Views Flow Testing", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Application Flow", () => {
    it("renders Application multi-step wizard and shows course details", () => {
      renderWithProviders(
        <Routes>
          <Route path="/apply" element={<Apply />} />
          <Route path="/apply/:courseId" element={<Apply />} />
        </Routes>,
        { initialEntries: ["/apply/frontend-development"] }
      );

      expect(screen.getByText(/Application Portal/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1: Select Your Course/i)).toBeInTheDocument();
    });
  });

  describe("Payment Callback Route Flow", () => {
    it("handles missing reference gracefully with error state", () => {
      renderWithProviders(<PaymentCallback />, { initialEntries: ["/payment/callback"] });

      expect(screen.getByText(/Payment Verification Failed/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Return & Retry/i })).toBeInTheDocument();
    });
  });

  describe("Admin Overview & Manager Modules", () => {
    it("renders Admin Overview dashboard with KPIs", () => {
      renderWithProviders(<AdminOverview />);
      expect(screen.getByText(/Total Students/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
    });

    it("renders Course Manager table and action buttons", () => {
      renderWithProviders(<CourseManager />);
      expect(screen.getByRole("button", { name: /Add New Course/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search courses by title/i)).toBeInTheDocument();
    });

    it("renders Student Directory", () => {
      renderWithProviders(<StudentManager />);
      expect(screen.getByPlaceholderText(/Search student by name/i)).toBeInTheDocument();
    });

    it("renders Application Manager with status filters", () => {
      renderWithProviders(<ApplicationManager />);
      expect(screen.getByPlaceholderText(/Search applicant name/i)).toBeInTheDocument();
    });

    it("renders Campus Branch Manager", () => {
      renderWithProviders(<BranchManager />);
      expect(screen.getByPlaceholderText(/Search branch by campus name/i)).toBeInTheDocument();
      expect(screen.getByText(/Dave Techs — Abeokuta Main Campus/i)).toBeInTheDocument();
    });

    it("renders CRM Manager with segments and campaigns", () => {
      renderWithProviders(<CrmManager />);
      expect(screen.getByText(/Dynamic Audience Segments/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Broadcast Campaigns/i })).toBeInTheDocument();
    });

    it("renders Analytics Hub with telemetry metrics", () => {
      renderWithProviders(<AnalyticsHub />);
      expect(screen.getByText(/Total Pageviews/i)).toBeInTheDocument();
      expect(screen.getByText(/Catalog Searches/i)).toBeInTheDocument();
    });
  });
});
