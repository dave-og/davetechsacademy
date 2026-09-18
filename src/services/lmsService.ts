import type {
  Lesson,
  LessonProgress,
  CourseProgress,
  Quiz,
  QuizAttempt,
  Assignment,
  AssignmentSubmission,
  Certificate,
  ForumTopic,
  ForumReply,
  JobListing,
  JobApplication,
  ReferralProfile,
  AffiliatePartner,
  AIMessage,
} from "../types/lms";
import {
  INITIAL_LESSONS,
  INITIAL_QUIZZES,
  INITIAL_ASSIGNMENTS,
  INITIAL_FORUM_TOPICS,
  INITIAL_JOBS,
  INITIAL_CERTIFICATES,
  INITIAL_AFFILIATES,
} from "../data/lmsData";

// Storage Keys
const KEYS = {
  LESSONS: "davetechs_lms_lessons",
  PROGRESS: "davetechs_lms_progress",
  QUIZZES: "davetechs_lms_quizzes",
  QUIZ_ATTEMPTS: "davetechs_lms_quiz_attempts",
  ASSIGNMENTS: "davetechs_lms_assignments",
  SUBMISSIONS: "davetechs_lms_submissions",
  CERTIFICATES: "davetechs_lms_certificates",
  FORUM_TOPICS: "davetechs_lms_forum_topics",
  JOBS: "davetechs_lms_jobs",
  JOB_APPLICATIONS: "davetechs_lms_job_applications",
  REFERRALS: "davetechs_lms_referrals",
  AFFILIATES: "davetechs_lms_affiliates",
};

// Safe LocalStorage helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist key ${key} to localStorage:`, err);
  }
}

// ─── LMS Service Engine ─────────────────────────────────────────

export const lmsService = {
  // ── 1. Lessons & Modules ──────────────────────────────────────
  getLessons(courseId?: string): Lesson[] {
    const all = getItem<Lesson[]>(KEYS.LESSONS, INITIAL_LESSONS);
    if (!courseId) return all;
    return all.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
  },

  getLessonById(lessonId: string): Lesson | undefined {
    const lessons = this.getLessons();
    return lessons.find((l) => l.id === lessonId);
  },

  saveLesson(lesson: Lesson): Lesson {
    const lessons = this.getLessons();
    const index = lessons.findIndex((l) => l.id === lesson.id);
    let updated: Lesson[];
    if (index >= 0) {
      updated = [...lessons];
      updated[index] = lesson;
    } else {
      updated = [...lessons, lesson];
    }
    setItem(KEYS.LESSONS, updated);
    return lesson;
  },

  deleteLesson(lessonId: string): boolean {
    const lessons = this.getLessons();
    const filtered = lessons.filter((l) => l.id !== lessonId);
    setItem(KEYS.LESSONS, filtered);
    return true;
  },

  // ── 2. Lesson & Course Progress Tracking ───────────────────────
  getLessonProgressList(studentId: string, courseId: string): LessonProgress[] {
    const all = getItem<LessonProgress[]>(KEYS.PROGRESS, []);
    return all.filter((p) => p.studentId === studentId && p.courseId === courseId);
  },

  isLessonCompleted(studentId: string, courseId: string, lessonId: string): boolean {
    const list = this.getLessonProgressList(studentId, courseId);
    const found = list.find((p) => p.lessonId === lessonId);
    return found ? found.completed : false;
  },

  toggleLessonCompletion(studentId: string, courseId: string, lessonId: string): CourseProgress {
    const all = getItem<LessonProgress[]>(KEYS.PROGRESS, []);
    const existingIndex = all.findIndex(
      (p) => p.studentId === studentId && p.courseId === courseId && p.lessonId === lessonId
    );

    let isNowCompleted = true;
    if (existingIndex >= 0) {
      isNowCompleted = !all[existingIndex].completed;
      all[existingIndex] = {
        ...all[existingIndex],
        completed: isNowCompleted,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      };
    } else {
      all.push({
        lessonId,
        courseId,
        studentId,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }

    setItem(KEYS.PROGRESS, all);
    return this.calculateCourseProgress(studentId, courseId, lessonId);
  },

  recordWatchTime(studentId: string, courseId: string, lessonId: string, seconds: number): void {
    const all = getItem<LessonProgress[]>(KEYS.PROGRESS, []);
    const idx = all.findIndex(
      (p) => p.studentId === studentId && p.courseId === courseId && p.lessonId === lessonId
    );
    if (idx >= 0) {
      all[idx].lastWatchTimeSeconds = seconds;
    } else {
      all.push({
        lessonId,
        courseId,
        studentId,
        completed: false,
        lastWatchTimeSeconds: seconds,
      });
    }
    setItem(KEYS.PROGRESS, all);
  },

  calculateCourseProgress(studentId: string, courseId: string, lastLessonId?: string): CourseProgress {
    const courseLessons = this.getLessons(courseId);
    const totalLessons = courseLessons.length;
    const progressList = this.getLessonProgressList(studentId, courseId);
    const completedLessonIds = progressList.filter((p) => p.completed).map((p) => p.lessonId);

    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0;

    const certs = this.getStudentCertificates(studentId);
    const existingCert = certs.find((c) => c.courseId === courseId);

    return {
      courseId,
      studentId,
      totalLessons,
      completedLessons: completedLessonIds,
      progressPercent: Math.min(progressPercent, 100),
      lastAccessedLessonId: lastLessonId,
      certificateIssued: !!existingCert,
      certificateId: existingCert?.certificateNumber,
      updatedAt: new Date().toISOString(),
    };
  },

  // ── 3. Quizzes & Exams ─────────────────────────────────────────
  getQuizzes(courseId?: string): Quiz[] {
    const all = getItem<Quiz[]>(KEYS.QUIZZES, INITIAL_QUIZZES);
    if (!courseId) return all;
    return all.filter((q) => q.courseId === courseId);
  },

  getQuizById(quizId: string): Quiz | undefined {
    const quizzes = this.getQuizzes();
    return quizzes.find((q) => q.id === quizId);
  },

  saveQuiz(quiz: Quiz): Quiz {
    const quizzes = this.getQuizzes();
    const idx = quizzes.findIndex((q) => q.id === quiz.id);
    let updated: Quiz[];
    if (idx >= 0) {
      updated = [...quizzes];
      updated[idx] = quiz;
    } else {
      updated = [...quizzes, quiz];
    }
    setItem(KEYS.QUIZZES, updated);
    return quiz;
  },

  submitQuizAttempt(
    quizId: string,
    studentId: string,
    courseId: string,
    answers: Record<string, number>
  ): QuizAttempt {
    const quiz = this.getQuizById(quizId);
    if (!quiz) throw new Error("Quiz not found");

    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q) => {
      totalPoints += q.points;
      if (answers[q.id] === q.correctOptionIndex) {
        score += q.points;
      }
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScorePercent;

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      quizId,
      courseId,
      studentId,
      answers,
      score,
      totalPoints,
      percentage,
      passed,
      completedAt: new Date().toISOString(),
    };

    const allAttempts = getItem<QuizAttempt[]>(KEYS.QUIZ_ATTEMPTS, []);
    allAttempts.push(attempt);
    setItem(KEYS.QUIZ_ATTEMPTS, allAttempts);

    return attempt;
  },

  getQuizAttempts(studentId: string, quizId?: string): QuizAttempt[] {
    const all = getItem<QuizAttempt[]>(KEYS.QUIZ_ATTEMPTS, []);
    return all
      .filter((a) => a.studentId === studentId && (!quizId || a.quizId === quizId))
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  },

  // ── 4. Assignments ─────────────────────────────────────────────
  getAssignments(courseId?: string): Assignment[] {
    const all = getItem<Assignment[]>(KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    if (!courseId) return all;
    return all.filter((a) => a.courseId === courseId);
  },

  getAssignmentById(assignmentId: string): Assignment | undefined {
    const list = this.getAssignments();
    return list.find((a) => a.id === assignmentId);
  },

  submitAssignment(data: Omit<AssignmentSubmission, "id" | "submittedAt" | "status">): AssignmentSubmission {
    const all = getItem<AssignmentSubmission[]>(KEYS.SUBMISSIONS, []);
    const submission: AssignmentSubmission = {
      ...data,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };
    all.push(submission);
    setItem(KEYS.SUBMISSIONS, all);
    return submission;
  },

  getSubmissions(filter?: { studentId?: string; courseId?: string; assignmentId?: string }): AssignmentSubmission[] {
    const all = getItem<AssignmentSubmission[]>(KEYS.SUBMISSIONS, []);
    return all.filter((s) => {
      if (filter?.studentId && s.studentId !== filter.studentId) return false;
      if (filter?.courseId && s.courseId !== filter.courseId) return false;
      if (filter?.assignmentId && s.assignmentId !== filter.assignmentId) return false;
      return true;
    });
  },

  gradeSubmission(
    submissionId: string,
    score: number,
    feedback: string,
    gradedBy: string
  ): AssignmentSubmission {
    const all = getItem<AssignmentSubmission[]>(KEYS.SUBMISSIONS, []);
    const idx = all.findIndex((s) => s.id === submissionId);
    if (idx === -1) throw new Error("Submission not found");

    all[idx] = {
      ...all[idx],
      score,
      feedback,
      gradedBy,
      gradedAt: new Date().toISOString(),
      status: "graded",
    };
    setItem(KEYS.SUBMISSIONS, all);
    return all[idx];
  },

  // ── 5. Certificates & Verification ─────────────────────────────
  getCertificates(): Certificate[] {
    return getItem<Certificate[]>(KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
  },

  getStudentCertificates(studentId: string): Certificate[] {
    const all = this.getCertificates();
    return all.filter((c) => c.studentId === studentId);
  },

  verifyCertificate(certificateNumberOrId: string): Certificate | undefined {
    const cleanId = certificateNumberOrId.trim().toUpperCase();
    const all = this.getCertificates();
    return all.find(
      (c) =>
        c.certificateNumber.toUpperCase() === cleanId ||
        c.id.toUpperCase() === cleanId
    );
  },

  issueCertificate(
    studentId: string,
    studentName: string,
    studentEmail: string,
    courseId: string,
    courseTitle: string,
    grade: "Pass" | "Credit" | "Distinction" = "Distinction",
    skills: string[] = ["Full Stack Development", "TypeScript", "React", "Node.js"]
  ): Certificate {
    const existing = this.getCertificates().find(
      (c) => c.studentId === studentId && c.courseId === courseId
    );
    if (existing) return existing;

    const certNum = `DTA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      studentId,
      studentName,
      studentEmail,
      courseId,
      courseTitle,
      issueDate: new Date().toISOString().split("T")[0],
      grade,
      instructorName: "David Johnson",
      instructorTitle: "Lead Technical Instructor & Architect",
      verificationUrl: `${window.location.origin}/verify/${certNum}`,
      credentialUrl: `${window.location.origin}/verify/${certNum}`,
      skills,
    };

    const all = this.getCertificates();
    all.push(newCert);
    setItem(KEYS.CERTIFICATES, all);
    return newCert;
  },

  // ── 6. Student Community & Forum ──────────────────────────────
  getForumTopics(category?: string, searchQuery?: string): ForumTopic[] {
    const all = getItem<ForumTopic[]>(KEYS.FORUM_TOPICS, INITIAL_FORUM_TOPICS);
    return all
      .filter((t) => {
        if (category && category !== "all" && t.category !== category) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchContent = t.content.toLowerCase().includes(q);
          const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
          return matchTitle || matchContent || matchTags;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  },

  getForumTopicById(topicId: string): ForumTopic | undefined {
    const all = getItem<ForumTopic[]>(KEYS.FORUM_TOPICS, INITIAL_FORUM_TOPICS);
    return all.find((t) => t.id === topicId);
  },

  createForumTopic(topic: Omit<ForumTopic, "id" | "createdAt" | "updatedAt" | "likes" | "views" | "replies">): ForumTopic {
    const all = getItem<ForumTopic[]>(KEYS.FORUM_TOPICS, INITIAL_FORUM_TOPICS);
    const newTopic: ForumTopic = {
      ...topic,
      id: `topic-${Date.now()}`,
      likes: 0,
      views: 1,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(newTopic);
    setItem(KEYS.FORUM_TOPICS, all);
    return newTopic;
  },

  addForumReply(
    topicId: string,
    reply: Omit<ForumReply, "id" | "createdAt" | "likes" | "topicId">
  ): ForumReply {
    const all = getItem<ForumTopic[]>(KEYS.FORUM_TOPICS, INITIAL_FORUM_TOPICS);
    const idx = all.findIndex((t) => t.id === topicId);
    if (idx === -1) throw new Error("Topic not found");

    const newReply: ForumReply = {
      ...reply,
      id: `reply-${Date.now()}`,
      topicId,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    all[idx].replies.push(newReply);
    all[idx].updatedAt = new Date().toISOString();
    setItem(KEYS.FORUM_TOPICS, all);
    return newReply;
  },

  likeTopic(topicId: string): number {
    const all = getItem<ForumTopic[]>(KEYS.FORUM_TOPICS, INITIAL_FORUM_TOPICS);
    const idx = all.findIndex((t) => t.id === topicId);
    if (idx >= 0) {
      all[idx].likes += 1;
      setItem(KEYS.FORUM_TOPICS, all);
      return all[idx].likes;
    }
    return 0;
  },

  // ── 7. AI Learning Assistant ──────────────────────────────────
  generateAIResponse(userPrompt: string, courseTitle?: string, lessonTitle?: string): AIMessage {
    const prompt = userPrompt.toLowerCase();
    let reply = "";
    let codeSnippet: string | undefined;
    let language: string | undefined;

    if (prompt.includes("explain") || prompt.includes("what is") || prompt.includes("how does")) {
      reply = `Here is a breakdown for your query regarding **${lessonTitle || courseTitle || "Modern Web Engineering"}**:

1. **Core Concept**: In modern development, systems are structured into composable units that minimize side effects and optimize data flow.
2. **Key Insight**: Always isolate state mutations to authoritative handlers and leverage immutable data structures.
3. **Best Practice**: Validate inputs on both client and server boundaries to maintain robustness.`;
    } else if (prompt.includes("debug") || prompt.includes("error") || prompt.includes("fix")) {
      reply = `I analyzed the issue you described. A common root cause in React / TypeScript code is stale closures or untyped asynchronous handlers. Here is the recommended fix:`;
      language = "typescript";
      codeSnippet = `// Recommended Safe Handler Pattern
const handleAsyncAction = async (payload: RequestData) => {
  try {
    setIsLoading(true);
    const result = await apiService.process(payload);
    setData((prev) => ({ ...prev, ...result }));
  } catch (error) {
    console.error("Action failed:", error);
    setErrorMessage(error instanceof Error ? error.message : "Unexpected error");
  } finally {
    setIsLoading(false);
  }
};`;
    } else if (prompt.includes("quiz") || prompt.includes("practice") || prompt.includes("exercise")) {
      reply = `Here is a quick practice challenge to reinforce your understanding:

**Challenge**: Write a TypeScript generic function \`pluck<T, K extends keyof T>(items: T[], key: K): T[K][]\` that safely extracts an array of values for a specific property.

Try writing it down and test it in your sandbox!`;
    } else {
      reply = `Hello! I am **Dave AI**, your dedicated 24/7 technical learning tutor for **${courseTitle || "Dave Techs Academy"}**.

I can help you:
- **Explain concepts** from your current lesson: *"${lessonTitle || "Fundamentals"}"*
- **Debug code errors** in TypeScript, React, Python, Node.js, and SQL
- **Generate practice exercises** and quizzes
- **Review capstone architectures** and suggest optimizations

What would you like to explore?`;
    }

    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: reply,
      codeSnippet,
      language,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedPrompts: [
        "Explain the key concept of this lesson",
        "How do I debug a 401 Unauthorized API error?",
        "Give me a coding exercise for React state",
      ],
    };
  },

  // ── 8. Job Board & Career Marketplace ─────────────────────────
  getJobs(filters?: {
    search?: string;
    workLocation?: string;
    jobType?: string;
    experienceLevel?: string;
  }): JobListing[] {
    const all = getItem<JobListing[]>(KEYS.JOBS, INITIAL_JOBS);
    return all.filter((job) => {
      if (filters?.workLocation && filters.workLocation !== "all" && job.workLocation !== filters.workLocation) {
        return false;
      }
      if (filters?.jobType && filters.jobType !== "all" && job.jobType !== filters.jobType) {
        return false;
      }
      if (filters?.experienceLevel && filters.experienceLevel !== "all" && job.experienceLevel !== filters.experienceLevel) {
        return false;
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = job.company.toLowerCase().includes(q);
        const matchTech = job.techStack.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchCompany || matchTech;
      }
      return true;
    });
  },

  getJobById(jobId: string): JobListing | undefined {
    const jobs = this.getJobs();
    return jobs.find((j) => j.id === jobId);
  },

  applyForJob(data: Omit<JobApplication, "id" | "appliedAt" | "status">): JobApplication {
    const all = getItem<JobApplication[]>(KEYS.JOB_APPLICATIONS, []);
    const application: JobApplication = {
      ...data,
      id: `app-job-${Date.now()}`,
      appliedAt: new Date().toISOString(),
      status: "submitted",
    };
    all.push(application);
    setItem(KEYS.JOB_APPLICATIONS, all);
    return application;
  },

  getStudentJobApplications(studentId: string): JobApplication[] {
    const all = getItem<JobApplication[]>(KEYS.JOB_APPLICATIONS, []);
    return all.filter((a) => a.studentId === studentId);
  },

  // ── 9. Referral & Affiliate System ────────────────────────────
  getReferralProfile(studentId: string, studentName?: string): ReferralProfile {
    const referrals = getItem<Record<string, ReferralProfile>>(KEYS.REFERRALS, {});
    if (referrals[studentId]) {
      return referrals[studentId];
    }

    const code = `DAVE-${(studentName || "STUDENT").split(" ")[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newProfile: ReferralProfile = {
      studentId,
      referralCode: code,
      referralLink: `${window.location.origin}/apply?ref=${code}`,
      totalReferrals: 3,
      successfulEnrollments: 2,
      pendingRewards: 10000,
      totalEarnings: 20000,
      currency: "NGN",
      history: [
        {
          id: "ref-1",
          referrerStudentId: studentId,
          referredEmail: "tunde.bakare@example.com",
          referredName: "Tunde Bakare",
          courseTitle: "Full Stack Web Development",
          rewardAmount: 10000,
          status: "paid",
          date: "2026-08-10",
        },
        {
          id: "ref-2",
          referrerStudentId: studentId,
          referredEmail: "kemi.ade@example.com",
          referredName: "Kemi Ade",
          courseTitle: "Python Data Science & AI",
          rewardAmount: 10000,
          status: "confirmed",
          date: "2026-09-02",
        },
      ],
    };

    referrals[studentId] = newProfile;
    setItem(KEYS.REFERRALS, referrals);
    return newProfile;
  },

  getAffiliates(): AffiliatePartner[] {
    return getItem<AffiliatePartner[]>(KEYS.AFFILIATES, INITIAL_AFFILIATES);
  },

  registerAffiliate(data: { partnerName: string; email: string; website?: string }): AffiliatePartner {
    const all = this.getAffiliates();
    const cleanCode = data.partnerName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 8);
    const newAffiliate: AffiliatePartner = {
      id: `aff-${Date.now()}`,
      partnerName: data.partnerName,
      email: data.email,
      website: data.website,
      affiliateCode: cleanCode,
      commissionRate: 15,
      clicks: 0,
      leads: 0,
      conversions: 0,
      earnedCommissions: 0,
      status: "active",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    all.push(newAffiliate);
    setItem(KEYS.AFFILIATES, all);
    return newAffiliate;
  },
};
