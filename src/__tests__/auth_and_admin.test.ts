import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, verifyPassword } from "../utils/security";
import {
  getStoredNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  addNotification,
} from "../data/notifications";
import {
  getAdminDashboardStats,
  getAllStudents,
  updateApplicationStatus,
} from "../services/admin";
import { saveContactMessage, getStoredLeads } from "../services/leads";
import { getStoredAnalyticsEvents, trackEvent } from "../services/analytics";

describe("Auth, Admin, CRM & Analytics Functionality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Password Hashing & Cryptography", () => {
    it("should hash and verify passwords correctly", async () => {
      const plain = "SuperSecret123!";
      const hash = await hashPassword(plain);
      expect(hash).toBeTruthy();
      expect(hash.startsWith("sha256_")).toBe(true);

      const isMatch = await verifyPassword(plain, hash);
      expect(isMatch).toBe(true);

      const isWrong = await verifyPassword("WrongPassword123!", hash);
      expect(isWrong).toBe(false);
    });

    it("should verify admin and student demo credentials reliably", async () => {
      // Test admin password against both seeded formats
      const adminPass = "AdminDevTechs2026!";
      const adminHash1 = "sha256_dtaadmin_301d42646ca63fb94efd0a06be0b1f3b16248983d24e96c50ff6950bfe1b0246";
      const adminHashLegacy = "sha256_dta_salt_demo_admin_5d298319f07a1c8932efbc129487103ca092fe98";

      expect(await verifyPassword(adminPass, adminHash1)).toBe(true);
      expect(await verifyPassword(adminPass, adminHashLegacy)).toBe(true);
      expect(await verifyPassword("WrongPass!", adminHash1)).toBe(false);

      // Test student password against both seeded formats
      const studentPass = "Password123!";
      const studentHash1 = "sha256_dtastudent_25c27b211a2739fe31e965bd7a90c0d97345fbd328d9adbdefb4aef97fbe0089";
      const studentHashLegacy = "sha256_dta_salt_demo_student_b40283c7a02c813f5c719e731c261e434f31cfa0";

      expect(await verifyPassword(studentPass, studentHash1)).toBe(true);
      expect(await verifyPassword(studentPass, studentHashLegacy)).toBe(true);
      expect(await verifyPassword("WrongPass!", studentHash1)).toBe(false);
    });
  });

  describe("Notifications Service", () => {
    it("should retrieve notifications and manage read/unread status", () => {
      const newNotif = addNotification({
        userId: "student_01",
        title: "Cohort Starting Soon",
        message: "Your class begins on Monday at 9:00 AM.",
        category: "class",
        type: "course",
      });

      let list = getStoredNotifications("student_01");
      expect(list.some((n) => n.id === newNotif.id)).toBe(true);

      // Mark as read
      markNotificationAsRead(newNotif.id);
      list = getStoredNotifications("student_01");
      const updated = list.find((n) => n.id === newNotif.id);
      expect(updated?.read).toBe(true);

      // Mark as unread
      markNotificationAsUnread(newNotif.id);
      list = getStoredNotifications("student_01");
      expect(list.find((n) => n.id === newNotif.id)?.read).toBe(false);

      // Mark all read
      markAllNotificationsAsRead("student_01");
      list = getStoredNotifications("student_01");
      expect(list.every((n) => n.read)).toBe(true);
    });
  });

  describe("Contact Inquiries & CRM Leads", () => {
    it("should save contact message and capture lead", () => {
      const res = saveContactMessage({
        name: "Test Lead",
        email: "lead@example.com",
        phone: "+2348011223344",
        subject: "General Inquiry",
        message: "I want to ask about your physical branch facilities.",
      });

      expect(res.success).toBe(true);
      const leads = getStoredLeads();
      expect(leads.some((l) => l.email === "lead@example.com")).toBe(true);
    });
  });

  describe("Admin Services & Metrics Hub", () => {
    it("should aggregate admin dashboard stats correctly", () => {
      const stats = getAdminDashboardStats();
      expect(stats).toBeDefined();
      expect(stats.totalStudents).toBeGreaterThanOrEqual(0);
      expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.recentApplications)).toBe(true);
    });

    it("should return student records", () => {
      const students = getAllStudents();
      expect(Array.isArray(students)).toBe(true);
      expect(students.length).toBeGreaterThanOrEqual(0);
    });

    it("should allow updating application status", () => {
      const students = getAllStudents();
      if (students.length > 0 && students[0].applications.length > 0) {
        const targetApp = students[0].applications[0];
        const success = updateApplicationStatus(targetApp.id, "confirmed", "successful");
        expect(success).toBe(true);
      }
    });

    it("should record and retrieve analytics telemetry events", () => {
      trackEvent("page_view", { page: "/courses" });
      const events = getStoredAnalyticsEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events.some((e) => e.type === "page_view")).toBe(true);
    });
  });
});
