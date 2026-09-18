import React, { useState, useEffect } from "react";
import type { Assignment, AssignmentSubmission } from "../../types/lms";
import { lmsService } from "../../services/lmsService";
import "./LMSComponents.css";

interface AssignmentRunnerProps {
  assignment: Assignment;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

export const AssignmentRunner: React.FC<AssignmentRunnerProps> = ({
  assignment,
  studentId,
  studentName,
  studentEmail,
}) => {
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const subs = lmsService.getSubmissions({
      studentId,
      assignmentId: assignment.id,
    });
    if (subs.length > 0) {
      setSubmission(subs[subs.length - 1]);
      setSubmissionText(subs[subs.length - 1].submissionText);
      setGithubUrl(subs[subs.length - 1].githubUrl || "");
      setDemoUrl(subs[subs.length - 1].demoUrl || "");
    } else {
      setSubmission(null);
      setSubmissionText("");
      setGithubUrl("");
      setDemoUrl("");
    }
  }, [assignment.id, studentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim()) {
      setStatusMessage("Please enter your project notes or response.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const newSub = lmsService.submitAssignment({
        assignmentId: assignment.id,
        courseId: assignment.courseId,
        studentId,
        studentName,
        studentEmail,
        submissionText,
        githubUrl: githubUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
      });
      setSubmission(newSub);
      setStatusMessage("Assignment submitted successfully! An instructor will review your work.");
    } catch {
      setStatusMessage("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lms-assignment-container">
      {/* Header & Instructions */}
      <div className="lms-assignment-header card">
        <div className="lms-assignment-badge">Practical Capstone Project</div>
        <h2 className="lms-assignment-title">{assignment.title}</h2>
        <div className="lms-assignment-instructions">
          {assignment.instructions.split("\n\n").map((para, pIdx) => (
            <p key={pIdx}>{para}</p>
          ))}
        </div>

        {/* Rubric */}
        <div className="lms-assignment-rubric">
          <h4>Grading Criteria & Rubric (Max: {assignment.maxScore} pts):</h4>
          <ul>
            {assignment.rubric.map((item, rIdx) => (
              <li key={rIdx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Existing Graded Review */}
      {submission && submission.status === "graded" && (
        <div className="lms-assignment-feedback card lms-assignment-feedback--graded">
          <div className="lms-feedback-header">
            <div>
              <span className="badge badge--active">Graded by Instructor</span>
              <h3>Instructor Evaluation & Feedback</h3>
            </div>
            <div className="lms-feedback-score">
              <span className="lms-feedback-score-num">{submission.score}</span>
              <span className="lms-feedback-score-denom">/ {assignment.maxScore}</span>
            </div>
          </div>
          <p className="lms-feedback-text">{submission.feedback || "Excellent work on your implementation!"}</p>
          <div className="lms-feedback-meta">
            Evaluated by <strong>{submission.gradedBy || "Senior Instructor"}</strong> on{" "}
            {submission.gradedAt ? new Date(submission.gradedAt).toLocaleDateString() : "Recent"}
          </div>
        </div>
      )}

      {/* Submission Form */}
      <div className="lms-assignment-form-card card">
        <h3>{submission ? "Update Submission" : "Submit Your Solution"}</h3>

        {statusMessage && (
          <div
            className={`alert ${statusMessage.includes("success") ? "alert--success" : "alert--danger"}`}
            style={{ marginBottom: "var(--sp-4)" }}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="assignment-notes">
              Project Description & Implementation Notes *
            </label>
            <textarea
              id="assignment-notes"
              className="form-input form-textarea"
              rows={6}
              placeholder="Describe your architecture, tools used, key challenges overcome, and instructions for running the project..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              required
            />
          </div>

          <div className="grid grid--2" style={{ marginTop: "var(--sp-4)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="github-url">
                GitHub Repository URL
              </label>
              <input
                id="github-url"
                type="url"
                className="form-input"
                placeholder="https://github.com/username/project-repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="demo-url">
                Live Deployment URL (Vercel / Netlify)
              </label>
              <input
                id="demo-url"
                type="url"
                className="form-input"
                placeholder="https://your-project.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: "var(--sp-6)", display: "flex", gap: "var(--sp-4)", alignItems: "center" }}>
            <button
              type="submit"
              className="btn btn--primary btn--glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : submission ? "Resubmit Project" : "Submit Assignment"}
            </button>
            {submission && (
              <span className="text-muted" style={{ fontSize: "var(--fs-sm)" }}>
                Last submitted on {new Date(submission.submittedAt).toLocaleString()} ({submission.status})
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
