import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { Login } from "../pages/Auth/Login";
import { Signup } from "../pages/Auth/Signup";
import { ForgotPassword } from "../pages/Auth/ForgotPassword";
import { Contact } from "../pages/Contact/Contact";
import { Courses } from "../pages/Courses/Courses";
import { CourseDetail } from "../pages/CourseDetail/CourseDetail";
import { Notifications } from "../pages/Dashboard/Notifications";
import { About } from "../pages/About/About";
import { Testimonials } from "../pages/Testimonials/Testimonials";
import { NotFound } from "../pages/NotFound/NotFound";

const renderWithProviders = (ui: React.ReactElement, { initialEntries = ["/"] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
};

describe("Interactive UI Component & Flow Testing", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Login Form Flow & Validation", () => {
    it("renders login form with fields and validation errors on empty submit", async () => {
      renderWithProviders(<Login />, { initialEntries: ["/login"] });

      expect(screen.getByRole("heading", { name: /Sign In to/i })).toBeInTheDocument();
      
      const submitBtn = screen.getByRole("button", { name: /Sign In →/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Email address is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
    });

    it("populates demo credentials when clicking Fill Student button", () => {
      renderWithProviders(<Login />, { initialEntries: ["/login"] });

      const fillStudentBtn = screen.getByRole("button", { name: /Fill Student/i });
      fireEvent.click(fillStudentBtn);

      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      expect(emailInput.value).toBe("student@davetechs.ng");
    });
  });

  describe("Signup Form Flow & Validation", () => {
    it("validates required fields and password matching in signup", async () => {
      renderWithProviders(<Signup />, { initialEntries: ["/signup"] });

      const submitBtn = screen.getByRole("button", { name: /Create Account/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Full name is required/i)).toBeInTheDocument();
    });
  });

  describe("Password Recovery Flow", () => {
    it("validates email in password reset request", async () => {
      renderWithProviders(<ForgotPassword />, { initialEntries: ["/forgot-password"] });

      const resetBtn = screen.getByRole("button", { name: /Send Reset Link/i });
      fireEvent.click(resetBtn);

      expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  describe("Course Catalog & Search Interaction", () => {
    it("renders course list and responds to search input", async () => {
      renderWithProviders(<Courses />, { initialEntries: ["/courses"] });

      expect(screen.getByText(/Our Professional/i)).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Search courses by skill/i);
      fireEvent.change(searchInput, { target: { value: "UI/UX" } });

      expect(screen.getByDisplayValue("UI/UX")).toBeInTheDocument();
    });

    it("displays empty state when search matches no courses", async () => {
      renderWithProviders(<Courses />, { initialEntries: ["/courses"] });

      const searchInput = screen.getByPlaceholderText(/Search courses by skill/i);
      fireEvent.change(searchInput, { target: { value: "nonexistentquery12345" } });

      expect(await screen.findByText(/No Courses Found/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Reset All Filters/i })).toBeInTheDocument();
    });
  });

  describe("Course Detail 404 Fallback", () => {
    it("renders Course Not Found message when slug is invalid", () => {
      renderWithProviders(
        <Routes>
          <Route path="/courses/:slug" element={<CourseDetail />} />
        </Routes>,
        { initialEntries: ["/courses/invalid-slug-xyz"] }
      );

      expect(screen.getByRole("heading", { name: /Course Not Found/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Browse All Courses/i })).toBeInTheDocument();
    });
  });

  describe("Contact Form Interaction", () => {
    it("renders contact form and handles input changes", async () => {
      renderWithProviders(<Contact />, { initialEntries: ["/contact"] });

      expect(screen.getByText(/Get In Touch/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Adeosun David/i)).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText(/Adeosun David/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      expect(nameInput.value).toBe("John Doe");
    });
  });

  describe("Notifications Page Interaction", () => {
    it("renders notification tabs and items", () => {
      renderWithProviders(<Notifications />, { initialEntries: ["/dashboard/notifications"] });

      expect(screen.getByText(/Notifications & Announcements/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^All/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Unread \(/i })).toBeInTheDocument();
    });
  });

  describe("About Page Interaction", () => {
    it("renders about page with mission, vision, values, and CTAs", () => {
      renderWithProviders(<About />, { initialEntries: ["/about"] });

      expect(screen.getByRole("heading", { name: /About Dave Techs Academy/i })).toBeInTheDocument();
      expect(screen.getByText(/Empower practical builders/i)).toBeInTheDocument();
      expect(screen.getByText(/Africa's tech innovation engine/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Explore Courses →/i })).toBeInTheDocument();
    });
  });

  describe("Testimonials Page Interaction", () => {
    it("renders testimonials page with student success stories", () => {
      renderWithProviders(<Testimonials />, { initialEntries: ["/testimonials"] });

      expect(screen.getByRole("heading", { name: /Student Success Stories/i })).toBeInTheDocument();
      expect(screen.getByText(/Chioma Okonkwo/i)).toBeInTheDocument();
    });
  });

  describe("NotFound 404 Page Interaction", () => {
    it("renders 404 error page with navigation back buttons", () => {
      renderWithProviders(<NotFound />, { initialEntries: ["/non-existent-route-xyz"] });

      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /Page Not Found/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /← Return Home/i })).toBeInTheDocument();
    });
  });
});
