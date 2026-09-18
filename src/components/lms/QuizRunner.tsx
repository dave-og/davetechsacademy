import React, { useState, useEffect } from "react";
import type { Quiz, QuizAttempt } from "../../types/lms";
import { lmsService } from "../../services/lmsService";
import "./LMSComponents.css";

interface QuizRunnerProps {
  quiz: Quiz;
  studentId: string;
  onComplete?: (attempt: QuizAttempt) => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, studentId, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(
    quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : 0
  );

  // Load existing attempts
  useEffect(() => {
    const attempts = lmsService.getQuizAttempts(studentId, quiz.id);
    if (attempts.length > 0) {
      setAttemptResult(attempts[0]);
      setIsSubmitted(true);
      setSelectedAnswers(attempts[0].answers);
    } else {
      setIsSubmitted(false);
      setAttemptResult(null);
      setSelectedAnswers({});
      setCurrentQuestionIdx(0);
    }
  }, [quiz.id, studentId]);

  // Timer countdown if active
  useEffect(() => {
    if (isSubmitted || !quiz.timeLimitMinutes || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, quiz.timeLimitMinutes, timeLeft]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    const attempt = lmsService.submitQuizAttempt(
      quiz.id,
      studentId,
      quiz.courseId,
      selectedAnswers
    );
    setAttemptResult(attempt);
    setIsSubmitted(true);
    if (onComplete) onComplete(attempt);
  };

  const handleRetake = () => {
    setIsSubmitted(false);
    setAttemptResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    if (quiz.timeLimitMinutes) setTimeLeft(quiz.timeLimitMinutes * 60);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = quiz.questions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === quiz.questions.length;

  return (
    <div className="lms-quiz-container">
      {/* Quiz Header */}
      <div className="lms-quiz-header">
        <div>
          <div className="lms-quiz-badge">
            {quiz.type === "exam" ? "Final Assessment Exam" : "Knowledge Check Quiz"}
          </div>
          <h2 className="lms-quiz-title">{quiz.title}</h2>
          <p className="lms-quiz-desc">{quiz.description}</p>
        </div>

        {quiz.timeLimitMinutes && !isSubmitted && (
          <div className={`lms-quiz-timer ${timeLeft < 120 ? "lms-quiz-timer--warning" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Time Left: <strong>{formatTimer(timeLeft)}</strong></span>
          </div>
        )}
      </div>

      {/* Results View */}
      {isSubmitted && attemptResult ? (
        <div className="lms-quiz-results card">
          <div
            className={`lms-quiz-score-badge ${
              attemptResult.passed ? "lms-quiz-score-badge--pass" : "lms-quiz-score-badge--fail"
            }`}
          >
            <div className="lms-quiz-score-num">{attemptResult.percentage}%</div>
            <div className="lms-quiz-score-label">
              {attemptResult.passed ? "Assessment Passed!" : "Needs Improvement"}
            </div>
          </div>

          <div className="lms-quiz-summary">
            <p>
              You scored <strong>{attemptResult.score}</strong> out of{" "}
              <strong>{attemptResult.totalPoints}</strong> points (Passing threshold:{" "}
              {quiz.passingScorePercent}%).
            </p>
          </div>

          {/* Question Review */}
          <div className="lms-quiz-review-list">
            <h4 className="lms-quiz-review-heading">Answer Review & Explanations:</h4>
            {quiz.questions.map((q, idx) => {
              const selectedIdx = attemptResult.answers[q.id];
              const isCorrect = selectedIdx === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className={`lms-quiz-review-item ${
                    isCorrect ? "lms-quiz-review-item--correct" : "lms-quiz-review-item--wrong"
                  }`}
                >
                  <div className="lms-quiz-review-header">
                    <span className="lms-quiz-review-num">Question {idx + 1}</span>
                    <span className={`badge ${isCorrect ? "badge--active" : "badge--danger"}`}>
                      {isCorrect ? `+${q.points} pts` : `0 / ${q.points} pts`}
                    </span>
                  </div>
                  <p className="lms-quiz-review-question">{q.question}</p>

                  <div className="lms-quiz-review-options">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`lms-quiz-review-opt ${
                          oIdx === q.correctOptionIndex
                            ? "lms-quiz-review-opt--correct"
                            : oIdx === selectedIdx
                            ? "lms-quiz-review-opt--selected"
                            : ""
                        }`}
                      >
                        {opt}
                        {oIdx === q.correctOptionIndex && " (Correct Answer)"}
                        {oIdx === selectedIdx && oIdx !== q.correctOptionIndex && " (Your Choice)"}
                      </div>
                    ))}
                  </div>

                  <div className="lms-quiz-explanation">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lms-quiz-results-actions">
            <button type="button" className="btn btn--secondary" onClick={handleRetake}>
              Retake Assessment
            </button>
          </div>
        </div>
      ) : (
        /* Active Quiz Question Runner */
        <div className="lms-quiz-active">
          {/* Progress Tracker */}
          <div className="lms-quiz-stepper">
            <div className="lms-quiz-stepper-text">
              Question {currentQuestionIdx + 1} of {quiz.questions.length} ({answeredCount} answered)
            </div>
            <div className="lms-quiz-stepper-bar">
              <div
                className="lms-quiz-stepper-fill"
                style={{
                  width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <div className="lms-quiz-qcard card">
              <h3 className="lms-quiz-qtext">{currentQ.question}</h3>
              <span className="lms-quiz-qpoints">{currentQ.points} points</span>

              <div className="lms-quiz-options">
                {currentQ.options.map((option, oIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className={`lms-quiz-option-btn ${isSelected ? "lms-quiz-option-btn--selected" : ""}`}
                      onClick={() => handleSelectOption(currentQ.id, oIdx)}
                    >
                      <span className="lms-quiz-opt-marker">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="lms-quiz-opt-text">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="lms-quiz-nav">
            <button
              type="button"
              className="btn btn--secondary"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((p) => Math.max(p - 1, 0))}
            >
              ← Previous
            </button>

            {currentQuestionIdx < quiz.questions.length - 1 ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() =>
                  setCurrentQuestionIdx((p) => Math.min(p + 1, quiz.questions.length - 1))
                }
              >
                Next Question →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary btn--glow"
                disabled={!isAllAnswered}
                onClick={handleSubmit}
              >
                Submit Assessment ({answeredCount}/{quiz.questions.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
