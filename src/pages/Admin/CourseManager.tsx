import React, { useState, useEffect } from "react";
import {
  getStoredCourses,
  saveCourse,
  deleteCourse,
  toggleCourseActive,
  courseCategories,
} from "../../data/courses";
import { instructors } from "../../data/instructors";
import { formatPrice, slugify } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { Course, CourseCategory, CourseLevel, LearningMode } from "../../types";
import "./CourseManager.css";

export const CourseManager: React.FC = () => {
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<CourseCategory>("Software Development");
  const [formLevel, setFormLevel] = useState<CourseLevel>("Beginner");
  const [formDurationWeeks, setFormDurationWeeks] = useState(8);
  const [formPrice, setFormPrice] = useState(50000);
  const [formImage, setFormImage] = useState("/img/2e6ffc7bb424ef561c1001111f222474.jpg");
  const [formModes, setFormModes] = useState<LearningMode[]>(["online", "physical"]);
  const [formInstructorId, setFormInstructorId] = useState<string>("inst-1");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCourses = () => {
    setCoursesList(getStoredCourses());
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFormCategory("Software Development");
    setFormLevel("Beginner");
    setFormDurationWeeks(8);
    setFormPrice(60000);
    setFormImage("/img/2e6ffc7bb424ef561c1001111f222474.jpg");
    setFormModes(["online", "physical"]);
    setFormInstructorId("inst-1");
    setFormFeatured(false);
    setFormActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setFormTitle(c.title);
    setFormSlug(c.slug);
    setFormDescription(c.description);
    setFormCategory(c.category);
    setFormLevel(c.level);
    setFormDurationWeeks(c.durationWeeks);
    setFormPrice(c.price);
    setFormImage(c.image);
    setFormModes(c.learningModes);
    setFormInstructorId(c.instructorIds[0] || "inst-1");
    setFormFeatured(c.featured);
    setFormActive(c.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Course title is required");
      return;
    }
    if (formPrice <= 0) {
      setFormError("Price must be greater than 0");
      return;
    }

    const calculatedSlug = formSlug.trim() ? slugify(formSlug) : slugify(formTitle);
    const courseId = editingCourse ? editingCourse.id : calculatedSlug;

    const newOrUpdated: Course = {
      id: courseId,
      title: formTitle.trim(),
      slug: calculatedSlug,
      description: formDescription.trim(),
      fullDescription: formDescription.trim(),
      category: formCategory,
      level: formLevel,
      durationWeeks: Number(formDurationWeeks),
      price: Number(formPrice),
      image: formImage.trim() || "/img/2e6ffc7bb424ef561c1001111f222474.jpg",
      rating: editingCourse ? editingCourse.rating : 4.8,
      reviewCount: editingCourse ? editingCourse.reviewCount : 25,
      learningModes: formModes.length > 0 ? formModes : ["online"],
      instructorIds: [formInstructorId],
      featured: formFeatured,
      active: formActive,
      certificateIncluded: true,
    };

    saveCourse(newOrUpdated);
    setIsModalOpen(false);
    loadCourses();
  };

  const handleToggleActive = (id: string) => {
    toggleCourseActive(id);
    loadCourses();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete course "${title}"?`)) {
      deleteCourse(id);
      loadCourses();
    }
  };

  // Filtered courses
  const filtered = coursesList.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || c.category === selectedCategory;
    const matchStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && c.active) ||
      (selectedStatus === "inactive" && !c.active);
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="course-manager">
      {/* ── Toolbar ── */}
      <div className="manager-toolbar">
        <div className="manager-search-group">
          <input
            type="text"
            className="manager-search-input"
            placeholder="🔍 Search courses by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="manager-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {courseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="manager-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <Button variant="primary" onClick={handleOpenAdd}>
          ➕ Add New Course
        </Button>
      </div>

      {/* ── Course Grid ── */}
      <div className="admin-courses-grid">
        {filtered.map((c) => {
          const instructorObj = instructors.find((i) => i.id === c.instructorIds[0]);

          return (
            <div
              key={c.id}
              className={`admin-course-card ${!c.active ? "admin-course-card--inactive" : ""}`}
            >
              <div className="admin-course-card__img-wrap">
                <img src={c.image} alt={c.title} className="admin-course-card__img" />
                <div className="admin-course-card__badges">
                  <Badge variant={c.active ? "success" : "info"}>
                    {c.active ? "Active" : "Deactivated"}
                  </Badge>
                  {c.featured && <Badge variant="gold">Featured</Badge>}
                </div>
              </div>

              <div className="admin-course-card__body">
                <div className="admin-course-card__meta">
                  <span>{c.category}</span>
                  <span>{c.durationWeeks} Weeks • {c.level}</span>
                </div>

                <h4 className="admin-course-card__title">{c.title}</h4>

                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  👨‍🏫 Instructor: <strong>{instructorObj?.name || "Faculty Assigned"}</strong>
                </div>

                <div className="admin-course-card__price">{formatPrice(c.price)}</div>

                <div className="admin-course-card__actions">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(c)}>
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(c.id)}
                    style={{ color: c.active ? "#f59e0b" : "#10b981" }}
                  >
                    {c.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c.id, c.title)}
                    style={{ color: "#ef4444", marginLeft: "auto" }}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.title}` : "Add New Course"}
      >
        <form onSubmit={handleSaveForm} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {formError && (
            <div className="auth-alert auth-alert--error">
              <span>⚠️ {formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Course Title *</label>
            <input
              type="text"
              className="form-input"
              value={formTitle}
              onChange={(e) => {
                setFormTitle(e.target.value);
                if (!editingCourse) setFormSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Advanced Artificial Intelligence & LLMs"
              required
            />
          </div>

          <div className="course-form-grid">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as CourseCategory)}
              >
                {courseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Level *</label>
              <select
                className="form-input"
                value={formLevel}
                onChange={(e) => setFormLevel(e.target.value as CourseLevel)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Beginner/Intermediate">Beginner/Intermediate</option>
              </select>
            </div>
          </div>

          <div className="course-form-grid">
            <div className="form-group">
              <label className="form-label">Tuition Price (₦ NGN) *</label>
              <input
                type="number"
                className="form-input"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                min="5000"
                step="1000"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Weeks) *</label>
              <input
                type="number"
                className="form-input"
                value={formDurationWeeks}
                onChange={(e) => setFormDurationWeeks(Number(e.target.value))}
                min="1"
                max="52"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lead Instructor *</label>
            <select
              className="form-input"
              value={formInstructorId}
              onChange={(e) => setFormInstructorId(e.target.value)}
            >
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} — {inst.role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Course Image URL</label>
            <input
              type="text"
              className="form-input"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="e.g. /img/2e6ffc7bb424ef561c1001111f222474.jpg or HTTPS URL"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief course summary..."
            />
          </div>

          <div style={{ display: "flex", gap: "var(--sp-6)", flexWrap: "wrap", margin: "var(--sp-2) 0" }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
              />
              <span>⭐ Featured on Homepage</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
              />
              <span>🟢 Active for Enrollment</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
