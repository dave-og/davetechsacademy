import { getCourseById } from "../data/courses";
import { branches } from "../data/branches";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "./security";
import type { LearningMode } from "../types";

/**
 * Strict RFC 5322-compliant email pattern.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * International / Nigerian phone number validation pattern.
 */
const PHONE_REGEX = /^(?:\+234|0)[789][01]\d{8}$|^[+0-9\s-]{10,16}$/;

export function validateEmail(email: string): { isValid: boolean; error?: string; normalized: string } {
  const normalized = sanitizeEmail(email);
  if (!normalized) {
    return { isValid: false, error: "Email address is required.", normalized: "" };
  }
  if (normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
    return { isValid: false, error: "Please enter a valid, deliverable email address.", normalized };
  }
  return { isValid: true, normalized };
}

export function validatePhone(phone: string): { isValid: boolean; error?: string; sanitized: string } {
  const sanitized = sanitizePhone(phone);
  if (!sanitized) {
    return { isValid: false, error: "Phone number is required.", sanitized: "" };
  }
  const cleanDigits = sanitized.replace(/\D/g, "");
  if (cleanDigits.length < 10 || cleanDigits.length > 15 || !PHONE_REGEX.test(sanitized)) {
    return {
      isValid: false,
      error: "Please enter a valid phone number (e.g. +234 801 234 5678 or 08012345678).",
      sanitized,
    };
  }
  return { isValid: true, sanitized };
}

export function validateFullName(name: string): { isValid: boolean; error?: string; sanitized: string } {
  const sanitized = sanitizeString(name);
  if (!sanitized) {
    return { isValid: false, error: "Full name is required.", sanitized: "" };
  }
  const parts = sanitized.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return { isValid: false, error: "Please enter both your first and last name.", sanitized };
  }
  if (sanitized.length < 3 || sanitized.length > 100) {
    return { isValid: false, error: "Full name must be between 3 and 100 characters.", sanitized };
  }
  return { isValid: true, sanitized };
}

export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
  strength: "weak" | "medium" | "strong";
} {
  if (!password) {
    return { isValid: false, error: "Password is required.", strength: "weak" };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long.", strength: "weak" };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;

  if (score < 3) {
    return {
      isValid: false,
      error: "Password must contain a mix of uppercase, lowercase, and numbers.",
      strength: "weak",
    };
  }

  const strength = password.length >= 12 && score === 4 ? "strong" : "medium";
  return { isValid: true, strength };
}

export interface ValidatedApplicationPayload {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCountry: string;
  studentState?: string;
  preferredContactMethod: "email" | "whatsapp" | "phone";
  courseId: string;
  courseTitle: string;
  tuitionAmount: number; // authoritative
  learningMode: LearningMode;
  branchId?: string;
  branchName?: string;
  cohort: string;
}

/**
 * Server-side / Authoritative Application Payload Validator.
 * Prevents price manipulation, invalid courses, or missing branch specifications.
 */
export function validateApplicationPayload(payload: any): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: ValidatedApplicationPayload;
} {
  const errors: Record<string, string> = {};

  const nameVal = validateFullName(payload.studentName || "");
  if (!nameVal.isValid) errors.studentName = nameVal.error!;

  const emailVal = validateEmail(payload.studentEmail || "");
  if (!emailVal.isValid) errors.studentEmail = emailVal.error!;

  const phoneVal = validatePhone(payload.studentPhone || "");
  if (!phoneVal.isValid) errors.studentPhone = phoneVal.error!;

  // Course validation & authoritative price extraction
  if (!payload.courseId) {
    errors.courseId = "A course must be selected.";
  }
  const course = getCourseById(payload.courseId);
  if (!course || !course.active) {
    errors.courseId = "Selected course is invalid or currently inactive.";
  }

  // Learning mode validation
  const learningMode: LearningMode = payload.learningMode;
  if (!learningMode || (learningMode !== "online" && learningMode !== "physical")) {
    errors.learningMode = "Please select either Online or Physical learning mode.";
  }

  // Physical branch validation
  let branchName: string | undefined;
  if (learningMode === "physical") {
    if (!payload.branchId) {
      errors.branchId = "A physical campus branch must be chosen for in-person learning.";
    } else {
      const branch = branches.find((b) => b.id === payload.branchId && b.active);
      if (!branch) {
        errors.branchId = "Selected branch is invalid or unavailable.";
      } else {
        branchName = branch.name;
      }
    }
  }

  // Cohort validation
  if (!payload.cohort || typeof payload.cohort !== "string" || !payload.cohort.trim()) {
    errors.cohort = "A cohort batch schedule must be selected.";
  }

  if (Object.keys(errors).length > 0 || !course) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    data: {
      studentName: nameVal.sanitized,
      studentEmail: emailVal.normalized,
      studentPhone: phoneVal.sanitized,
      studentCountry: sanitizeString(payload.studentCountry || "Nigeria"),
      studentState: payload.studentState ? sanitizeString(payload.studentState) : undefined,
      preferredContactMethod:
        payload.preferredContactMethod === "whatsapp" || payload.preferredContactMethod === "phone"
          ? payload.preferredContactMethod
          : "email",
      courseId: course.id,
      courseTitle: course.title,
      tuitionAmount: course.price, // Authoritative price from catalog
      learningMode,
      branchId: learningMode === "physical" ? payload.branchId : undefined,
      branchName: learningMode === "physical" ? branchName : undefined,
      cohort: sanitizeString(payload.cohort),
    },
  };
}

/**
 * Server-side validator for contact form and inquiry submissions.
 */
export function validateContactPayload(payload: any): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    courseInterest?: string;
    branchInterest?: string;
  };
} {
  const errors: Record<string, string> = {};

  const nameVal = validateFullName(payload.name || "");
  if (!nameVal.isValid) errors.name = nameVal.error!;

  const emailVal = validateEmail(payload.email || "");
  if (!emailVal.isValid) errors.email = emailVal.error!;

  const phoneVal = validatePhone(payload.phone || "");
  if (!phoneVal.isValid) errors.phone = phoneVal.error!;

  const subject = sanitizeString(payload.subject || "");
  if (!subject || subject.length < 2) {
    errors.subject = "Please enter an inquiry subject.";
  } else if (subject.length > 150) {
    errors.subject = "Subject is too long (maximum 150 characters).";
  }

  const message = sanitizeString(payload.message || "");
  if (!message || message.length < 10) {
    errors.message = "Message must contain at least 10 characters.";
  } else if (message.length > 3000) {
    errors.message = "Message cannot exceed 3,000 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      name: nameVal.sanitized,
      email: emailVal.normalized,
      phone: phoneVal.sanitized,
      subject,
      message,
      courseInterest: payload.courseInterest ? sanitizeString(payload.courseInterest) : undefined,
      branchInterest: payload.branchInterest ? sanitizeString(payload.branchInterest) : undefined,
    },
  };
}
