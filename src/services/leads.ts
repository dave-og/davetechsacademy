import type { ContactMessage, Lead } from "../types";
import { checkRateLimit, recordRateLimitAttempt } from "../utils/rateLimiter";
import { validateContactPayload } from "../utils/validation";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "../utils/security";

const CONTACT_MESSAGES_KEY = "devtechs_contact_messages";
const CRM_LEADS_KEY = "devtechs_crm_leads";

export function getStoredContactMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(CONTACT_MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read contact messages", err);
    return [];
  }
}

export function saveContactMessage(
  data: Omit<ContactMessage, "id" | "createdAt">
): { success: boolean; messageId?: string; error?: string } {
  // 1. Rate Limiting Check
  const rateCheck = checkRateLimit("contact:submit");
  if (!rateCheck.allowed) {
    return { success: false, error: rateCheck.message };
  }

  // 2. Server-side / Service Validation
  const validation = validateContactPayload(data);
  if (!validation.isValid || !validation.sanitized) {
    const firstErr = Object.values(validation.errors)[0] || "Invalid submission data.";
    return { success: false, error: firstErr };
  }

  recordRateLimitAttempt("contact:submit");

  try {
    const messages = getStoredContactMessages();
    const newMsg: ContactMessage = {
      ...validation.sanitized,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    messages.unshift(newMsg);
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));

    // Also register or update as a CRM Lead
    captureLead({
      name: validation.sanitized.name,
      email: validation.sanitized.email,
      phone: validation.sanitized.phone,
      courseInterest: validation.sanitized.courseInterest,
      branchInterest: validation.sanitized.branchInterest,
      source: "contact_page",
      signupDate: new Date().toISOString(),
    });

    return { success: true, messageId: newMsg.id };
  } catch (err) {
    console.error("Failed to save contact message", err);
    return { success: false, error: "Failed to persist contact message." };
  }
}

export function getStoredLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(CRM_LEADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to load CRM leads", err);
    return [];
  }
}

export function captureLead(
  leadData: Partial<Lead> & { email: string; name: string; phone?: string }
): Lead {
  const leads = getStoredLeads();
  const emailNorm = sanitizeEmail(leadData.email);
  const existingIndex = leads.findIndex((l) => l.email.toLowerCase() === emailNorm);

  let finalLead: Lead;

  if (existingIndex !== -1) {
    finalLead = {
      ...leads[existingIndex],
      ...leadData,
      name: sanitizeString(leadData.name || leads[existingIndex].name),
      email: emailNorm,
      phone: leadData.phone ? sanitizePhone(leadData.phone) : leads[existingIndex].phone,
      crmSynced: true,
    };
    leads[existingIndex] = finalLead;
  } else {
    finalLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: sanitizeString(leadData.name),
      email: emailNorm,
      phone: sanitizePhone(leadData.phone || ""),
      courseId: leadData.courseId ? sanitizeString(leadData.courseId) : undefined,
      courseInterest: leadData.courseInterest ? sanitizeString(leadData.courseInterest) : undefined,
      learningMode: leadData.learningMode || "online",
      branchId: leadData.branchId ? sanitizeString(leadData.branchId) : undefined,
      branchName: leadData.branchName ? sanitizeString(leadData.branchName) : undefined,
      cohortInterest: leadData.cohortInterest ? sanitizeString(leadData.cohortInterest) : undefined,
      source: sanitizeString(leadData.source || "web_visitor"),
      signupDate: leadData.signupDate || new Date().toISOString(),
      applicationStatus: leadData.applicationStatus || "inquired",
      paymentStatus: leadData.paymentStatus || "pending",
      crmSynced: true,
    };
    leads.unshift(finalLead);
  }

  try {
    localStorage.setItem(CRM_LEADS_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error("Failed to save CRM lead", err);
  }

  return finalLead;
}

/**
 * Tracks course-specific lead interest whenever a visitor expresses interest in a skill.
 */
export function trackCourseInterest(
  email: string,
  courseId: string,
  courseTitle: string,
  name?: string,
  phone?: string
): void {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return;

  captureLead({
    email: cleanEmail,
    name: sanitizeString(name || "Prospective Student"),
    phone: sanitizePhone(phone || ""),
    courseId: sanitizeString(courseId),
    courseInterest: sanitizeString(courseTitle),
    source: "course_interest_cta",
    signupDate: new Date().toISOString(),
  });
}
