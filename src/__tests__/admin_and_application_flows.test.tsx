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

    it("verifies Step 4 learning mode cards, contact buttons, and branch assistance", () => {
      renderWithProviders(
        <Routes>
          <Route path="/apply/:courseId" element={<Apply />} />
        </Routes>,
        { initialEntries: ["/apply/frontend-development"] }
      );

      // Step 1 -> Next (Step 2 Account)
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));
      // Step 2 -> Next (Step 3 Personal Info)
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));

      // Fill Step 3 Personal Info
      fireEvent.change(screen.getByLabelText(/Full Legal Name/i), { target: { value: "Adebayo Test" } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "adebayo@test.ng" } });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "+2348012345678" } });
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));

      // Now at Step 4: Select Learning Mode
      expect(screen.getByText(/Step 4: Select Learning Mode/i)).toBeInTheDocument();

      // Verify Online Live Training card
      expect(screen.getByText(/Online Live Training/i)).toBeInTheDocument();
      expect(screen.getByText(/^Payment Required$/i)).toBeInTheDocument();
      expect(screen.getByText(/Live interactive classes via Google Meet \/ Zoom/i)).toBeInTheDocument();

      // Verify Hands-on Physical Classes card
      expect(screen.getByText(/Hands-on Physical Classes/i)).toBeInTheDocument();
      expect(screen.getByText(/^No Online Payment Required$/i)).toBeInTheDocument();
      expect(screen.getByText(/Want to learn physically\? Contact our admin to find the nearest Dave Techs branch/i)).toBeInTheDocument();
      expect(screen.getByText(/Find the nearest Dave Techs branch to you/i)).toBeInTheDocument();
      expect(screen.getByText(/Speak directly with our admin about physical classes/i)).toBeInTheDocument();
      expect(screen.getByText(/Get information about available courses, schedules, and enrollment/i)).toBeInTheDocument();
      expect(screen.getByText(/Arrange a visit to your preferred branch/i)).toBeInTheDocument();
      expect(screen.getByText(/Get guidance on the next steps for joining Dave Techs/i)).toBeInTheDocument();

      // Verify WhatsApp button link
      const whatsappLink = screen.getByTitle(/Contact Dave Techs Admin on WhatsApp/i);
      expect(whatsappLink).toHaveAttribute("href", expect.stringContaining("https://wa.me/2349070925508"));
      expect(whatsappLink).toHaveAttribute("href", expect.stringContaining(encodeURIComponent("Hello Dave Techs Admin, I am interested in attending physical classes at Dave Techs.")));

      // Verify Phone call links
      const callLink = screen.getByTitle(/Call Dave Techs Admin directly at 09070925508/i);
      expect(callLink).toHaveAttribute("href", "tel:+2349070925508");

      const altCallLink = screen.getByTitle(/Call alternative phone number 08110913672/i);
      expect(altCallLink).toHaveAttribute("href", "tel:+2348110913672");

      // Verify Nearest Branch Assistance section
      expect(screen.getByText(/Find a Branch Near You/i)).toBeInTheDocument();
      expect(screen.getByText(/Tell us your location, and our admin will help you identify the nearest available Dave Techs branch/i)).toBeInTheDocument();

      const branchInput = screen.getByPlaceholderText(/Enter your city or area/i);
      const findBranchBtn = screen.getByRole("button", { name: /^Find Nearest Branch$/i });

      // Click with empty input -> triggers validation error
      fireEvent.click(findBranchBtn);
      expect(screen.getByText(/Please enter your city or area/i)).toBeInTheDocument();

      // Enter location and click
      const originalOpen = window.open;
      window.open = vi.fn();

      fireEvent.change(branchInput, { target: { value: "Ikeja, Lagos" } });
      fireEvent.click(findBranchBtn);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("https://wa.me/2349070925508"),
        "_blank",
        "noopener,noreferrer"
      );
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent("My location is Ikeja, Lagos")),
        "_blank",
        "noopener,noreferrer"
      );

      window.open = originalOpen;
    });

    it("completes physical enrollment flow without requiring online payment", () => {
      renderWithProviders(
        <Routes>
          <Route path="/apply/:courseId" element={<Apply />} />
        </Routes>,
        { initialEntries: ["/apply/frontend-development"] }
      );

      // Step 1 -> Step 2
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));
      // Step 2 -> Step 3
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));

      // Fill Step 3
      fireEvent.change(screen.getByLabelText(/Full Legal Name/i), { target: { value: "Chioma Physical" } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "chioma@example.ng" } });
      fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: "+2348099887766" } });
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));

      // Step 4: Select Physical Mode
      const physicalCard = screen.getByText(/Hands-on Physical Classes/i).closest(".learning-mode-card");
      expect(physicalCard).toBeInTheDocument();
      fireEvent.click(physicalCard!);

      // Click Next Step -> Step 5
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));
      expect(screen.getByText(/Step 5:/i)).toBeInTheDocument();

      // Click Next Step -> Step 6 (Review)
      fireEvent.click(screen.getByRole("button", { name: /^Next Step →$/i }));
      expect(screen.getByText(/Step 6: Review & Final Confirmation/i)).toBeInTheDocument();
      expect(screen.getByText(/No Online Payment Required:/i)).toBeInTheDocument();

      // Check Terms checkbox
      const termsCheckbox = screen.getByLabelText(/I verify that the above information is accurate/i);
      fireEvent.click(termsCheckbox);

      // Submit button should read "Complete Physical Registration →"
      const submitBtn = screen.getByRole("button", { name: /Complete Physical Registration/i });
      expect(submitBtn).toBeInTheDocument();
      fireEvent.click(submitBtn);

      // Confirmation screen appears without Paystack modal
      expect(screen.queryByText(/Pay via Paystack/i)).not.toBeInTheDocument();
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
