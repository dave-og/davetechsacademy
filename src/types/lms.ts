// ─── Lesson & Curriculum ─────────────────────────────────────
export type VideoProvider = "youtube" | "vimeo" | "custom" | "mp4";

export interface LessonResource {
  id: string;
  title: string;
  url: string;
  type: "pdf" | "github" | "link" | "zip" | "doc";
  size?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl: string;
  videoProvider: VideoProvider;
  order: number;
  isFreePreview?: boolean;
  resources?: LessonResource[];
  quizId?: string;
  assignmentId?: string;
}

export interface CurriculumModuleWithLessons {
  id: string;
  title: string;
  duration?: string;
  order: number;
  lessons: Lesson[];
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  studentId: string;
  completed: boolean;
  completedAt?: string;
  lastWatchTimeSeconds?: number;
}

export interface CourseProgress {
  courseId: string;
  studentId: string;
  totalLessons: number;
  completedLessons: string[];
  progressPercent: number;
  lastAccessedLessonId?: string;
  certificateIssued: boolean;
  certificateId?: string;
  updatedAt: string;
}

// ─── Quiz & Exam ─────────────────────────────────────────────
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  type: "quiz" | "exam";
  timeLimitMinutes?: number;
  passingScorePercent: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  studentId: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

// ─── Assignment ──────────────────────────────────────────────
export interface Assignment {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  instructions: string;
  rubric: string[];
  maxScore: number;
  dueDateDaysAfterEnroll?: number;
}

export type SubmissionStatus = "submitted" | "under_review" | "graded" | "resubmit";

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submissionText: string;
  githubUrl?: string;
  demoUrl?: string;
  fileAttachment?: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

// ─── Certificate ─────────────────────────────────────────────
export type CertificateGrade = "Pass" | "Credit" | "Distinction";

export interface Certificate {
  id: string;
  certificateNumber: string; // e.g., DTA-2026-XXXXX
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  grade: CertificateGrade;
  instructorName: string;
  instructorTitle: string;
  verificationUrl: string;
  credentialUrl: string;
  skills: string[];
}

// ─── Community & Forum ───────────────────────────────────────
export type ForumCategory = "general" | "course_qa" | "projects" | "career" | "announcements";

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: "student" | "instructor" | "admin" | "alumni";
  content: string;
  likes: number;
  isAcceptedAnswer?: boolean;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  courseId?: string;
  courseTitle?: string;
  category: ForumCategory;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: "student" | "instructor" | "admin" | "alumni";
  tags: string[];
  likes: number;
  views: number;
  replies: ForumReply[];
  isPinned?: boolean;
  isSolved?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Learning Assistant ────────────────────────────────────
export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  codeSnippet?: string;
  language?: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

// ─── Job Board & Career Marketplace ───────────────────────────
export type JobType = "Full-time" | "Part-time" | "Internship" | "Contract" | "Apprenticeship";
export type WorkLocation = "Remote" | "Hybrid" | "On-site";
export type ExperienceLevel = "Junior" | "Mid" | "Senior" | "Lead" | "Entry Level";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  workLocation: WorkLocation;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryRange: string;
  techStack: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  featured?: boolean;
  postedDate: string;
  deadline?: string;
  contactEmail: string;
  applyUrl?: string;
  exclusiveForAlumni?: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  portfolioUrl?: string;
  githubUrl?: string;
  coverNote?: string;
  appliedAt: string;
  status: "submitted" | "shortlisted" | "interview" | "rejected" | "hired";
}

// ─── Referral & Affiliate System ──────────────────────────────
export interface ReferralRecord {
  id: string;
  referrerStudentId: string;
  referredEmail: string;
  referredName?: string;
  courseTitle?: string;
  rewardAmount: number; // e.g. 10000 NGN
  status: "pending" | "confirmed" | "paid";
  date: string;
}

export interface ReferralProfile {
  studentId: string;
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulEnrollments: number;
  pendingRewards: number;
  totalEarnings: number;
  currency: string;
  history: ReferralRecord[];
}

export interface AffiliatePartner {
  id: string;
  partnerName: string;
  email: string;
  website?: string;
  affiliateCode: string;
  commissionRate: number; // e.g. 15%
  clicks: number;
  leads: number;
  conversions: number;
  earnedCommissions: number;
  status: "active" | "pending" | "paused";
  joinedAt: string;
}
