import React, { useState } from "react";
import type { AIMessage } from "../../types/lms";
import { lmsService } from "../../services/lmsService";
import "./LMSComponents.css";

interface AILearningAssistantProps {
  courseTitle?: string;
  lessonTitle?: string;
}

export const AILearningAssistant: React.FC<AILearningAssistantProps> = ({
  courseTitle,
  lessonTitle,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "msg-0",
      role: "assistant",
      content: `👋 Hi there! I'm **Dave AI**, your 24/7 technical learning tutor for **${courseTitle || "Dave Techs Academy"}**.

I can help explain code concepts, debug syntax errors, review your architecture, or create personalized practice questions. What are you working on right now?`,
      timestamp: "Just now",
      suggestedPrompts: [
        "Explain the core concept of this lesson",
        "How do I debug a React state mutation bug?",
        "Give me a challenge exercise for this topic",
      ],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const aiReply = lmsService.generateAIResponse(text, courseTitle, lessonTitle);
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="lms-ai-assistant card">
      {/* Header */}
      <div className="lms-ai-header">
        <div className="lms-ai-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
            <rect x="4" y="8" width="16" height="12" rx="2" />
            <circle cx="9" cy="13" r="1" fill="currentColor" />
            <circle cx="15" cy="13" r="1" fill="currentColor" />
            <path d="M9 17h6" />
          </svg>
        </div>
        <div>
          <div className="lms-ai-title">Dave AI Learning Assistant</div>
          <div className="lms-ai-subtitle">Active Context: {lessonTitle || courseTitle || "Curriculum"}</div>
        </div>
        <span className="badge badge--active" style={{ marginLeft: "auto" }}>
          AI Online 24/7
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="lms-ai-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`lms-ai-msg ${m.role === "user" ? "lms-ai-msg--user" : "lms-ai-msg--bot"}`}
          >
            <div className="lms-ai-msg-bubble">
              <div className="lms-ai-msg-text">
                {m.content.split("\n\n").map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {m.codeSnippet && (
                <div className="lms-ai-code-block">
                  <pre>
                    <code>{m.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <div className="lms-ai-msg-time">{m.timestamp}</div>
            </div>

            {m.suggestedPrompts && (
              <div className="lms-ai-prompts">
                {m.suggestedPrompts.map((p, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    className="lms-ai-prompt-chip"
                    onClick={() => handleSend(p)}
                  >
                    💡 {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="lms-ai-msg lms-ai-msg--bot">
            <div className="lms-ai-msg-bubble lms-ai-typing">
              <span>Dave AI is generating answer</span>
              <span className="lms-typing-dots">...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form
        className="lms-ai-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Ask Dave AI any question about code, exercises, or curriculum..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!inputText.trim() || isTyping}
        >
          Ask AI
        </button>
      </form>
    </div>
  );
};
