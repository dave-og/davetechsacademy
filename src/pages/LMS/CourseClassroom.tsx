import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { lmsService } from "../../services/lmsService";
import { courses } from "../../data/courses";
import { VideoPlayer } from "../../components/lms/VideoPlayer";
import { QuizRunner } from "../../components/lms/QuizRunner";
import { AssignmentRunner } from "../../components/lms/AssignmentRunner";
import { AILearningAssistant } from "../../components/lms/AILearningAssistant";
import { CertificateModal } from "../../components/lms/CertificateModal";
import type { Lesson, CourseProgress, Certificate, Quiz, Assignment } from "../../types/lms";
import "./CourseClassroom.css";

export const CourseClassroom: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const [activeLessonId, setActiveLessonId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "quiz" | "assignment" | "ai" | "resources">("overview");
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [earnedCert, setEarnedCert] = useState<Certificate | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);

  const studentId = user?.id || "guest-student";
  const studentName = user?.fullName || "Dave Techs Student";
  const studentEmail = user?.email || "student@davetechs.com";

  // Find course
  const course = courses.find((c) => c.id === courseId || c.slug === courseId) || courses[0];
  const targetCourseId = course.id;

  const lessons = lmsService.getLessons(targetCourseId);
  const activeLesson: Lesson | undefined =
    lessons.find((l) => l.id === activeLessonId) || lessons[0];

  // Group lessons by module
  const modulesMap = lessons.reduce((acc, l) => {
    if (!acc[l.moduleId]) {
      acc[l.moduleId] = {
        title: l.moduleTitle,
        lessons: [],
      };
    }
    acc[l.moduleId].lessons.push(l);
    return acc;
  }, {} as Record<string, { title: string; lessons: Lesson[] }>);

  useEffect(() => {
    if (lessons.length > 0 && !activeLessonId) {
      setActiveLessonId(lessons[0].id);
    }
    const currentProgress = lmsService.calculateCourseProgress(studentId, targetCourseId);
    setProgress(currentProgress);

    const existingCert = lmsService.getStudentCertificates(studentId).find((c) => c.courseId === targetCourseId);
    if (existingCert) {
      setEarnedCert(existingCert);
    }
  }, [studentId, targetCourseId, activeLessonId, lessons]);

  const handleToggleComplete = () => {
    if (!activeLesson) return;
    const newProg = lmsService.toggleLessonCompletion(studentId, targetCourseId, activeLesson.id);
    setProgress(newProg);

    // If 100% complete, issue certificate automatically
    if (newProg.progressPercent === 100 && !earnedCert) {
      const issued = lmsService.issueCertificate(
        studentId,
        studentName,
        studentEmail,
        targetCourseId,
        course.title,
        "Distinction"
      );
      setEarnedCert(issued);
      setIsCertModalOpen(true);
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const currentIdx = lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIdx >= 0 && currentIdx < lessons.length - 1) {
      setActiveLessonId(lessons[currentIdx + 1].id);
      setActiveTab("overview");
    }
  };

  const activeQuiz: Quiz | undefined = activeLesson?.quizId
    ? lmsService.getQuizById(activeLesson.quizId)
    : undefined;

  const activeAssignment: Assignment | undefined = activeLesson?.assignmentId
    ? lmsService.getAssignmentById(activeLesson.assignmentId)
    : undefined;

  const isCompleted = activeLesson
    ? lmsService.isLessonCompleted(studentId, targetCourseId, activeLesson.id)
    : false;

  return (
    <div className="classroom-layout">
      {/* Top Classroom Bar */}
      <header className="classroom-topbar">
        <div className="classroom-topbar__left">
          <Link to="/dashboard/courses" className="classroom-back-btn">
            ← Dashboard
          </Link>
          <div className="classroom-course-info">
            <h1 className="classroom-course-title">{course.title}</h1>
            <span className="classroom-badge">Live Interactive Classroom</span>
          </div>
        </div>

        <div className="classroom-topbar__right">
          {/* Course Progress Indicator */}
          <div className="classroom-prog-block">
            <div className="classroom-prog-label">
              <span>Course Progress</span>
              <strong>{progress?.progressPercent || 0}%</strong>
            </div>
            <div className="classroom-prog-bar">
              <div
                className="classroom-prog-fill"
                style={{ width: `${progress?.progressPercent || 0}%` }}
              />
            </div>
          </div>

          {/* Certificate Action */}
          {earnedCert || progress?.progressPercent === 100 ? (
            <button
              type="button"
              className="btn btn--primary btn--sm btn--glow"
              onClick={() => {
                if (!earnedCert) {
                  const issued = lmsService.issueCertificate(
                    studentId,
                    studentName,
                    studentEmail,
                    targetCourseId,
                    course.title,
                    "Distinction"
                  );
                  setEarnedCert(issued);
                }
                setIsCertModalOpen(true);
              }}
            >
              🎓 View Certificate
            </button>
          ) : (
            <span className="classroom-cert-locked" title="Complete 100% of lessons to unlock official certificate">
              🔒 Certificate Locked ({progress?.progressPercent || 0}%)
            </span>
          )}
        </div>
      </header>

      {/* Main Classroom Grid: Video + Content | Sidebar */}
      <div className="classroom-main-grid">
        {/* Left Column: Player & Interactive Tabs */}
        <div className="classroom-main-content">
          {activeLesson ? (
            <VideoPlayer
              lesson={activeLesson}
              isCompleted={isCompleted}
              onToggleComplete={handleToggleComplete}
              onNextLesson={
                lessons.findIndex((l) => l.id === activeLesson.id) < lessons.length - 1
                  ? handleNextLesson
                  : undefined
              }
            />
          ) : (
            <div className="card" style={{ padding: "var(--sp-8)", textAlign: "center" }}>
              <h3>No video lesson found for this module.</h3>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="classroom-tabs">
            <button
              type="button"
              className={`classroom-tab-btn ${activeTab === "overview" ? "classroom-tab-btn--active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📖 Lesson Notes
            </button>

            {activeLesson?.resources && activeLesson.resources.length > 0 && (
              <button
                type="button"
                className={`classroom-tab-btn ${activeTab === "resources" ? "classroom-tab-btn--active" : ""}`}
                onClick={() => setActiveTab("resources")}
              >
                📎 Attachments ({activeLesson.resources.length})
              </button>
            )}

            {activeQuiz && (
              <button
                type="button"
                className={`classroom-tab-btn ${activeTab === "quiz" ? "classroom-tab-btn--active" : ""}`}
                onClick={() => setActiveTab("quiz")}
              >
                ✍️ Quiz / Assessment
              </button>
            )}

            {activeAssignment && (
              <button
                type="button"
                className={`classroom-tab-btn ${activeTab === "assignment" ? "classroom-tab-btn--active" : ""}`}
                onClick={() => setActiveTab("assignment")}
              >
                📂 Capstone Assignment
              </button>
            )}

            <button
              type="button"
              className={`classroom-tab-btn ${activeTab === "ai" ? "classroom-tab-btn--active" : ""}`}
              onClick={() => setActiveTab("ai")}
            >
              🤖 Dave AI Tutor
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="classroom-tab-panel">
            {activeTab === "overview" && activeLesson && (
              <div className="card" style={{ padding: "var(--sp-6)" }}>
                <h3 style={{ fontSize: "var(--fs-xl)", color: "var(--text-primary)", marginBottom: "var(--sp-3)" }}>
                  {activeLesson.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "var(--fs-base)" }}>
                  {activeLesson.description}
                </p>

                <div style={{ marginTop: "var(--sp-6)", paddingTop: "var(--sp-6)", borderTop: "1px solid var(--border-primary)" }}>
                  <h4 style={{ color: "var(--color-gold-bright)", marginBottom: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>
                    Key Learning Objectives:
                  </h4>
                  <ul style={{ color: "var(--text-secondary)", paddingLeft: "var(--sp-4)", fontSize: "var(--fs-sm)" }}>
                    <li>Understand architectural flow and core paradigms.</li>
                    <li>Implement responsive, resilient components adhering to industry best practices.</li>
                    <li>Verify functionality through automated tests and state assertions.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "resources" && activeLesson?.resources && (
              <div className="card" style={{ padding: "var(--sp-6)" }}>
                <h3 style={{ marginBottom: "var(--sp-4)", fontSize: "var(--fs-lg)" }}>
                  Downloadable Materials & Starter Repos
                </h3>
                <div className="classroom-resources-list">
                  {activeLesson.resources.map((res) => (
                    <div key={res.id} className="classroom-resource-item">
                      <div className="classroom-resource-icon">
                        {res.type === "github" ? "🐙" : res.type === "pdf" ? "📄" : "📦"}
                      </div>
                      <div className="classroom-resource-info">
                        <strong>{res.title}</strong>
                        {res.size && <span className="text-muted" style={{ fontSize: "11px" }}>({res.size})</span>}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--secondary btn--sm"
                      >
                        Download / View →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "quiz" && activeQuiz && (
              <QuizRunner
                quiz={activeQuiz}
                studentId={studentId}
                onComplete={() => {
                  if (activeLesson) {
                    lmsService.toggleLessonCompletion(studentId, targetCourseId, activeLesson.id);
                    const updated = lmsService.calculateCourseProgress(studentId, targetCourseId);
                    setProgress(updated);
                  }
                }}
              />
            )}

            {activeTab === "assignment" && activeAssignment && (
              <AssignmentRunner
                assignment={activeAssignment}
                studentId={studentId}
                studentName={studentName}
                studentEmail={studentEmail}
              />
            )}

            {activeTab === "ai" && (
              <AILearningAssistant
                courseTitle={course.title}
                lessonTitle={activeLesson?.title}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar: Curriculum Module & Lesson Tree */}
        <aside className="classroom-sidebar card">
          <div className="classroom-sidebar__header">
            <h3>Course Curriculum</h3>
            <span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
              {lessons.length} Lessons Available
            </span>
          </div>

          <div className="classroom-module-list">
            {Object.entries(modulesMap).map(([mId, mod]) => (
              <div key={mId} className="classroom-module-block">
                <div className="classroom-module-title">
                  <span>{mod.title}</span>
                </div>

                <div className="classroom-lesson-items">
                  {mod.lessons.map((lesson) => {
                    const isLessonDone = lmsService.isLessonCompleted(studentId, targetCourseId, lesson.id);
                    const isActive = lesson.id === activeLesson?.id;

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        className={`classroom-lesson-row ${isActive ? "classroom-lesson-row--active" : ""}`}
                        onClick={() => {
                          setActiveLessonId(lesson.id);
                          setActiveTab("overview");
                        }}
                      >
                        <span className={`classroom-check ${isLessonDone ? "classroom-check--done" : ""}`}>
                          {isLessonDone ? "✓" : "○"}
                        </span>
                        <div className="classroom-lesson-meta">
                          <span className="classroom-lesson-name">{lesson.title}</span>
                          <span className="classroom-lesson-duration">
                            {lesson.durationMinutes} min
                            {lesson.quizId && " • Quiz"}
                            {lesson.assignmentId && " • Project"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Certificate Modal */}
      {earnedCert && (
        <CertificateModal
          certificate={earnedCert}
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
        />
      )}
    </div>
  );
};
