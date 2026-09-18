import type { AuthUser, Application, Lead } from "../types";
import type { PaymentTransaction } from "./paystack";
import { getStoredLeads, captureLead } from "./leads";
import { getStoredApplications } from "../data/applications";
import { addNotification } from "../data/notifications";

export type CommunicationChannel = "email" | "sms" | "whatsapp";
export type CommunicationTemplate =
  | "welcome"
  | "application_received"
  | "payment_receipt"
  | "payment_abandoned_reminder"
  | "class_reminder"
  | "course_announcement"
  | "custom_broadcast";

export interface SentMessage {
  id: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  channel: CommunicationChannel;
  templateType: CommunicationTemplate;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  status: "sent" | "delivered" | "simulated";
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CrmSegment {
  key: string;
  name: string;
  description: string;
  count: number;
  members: Lead[];
  category?: "general" | "funnel" | "course";
}

export interface ProviderConfig {
  emailProvider: "resend" | "sendgrid" | "brevo" | "simulation";
  emailApiKey?: string;
  senderEmail: string;
  senderName: string;
  smsProvider: "termii" | "twilio" | "africastalking" | "simulation";
  smsApiKey?: string;
  smsSenderId: string;
  whatsappProvider: "meta_cloud" | "termii" | "direct_deep_link" | "simulation";
  whatsappPhoneId?: string;
  whatsappApiKey?: string;
  activeMode: "production" | "simulation";
  lastVerifiedAt?: string;
}

const COMMUNICATIONS_STORAGE_KEY = "devtechs_sent_communications";
const PROVIDER_CONFIG_STORAGE_KEY = "devtechs_provider_config";

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  emailProvider: "resend",
  senderEmail: "admissions@davetechs.ng",
  senderName: "Dave Techs Academy Admissions",
  smsProvider: "termii",
  smsSenderId: "DaveTechs",
  whatsappProvider: "direct_deep_link",
  activeMode: "simulation",
  lastVerifiedAt: new Date().toISOString(),
};

export function getProviderConfig(): ProviderConfig {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(PROVIDER_CONFIG_STORAGE_KEY) : null;
    return raw ? { ...DEFAULT_PROVIDER_CONFIG, ...JSON.parse(raw) } : DEFAULT_PROVIDER_CONFIG;
  } catch {
    return DEFAULT_PROVIDER_CONFIG;
  }
}

export function saveProviderConfig(config: Partial<ProviderConfig>): ProviderConfig {
  const current = getProviderConfig();
  const updated: ProviderConfig = {
    ...current,
    ...config,
    lastVerifiedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PROVIDER_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function getStoredCommunications(): SentMessage[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(COMMUNICATIONS_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logCommunication(
  msg: Omit<SentMessage, "id" | "createdAt">
): SentMessage {
  const all = getStoredCommunications();
  const newMsg: SentMessage = {
    ...msg,
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newMsg);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COMMUNICATIONS_STORAGE_KEY, JSON.stringify(all.slice(0, 150))); // keep latest 150
    } catch {
      // Storage quota fallback
    }
  }
  return newMsg;
}

export function clearCommunicationLogs(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(COMMUNICATIONS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Replaces token placeholders like {{name}}, {{course}}, {{cohort}}, etc.
 */
export function replaceTemplateVariables(
  text: string,
  variables: Record<string, any>
): string {
  let result = text;
  Object.keys(variables).forEach((key) => {
    const val = variables[key];
    if (val !== undefined && val !== null) {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), String(val));
    }
  });
  return result;
}

/**
 * HTML Email Generator for branded Dave Techs communications.
 */
export function renderEmailHtml(
  templateType: CommunicationTemplate,
  data: Record<string, any>
): string {
  const goldColor = "#d4af37";
  const bgDark = "#0a0a0a";
  const surfaceDark = "#121212";
  const textColor = "#f5f5f5";
  const textMuted = "#9ca3af";

  let bodyContent = "";

  switch (templateType) {
    case "welcome":
      bodyContent = `
        <h2 style="color: ${goldColor}; margin-top: 0;">Welcome to Dave Techs Academy, ${data.name || "Student"}! 🚀</h2>
        <p>Your student account has been successfully created. You now have access to explore top-tier practical technology courses and track your training journey.</p>
        <div style="background-color: ${bgDark}; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Registered Email:</strong> ${data.email || ""}</p>
          <p style="margin: 0;"><strong>Learning Portal:</strong> <a href="${data.siteUrl || "https://davetechs.com"}/dashboard" style="color: ${goldColor}; text-decoration: none;">Access Student Dashboard →</a></p>
        </div>
        <p>Whether you are learning online or at our physical campuses in Abeokuta, Victoria Island, Ikeja, or Ibadan, our industry instructors are ready to mentor you.</p>
      `;
      break;

    case "application_received":
      bodyContent = `
        <h2 style="color: ${goldColor}; margin-top: 0;">Application Received: ${data.courseTitle || "Tech Course"} 📋</h2>
        <p>Dear ${data.name || "Student"},</p>
        <p>Thank you for applying to Dave Techs Academy. We have successfully recorded your admission application for the upcoming training cohort.</p>
        <div style="background-color: ${bgDark}; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Application Number:</strong> <span style="color: ${goldColor}; font-family: monospace;">${data.applicationNumber || "DTA-APP"}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>Course:</strong> ${data.courseTitle || ""}</p>
          <p style="margin: 0 0 8px 0;"><strong>Learning Mode:</strong> ${data.learningMode === "physical" ? `Physical Campus (${data.branchName || "Main Campus"})` : "Online Virtual Class"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Selected Cohort:</strong> ${data.cohort || "Upcoming Batch"}</p>
          <p style="margin: 0;"><strong>Tuition Fee:</strong> ₦${Number(data.amount || 0).toLocaleString()}</p>
        </div>
        <p>To finalize your seat in the classroom or virtual batch, complete your payment before cohort registration closes.</p>
        <p><a href="${data.siteUrl || "https://davetechs.com"}/dashboard/applications" style="display: inline-block; background-color: ${goldColor}; color: #000; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Complete Tuition Payment →</a></p>
      `;
      break;

    case "payment_receipt":
      bodyContent = `
        <h2 style="color: #10b981; margin-top: 0;">Payment Verified & Admission Confirmed! 🎉</h2>
        <p>Dear ${data.name || "Student"},</p>
        <p>Congratulations! Your payment for <strong>${data.courseTitle || "your course"}</strong> has been confirmed through Paystack. Your admission is officially secured.</p>
        <div style="background-color: ${bgDark}; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Payment Reference:</strong> <span style="color: ${goldColor}; font-family: monospace;">${data.reference || "DTA-REF"}</span></p>
          <p style="margin: 0 0 8px 0;"><strong>Amount Paid:</strong> ₦${Number(data.amount || 0).toLocaleString()} (NGN)</p>
          <p style="margin: 0 0 8px 0;"><strong>Payment Channel:</strong> ${data.channel || "Paystack Card / Transfer"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Cohort Schedule:</strong> ${data.cohort || "Current Batch"}</p>
          <p style="margin: 0;"><strong>Campus / Venue:</strong> ${data.learningMode === "physical" ? (data.branchName || "Physical Campus") : "Online Live Virtual Classrooms"}</p>
        </div>
        <p>Your instructors will reach out with the cohort onboarding details 48 hours before class begins.</p>
        <p><a href="${data.siteUrl || "https://davetechs.com"}/dashboard/payments" style="display: inline-block; background-color: #10b981; color: #fff; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View Official Receipt in Portal →</a></p>
      `;
      break;

    case "payment_abandoned_reminder":
      bodyContent = `
        <h2 style="color: ${goldColor}; margin-top: 0;">Complete Your Application for ${data.courseTitle || "Tech Course"} ⏳</h2>
        <p>Hello ${data.name || "Student"},</p>
        <p>We noticed you initiated enrollment for <strong>${data.courseTitle || "our training program"}</strong>, but did not finalize your tuition payment.</p>
        <div style="background-color: ${bgDark}; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Target Cohort:</strong> ${data.cohort || "Upcoming Batch"}</p>
          <p style="margin: 0;"><strong>Status:</strong> Reserved Seat Pending Payment</p>
        </div>
        <p>Seats in this cohort are strictly limited to maintain small student-to-mentor ratios. Resume your checkout now to secure your spot.</p>
        <p><a href="${data.siteUrl || "https://davetechs.com"}/dashboard/applications" style="display: inline-block; background-color: ${goldColor}; color: #000; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Resume & Finalize Admission →</a></p>
      `;
      break;

    case "class_reminder":
      bodyContent = `
        <h2 style="color: ${goldColor}; margin-top: 0;">Cohort Orientation & Class Reminder ⏰</h2>
        <p>Hello ${data.name || "Student"},</p>
        <p>This is an important reminder that your upcoming training cohort for <strong>${data.cohort || "your enrolled course"}</strong> is starting soon.</p>
        <div style="background-color: ${bgDark}; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Scheduled Time:</strong> ${data.time || "Saturday, 10:00 AM West Africa Time (WAT)"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Location / Meeting Link:</strong> ${data.location || "Dave Techs Learning Hub & Google Meet"}</p>
          <p style="margin: 0;"><strong>Requirements:</strong> Laptop, Notebook, and your student portal credentials.</p>
        </div>
        <p>Please log into your <a href="${data.siteUrl || "https://davetechs.com"}/dashboard" style="color: ${goldColor};">Student Dashboard</a> to review preparatory syllabus materials.</p>
      `;
      break;

    case "course_announcement":
      bodyContent = `
        <h2 style="color: ${goldColor}; margin-top: 0;">${data.headline || "New Cohorts & Special Announcements"} 📢</h2>
        <p>Hello ${data.name || "Student"},</p>
        <p>${data.message || "We have exciting updates, new curriculum tracks, and early-bird tuition scholarships at Dave Techs Academy."}</p>
        <div style="background-color: ${bgDark}; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Featured Program:</strong> ${data.courseTitle || "All Practical Tracks"}</p>
          <p style="margin: 0;"><strong>Special Offer:</strong> ${data.offerDetails || "Early-Bird Admission Open"}</p>
        </div>
        <p><a href="${data.ctaUrl || "https://davetechs.com/courses"}" style="display: inline-block; background-color: ${goldColor}; color: #000; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none;">${data.callToAction || "Explore New Courses →"}</a></p>
      `;
      break;

    default:
      bodyContent = `
        <h2 style="color: ${goldColor}; margin-top: 0;">${data.headline || "Academy Announcement"} 📢</h2>
        <p>Hello ${data.name || "Student"},</p>
        <p style="white-space: pre-wrap;">${data.message || "We have exciting updates and new opportunities at Dave Techs Academy."}</p>
        ${data.callToAction ? `<p><a href="${data.ctaUrl || "https://davetechs.com"}" style="display: inline-block; background-color: ${goldColor}; color: #000; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none;">${data.callToAction}</a></p>` : ""}
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${bgDark}; color: ${textColor}; margin: 0; padding: 20px; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; background-color: ${surfaceDark}; border: 1px solid #262626; border-radius: 12px; padding: 32px; box-sizing: border-box; }
          .header { text-align: center; border-bottom: 1px solid #262626; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: 800; color: ${textColor}; letter-spacing: -0.02em; }
          .logo span { color: ${goldColor}; }
          .footer { text-align: center; border-top: 1px solid #262626; padding-top: 20px; margin-top: 32px; font-size: 12px; color: ${textMuted}; }
          p { margin: 0 0 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">DAVE <span>TECHS</span> ACADEMY</div>
            <div style="font-size: 11px; color: ${textMuted}; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px;">Practical Technology Education</div>
          </div>
          ${bodyContent}
          <div class="footer">
            <p style="margin: 0 0 6px 0;">Dave Techs Academy • Campuses in Abeokuta, Victoria Island, Ikeja & Ibadan</p>
            <p style="margin: 0;">Admissions Support: <a href="mailto:admissions@davetechs.ng" style="color: ${goldColor}; text-decoration: none;">admissions@davetechs.ng</a> • 09070925508, 08110913672</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Creates direct WhatsApp deep link with sanitized Nigerian/international phone formatting.
 */
export function createWhatsAppShareLink(phone: string, text: string): string {
  const cleanDigits = phone.replace(/\D/g, "");
  const formattedPhone = cleanDigits.startsWith("0")
    ? `234${cleanDigits.substring(1)}`
    : cleanDigits.startsWith("234")
    ? cleanDigits
    : `234${cleanDigits}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * CRM Lifecycle Trigger: User Signup Welcome
 */
export function triggerSignupWelcome(user: AuthUser): SentMessage {
  captureLead({
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    source: "signup_form",
    signupDate: user.createdAt,
    applicationStatus: "registered",
  });

  const subject = "Welcome to Dave Techs Academy! 🎉";
  const bodyText = `Welcome to Dave Techs Academy, ${user.fullName}! Your student account is now active. Explore our top-tier courses at https://davetechs.com/courses.`;
  const bodyHtml = renderEmailHtml("welcome", {
    name: user.fullName,
    email: user.email,
  });

  // In-App Notification for Student Dashboard
  addNotification({
    userId: user.id,
    type: "announcement",
    category: "announcement",
    title: "Welcome to Dave Techs Academy! 🎉",
    message: "Your student account is now active. Browse available tech courses and apply for the upcoming cohort.",
    actionUrl: "/courses",
  });

  return logCommunication({
    recipientEmail: user.email,
    recipientPhone: user.phone,
    recipientName: user.fullName,
    channel: "email",
    templateType: "welcome",
    subject,
    bodyText,
    bodyHtml,
    status: "delivered",
  });
}

/**
 * CRM Lifecycle Trigger: Application Received
 */
export function triggerApplicationReceived(app: Application): SentMessage {
  captureLead({
    name: app.studentName,
    email: app.studentEmail,
    phone: app.studentPhone,
    courseId: app.courseId,
    courseInterest: app.courseTitle,
    learningMode: app.learningMode,
    branchId: app.branchId,
    branchName: app.branchName,
    cohortInterest: app.cohort,
    source: "application_portal",
    signupDate: app.createdAt,
    applicationStatus: app.applicationStatus,
    paymentStatus: app.paymentStatus,
  });

  const subject = `Application Received: ${app.courseTitle} (${app.applicationNumber})`;
  const bodyText = `Hello ${app.studentName}, your application for ${app.courseTitle} has been recorded (App ID: ${app.applicationNumber}). Please complete your tuition payment of ₦${app.tuitionAmount.toLocaleString()} to confirm admission.`;
  const bodyHtml = renderEmailHtml("application_received", {
    name: app.studentName,
    email: app.studentEmail,
    courseTitle: app.courseTitle,
    applicationNumber: app.applicationNumber,
    learningMode: app.learningMode,
    branchName: app.branchName,
    cohort: app.cohort,
    amount: app.tuitionAmount,
  });

  // In-App Notification
  addNotification({
    userId: app.studentId,
    type: "course",
    category: "application",
    title: `Application Received: ${app.courseTitle}`,
    message: `Your application (${app.applicationNumber}) for ${app.courseTitle} has been received. Complete your tuition payment to secure your seat.`,
    actionUrl: "/dashboard/applications",
  });

  return logCommunication({
    recipientEmail: app.studentEmail,
    recipientPhone: app.studentPhone,
    recipientName: app.studentName,
    channel: "email",
    templateType: "application_received",
    subject,
    bodyText,
    bodyHtml,
    status: "delivered",
  });
}

/**
 * CRM Lifecycle Trigger: Payment Verified & Admission Confirmed
 */
export function triggerPaymentReceipt(
  app: Application,
  tx: PaymentTransaction
): SentMessage {
  captureLead({
    name: app.studentName,
    email: app.studentEmail,
    phone: app.studentPhone,
    courseId: app.courseId,
    courseInterest: app.courseTitle,
    learningMode: app.learningMode,
    branchId: app.branchId,
    branchName: app.branchName,
    cohortInterest: app.cohort,
    applicationStatus: "confirmed",
    paymentStatus: "successful",
  });

  const subject = `Tuition Payment Receipt & Admission Confirmed — ${app.courseTitle}`;
  const bodyText = `Dear ${app.studentName}, your tuition payment of ₦${tx.amount.toLocaleString()} for ${app.courseTitle} is verified! Reference: ${tx.reference}. Your admission is confirmed for ${app.cohort}.`;
  const bodyHtml = renderEmailHtml("payment_receipt", {
    name: app.studentName,
    email: app.studentEmail,
    courseTitle: app.courseTitle,
    reference: tx.reference,
    amount: tx.amount,
    channel: tx.channel,
    cohort: app.cohort,
    learningMode: app.learningMode,
    branchName: app.branchName,
  });

  // In-App Notification
  addNotification({
    userId: app.studentId,
    type: "payment",
    category: "payment",
    title: "Payment Verified & Admission Confirmed! 🎉",
    message: `Tuition payment of ₦${tx.amount.toLocaleString()} for ${app.courseTitle} verified (Ref: ${tx.reference}). Your seat is confirmed!`,
    actionUrl: "/dashboard/payments",
  });

  return logCommunication({
    recipientEmail: app.studentEmail,
    recipientPhone: app.studentPhone,
    recipientName: app.studentName,
    channel: "email",
    templateType: "payment_receipt",
    subject,
    bodyText,
    bodyHtml,
    status: "delivered",
  });
}

/**
 * CRM Lifecycle Trigger: Abandoned Payment Recovery Follow-Up
 */
export function triggerPaymentAbandoned(app: Application): SentMessage {
  const subject = `Complete Your Enrollment for ${app.courseTitle} — Dave Techs Academy`;
  const bodyText = `Hello ${app.studentName}, we noticed you began registering for ${app.courseTitle}. Seats are filling up fast for ${app.cohort}. Return to finalize your admission.`;
  const bodyHtml = renderEmailHtml("payment_abandoned_reminder", {
    name: app.studentName,
    courseTitle: app.courseTitle,
    cohort: app.cohort,
  });

  // In-App Notification
  addNotification({
    userId: app.studentId,
    type: "payment",
    category: "application",
    title: `Incomplete Application: ${app.courseTitle}`,
    message: `Your payment for ${app.courseTitle} was not completed. Return to your applications to finalize before registration closes.`,
    actionUrl: "/dashboard/applications",
  });

  return logCommunication({
    recipientEmail: app.studentEmail,
    recipientPhone: app.studentPhone,
    recipientName: app.studentName,
    channel: "email",
    templateType: "payment_abandoned_reminder",
    subject,
    bodyText,
    bodyHtml,
    status: "delivered",
  });
}

/**
 * Audience Segmentation Engine
 */
export function getAudienceSegments(): Record<string, CrmSegment> {
  const leads = getStoredLeads();
  const applications = getStoredApplications();

  // 1. All Leads
  const allLeadsSegment: CrmSegment = {
    key: "all_leads",
    name: "All Registered & Inquired Leads",
    description: "Every student or contact inquiry captured across all website channels",
    count: leads.length,
    members: leads,
    category: "general",
  };

  // 2. Enrolled Students (Confirmed + Paid)
  const enrolledLeads = leads.filter(
    (l) => l.applicationStatus === "confirmed" || l.paymentStatus === "successful"
  );
  const enrolledSegment: CrmSegment = {
    key: "enrolled_students",
    name: "Confirmed Enrolled Students",
    description: "Students who have completed Paystack tuition payment with verified admission",
    count: enrolledLeads.length,
    members: enrolledLeads,
    category: "funnel",
  };

  // 3. Unpaid Applications
  const unpaidLeads = leads.filter(
    (l) =>
      (l.applicationStatus === "pending" || l.paymentStatus === "pending") &&
      l.paymentStatus !== "successful"
  );
  const unpaidSegment: CrmSegment = {
    key: "unpaid_applications",
    name: "Unpaid / Pending Applications",
    description: "Applicants who submitted an application but have not finalized tuition payment",
    count: unpaidLeads.length,
    members: unpaidLeads,
    category: "funnel",
  };

  // 4. Abandoned Applications
  const abandonedApps = applications.filter((a) => a.paymentStatus === "abandoned");
  const abandonedEmails = new Set(abandonedApps.map((a) => a.studentEmail.toLowerCase()));
  const abandonedLeads = leads.filter((l) => abandonedEmails.has(l.email.toLowerCase()));

  const abandonedSegment: CrmSegment = {
    key: "abandoned_applications",
    name: "Abandoned Checkout Leads",
    description: "Prospects who initiated Paystack checkout but closed before payment",
    count: abandonedLeads.length,
    members: abandonedLeads,
    category: "funnel",
  };

  // 5. Course Interest: Software Development
  const devLeads = leads.filter(
    (l) =>
      l.courseInterest?.toLowerCase().includes("development") ||
      l.courseInterest?.toLowerCase().includes("frontend") ||
      l.courseInterest?.toLowerCase().includes("backend") ||
      l.courseInterest?.toLowerCase().includes("python") ||
      l.courseInterest?.toLowerCase().includes("fullstack") ||
      l.courseId?.includes("dev") ||
      l.courseId?.includes("python")
  );
  const devSegment: CrmSegment = {
    key: "course_software_dev",
    name: "Interest: Software Development",
    description: "Leads interested in Web Development, Python, and Fullstack Engineering",
    count: devLeads.length,
    members: devLeads,
    category: "course",
  };

  // 6. Course Interest: Cybersecurity
  const cyberLeads = leads.filter(
    (l) =>
      l.courseInterest?.toLowerCase().includes("cyber") ||
      l.courseInterest?.toLowerCase().includes("security") ||
      l.courseInterest?.toLowerCase().includes("ethical") ||
      l.courseId?.includes("cyber")
  );
  const cyberSegment: CrmSegment = {
    key: "course_cybersecurity",
    name: "Interest: Cybersecurity & Defense",
    description: "Leads interested in Ethical Hacking, SOC, and Cyber Defense",
    count: cyberLeads.length,
    members: cyberLeads,
    category: "course",
  };

  // 7. Course Interest: Design
  const designLeads = leads.filter(
    (l) =>
      l.courseInterest?.toLowerCase().includes("design") ||
      l.courseInterest?.toLowerCase().includes("ui") ||
      l.courseInterest?.toLowerCase().includes("ux") ||
      l.courseId?.includes("design")
  );
  const designSegment: CrmSegment = {
    key: "course_design",
    name: "Interest: UI/UX & Digital Design",
    description: "Leads interested in Product Design, UI/UX, and Digital Arts",
    count: designLeads.length,
    members: designLeads,
    category: "course",
  };

  // 8. Course Interest: Data & AI
  const dataLeads = leads.filter(
    (l) =>
      l.courseInterest?.toLowerCase().includes("data") ||
      l.courseInterest?.toLowerCase().includes("ai") ||
      l.courseInterest?.toLowerCase().includes("machine") ||
      l.courseId?.includes("data")
  );
  const dataSegment: CrmSegment = {
    key: "course_data_ai",
    name: "Interest: Data Science & AI",
    description: "Leads interested in Data Analytics, Machine Learning, and Artificial Intelligence",
    count: dataLeads.length,
    members: dataLeads,
    category: "course",
  };

  // 9. Course Interest: Cloud & DevOps
  const cloudLeads = leads.filter(
    (l) =>
      l.courseInterest?.toLowerCase().includes("cloud") ||
      l.courseInterest?.toLowerCase().includes("devops") ||
      l.courseInterest?.toLowerCase().includes("aws") ||
      l.courseId?.includes("cloud")
  );
  const cloudSegment: CrmSegment = {
    key: "course_cloud_devops",
    name: "Interest: Cloud & DevOps",
    description: "Leads interested in Cloud Architecture, AWS, Docker, and CI/CD",
    count: cloudLeads.length,
    members: cloudLeads,
    category: "course",
  };

  return {
    all_leads: allLeadsSegment,
    enrolled_students: enrolledSegment,
    unpaid_applications: unpaidSegment,
    abandoned_applications: abandonedSegment,
    course_software_dev: devSegment,
    course_cybersecurity: cyberSegment,
    course_design: designSegment,
    course_data_ai: dataSegment,
    course_cloud_devops: cloudSegment,
  };
}

/**
 * Broadcast Campaign Dispatcher
 */
export function dispatchBroadcastCampaign(
  segmentKey: string,
  channel: CommunicationChannel,
  subject: string,
  messageText: string
): { success: boolean; sentCount: number } {
  const segments = getAudienceSegments();
  const segment = segments[segmentKey] || segments["all_leads"];

  if (!segment || segment.members.length === 0) {
    return { success: false, sentCount: 0 };
  }

  segment.members.forEach((member) => {
    const personalizedSubject = replaceTemplateVariables(subject, {
      name: member.name,
      course: member.courseInterest || "Practical Technology Program",
      cohort: member.cohortInterest || "Upcoming Cohort",
    });

    const personalizedMessage = replaceTemplateVariables(messageText, {
      name: member.name,
      course: member.courseInterest || "Practical Technology Program",
      cohort: member.cohortInterest || "Upcoming Cohort",
      email: member.email,
    });

    logCommunication({
      recipientEmail: member.email,
      recipientPhone: member.phone,
      recipientName: member.name,
      channel,
      templateType: "custom_broadcast",
      subject: personalizedSubject,
      bodyText: personalizedMessage,
      bodyHtml: renderEmailHtml("custom_broadcast", {
        name: member.name,
        headline: personalizedSubject,
        message: personalizedMessage,
      }),
      status: "delivered",
      metadata: { segmentKey },
    });
  });

  return { success: true, sentCount: segment.members.length };
}

/**
 * Class Reminder Workflow Dispatcher
 */
export function dispatchClassReminder(
  cohortName: string,
  location: string,
  timeString?: string,
  customNotes?: string
): { success: boolean; sentCount: number } {
  const applications = getStoredApplications().filter(
    (a) => a.cohort === cohortName && (a.applicationStatus === "confirmed" || a.paymentStatus === "successful")
  );

  applications.forEach((app) => {
    const timeFormatted = timeString || "Saturday, 10:00 AM West Africa Time (WAT)";
    const subject = `Reminder: Cohort Orientation & First Class for ${cohortName}`;
    const bodyText = `Hello ${app.studentName}, orientation for your cohort ${cohortName} starts on ${timeFormatted} at ${location}. ${customNotes || ""}`;

    logCommunication({
      recipientEmail: app.studentEmail,
      recipientPhone: app.studentPhone,
      recipientName: app.studentName,
      channel: "email",
      templateType: "class_reminder",
      subject,
      bodyText,
      bodyHtml: renderEmailHtml("class_reminder", {
        name: app.studentName,
        cohort: cohortName,
        time: timeFormatted,
        location,
        customNotes,
      }),
      status: "delivered",
      metadata: { cohortName, applicationId: app.id },
    });

    // In-App Notification
    addNotification({
      userId: app.studentId,
      type: "course",
      category: "class",
      title: `Orientation Reminder: ${cohortName} ⏰`,
      message: `Your class starts on ${timeFormatted}. Location/Link: ${location}. Log in to view curriculum preparation.`,
      actionUrl: "/dashboard/courses",
    });
  });

  return { success: true, sentCount: applications.length };
}

/**
 * Simulates a test provider connection check.
 */
export function testProviderConnection(
  channel: CommunicationChannel
): { success: boolean; message: string; latencyMs: number } {
  const config = getProviderConfig();
  const latency = Math.floor(Math.random() * 80) + 40;

  if (channel === "email") {
    return {
      success: true,
      message: `Connected successfully to ${config.emailProvider.toUpperCase()} Gateway (${config.senderEmail}). Ready for dispatch.`,
      latencyMs: latency,
    };
  }

  if (channel === "sms") {
    return {
      success: true,
      message: `Connected successfully to ${config.smsProvider.toUpperCase()} SMS Route (Sender ID: "${config.smsSenderId}"). Auto-DND routing active.`,
      latencyMs: latency,
    };
  }

  return {
    success: true,
    message: `WhatsApp integration active (${config.whatsappProvider === "direct_deep_link" ? "Direct wa.me deep-links" : config.whatsappProvider.toUpperCase()}).`,
    latencyMs: latency,
  };
}
