import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePhone,
  validateFullName,
  validatePassword,
  validateApplicationPayload,
  validateContactPayload,
} from "../utils/validation";
import {
  sanitizeString,
  escapeHtml,
  sanitizeUserForStorage,
  assertNoSecretKey,
  generateMockJwt,
  isTokenExpired,
} from "../utils/security";

describe("Validation & Security Edge Cases", () => {
  describe("Email Validation", () => {
    it("should accept valid email addresses", () => {
      const result = validateEmail("student@devtechs.ng");
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe("student@devtechs.ng");
    });

    it("should normalize email with whitespace and uppercase", () => {
      const result = validateEmail("  User.Test@Example.COM  ");
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe("user.test@example.com");
    });

    it("should reject invalid email formats (Edge Cases)", () => {
      expect(validateEmail("plainaddress").isValid).toBe(false);
      expect(validateEmail("@missinguser.com").isValid).toBe(false);
      expect(validateEmail("user@.com").isValid).toBe(false);
      expect(validateEmail("user@com").isValid).toBe(false);
      expect(validateEmail("").isValid).toBe(false);
      expect(validateEmail("   ").isValid).toBe(false);
    });
  });

  describe("Phone Number Validation", () => {
    it("should accept valid Nigerian phone numbers", () => {
      expect(validatePhone("+2348012345678").isValid).toBe(true);
      expect(validatePhone("08012345678").isValid).toBe(true);
      expect(validatePhone("09098765432").isValid).toBe(true);
      expect(validatePhone("07011223344").isValid).toBe(true);
    });

    it("should reject invalid or too short phone numbers", () => {
      expect(validatePhone("123").isValid).toBe(false);
      expect(validatePhone("").isValid).toBe(false);
      expect(validatePhone("abcdefghijk").isValid).toBe(false);
    });
  });

  describe("Full Name Validation", () => {
    it("should accept first and last name", () => {
      const res = validateFullName("Amina Bello");
      expect(res.isValid).toBe(true);
      expect(res.sanitized).toBe("Amina Bello");
    });

    it("should reject single names or empty input", () => {
      expect(validateFullName("Amina").isValid).toBe(false);
      expect(validateFullName("").isValid).toBe(false);
      expect(validateFullName("   ").isValid).toBe(false);
    });
  });

  describe("Password Validation & Strength", () => {
    it("should evaluate strong password with uppercase, lowercase, number, special char", () => {
      const res = validatePassword("Password123!@#");
      expect(res.isValid).toBe(true);
      expect(res.strength).toBe("strong");
    });

    it("should evaluate medium password meeting minimum requirements", () => {
      const res = validatePassword("Password123");
      expect(res.isValid).toBe(true);
      expect(["medium", "strong"]).toContain(res.strength);
    });

    it("should reject weak password under 8 characters", () => {
      const res = validatePassword("Pass1!");
      expect(res.isValid).toBe(false);
      expect(res.strength).toBe("weak");
    });

    it("should reject password without mixed character types", () => {
      const res = validatePassword("alllowercasepassword");
      expect(res.isValid).toBe(false);
      expect(res.strength).toBe("weak");
    });
  });

  describe("Security Sanitization & XSS Prevention", () => {
    it("should strip script tags and inline event handlers", () => {
      const malicious = '<script>alert("xss")</script>Hello <b onclick="evil()">World</b>';
      const clean = sanitizeString(malicious);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert");
      expect(clean).not.toContain("onclick");
    });

    it("should escape HTML entities", () => {
      const unescaped = '<div class="test">&"\'</div>';
      const escaped = escapeHtml(unescaped);
      expect(escaped).toContain("&lt;div");
      expect(escaped).toContain("&amp;");
      expect(escaped).toContain("&quot;");
    });

    it("should strip password hashes when sanitizing user for storage", () => {
      const rawUser = {
        id: "u123",
        fullName: "John Doe",
        email: "john@example.com",
        passwordHash: "sha256_salt_secretHash",
        role: "student",
      };
      const sanitized = sanitizeUserForStorage(rawUser);
      expect((sanitized as any).passwordHash).toBeUndefined();
      expect(sanitized.id).toBe("u123");
      expect(sanitized.email).toBe("john@example.com");
    });

    it("assertNoSecretKey should throw when Paystack secret key is provided", () => {
      expect(() => assertNoSecretKey("sk_live_1234567890abcdef")).toThrow(
        /SECURITY FAULT/
      );
      expect(() => assertNoSecretKey("sk_test_1234567890abcdef")).toThrow(
        /SECURITY FAULT/
      );
      expect(() => assertNoSecretKey("pk_test_1234567890abcdef")).not.toThrow();
    });
  });

  describe("Mock JWT & Token Expiration Edge Cases", () => {
    it("should generate valid token and report not expired for active token", () => {
      const token = generateMockJwt({ id: "u1", email: "test@devtechs.ng", role: "student" }, 2);
      expect(isTokenExpired(token)).toBe(false);
    });

    it("should report expired token when expired in past", () => {
      const expiredToken = generateMockJwt({ id: "u1", email: "test@devtechs.ng" }, -5);
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it("should handle null or malformed tokens safely", () => {
      expect(isTokenExpired(undefined)).toBe(true);
      expect(isTokenExpired("invalid.token")).toBe(true);
      expect(isTokenExpired("garbage")).toBe(true);
    });
  });

  describe("Application Payload Validator (Authoritative Pricing & Branch)", () => {
    it("should validate a complete and correct application payload", () => {
      const payload = {
        studentName: "John Doe",
        studentEmail: "john.doe@example.com",
        studentPhone: "+2348012345678",
        studentCountry: "Nigeria",
        studentState: "Lagos",
        courseId: "frontend-development",
        learningMode: "physical",
        branchId: "abeokuta-main",
        cohort: "Morning Cohort (Mon/Wed/Fri 9am)",
      };
      const res = validateApplicationPayload(payload);
      expect(res.isValid).toBe(true);
      expect(res.data?.tuitionAmount).toBeGreaterThan(0);
      expect(res.data?.branchName).toBeDefined();
    });

    it("should enforce physical campus branch when mode is physical", () => {
      const payload = {
        studentName: "John Doe",
        studentEmail: "john.doe@example.com",
        studentPhone: "+2348012345678",
        courseId: "frontend-development",
        learningMode: "physical",
        cohort: "Morning Cohort",
      };
      const res = validateApplicationPayload(payload);
      expect(res.isValid).toBe(false);
      expect(res.errors.branchId).toBeDefined();
    });

    it("should reject invalid course ID", () => {
      const payload = {
        studentName: "John Doe",
        studentEmail: "john.doe@example.com",
        studentPhone: "+2348012345678",
        courseId: "non-existent-course-id-xyz",
        learningMode: "online",
        cohort: "Morning Cohort",
      };
      const res = validateApplicationPayload(payload);
      expect(res.isValid).toBe(false);
      expect(res.errors.courseId).toBeDefined();
    });
  });

  describe("Contact Payload Validator", () => {
    it("should validate correct contact payload", () => {
      const payload = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+2348098765432",
        subject: "Course Inquiry",
        message: "I would like to inquire about the upcoming Cybersecurity cohort dates.",
      };
      const res = validateContactPayload(payload);
      expect(res.isValid).toBe(true);
      expect(res.sanitized?.message).toContain("Cybersecurity");
    });

    it("should reject message shorter than 10 characters", () => {
      const payload = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+2348098765432",
        subject: "Hi",
        message: "Short",
      };
      const res = validateContactPayload(payload);
      expect(res.isValid).toBe(false);
      expect(res.errors.message).toBeDefined();
    });
  });
});
