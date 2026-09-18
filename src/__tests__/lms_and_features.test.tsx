import { describe, it, expect, beforeEach } from "vitest";
import { lmsService } from "../services/lmsService";
import type { Lesson, Quiz } from "../types/lms";

describe("Phase 26: LMS, Community, Career & Growth Systems Test Suite", () => {
  const studentId = "student-test-01";
  const courseId = "course-1";

  beforeEach(() => {
    localStorage.clear();
  });

  // ── 1. Course Video Lessons ─────────────────────────────────
  describe("1. Course Video Lessons & Curriculum Structure", () => {
    it("should retrieve structured video lessons grouped by curriculum module", () => {
      const lessons = lmsService.getLessons(courseId);
      expect(lessons.length).toBeGreaterThan(0);

      const firstLesson = lessons[0];
      expect(firstLesson.courseId).toBe(courseId);
      expect(firstLesson.title).toBeDefined();
      expect(firstLesson.videoUrl).toContain("youtube");
      expect(firstLesson.durationMinutes).toBeGreaterThan(0);
      expect(firstLesson.moduleTitle).toContain("Module 1");
    });

    it("should allow querying specific lessons by ID", () => {
      const lesson = lmsService.getLessonById("lesson-fs-101");
      expect(lesson).toBeDefined();
      expect(lesson?.title).toContain("HTML5");
    });
  });

  // ── 2. Student Lesson Tracking ──────────────────────────────
  describe("2. Student Lesson Progress Tracking", () => {
    it("should toggle lesson completion and record timestamp", () => {
      const initialCompleted = lmsService.isLessonCompleted(studentId, courseId, "lesson-fs-101");
      expect(initialCompleted).toBe(false);

      const progress = lmsService.toggleLessonCompletion(studentId, courseId, "lesson-fs-101");
      expect(progress.completedLessons).toContain("lesson-fs-101");

      const isNowCompleted = lmsService.isLessonCompleted(studentId, courseId, "lesson-fs-101");
      expect(isNowCompleted).toBe(true);

      // Toggle again to unmark
      lmsService.toggleLessonCompletion(studentId, courseId, "lesson-fs-101");
      expect(lmsService.isLessonCompleted(studentId, courseId, "lesson-fs-101")).toBe(false);
    });

    it("should record video watch timestamp without marking as complete", () => {
      lmsService.recordWatchTime(studentId, courseId, "lesson-fs-101", 125);
      const list = lmsService.getLessonProgressList(studentId, courseId);
      expect(list.length).toBe(1);
      expect(list[0].lastWatchTimeSeconds).toBe(125);
      expect(list[0].completed).toBe(false);
    });
  });

  // ── 3. Quizzes & Assessments ────────────────────────────────
  describe("3. Quizzes & Automated Scoring Engine", () => {
    it("should calculate correct quiz score and pass threshold", () => {
      const quiz = lmsService.getQuizById("quiz-fs-101");
      expect(quiz).toBeDefined();

      // Submit all correct answers
      const answers: Record<string, number> = {
        q1: 1, // correct
        q2: 1, // correct
        q3: 1, // correct
      };

      const attempt = lmsService.submitQuizAttempt("quiz-fs-101", studentId, courseId, answers);
      expect(attempt.score).toBe(30);
      expect(attempt.totalPoints).toBe(30);
      expect(attempt.percentage).toBe(100);
      expect(attempt.passed).toBe(true);
    });

    it("should fail quiz if score is below passing percentage", () => {
      const answers: Record<string, number> = {
        q1: 0, // wrong
        q2: 0, // wrong
        q3: 1, // correct
      };

      const attempt = lmsService.submitQuizAttempt("quiz-fs-101", studentId, courseId, answers);
      expect(attempt.score).toBe(10);
      expect(attempt.percentage).toBe(33);
      expect(attempt.passed).toBe(false);
    });
  });

  // ── 4. Exams ────────────────────────────────────────────────
  describe("4. Certification Final Exams", () => {
    it("should evaluate final certification exam with strict passing grade", () => {
      const exam = lmsService.getQuizById("exam-fs-final");
      expect(exam).toBeDefined();
      expect(exam?.type).toBe("exam");
      expect(exam?.passingScorePercent).toBe(80);

      const answers: Record<string, number> = {
        fe1: 1,
        fe2: 1,
        fe3: 1,
        fe4: 20,
        fe5: 0,
      };

      const attempt = lmsService.submitQuizAttempt("exam-fs-final", studentId, courseId, answers);
      expect(attempt.passed).toBe(true);
      expect(attempt.percentage).toBe(100);
    });
  });

  // ── 5. Assignments & Submissions ────────────────────────────
  describe("5. Practical Assignments & Project Submissions", () => {
    it("should submit assignment with repository and deployment URLs", () => {
      const sub = lmsService.submitAssignment({
        assignmentId: "assign-fs-101",
        courseId,
        studentId,
        studentName: "Alex Morgan",
        studentEmail: "alex@example.com",
        submissionText: "Implemented full responsive grid with dark mode.",
        githubUrl: "https://github.com/alex/portfolio",
        demoUrl: "https://alex-portfolio.vercel.app",
      });

      expect(sub.id).toBeDefined();
      expect(sub.status).toBe("submitted");

      const mySubs = lmsService.getSubmissions({ studentId, assignmentId: "assign-fs-101" });
      expect(mySubs.length).toBe(1);
      expect(mySubs[0].githubUrl).toBe("https://github.com/alex/portfolio");
    });
  });

  // ── 6. Course Progress Tracking ─────────────────────────────
  describe("6. Course Progress Calculation", () => {
    it("should compute accurate progress percentage as lessons are completed", () => {
      const lessons = lmsService.getLessons(courseId);
      const total = lessons.length;

      // Complete 3 out of total
      lmsService.toggleLessonCompletion(studentId, courseId, lessons[0].id);
      lmsService.toggleLessonCompletion(studentId, courseId, lessons[1].id);
      const progress = lmsService.toggleLessonCompletion(studentId, courseId, lessons[2].id);

      const expectedPct = Math.round((3 / total) * 100);
      expect(progress.progressPercent).toBe(expectedPct);
      expect(progress.completedLessons.length).toBe(3);
    });
  });

  // ── 7. Instructor Lesson Management ─────────────────────────
  describe("7. Instructor Lesson Management & Grading", () => {
    it("should allow creating and deleting lessons", () => {
      const newLesson: Lesson = {
        id: "lesson-custom-99",
        courseId,
        moduleId: "mod-custom",
        moduleTitle: "Module 4: DevOps & CI/CD",
        title: "Docker Containerization for React Apps",
        description: "Build multi-stage production Docker images.",
        durationMinutes: 50,
        videoUrl: "https://youtube.com/watch?v=custom",
        videoProvider: "youtube",
        order: 10,
      };

      lmsService.saveLesson(newLesson);
      expect(lmsService.getLessonById("lesson-custom-99")).toBeDefined();

      lmsService.deleteLesson("lesson-custom-99");
      expect(lmsService.getLessonById("lesson-custom-99")).toBeUndefined();
    });

    it("should allow instructors to grade student submissions with feedback", () => {
      const sub = lmsService.submitAssignment({
        assignmentId: "assign-fs-201",
        courseId,
        studentId,
        studentName: "Tunde Bakare",
        studentEmail: "tunde@example.com",
        submissionText: "Kanban React App",
      });

      const graded = lmsService.gradeSubmission(
        sub.id,
        96,
        "Outstanding implementation of React Context and optimistic updates.",
        "David Johnson"
      );

      expect(graded.status).toBe("graded");
      expect(graded.score).toBe(96);
      expect(graded.gradedBy).toBe("David Johnson");
      expect(graded.feedback).toContain("Outstanding");
    });
  });

  // ── 8. Certificate Generation & Verification ────────────────
  describe("8. Certificate Generation & Public Verification", () => {
    it("should issue a certificate with unique credential ID", () => {
      const cert = lmsService.issueCertificate(
        studentId,
        "Alex Morgan",
        "alex@example.com",
        courseId,
        "Full Stack Web Development",
        "Distinction"
      );

      expect(cert.certificateNumber).toMatch(/^DTA-2026-\d{5}$/);
      expect(cert.studentName).toBe("Alex Morgan");
      expect(cert.grade).toBe("Distinction");

      const studentCerts = lmsService.getStudentCertificates(studentId);
      expect(studentCerts.length).toBe(1);
    });

    it("should verify authentic certificate by serial number", () => {
      const cert = lmsService.issueCertificate(
        "student-verify-1",
        "Kemi Adebayo",
        "kemi@example.com",
        courseId,
        "Full Stack Web Development"
      );

      const verified = lmsService.verifyCertificate(cert.certificateNumber);
      expect(verified).toBeDefined();
      expect(verified?.studentName).toBe("Kemi Adebayo");

      // Invalid number lookup
      const notFound = lmsService.verifyCertificate("INVALID-NUMBER-999");
      expect(notFound).toBeUndefined();
    });
  });

  // ── 9. Student Community & Discussion Forums ────────────────
  describe("9. Student Community & Discussion Forums", () => {
    it("should create forum topics and support replies and upvoting", () => {
      const topic = lmsService.createForumTopic({
        title: "How to configure Tailwind with Vite 8?",
        category: "course_qa",
        content: "Looking for recommendations on configuring PostCSS.",
        authorId: studentId,
        authorName: "Alex Morgan",
        authorRole: "student",
        tags: ["Tailwind", "Vite", "CSS"],
      });

      expect(topic.id).toBeDefined();
      expect(topic.likes).toBe(0);

      // Like topic
      const likes = lmsService.likeTopic(topic.id);
      expect(likes).toBe(1);

      // Add reply
      const reply = lmsService.addForumReply(topic.id, {
        authorId: "inst-1",
        authorName: "David Johnson",
        authorRole: "instructor",
        content: "Install @tailwindcss/vite plugin in your vite.config.ts.",
      });

      expect(reply.id).toBeDefined();

      const refreshed = lmsService.getForumTopicById(topic.id);
      expect(refreshed?.replies.length).toBe(1);
      expect(refreshed?.replies[0].content).toContain("@tailwindcss/vite");
    });
  });

  // ── 10. AI Learning Assistant ───────────────────────────────
  describe("10. AI Learning Assistant (Dave AI)", () => {
    it("should generate contextual explanation and debug responses", () => {
      const explainRes = lmsService.generateAIResponse("Explain modern component architecture", "Full Stack Web", "React Fundamentals");
      expect(explainRes.content).toContain("breakdown");

      const debugRes = lmsService.generateAIResponse("How to debug error in async React state?");
      expect(debugRes.codeSnippet).toBeDefined();
      expect(debugRes.language).toBe("typescript");

      const exerciseRes = lmsService.generateAIResponse("Give me a practice exercise");
      expect(exerciseRes.content).toContain("Challenge");
    });
  });

  // ── 11. Job Board & Career Marketplace ──────────────────────
  describe("11. Job Board & Career Marketplace", () => {
    it("should filter job opportunities by location and tech stack", () => {
      const remoteJobs = lmsService.getJobs({ workLocation: "Remote" });
      expect(remoteJobs.every((j) => j.workLocation === "Remote")).toBe(true);

      const reactJobs = lmsService.getJobs({ search: "React" });
      expect(reactJobs.length).toBeGreaterThan(0);
    });

    it("should allow student to submit job application", () => {
      const app = lmsService.applyForJob({
        jobId: "job-1",
        jobTitle: "Junior Frontend Developer",
        company: "Paystack Partner Lab",
        studentId,
        studentName: "Alex Morgan",
        studentEmail: "alex@example.com",
        studentPhone: "+2348012345678",
        portfolioUrl: "https://alexportfolio.dev",
        coverNote: "Passionate React engineer with Dave Techs verified distinction.",
      });

      expect(app.id).toBeDefined();
      expect(app.status).toBe("submitted");

      const myApps = lmsService.getStudentJobApplications(studentId);
      expect(myApps.length).toBe(1);
      expect(myApps[0].jobTitle).toBe("Junior Frontend Developer");
    });
  });

  // ── 12. Referral & Affiliate Systems ────────────────────────
  describe("12. Referral & Affiliate Systems", () => {
    it("should generate student referral profile with tracking link and earnings", () => {
      const prof = lmsService.getReferralProfile(studentId, "Alex Morgan");
      expect(prof.referralCode).toContain("DAVE-ALEX");
      expect(prof.referralLink).toContain("/apply?ref=");
      expect(prof.totalEarnings).toBeGreaterThanOrEqual(20000);
      expect(prof.history.length).toBeGreaterThan(0);
    });

    it("should register affiliate partner and calculate commission stats", () => {
      const affiliate = lmsService.registerAffiliate({
        partnerName: "Tech Hub Abuja",
        email: "partnerships@techhubabuja.ng",
        website: "https://techhubabuja.ng",
      });

      expect(affiliate.affiliateCode).toBe("TECHHUBA");
      expect(affiliate.commissionRate).toBe(15);
      expect(affiliate.status).toBe("active");

      const allAffiliates = lmsService.getAffiliates();
      expect(allAffiliates.find((a) => a.id === affiliate.id)).toBeDefined();
    });
  });
});
