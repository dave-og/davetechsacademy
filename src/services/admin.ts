import { getStoredCourses } from "../data/courses";
import { getStoredBranches } from "../data/branches";
import { getStoredApplications, saveApplication } from "../data/applications";
import { getStoredTransactions } from "./paystack";
import type { PaymentTransaction } from "./paystack";
import type { Application, Student, ApplicationStatus, PaymentStatus } from "../types";
import { sanitizeUserForStorage } from "../utils/security";

const USERS_STORAGE_KEY = "devtechs_registered_users";

export interface DashboardStats {
  totalStudents: number;
  totalApplications: number;
  successfulPaymentsCount: number;
  pendingApplicationsCount: number;
  totalRevenue: number;
  conversionRate: number;
  popularCourses: {
    courseId: string;
    courseTitle: string;
    category: string;
    applicationsCount: number;
    confirmedCount: number;
    revenue: number;
  }[];
  recentApplications: Application[];
  upcomingCohorts: {
    name: string;
    branchName: string;
    enrolledCount: number;
    startDate: string;
  }[];
}

export interface StudentWithHistory extends Student {
  applications: Application[];
  transactions: PaymentTransaction[];
  totalSpent: number;
}

/**
 * Seed initial sample applications if storage is empty for realistic dashboard preview.
 */
function ensureSampleData(): void {
  try {
    const existing = getStoredApplications();
    if (existing.length === 0) {
      const sampleApps: Application[] = [
        {
          id: "app_demo_001",
          applicationNumber: "DTA-2026-AB782",
          studentId: "stu-demo-01",
          studentName: "Adebayo David",
          studentEmail: "student@davetechs.ng",
          studentPhone: "+234 801 234 5678",
          studentCountry: "Nigeria",
          studentState: "Ogun State",
          preferredContactMethod: "whatsapp",
          courseId: "ui-ux-design",
          courseTitle: "UI/UX Design",
          tuitionAmount: 46000,
          learningMode: "online",
          cohort: "Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)",
          paymentStatus: "successful",
          applicationStatus: "confirmed",
          paymentReference: "DTA_PAY_DTA2026AB782_1740000000_XY1",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: "app_demo_002",
          applicationNumber: "DTA-2026-CD491",
          studentId: "stu_guest_102",
          studentName: "Chioma Okonjo",
          studentEmail: "chioma.o@example.ng",
          studentPhone: "+234 803 111 2233",
          studentCountry: "Nigeria",
          studentState: "Lagos State",
          preferredContactMethod: "email",
          courseId: "frontend-development",
          courseTitle: "Frontend Development with React",
          tuitionAmount: 75000,
          learningMode: "physical",
          branchId: "lagos-island",
          branchName: "Dave Techs — Victoria Island Campus",
          cohort: "Weekday Intensive (Mon-Fri 9:00 AM - 1:00 PM)",
          paymentStatus: "successful",
          applicationStatus: "confirmed",
          paymentReference: "DTA_PAY_DTA2026CD491_1740086400_AB2",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: "app_demo_003",
          applicationNumber: "DTA-2026-EF823",
          studentId: "stu_guest_103",
          studentName: "Ibrahim Musa",
          studentEmail: "ibrahim.m@example.ng",
          studentPhone: "+234 802 444 5566",
          studentCountry: "Nigeria",
          studentState: "Oyo State",
          preferredContactMethod: "phone",
          courseId: "cybersecurity",
          courseTitle: "Cybersecurity & Ethical Hacking",
          tuitionAmount: 95000,
          learningMode: "physical",
          branchId: "ibadan-campus",
          branchName: "Dave Techs — Ibadan Innovation Center",
          cohort: "Weekend Batch (Sat 9:00 AM - 3:00 PM)",
          paymentStatus: "pending",
          applicationStatus: "pending",
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
          id: "app_demo_004",
          applicationNumber: "DTA-2026-GH914",
          studentId: "stu_guest_104",
          studentName: "Emeka Stanley",
          studentEmail: "stanley.e@example.ng",
          studentPhone: "+234 814 888 9900",
          studentCountry: "Nigeria",
          studentState: "Lagos State",
          preferredContactMethod: "whatsapp",
          courseId: "python-programming",
          courseTitle: "Python Programming & Automation",
          tuitionAmount: 55000,
          learningMode: "online",
          cohort: "Evening Cohort (Tue/Thu 6:00 PM - 9:00 PM)",
          paymentStatus: "successful",
          applicationStatus: "confirmed",
          paymentReference: "DTA_PAY_DTA2026GH914_1740172800_JK3",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ];

      localStorage.setItem("devtechs_applications_store", JSON.stringify(sampleApps));
    }
  } catch (err) {
    console.error("Error setting up sample data", err);
  }
}

/**
 * Retrieves all registered students with calculated applications and spending history.
 */
export function getAllStudents(): StudentWithHistory[] {
  ensureSampleData();
  const rawUsers = typeof window !== "undefined" ? localStorage.getItem(USERS_STORAGE_KEY) : null;
  const applications = getStoredApplications();
  const transactions = getStoredTransactions();

  let registeredUsers: any[] = [];
  try {
    registeredUsers = rawUsers ? JSON.parse(rawUsers) : [];
  } catch {
    registeredUsers = [];
  }

  // Filter for students
  const studentsOnly = registeredUsers.filter((u) => u.role !== "admin");

  // Also collect any guest applicants who applied without full account registration
  const studentMap = new Map<string, StudentWithHistory>();

  studentsOnly.forEach((u) => {
    const studentApps = applications.filter(
      (a) => a.studentId === u.id || a.studentEmail.toLowerCase() === u.email.toLowerCase()
    );
    const studentTxs = transactions.filter(
      (t) => t.studentId === u.id || t.studentEmail.toLowerCase() === u.email.toLowerCase()
    );
    const totalSpent = studentApps
      .filter((a) => a.paymentStatus === "successful")
      .reduce((sum, a) => sum + (a.tuitionAmount || 0), 0);

    studentMap.set(u.email.toLowerCase(), {
      ...sanitizeUserForStorage(u),
      applications: studentApps,
      transactions: studentTxs,
      totalSpent,
    });
  });

  applications.forEach((app) => {
    const emailNorm = app.studentEmail.toLowerCase();
    if (!studentMap.has(emailNorm)) {
      const studentApps = applications.filter((a) => a.studentEmail.toLowerCase() === emailNorm);
      const studentTxs = transactions.filter((t) => t.studentEmail.toLowerCase() === emailNorm);
      const totalSpent = studentApps
        .filter((a) => a.paymentStatus === "successful")
        .reduce((sum, a) => sum + (a.tuitionAmount || 0), 0);

      studentMap.set(emailNorm, {
        id: app.studentId,
        fullName: app.studentName,
        email: app.studentEmail,
        phone: app.studentPhone,
        country: app.studentCountry || "Nigeria",
        state: app.studentState,
        role: "student",
        createdAt: app.createdAt,
        applications: studentApps,
        transactions: studentTxs,
        totalSpent,
      });
    }
  });

  return Array.from(studentMap.values());
}

/**
 * Computes live Admin Dashboard statistics across students, applications, payments, and branches.
 */
export function getAdminDashboardStats(): DashboardStats {
  ensureSampleData();
  const students = getAllStudents();
  const applications = getStoredApplications();
  const courses = getStoredCourses();
  const branches = getStoredBranches();

  const totalStudents = students.length;
  const totalApplications = applications.length;
  const successfulPayments = applications.filter((a) => a.paymentStatus === "successful");
  const successfulPaymentsCount = successfulPayments.length;
  const pendingApplicationsCount = applications.filter((a) => a.applicationStatus === "pending").length;

  const totalRevenue = successfulPayments.reduce((sum, a) => sum + (a.tuitionAmount || 0), 0);
  const conversionRate = totalApplications > 0 ? Math.round((successfulPaymentsCount / totalApplications) * 100) : 0;

  // Popular courses aggregation
  const popularCourses = courses.map((course) => {
    const courseApps = applications.filter((a) => a.courseId === course.id);
    const confirmedApps = courseApps.filter((a) => a.paymentStatus === "successful");
    const revenue = confirmedApps.reduce((sum, a) => sum + (a.tuitionAmount || course.price), 0);

    return {
      courseId: course.id,
      courseTitle: course.title,
      category: course.category,
      applicationsCount: courseApps.length,
      confirmedCount: confirmedApps.length,
      revenue,
    };
  }).sort((a, b) => b.applicationsCount - a.applicationsCount);

  // Recent applications (sorted by creation date)
  const recentApplications = [...applications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 8);

  // Upcoming cohorts
  const upcomingCohorts: DashboardStats["upcomingCohorts"] = [];
  branches.forEach((b) => {
    if (b.availableCohorts) {
      b.availableCohorts.forEach((cohort) => {
        const enrolled = applications.filter(
          (a) => a.branchId === b.id && a.cohort === cohort && a.applicationStatus === "confirmed"
        ).length;

        upcomingCohorts.push({
          name: cohort,
          branchName: b.name,
          enrolledCount: enrolled,
          startDate: "Next Cohort (1st of Next Month)",
        });
      });
    }
  });

  return {
    totalStudents,
    totalApplications,
    successfulPaymentsCount,
    pendingApplicationsCount,
    totalRevenue,
    conversionRate,
    popularCourses: popularCourses.slice(0, 6),
    recentApplications,
    upcomingCohorts: upcomingCohorts.slice(0, 5),
  };
}

/**
 * Updates application status and/or payment status.
 */
export function updateApplicationStatus(
  applicationId: string,
  newAppStatus: ApplicationStatus,
  newPaymentStatus?: PaymentStatus
): boolean {
  try {
    const apps = getStoredApplications();
    const idx = apps.findIndex((a) => a.id === applicationId);
    if (idx !== -1) {
      apps[idx] = {
        ...apps[idx],
        applicationStatus: newAppStatus,
        paymentStatus: newPaymentStatus || apps[idx].paymentStatus,
      };
      saveApplication(apps[idx]);
      return true;
    }
  } catch (err) {
    console.error("Failed to update application status", err);
  }
  return false;
}

/**
 * Deletes an application record.
 */
export function deleteApplicationRecord(applicationId: string): boolean {
  try {
    const apps = getStoredApplications().filter((a) => a.id !== applicationId);
    if (typeof window !== "undefined") {
      localStorage.setItem("devtechs_applications_store", JSON.stringify(apps));
      return true;
    }
  } catch (err) {
    console.error("Failed to delete application", err);
  }
  return false;
}
