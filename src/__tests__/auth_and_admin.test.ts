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
