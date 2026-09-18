import { describe, it, expect, beforeEach } from "vitest";
import {
  generatePaymentReference,
  checkPaymentInitializationAllowed,
  verifyPayment,
  recordFailedOrAbandonedPayment,
  getStoredTransactions,
  PAYSTACK_PUBLIC_KEY,
} from "../services/paystack";
import { saveApplication, getApplicationById } from "../data/applications";
import { getCourseById } from "../data/courses";
import type { Application } from "../types";

describe("Paystack Payment Lifecycle & Verification Edge Cases", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should have a valid public key configured and never expose secret keys", () => {
    expect(PAYSTACK_PUBLIC_KEY).toBeTruthy();
    expect(PAYSTACK_PUBLIC_KEY.startsWith("pk_")).toBe(true);
    expect(PAYSTACK_PUBLIC_KEY.startsWith("sk_")).toBe(false);
  });

  it("should generate secure, unique payment references", () => {
    const ref1 = generatePaymentReference("app_001");
    const ref2 = generatePaymentReference("app_001");
    expect(ref1).toMatch(/^DTA_PAY_app001_\d+_[A-Z0-9]+$/);
    expect(ref2).toMatch(/^DTA_PAY_app001_\d+_[A-Z0-9]+$/);
    expect(ref1).not.toEqual(ref2);
  });

  it("should allow initialization within rate limits", () => {
    const check = checkPaymentInitializationAllowed();
    expect(check.allowed).toBe(true);
  });

  it("should verify valid payment and update application atomically with authoritative fee", async () => {
    const authoritativeCourse = getCourseById("frontend-development")!;
    expect(authoritativeCourse).toBeDefined();

    const mockApp: Application = {
      id: "app_test_1",
      applicationNumber: "DTA-2026-0001",
      studentId: "student_1",
      studentName: "Test Student",
      studentEmail: "student@devtechs.ng",
      studentPhone: "+2348012345678",
      courseId: authoritativeCourse.id,
      courseTitle: authoritativeCourse.title,
      tuitionAmount: authoritativeCourse.price,
      learningMode: "online",
      cohort: "Morning Cohort",
      paymentStatus: "pending",
      applicationStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    saveApplication(mockApp);

    const ref = generatePaymentReference(mockApp.id);
    const result = await verifyPayment(ref, mockApp.id);

    expect(result.success).toBe(true);
    expect(result.application?.paymentStatus).toBe("successful");
    expect(result.application?.applicationStatus).toBe("confirmed");
    expect(result.transaction).toBeDefined();
    expect(result.transaction?.amount).toBe(authoritativeCourse.price);

    const storedApp = getApplicationById(mockApp.id);
    expect(storedApp?.paymentStatus).toBe("successful");

    const txs = getStoredTransactions();
    expect(txs.some((t) => t.reference === ref)).toBe(true);
  });

  it("should handle duplicate payment callback idempotently without double recording (Edge Case: Duplicate callback)", async () => {
    const authoritativeCourse = getCourseById("frontend-development")!;
    const mockApp: Application = {
      id: "app_test_dup",
      applicationNumber: "DTA-2026-0002",
      studentId: "student_2",
      studentName: "Dup Student",
      studentEmail: "dup@devtechs.ng",
      studentPhone: "+2348012345678",
      courseId: authoritativeCourse.id,
      courseTitle: authoritativeCourse.title,
      tuitionAmount: authoritativeCourse.price,
      learningMode: "online",
      cohort: "Morning Cohort",
      paymentStatus: "pending",
      applicationStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    saveApplication(mockApp);

    const ref = generatePaymentReference(mockApp.id);
    
    // First verification
    const res1 = await verifyPayment(ref, mockApp.id);
    expect(res1.success).toBe(true);

    const txCountAfterFirst = getStoredTransactions().length;

    // Second (duplicate/replay) verification
    const res2 = await verifyPayment(ref, mockApp.id);
    expect(res2.success).toBe(true);
    expect(res2.message).toContain("already been verified");

    // Transactions count should not increase
    const txCountAfterSecond = getStoredTransactions().length;
    expect(txCountAfterSecond).toBe(txCountAfterFirst);
  });

  it("should record failed and abandoned payments properly (Edge Cases: Payment cancelled / failed)", () => {
    const mockApp: Application = {
      id: "app_test_fail",
      applicationNumber: "DTA-2026-0003",
      studentId: "student_3",
      studentName: "Failed Student",
      studentEmail: "fail@devtechs.ng",
      studentPhone: "+2348012345678",
      courseId: "frontend-development",
      courseTitle: "Frontend Web Development",
      tuitionAmount: 46000,
      learningMode: "online",
      cohort: "Morning Cohort",
      paymentStatus: "pending",
      applicationStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    saveApplication(mockApp);

    // Record user cancelled / abandoned
    recordFailedOrAbandonedPayment(mockApp.id, "ref_abandoned_1", "abandoned");
    let app = getApplicationById(mockApp.id);
    expect(app?.paymentStatus).toBe("abandoned");

    // Record gateway failed
    recordFailedOrAbandonedPayment(mockApp.id, "ref_failed_1", "failed");
    app = getApplicationById(mockApp.id);
    expect(app?.paymentStatus).toBe("failed");
  });

  it("should reject verification for non-existent application", async () => {
    const res = await verifyPayment("ref_any_123", "non-existent-app-id");
    expect(res.success).toBe(false);
    expect(res.message).toContain("Application record not found");
  });
});
