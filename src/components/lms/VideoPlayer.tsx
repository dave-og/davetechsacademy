import React, { useState } from "react";
import type { Lesson } from "../../types/lms";
import "./LMSComponents.css";

interface VideoPlayerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNextLesson?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  isCompleted,
  onToggleComplete,
  onNextLesson,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className={`lms-video-card ${isFullscreen ? "lms-video-card--fullscreen" : ""}`}>
      {/* Video Container */}
      <div className="lms-video-wrapper">
        {lesson.videoProvider === "youtube" ? (
          <iframe
            src={`${lesson.videoUrl}?autoplay=0&rel=0&modestbranding=1`}
            title={lesson.title}
            className="lms-video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="lms-video-placeholder">
            <svg
              className="lms-video-icon"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <p className="lms-video-title">{lesson.title}</p>
            <span className="lms-video-badge">{lesson.durationMinutes} Minutes Lesson</span>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="lms-video-toolbar">
        <div className="lms-video-toolbar__meta">
          <span className="lms-video-toolbar__module">{lesson.moduleTitle}</span>
          <h3 className="lms-video-toolbar__title">{lesson.title}</h3>
        </div>

        <div className="lms-video-toolbar__actions">
          {/* Playback Speed */}
          <div className="lms-speed-selector">
            <span className="lms-speed-label">Speed:</span>
            <div className="lms-speed-pills">
              {speeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPlaybackSpeed(s)}
                  className={`lms-speed-btn ${playbackSpeed === s ? "lms-speed-btn--active" : ""}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Theater Mode"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            {isFullscreen ? "Standard View" : "Theater Mode"}
          </button>

          {/* Complete Toggle */}
          <button
            type="button"
            className={`btn btn--sm ${isCompleted ? "btn--secondary" : "btn--primary"}`}
            onClick={onToggleComplete}
          >
            {isCompleted ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Completed
              </>
            ) : (
              "Mark as Complete"
            )}
          </button>

          {/* Next Lesson */}
          {onNextLesson && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onNextLesson}
            >
              Next Lesson →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
