import type { Notification } from "../types";

const NOTIFICATIONS_STORAGE_KEY = "devtechs_notifications_store";

export interface StudentNotification extends Notification {
  userId?: string;
  category?: "announcement" | "payment" | "class" | "application";
  actionUrl?: string;
}

const DEFAULT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: "notif-1",
    type: "announcement",
    category: "announcement",
    title: "Welcome to Dave Techs Academy! 🎉",
    message: "Welcome to the academy. Complete your course applications and prepare for interactive hands-on training.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    actionUrl: "/dashboard/courses",
  },
  {
    id: "notif-2",
    type: "course",
    category: "class",
    title: "Upcoming Orientation Session ⏰",
    message: "New Cohort Orientation session is scheduled for Saturday at 10:00 AM via Google Meet and at Physical Hubs.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    actionUrl: "/dashboard/courses",
  },
  {
    id: "notif-3",
    type: "payment",
    category: "payment",
    title: "Paystack Payment System Active 💳",
    message: "Tuition payments can now be completed securely via Card, Bank Transfer, or USSD.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    actionUrl: "/dashboard/payments",
  },
];

export function getStoredNotifications(userId?: string): StudentNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const all: StudentNotification[] = JSON.parse(raw);
    if (userId) {
      return all.filter((n) => !n.userId || n.userId === userId);
    }
    return all;
  } catch (err) {
    console.error("Failed to load notifications", err);
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: StudentNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (err) {
    console.error("Failed to save notifications", err);
  }
}

export function markNotificationAsRead(id: string): void {
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveStoredNotifications(updated);
}

export function markNotificationAsUnread(id: string): void {
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: false } : n));
  saveStoredNotifications(updated);
}

export function markAllNotificationsAsRead(userId?: string): void {
  const notifs = getStoredNotifications();
  const updated = notifs.map((n) => {
    if (!userId || !n.userId || n.userId === userId) {
      return { ...n, read: true };
    }
    return n;
  });
  saveStoredNotifications(updated);
}

export function deleteStoredNotification(id: string): void {
  const notifs = getStoredNotifications();
  const filtered = notifs.filter((n) => n.id !== id);
  saveStoredNotifications(filtered);
}

export function addNotification(
  notif: Omit<StudentNotification, "id" | "createdAt" | "read">
): StudentNotification {
  const notifs = getStoredNotifications();
  const newNotif: StudentNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifs.unshift(newNotif);
  saveStoredNotifications(notifs);
  return newNotif;
}

export function getUnreadNotificationCount(userId?: string): number {
  const notifs = getStoredNotifications(userId);
  return notifs.filter((n) => !n.read).length;
}
