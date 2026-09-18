import React, { useState, useEffect } from "react";
import { lmsService } from "../../services/lmsService";
import { useAuth } from "../../hooks/useAuth";
import { useSEO } from "../../hooks/useSEO";
import type { ForumTopic, ForumCategory } from "../../types/lms";
import "./Community.css";

export const Community: React.FC = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);

  // New Topic Form State
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ForumCategory>("general");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  // Reply Form State
  const [replyText, setReplyText] = useState("");

  useSEO({
    title: "Student Community & Tech Forums | Dave Techs Academy",
    description: "Connect with Dave Techs Academy students, alumni, and instructors. Discuss code, share capstone projects, and accelerate your tech career.",
  });

  const loadTopics = () => {
    const list = lmsService.getForumTopics(selectedCategory, searchQuery);
    setTopics(list);
    if (activeTopic) {
      const refreshed = list.find((t) => t.id === activeTopic.id);
      setActiveTopic(refreshed || null);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [selectedCategory, searchQuery]);

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const authorName = user?.fullName || "Dave Techs Student";
    const authorId = user?.id || "student-guest";
    const authorRole = user?.role === "admin" ? "admin" : "student";

    const tagsArray = newTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const created = lmsService.createForumTopic({
      title: newTitle,
      category: newCategory,
      content: newContent,
      authorId,
      authorName,
      authorRole,
      tags: tagsArray.length > 0 ? tagsArray : ["Discussion"],
    });

    setIsCreatingTopic(false);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    loadTopics();
    setActiveTopic(created);
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic || !replyText.trim()) return;

    const authorName = user?.fullName || "Dave Techs Student";
    const authorId = user?.id || "student-guest";
    const authorRole = user?.role === "admin" ? "admin" : "student";

    lmsService.addForumReply(activeTopic.id, {
      authorId,
      authorName,
      authorRole,
      content: replyText,
    });

    setReplyText("");
    loadTopics();
    const updated = lmsService.getForumTopicById(activeTopic.id);
    if (updated) setActiveTopic(updated);
  };

  const handleLike = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    lmsService.likeTopic(topicId);
    loadTopics();
    if (activeTopic?.id === topicId) {
      const updated = lmsService.getForumTopicById(topicId);
      if (updated) setActiveTopic(updated);
    }
  };

  const categories = [
    { id: "all", label: "🌐 All Discussions" },
    { id: "course_qa", label: "💡 Course Q&A" },
    { id: "projects", label: "🚀 Project Showcase" },
    { id: "career", label: "💼 Career & Hiring" },
    { id: "general", label: "💬 General Hub" },
  ];

  return (
    <div className="community-page section container">
      {/* Hero */}
      <div className="community-hero">
        <span className="badge badge--active">Peer Learning Network</span>
        <h1 className="section__title" style={{ marginTop: "var(--sp-2)" }}>
          Student Community & Technical Forums
        </h1>
        <p className="section__subtitle">
          Collaborate with fellow learners, get answers from instructors, showcase your capstone projects, and network with hiring alumni.
        </p>

        <div className="community-hero-actions">
          <button
            type="button"
            className="btn btn--primary btn--glow"
            onClick={() => {
              setIsCreatingTopic(true);
              setActiveTopic(null);
            }}
          >
            ✍️ Start New Discussion
          </button>
        </div>
      </div>

      {/* Main Community Grid */}
      <div className="community-grid">
        {/* Left Sidebar: Categories & Search */}
        <aside className="community-sidebar card">
          <div className="form-group" style={{ marginBottom: "var(--sp-4)" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search discussions & tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <h4 className="community-sidebar-title">Categories</h4>
          <div className="community-cat-list">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`community-cat-btn ${selectedCategory === c.id ? "community-cat-btn--active" : ""}`}
                onClick={() => {
                  setSelectedCategory(c.id);
                  setActiveTopic(null);
                  setIsCreatingTopic(false);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Center / Main Content Area */}
        <div className="community-main">
          {/* Create Topic Modal / Form */}
          {isCreatingTopic && (
            <div className="community-create-card card">
              <div className="community-create-header">
                <h3>Start a New Technical Discussion</h3>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setIsCreatingTopic(false)}
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateTopic}>
                <div className="form-group">
                  <label className="form-label" htmlFor="topic-title">
                    Discussion Title *
                  </label>
                  <input
                    id="topic-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g., How do I implement optimistic UI updates in React Query?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid--2" style={{ margin: "var(--sp-4) 0" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="topic-category">
                      Category *
                    </label>
                    <select
                      id="topic-category"
                      className="form-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ForumCategory)}
                    >
                      <option value="course_qa">Course Q&A</option>
                      <option value="projects">Project Showcase</option>
                      <option value="career">Career & Hiring</option>
                      <option value="general">General Discussion</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="topic-tags">
                      Tags (Comma-separated)
                    </label>
                    <input
                      id="topic-tags"
                      type="text"
                      className="form-input"
                      placeholder="React, State, TypeScript"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="topic-content">
                    Detailed Question / Context *
                  </label>
                  <textarea
                    id="topic-content"
                    className="form-input form-textarea"
                    rows={6}
                    placeholder="Provide full context, code snippets, or error logs to help the community answer effectively..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginTop: "var(--sp-6)", display: "flex", gap: "var(--sp-4)" }}>
                  <button type="submit" className="btn btn--primary btn--glow">
                    Publish Discussion
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setIsCreatingTopic(false)}
                  >
                    Discard
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Topic Detail View */}
          {activeTopic && !isCreatingTopic ? (
            <div className="community-detail card">
              <button
                type="button"
                className="community-back-btn"
                onClick={() => setActiveTopic(null)}
              >
                ← Back to All Discussions
              </button>

              <div className="community-detail-header">
                <div className="community-detail-meta">
                  <span className="badge badge--active">{activeTopic.category.replace("_", " ").toUpperCase()}</span>
                  {activeTopic.isSolved && <span className="badge badge--outline text-gold">✓ Solved</span>}
                  <span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
                    Posted by <strong>{activeTopic.authorName}</strong> ({activeTopic.authorRole}) on{" "}
                    {new Date(activeTopic.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="community-detail-title">{activeTopic.title}</h2>

                <div className="community-tags">
                  {activeTopic.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="community-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="community-detail-content">
                {activeTopic.content.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Likes & Actions */}
              <div className="community-detail-actions">
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={(e) => handleLike(activeTopic.id, e)}
                >
                  ❤️ {activeTopic.likes} Upvotes
                </button>
                <span className="text-muted" style={{ fontSize: "var(--fs-xs)" }}>
                  💬 {activeTopic.replies.length} Replies
                </span>
              </div>

              {/* Replies Thread */}
              <div className="community-replies-section">
                <h3>Replies ({activeTopic.replies.length})</h3>

                {activeTopic.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`community-reply-item ${reply.isAcceptedAnswer ? "community-reply-item--accepted" : ""}`}
                  >
                    <div className="community-reply-header">
                      <div>
                        <strong>{reply.authorName}</strong>
                        <span className="badge badge--active" style={{ marginLeft: "var(--sp-2)" }}>
                          {reply.authorRole}
                        </span>
                      </div>
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="community-reply-body">
                      {reply.content.split("\n\n").map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {reply.isAcceptedAnswer && (
                      <div className="community-accepted-badge">✓ Solution Accepted by Author</div>
                    )}
                  </div>
                ))}

                {/* Reply Form */}
                <form className="community-reply-form" onSubmit={handleAddReply}>
                  <h4>Leave a Reply</h4>
                  <textarea
                    className="form-input form-textarea"
                    rows={4}
                    placeholder="Write a helpful answer, share a solution, or offer constructive feedback..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <div style={{ marginTop: "var(--sp-3)" }}>
                    <button type="submit" className="btn btn--primary btn--sm">
                      Post Reply
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Topics List View */
            !isCreatingTopic && (
              <div className="community-topics-list">
                {topics.length === 0 ? (
                  <div className="card" style={{ padding: "var(--sp-8)", textAlign: "center" }}>
                    <h3>No discussions found in this category.</h3>
                    <p className="text-muted" style={{ marginTop: "var(--sp-2)" }}>
                      Be the first to start a conversation!
                    </p>
                  </div>
                ) : (
                  topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="community-topic-card card"
                      onClick={() => setActiveTopic(topic)}
                    >
                      <div className="community-topic-left">
                        <button
                          type="button"
                          className="community-upvote-box"
                          onClick={(e) => handleLike(topic.id, e)}
                        >
                          <span>▲</span>
                          <strong>{topic.likes}</strong>
                        </button>
                      </div>

                      <div className="community-topic-center">
                        <div className="community-topic-badges">
                          <span className="badge badge--active">
                            {topic.category.replace("_", " ").toUpperCase()}
                          </span>
                          {topic.isPinned && <span className="badge badge--outline text-gold">📌 Pinned</span>}
                          {topic.isSolved && <span className="badge badge--outline text-success">✓ Solved</span>}
                        </div>

                        <h3 className="community-topic-title">{topic.title}</h3>
                        <p className="community-topic-snippet">{topic.content}</p>

                        <div className="community-topic-footer">
                          <span className="community-topic-author">
                            By <strong>{topic.authorName}</strong> ({topic.authorRole}) •{" "}
                            {new Date(topic.createdAt).toLocaleDateString()}
                          </span>

                          <div className="community-tags">
                            {topic.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="community-tag">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="community-topic-right">
                        <div className="community-reply-counter">
                          💬 {topic.replies.length}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
