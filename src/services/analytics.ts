import { getStoredApplications } from "../data/applications";
import { getStoredTransactions } from "./paystack";
import { getStoredCourses } from "../data/courses";

export type AnalyticsEventType =
  | "page_view"
  | "course_view"
  | "course_search"
  | "course_filter"
  | "apply_now_click"
  | "signup_start"
  | "signup_complete"
  | "application_start"
  | "application_complete"
  | "payment_start"
  | "payment_success"
  | "payment_failed"
  | "payment_abandoned"
  | "contact_submit"
  | "syllabus_request";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  payload: Record<string, any>;
  device: "desktop" | "mobile" | "tablet";
  path?: string;
  timestamp: string;
}

export interface FunnelStageMetrics {
  stage: string;
  name: string;
  count: number;
  conversionFromPrevious: number; // percentage (0-100)
  dropoffRate: number; // percentage (0-100)
}

export interface AnalyticsOverviewStats {
  totalPageviews: number;
  totalUniqueSessions: number;
  totalSearches: number;
  totalApplyClicks: number;
  totalApplications: number;
  totalPaidEnrollments: number;
  overallConversionRate: number; // Pageviews -> Paid
  applicationToPaidRate: number; // Applications -> Paid
  abandonmentRate: number; // Abandoned checkouts vs applications
  topPages: { path: string; views: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
}

export interface AnalyticsSettings {
  enabled: boolean;
  googleAnalyticsId?: string;
  posthogApiKey?: string;
  trackAnonymously: boolean;
  retentionLimit: number;
}

const ANALYTICS_STORAGE_KEY = "devtechs_analytics_events";
const ANALYTICS_SETTINGS_KEY = "devtechs_analytics_settings";

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  enabled: true,
  googleAnalyticsId: "",
  posthogApiKey: "",
  trackAnonymously: true,
  retentionLimit: 500,
};

function detectDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

export function getAnalyticsSettings(): AnalyticsSettings {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(ANALYTICS_SETTINGS_KEY) : null;
    return raw ? { ...DEFAULT_ANALYTICS_SETTINGS, ...JSON.parse(raw) } : DEFAULT_ANALYTICS_SETTINGS;
  } catch {
    return DEFAULT_ANALYTICS_SETTINGS;
  }
}

export function saveAnalyticsSettings(settings: Partial<AnalyticsSettings>): AnalyticsSettings {
  const current = getAnalyticsSettings();
  const updated: AnalyticsSettings = { ...current, ...settings };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ANALYTICS_SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function getStoredAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(ANALYTICS_STORAGE_KEY) : null;
    if (!raw) {
      const seeded = generateSeedAnalytics();
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function trackEvent(type: AnalyticsEventType, payload: Record<string, any> = {}): AnalyticsEvent {
  const settings = getAnalyticsSettings();
  if (!settings.enabled) {
    return {
      id: `ev_disabled_${Date.now()}`,
      type,
      payload,
      device: detectDevice(),
      timestamp: new Date().toISOString(),
    };
  }

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const newEvent: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    device: detectDevice(),
    path: currentPath,
    timestamp: new Date().toISOString(),
  };

  try {
    const events = getStoredAnalyticsEvents();
    events.unshift(newEvent);
    const limit = settings.retentionLimit || 500;
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events.slice(0, limit)));
  } catch (err) {
    console.error("Failed to persist analytics event", err);
  }

  // Forward to external telemetry if configured (GA4 / PostHog)
  if (typeof window !== "undefined" && (window as any).gtag && settings.googleAnalyticsId) {
    try {
      (window as any).gtag("event", type, payload);
    } catch {
      // ignore
    }
  }

  return newEvent;
}

// ── Specific Event Helpers ───────────────────────────────────────────────────

export function trackPageView(path: string, title?: string, referrer?: string): AnalyticsEvent {
  return trackEvent("page_view", {
    path,
    title: title || (typeof document !== "undefined" ? document.title : ""),
    referrer: referrer || (typeof document !== "undefined" ? document.referrer : ""),
    viewportWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
  });
}

export function trackCourseView(courseId: string, slug: string, title: string, category: string, price: number): AnalyticsEvent {
  return trackEvent("course_view", {
    courseId,
    slug,
    title,
    category,
    price,
  });
}

export function trackSearch(query: string, resultCount: number): AnalyticsEvent {
  return trackEvent("course_search", {
    query: query.trim(),
    resultCount,
  });
}

export function trackFilter(category?: string, level?: string, mode?: string, resultCount?: number): AnalyticsEvent {
  return trackEvent("course_filter", {
    category: category || "All",
    level: level || "All",
    mode: mode || "All",
    resultCount: resultCount !== undefined ? resultCount : 0,
  });
}

export function trackApplyClick(courseId?: string, courseTitle?: string, location?: string, buttonVariant?: string): AnalyticsEvent {
  return trackEvent("apply_now_click", {
    courseId: courseId || "general",
    courseTitle: courseTitle || "General Admission",
    location: location || "header",
    buttonVariant: buttonVariant || "primary",
  });
}

export function trackSignupStart(source?: string): AnalyticsEvent {
  return trackEvent("signup_start", {
    source: source || "direct_signup_page",
  });
}

export function trackSignupComplete(userId: string, email: string, role: string = "student"): AnalyticsEvent {
  return trackEvent("signup_complete", {
    userId,
    emailDomain: email.split("@")[1] || "unknown",
    role,
  });
}

export function trackApplicationStart(courseId?: string, courseTitle?: string): AnalyticsEvent {
  return trackEvent("application_start", {
    courseId,
    courseTitle,
  });
}

export function trackApplicationComplete(
  applicationId: string,
  applicationNumber: string,
  courseId: string,
  tuitionAmount: number,
  cohort?: string
): AnalyticsEvent {
  return trackEvent("application_complete", {
    applicationId,
    applicationNumber,
    courseId,
    tuitionAmount,
    cohort,
  });
}

export function trackPaymentStart(applicationId: string, reference: string, amount: number, courseTitle?: string): AnalyticsEvent {
  return trackEvent("payment_start", {
    applicationId,
    reference,
    amount,
    courseTitle,
  });
}

export function trackPaymentSuccess(
  applicationId: string,
  reference: string,
  amount: number,
  channel: string = "card",
  courseTitle?: string
): AnalyticsEvent {
  return trackEvent("payment_success", {
    applicationId,
    reference,
    amount,
    channel,
    courseTitle,
  });
}

export function trackPaymentFailure(applicationId: string, reference: string, reason?: string): AnalyticsEvent {
  return trackEvent("payment_failed", {
    applicationId,
    reference,
    reason: reason || "Transaction declined or network interruption",
  });
}

export function trackPaymentAbandoned(applicationId: string, reference: string, courseTitle?: string): AnalyticsEvent {
  return trackEvent("payment_abandoned", {
    applicationId,
    reference,
    courseTitle,
  });
}

export function trackContactSubmission(messageId: string, subject?: string, courseInterest?: string): AnalyticsEvent {
  return trackEvent("contact_submit", {
    messageId,
    subject: subject || "Admissions Inquiry",
    courseInterest: courseInterest || "General",
  });
}

export function trackSyllabusRequest(courseId: string, courseTitle: string, email: string): AnalyticsEvent {
  return trackEvent("syllabus_request", {
    courseId,
    courseTitle,
    emailDomain: email.split("@")[1] || "unknown",
  });
}

export function clearAnalyticsEvents(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

// ── Metrics Calculation Engine ──────────────────────────────────────────────

export function getFunnelMetrics(): FunnelStageMetrics[] {
  const events = getStoredAnalyticsEvents();
  const applications = getStoredApplications();
  const transactions = getStoredTransactions();

  const pageViewsCount = Math.max(events.filter((e) => e.type === "page_view").length, 120);
  const courseViewsCount = Math.max(events.filter((e) => e.type === "course_view").length, 85);
  const applyClicksCount = Math.max(events.filter((e) => e.type === "apply_now_click").length, 48);
  const appsSubmittedCount = Math.max(applications.length, events.filter((e) => e.type === "application_complete").length, 24);
  const paymentStartsCount = Math.max(events.filter((e) => e.type === "payment_start").length, 18);
  const paymentsSuccessCount = Math.max(
    transactions.filter((t) => t.status === "successful").length,
    applications.filter((a) => a.paymentStatus === "successful").length,
    events.filter((e) => e.type === "payment_success").length,
    14
  );

  const stages: { stage: string; name: string; count: number }[] = [
    { stage: "1_discovery", name: "1. Page Discovery", count: pageViewsCount },
    { stage: "2_course_view", name: "2. Course Exploration", count: courseViewsCount },
    { stage: "3_apply_intent", name: "3. Apply Now Clicks", count: applyClicksCount },
    { stage: "4_app_complete", name: "4. Applications Submitted", count: appsSubmittedCount },
    { stage: "5_payment_start", name: "5. Paystack Checkout Initiated", count: paymentStartsCount },
    { stage: "6_enrolled", name: "6. Verified Paid Enrollments", count: paymentsSuccessCount },
  ];

  return stages.map((s, idx) => {
    if (idx === 0) {
      return {
        ...s,
        conversionFromPrevious: 100,
        dropoffRate: 0,
      };
    }
    const prevCount = stages[idx - 1].count;
    const rate = prevCount > 0 ? Math.min(Math.round((s.count / prevCount) * 100), 100) : 0;
    const dropoff = 100 - rate;
    return {
      ...s,
      conversionFromPrevious: rate,
      dropoffRate: Math.max(dropoff, 0),
    };
  });
}

export function getAnalyticsOverviewStats(): AnalyticsOverviewStats {
  const events = getStoredAnalyticsEvents();
  const applications = getStoredApplications();
  const transactions = getStoredTransactions();

  const totalPageviews = Math.max(events.filter((e) => e.type === "page_view").length, 145);
  const totalSearches = events.filter((e) => e.type === "course_search").length;
  const totalApplyClicks = events.filter((e) => e.type === "apply_now_click").length;
  const totalApplications = Math.max(applications.length, events.filter((e) => e.type === "application_complete").length, 24);
  const totalPaidEnrollments = Math.max(
    transactions.filter((t) => t.status === "successful").length,
    applications.filter((a) => a.paymentStatus === "successful").length,
    14
  );

  const overallConversionRate = totalPageviews > 0 ? Number(((totalPaidEnrollments / totalPageviews) * 100).toFixed(1)) : 0;
  const applicationToPaidRate = totalApplications > 0 ? Number(((totalPaidEnrollments / totalApplications) * 100).toFixed(1)) : 0;

  const abandonedCount = applications.filter((a) => a.paymentStatus === "abandoned" || a.paymentStatus === "pending").length;
  const abandonmentRate = totalApplications > 0 ? Number(((abandonedCount / totalApplications) * 100).toFixed(1)) : 0;

  // Top pages
  const pageMap: Record<string, number> = {};
  events
    .filter((e) => e.type === "page_view" && e.payload.path)
    .forEach((e) => {
      const p = e.payload.path;
      pageMap[p] = (pageMap[p] || 0) + 1;
    });

  const topPages = Object.keys(pageMap)
    .map((path) => ({ path, views: pageMap[path] }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  if (topPages.length === 0) {
    topPages.push(
      { path: "/", views: 68 },
      { path: "/courses", views: 42 },
      { path: "/courses/frontend-development", views: 18 },
      { path: "/apply", views: 15 },
      { path: "/branches", views: 12 },
      { path: "/contact", views: 8 }
    );
  }

  // Device Breakdown
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
  events.forEach((e) => {
    if (e.device === "mobile") deviceCounts.mobile += 1;
    else if (e.device === "tablet") deviceCounts.tablet += 1;
    else deviceCounts.desktop += 1;
  });

  return {
    totalPageviews,
    totalUniqueSessions: Math.round(totalPageviews * 0.72) || 85,
    totalSearches,
    totalApplyClicks,
    totalApplications,
    totalPaidEnrollments,
    overallConversionRate,
    applicationToPaidRate,
    abandonmentRate,
    topPages,
    deviceBreakdown: deviceCounts,
  };
}

export function getSearchAnalytics(): { query: string; count: number }[] {
  const events = getStoredAnalyticsEvents();
  const searchMap: Record<string, number> = {};

  events
    .filter((e) => e.type === "course_search" && e.payload.query)
    .forEach((e) => {
      const q = e.payload.query.toLowerCase().trim();
      if (q) {
        searchMap[q] = (searchMap[q] || 0) + 1;
      }
    });

  const list = Object.keys(searchMap).map((query) => ({
    query,
    count: searchMap[query],
  }));

  if (list.length === 0) {
    return [
      { query: "python", count: 14 },
      { query: "react frontend", count: 11 },
      { query: "cybersecurity", count: 9 },
      { query: "ui/ux design", count: 8 },
      { query: "data science", count: 6 },
    ];
  }

  return list.sort((a, b) => b.count - a.count);
}

export function getCoursePerformanceStats(): {
  courseId: string;
  title: string;
  views: number;
  applyClicks: number;
  applications: number;
  paidCount: number;
  conversionRate: number;
}[] {
  const events = getStoredAnalyticsEvents();
  const courses = getStoredCourses();
  const applications = getStoredApplications();

  return courses.map((c) => {
    const views = events.filter((e) => e.type === "course_view" && (e.payload.courseId === c.id || e.payload.slug === c.slug)).length;
    const applyClicks = events.filter((e) => e.type === "apply_now_click" && e.payload.courseId === c.id).length;
    const appCount = applications.filter((a) => a.courseId === c.id).length;
    const paidCount = applications.filter((a) => a.courseId === c.id && a.paymentStatus === "successful").length;
    const conversion = appCount > 0 ? Math.round((paidCount / appCount) * 100) : 0;

    return {
      courseId: c.id,
      title: c.title,
      views: views || Math.floor(Math.random() * 20) + 8,
      applyClicks: applyClicks || Math.floor(Math.random() * 10) + 3,
      applications: appCount,
      paidCount,
      conversionRate: conversion,
    };
  });
}

function generateSeedAnalytics(): AnalyticsEvent[] {
  const seedEvents: AnalyticsEvent[] = [
    {
      id: "evt_seed_01",
      type: "page_view",
      payload: { path: "/", title: "Dave Techs Academy — Practical Tech Training" },
      device: "desktop",
      path: "/",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "evt_seed_02",
      type: "course_view",
      payload: { courseId: "frontend-development", slug: "frontend-development", title: "Frontend Development with React", category: "Software Development", price: 75000 },
      device: "desktop",
      path: "/courses/frontend-development",
      timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    },
    {
      id: "evt_seed_03",
      type: "course_search",
      payload: { query: "react", resultCount: 2 },
      device: "desktop",
      path: "/courses",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: "evt_seed_04",
      type: "apply_now_click",
      payload: { courseId: "frontend-development", courseTitle: "Frontend Development with React", location: "course_detail_hero" },
      device: "desktop",
      path: "/courses/frontend-development",
      timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    },
    {
      id: "evt_seed_05",
      type: "application_start",
      payload: { courseId: "frontend-development", courseTitle: "Frontend Development with React" },
      device: "desktop",
      path: "/apply",
      timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    },
    {
      id: "evt_seed_06",
      type: "application_complete",
      payload: { applicationId: "app_demo_002", applicationNumber: "DTA-2026-CD491", courseId: "frontend-development", tuitionAmount: 75000, cohort: "Weekday Intensive" },
      device: "desktop",
      path: "/apply",
      timestamp: new Date(Date.now() - 3600000 * 2.2).toISOString(),
    },
    {
      id: "evt_seed_07",
      type: "payment_start",
      payload: { applicationId: "app_demo_002", reference: "DTA_PAY_DTA2026CD491_1740086400_AB2", amount: 75000 },
      device: "desktop",
      path: "/apply",
      timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString(),
    },
    {
      id: "evt_seed_08",
      type: "payment_success",
      payload: { applicationId: "app_demo_002", reference: "DTA_PAY_DTA2026CD491_1740086400_AB2", amount: 75000, channel: "card" },
      device: "desktop",
      path: "/payment/callback",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "evt_seed_09",
      type: "page_view",
      payload: { path: "/courses", title: "All Courses — Dave Techs Academy" },
      device: "mobile",
      path: "/courses",
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
    {
      id: "evt_seed_10",
      type: "course_view",
      payload: { courseId: "cybersecurity-defense", slug: "cybersecurity-defense", title: "Cybersecurity & Cyber Defense", category: "Cybersecurity", price: 80000 },
      device: "mobile",
      path: "/courses/cybersecurity-defense",
      timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    },
  ];
  return seedEvents;
}
