import React, { useState, useEffect } from "react";
import { lmsService } from "../../services/lmsService";
import { courses } from "../../data/courses";
import type { Lesson, Quiz, AssignmentSubmission } from "../../types/lms";

export const LmsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"lessons" | "submissions" | "quizzes">("lessons");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "course-1");

  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    moduleTitle: string;
    moduleId: string;
    durationMinutes: number;
    videoUrl: string;
    description: string;
    order: number;
  }>({
    title: "",
    moduleTitle: "Module 1: Foundations",
    moduleId: "mod-1",
    durationMinutes: 45,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "",
    order: 1,
  });

  // Submissions state
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [gradingSub, setGradingSub] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>("Great project execution!");

  // Quizzes state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const loadData = () => {
    setLessons(lmsService.getLessons(selectedCourseId));
    setSubmissions(lmsService.getSubmissions({ courseId: selectedCourseId }));
    setQuizzes(lmsService.getQuizzes(selectedCourseId));
  };

  useEffect(() => {
    loadData();
  }, [selectedCourseId]);

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;

    const lessonToSave: Lesson = {
      id: editingLesson?.id || `lesson-${Date.now()}`,
      courseId: selectedCourseId,
      moduleId: lessonForm.moduleId,
      moduleTitle: lessonForm.moduleTitle,
      title: lessonForm.title,
      description: lessonForm.description,
      durationMinutes: Number(lessonForm.durationMinutes),
      videoUrl: lessonForm.videoUrl,
      videoProvider: "youtube",
      order: Number(lessonForm.order),
    };

    lmsService.saveLesson(lessonToSave);
    setEditingLesson(null);
    setLessonForm({
      title: "",
      moduleTitle: "Module 1: Foundations",
      moduleId: "mod-1",
      durationMinutes: 45,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "",
      order: lessons.length + 1,
    });
    loadData();
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm("Are you sure you want to remove this video lesson?")) {
      lmsService.deleteLesson(lessonId);
      loadData();
    }
  };

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;

    lmsService.gradeSubmission(
      gradingSub.id,
      Number(gradeScore),
      gradeFeedback,
      "Lead Academy Instructor"
    );
    setGradingSub(null);
    loadData();
  };

  return (
    <div className="admin-lms">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">LMS & Curriculum Manager</h1>
          <p className="admin-page-subtitle">
            Manage course video lessons, curriculum modules, quizzes, and grade student capstone assignments.
          </p>
        </div>

        {/* Course Selector */}
        <div style={{ minWidth: "260px" }}>
          <select
            className="form-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-6)", borderBottom: "1px solid var(--border-primary)" }}>
        <button
          type="button"
          className={`btn ${activeTab === "lessons" ? "btn--primary" : "btn--ghost"} btn--sm`}
          onClick={() => setActiveTab("lessons")}
        >
          🎬 Video Lessons ({lessons.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "submissions" ? "btn--primary" : "btn--ghost"} btn--sm`}
          onClick={() => setActiveTab("submissions")}
        >
          📝 Student Submissions ({submissions.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "quizzes" ? "btn--primary" : "btn--ghost"} btn--sm`}
          onClick={() => setActiveTab("quizzes")}
        >
          ✍️ Quizzes & Exams ({quizzes.length})
        </button>
      </div>

      {/* Tab: Video Lessons */}
      {activeTab === "lessons" && (
        <div className="grid grid--2" style={{ alignItems: "flex-start" }}>
          {/* Lessons List */}
          <div className="card" style={{ padding: "var(--sp-6)" }}>
            <h3 style={{ marginBottom: "var(--sp-4)" }}>Curriculum Video Lessons</h3>
            {lessons.length === 0 ? (
              <p className="text-muted">No lessons published for this course yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
                {lessons.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      padding: "var(--sp-3) var(--sp-4)",
                      background: "var(--bg-input)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-primary)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div className="text-gold" style={{ fontSize: "11px", fontWeight: 700 }}>
                        {l.moduleTitle}
                      </div>
                      <strong style={{ fontSize: "var(--fs-sm)" }}>{l.title}</strong>
                      <div className="text-muted" style={{ fontSize: "11px" }}>
                        ⏱ {l.durationMinutes} min • Order #{l.order}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => {
                          setEditingLesson(l);
                          setLessonForm({
                            title: l.title,
                            moduleTitle: l.moduleTitle,
                            moduleId: l.moduleId,
                            durationMinutes: l.durationMinutes,
                            videoUrl: l.videoUrl,
                            description: l.description,
                            order: l.order,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => handleDeleteLesson(l.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Edit Lesson Form */}
          <div className="card" style={{ padding: "var(--sp-6)" }}>
            <h3>{editingLesson ? "Edit Video Lesson" : "Add New Video Lesson"}</h3>

            <form onSubmit={handleSaveLesson} style={{ marginTop: "var(--sp-4)" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="les-title">
                  Lesson Title *
                </label>
                <input
                  id="les-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1.1 Intro to Component Tree Architecture"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid--2" style={{ margin: "var(--sp-3) 0" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="les-mod">
                    Module Title *
                  </label>
                  <input
                    id="les-mod"
                    type="text"
                    className="form-input"
                    value={lessonForm.moduleTitle}
                    onChange={(e) => setLessonForm({ ...lessonForm, moduleTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="les-dur">
                    Duration (Minutes) *
                  </label>
                  <input
                    id="les-dur"
                    type="number"
                    className="form-input"
                    value={lessonForm.durationMinutes}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="les-video">
                  Video Embed URL (YouTube / Vimeo / MP4) *
                </label>
                <input
                  id="les-video"
                  type="url"
                  className="form-input"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: "var(--sp-3)" }}>
                <label className="form-label" htmlFor="les-desc">
                  Lesson Notes & Summary
                </label>
                <textarea
                  id="les-desc"
                  className="form-input form-textarea"
                  rows={4}
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                />
              </div>

              <div style={{ marginTop: "var(--sp-6)", display: "flex", gap: "var(--sp-3)" }}>
                <button type="submit" className="btn btn--primary btn--glow">
                  {editingLesson ? "Update Lesson" : "Publish Lesson"}
                </button>
                {editingLesson && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => {
                      setEditingLesson(null);
                      setLessonForm({
                        title: "",
                        moduleTitle: "Module 1: Foundations",
                        moduleId: "mod-1",
                        durationMinutes: 45,
                        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                        description: "",
                        order: lessons.length + 1,
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Submissions & Grading */}
      {activeTab === "submissions" && (
        <div className="card" style={{ padding: "var(--sp-6)" }}>
          <h3 style={{ marginBottom: "var(--sp-4)" }}>Student Project Submissions</h3>

          {submissions.length === 0 ? (
            <p className="text-muted">No student submissions recorded for this course yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Project Notes / URLs</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <strong>{sub.studentName}</strong>
                        <div className="text-muted" style={{ fontSize: "11px" }}>{sub.studentEmail}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: "300px", fontSize: "var(--fs-xs)", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {sub.submissionText}
                        </div>
                        {sub.githubUrl && (
                          <div>
                            <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-gold" style={{ fontSize: "11px" }}>
                              🐙 GitHub Repo
                            </a>
                          </div>
                        )}
                        {sub.demoUrl && (
                          <div>
                            <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-gold" style={{ fontSize: "11px" }}>
                              🚀 Live Preview
                            </a>
                          </div>
                        )}
                      </td>
                      <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${sub.status === "graded" ? "badge--active" : "badge--pending"}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-gold" style={{ fontWeight: 700 }}>
                        {sub.score !== undefined ? `${sub.score} / 100` : "Pending"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => {
                            setGradingSub(sub);
                            setGradeScore(sub.score || 95);
                            setGradeFeedback(sub.feedback || "Well implemented architecture!");
                          }}
                        >
                          Grade Submission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Grading Modal */}
          {gradingSub && (
            <div className="modal-overlay" onClick={() => setGradingSub(null)}>
              <div className="modal modal--md" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                  <h3 className="modal__title">Grade Submission: {gradingSub.studentName}</h3>
                  <button type="button" className="modal__close" onClick={() => setGradingSub(null)}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleGradeSubmission} style={{ marginTop: "var(--sp-4)" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="grade-score">
                      Assigned Score (0 - 100) *
                    </label>
                    <input
                      id="grade-score"
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={gradeScore}
                      onChange={(e) => setGradeScore(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: "var(--sp-3)" }}>
                    <label className="form-label" htmlFor="grade-feedback">
                      Instructor Feedback & Recommendations *
                    </label>
                    <textarea
                      id="grade-feedback"
                      className="form-input form-textarea"
                      rows={4}
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ marginTop: "var(--sp-6)", display: "flex", gap: "var(--sp-3)" }}>
                    <button type="submit" className="btn btn--primary btn--glow">
                      Save Grade & Publish to Student
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={() => setGradingSub(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Quizzes & Exams */}
      {activeTab === "quizzes" && (
        <div className="card" style={{ padding: "var(--sp-6)" }}>
          <h3 style={{ marginBottom: "var(--sp-4)" }}>Configured Quizzes & Final Exams</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            {quizzes.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: "var(--sp-4)",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span className="badge badge--active">{q.type.toUpperCase()}</span>
                    <h4 style={{ fontSize: "var(--fs-base)", marginTop: "4px" }}>{q.title}</h4>
                    <p className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
                      {q.questions.length} Questions • Passing: {q.passingScorePercent}% • Time: {q.timeLimitMinutes || "Untimed"} min
                    </p>
                  </div>
                  <span className="text-gold" style={{ fontSize: "var(--fs-xs)", fontWeight: 700 }}>
                    Auto-Graded Engine Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
