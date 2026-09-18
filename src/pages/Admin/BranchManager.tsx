import React, { useState, useEffect } from "react";
import {
  getStoredBranches,
  saveBranch,
  deleteBranch,
  toggleBranchActive,
} from "../../data/branches";
import { getStoredCourses } from "../../data/courses";
import { slugify } from "../../utils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import type { Branch } from "../../types";
import "./BranchManager.css";

export const BranchManager: React.FC = () => {
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [coursesList, setCoursesList] = useState(getStoredCourses());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formOpeningHours, setFormOpeningHours] = useState("Mon – Fri: 8:30 AM – 5:30 PM | Sat: 9:00 AM – 3:00 PM");
  const [formImage, setFormImage] = useState("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80");
  const [formFacilities, setFormFacilities] = useState("Modern Workstations, High-Speed Wi-Fi, 24/7 Power Backup, Interactive Lab");
  const [formTransportInfo, setFormTransportInfo] = useState("");
  const [formCohorts, setFormCohorts] = useState("Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)\nAfternoon Cohort (Mon/Wed/Fri 2:00 PM - 6:00 PM)\nWeekend Intensive (Sat 10:00 AM - 4:00 PM)");
  const [formSelectedCourseIds, setFormSelectedCourseIds] = useState<string[]>([]);
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = () => {
    setBranchesList(getStoredBranches());
    setCoursesList(getStoredCourses());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormName("");
    setFormLocation("Lagos State");
    setFormAddress("");
    setFormPhone("+234 800 000 0000");
    setFormEmail("");
    setFormOpeningHours("Mon – Fri: 8:30 AM – 5:30 PM | Sat: 9:00 AM – 3:00 PM");
    setFormImage("https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80");
    setFormFacilities("50+ High-Spec Workstations\nHigh-Speed Fiber & Starlink\n24/7 Solar Inverter Power");
    setFormTransportInfo("Centrally located with ample secured parking.");
    setFormCohorts("Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)\nWeekend Intensive (Sat 10:00 AM - 4:00 PM)");
    setFormSelectedCourseIds(coursesList.map((c) => c.id));
    setFormActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setFormName(b.name);
    setFormLocation(b.location);
    setFormAddress(b.address);
    setFormPhone(b.phone);
    setFormEmail(b.email || "");
    setFormOpeningHours(b.openingHours);
    setFormImage(b.image || "");
    setFormFacilities(b.facilities ? b.facilities.join("\n") : "");
    setFormTransportInfo(b.transportInfo || "");
    setFormCohorts(b.availableCohorts ? b.availableCohorts.join("\n") : "");
    setFormSelectedCourseIds(b.courseIds || []);
    setFormActive(b.active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCourseCheckboxToggle = (courseId: string) => {
    if (formSelectedCourseIds.includes(courseId)) {
      setFormSelectedCourseIds(formSelectedCourseIds.filter((id) => id !== courseId));
    } else {
      setFormSelectedCourseIds([...formSelectedCourseIds, courseId]);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Branch name is required");
      return;
    }
    if (!formAddress.trim()) {
      setFormError("Physical address is required");
      return;
    }

    const branchId = editingBranch ? editingBranch.id : `branch-${slugify(formName)}`;
    const parsedFacilities = formFacilities
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const parsedCohorts = formCohorts
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    const newOrUpdated: Branch = {
      id: branchId,
      name: formName.trim(),
      location: formLocation.trim(),
      address: formAddress.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || undefined,
      openingHours: formOpeningHours.trim(),
      image: formImage.trim() || undefined,
      facilities: parsedFacilities.length > 0 ? parsedFacilities : undefined,
      transportInfo: formTransportInfo.trim() || undefined,
      availableCohorts: parsedCohorts.length > 0 ? parsedCohorts : ["Morning Cohort (Mon/Wed/Fri)"],
      courseIds: formSelectedCourseIds,
      active: formActive,
    };

    saveBranch(newOrUpdated);
    setIsModalOpen(false);
    loadData();
  };

  const handleToggleActive = (id: string) => {
    toggleBranchActive(id);
    loadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove branch "${name}"?`)) {
      deleteBranch(id);
      loadData();
    }
  };

  const filtered = branchesList.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && b.active) ||
      (selectedStatus === "inactive" && !b.active);
    return matchSearch && matchStatus;
  });

  return (
    <div className="branch-manager">
      {/* ── Toolbar ── */}
      <div className="manager-toolbar">
        <div className="manager-search-group">
          <input
            type="text"
            className="manager-search-input"
            placeholder="🔍 Search branch by campus name, location, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="manager-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <Button variant="primary" onClick={handleOpenAdd}>
          ➕ Add New Campus
        </Button>
      </div>

      {/* ── Branches Grid ── */}
      <div className="admin-branches-grid">
        {filtered.map((b) => (
          <div
            key={b.id}
            className={`admin-branch-card ${!b.active ? "admin-branch-card--inactive" : ""}`}
          >
            <div className="admin-branch-card__img-wrap">
              <img
                src={b.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"}
                alt={b.name}
                className="admin-branch-card__img"
              />
              <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                <Badge variant={b.active ? "success" : "info"}>
                  {b.active ? "Operational" : "Deactivated"}
                </Badge>
              </div>
            </div>

            <div className="admin-branch-card__body">
              <div className="admin-branch-card__location">📍 {b.location}</div>
              <h4 className="admin-branch-card__title">{b.name}</h4>
              <p className="admin-branch-card__address">{b.address}</p>

              <div className="admin-branch-card__stats">
                <span>📚 <strong>{b.courseIds?.length || 0}</strong> Courses</span>
                <span>📅 <strong>{b.availableCohorts?.length || 0}</strong> Cohorts</span>
                <span>📞 {b.phone}</span>
              </div>

              <div className="admin-branch-card__actions">
                <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(b)}>
                  ✏️ Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(b.id)}
                  style={{ color: b.active ? "#f59e0b" : "#10b981" }}
                >
                  {b.active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(b.id, b.name)}
                  style={{ color: "#ef4444", marginLeft: "auto" }}
                >
                  🗑️
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? `Edit Branch: ${editingBranch.name}` : "Add New Campus Branch"}
      >
        <form onSubmit={handleSaveForm} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {formError && (
            <div className="auth-alert auth-alert--error">
              <span>⚠️ {formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Campus / Branch Name *</label>
            <input
              type="text"
              className="form-input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Dave Techs — Lekki Phase 1 Innovation Lab"
              required
            />
          </div>

          <div className="course-form-grid">
            <div className="form-group">
              <label className="form-label">Location / State *</label>
              <input
                type="text"
                className="form-input"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Lekki, Lagos State"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-input"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +234 801 234 5678"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Street Address *</label>
            <input
              type="text"
              className="form-input"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. Plot 14 Admiralty Way, Lekki Phase 1, Lagos"
              required
            />
          </div>

          <div className="course-form-grid">
            <div className="form-group">
              <label className="form-label">Branch Email</label>
              <input
                type="email"
                className="form-input"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. lekki@davetechs.ng"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opening Hours</label>
              <input
                type="text"
                className="form-input"
                value={formOpeningHours}
                onChange={(e) => setFormOpeningHours(e.target.value)}
                placeholder="Mon – Fri: 8:30 AM – 5:30 PM"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Campus Image URL</label>
            <input
              type="text"
              className="form-input"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Assign Courses */}
          <div className="form-group">
            <label className="form-label">Assigned Available Courses ({formSelectedCourseIds.length} selected)</label>
            <div className="course-checkbox-list">
              {coursesList.map((course) => (
                <label key={course.id} className="checkbox-label" style={{ fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={formSelectedCourseIds.includes(course.id)}
                    onChange={() => handleCourseCheckboxToggle(course.id)}
                  />
                  <span>{course.title} ({course.category})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cohorts */}
          <div className="form-group">
            <label className="form-label">Available Cohort Batches (One per line)</label>
            <textarea
              className="form-input"
              rows={3}
              value={formCohorts}
              onChange={(e) => setFormCohorts(e.target.value)}
              placeholder="Morning Cohort (Mon/Wed/Fri 9:00 AM - 1:00 PM)&#10;Weekend Intensive (Sat 10:00 AM - 4:00 PM)"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
              />
              <span>🟢 Campus Open & Active for Admission</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end", marginTop: "var(--sp-4)" }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingBranch ? "Save Changes" : "Create Campus Branch"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
