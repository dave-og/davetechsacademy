// ─── Course ───────────────────────────────────────────────
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced" | "Beginner/Intermediate";

export type LearningMode = "online" | "physical";

export type CourseCategory =
  | "Software Development"
  | "Data & AI"
  | "Cybersecurity"
  | "Design"
  | "Cloud & DevOps"
  | "Mobile Development"
  | "Emerging Technology"
  | "Digital Skills";

export interface CurriculumModule {
  title: string;
  duration?: string;
  topics: string[];
}

export interface PracticalProject {
  title: string;
  description: string;
  tools?: string[];
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: string;
  category: CourseCategory;
  level: CourseLevel;
  durationWeeks: number;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  learningModes: LearningMode[];
  instructorIds: string[];
  featured: boolean;
  active: boolean;
  learningOutcomes?: string[];
  curriculum?: CurriculumModule[];
  requirements?: string[];
  projects?: PracticalProject[];
  faqs?: CourseFAQ[];
  certificateIncluded?: boolean;
}

// ─── Student & Auth ─────────────────────────────────────────
export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state?: string;
  role?: "student" | "admin";
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  referralCode?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser extends Student {
  token?: string;
}

// ─── Application ──────────────────────────────────────────
export type PaymentStatus = "pending" | "processing" | "successful" | "failed" | "abandoned" | "refunded";
export type ApplicationStatus = "pending" | "confirmed" | "cancelled";

export interface Application {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCountry: string;
  studentState?: string;
  preferredContactMethod: "email" | "whatsapp" | "phone";
  courseId: string;
  courseTitle: string;
  tuitionAmount: number;
  learningMode: LearningMode;
  branchId?: string;
  branchName?: string;
  cohort: string;
  paymentStatus: PaymentStatus;
  applicationStatus: ApplicationStatus;
  paymentReference?: string;
  createdAt: string;
}


// ─── Branch ───────────────────────────────────────────────
export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email?: string;
  openingHours: string;
  courseIds: string[];
  availableCohorts: string[];
  mapUrl?: string;
  active: boolean;
  image?: string;
  facilities?: string[];
  transportInfo?: string;
}

// ─── Instructor ───────────────────────────────────────────
export interface Instructor {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  experience: string;
  courseIds: string[];
  image: string;
  bio?: string;
  qualifications?: string[];
  rating?: number;
  studentsTrained?: number;
  socials?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
}

// ─── Testimonial ──────────────────────────────────────────
export interface Testimonial {
  id: string;
  studentName: string;
  course: string;
  rating: number;
  content: string;
  image?: string;
  location?: string;
}

// ─── Notification ─────────────────────────────────────────
export type NotificationType = "application" | "payment" | "course" | "announcement";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ─── Theme ────────────────────────────────────────────────
export type Theme = "dark" | "light";

// ─── Contact & CRM Lead ───────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  courseInterest?: string;
  branchInterest?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseId?: string;
  courseInterest?: string;
  learningMode?: "online" | "physical";
  branchId?: string;
  branchName?: string;
  branchInterest?: string;
  cohortInterest?: string;
  source: string;
  signupDate: string;
  applicationStatus?: string;
  paymentStatus?: string;
  crmSynced?: boolean;
}
