import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getApplicationsByStudentId } from "../../data/applications";
import { courses } from "../../data/courses";
import { instructors } from "../../data/instructors";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import type { Course, Application, Instructor } from "../../types";
import "./MyCourses.css";

interface EnrolledCourseItem {
  id: string;
  application: Application;
  course: Course;
  instructor?: Instructor;
  progress: number;
  completedModules: number;
  totalModules: number;
  status: "in_progress" | "upcoming" | "completed";
  startDate: string;
  schedule: string;
  classroomLink: string;
}

export const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const [enrolledList, setEnrolledList] = useState<EnrolledCourseItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "upcoming" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<Course | null>(null);

  // Handle ESC key for syllabus modal
  useEffect(() => {
    if (!selectedCourseForSyllabus) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCourseForSyllabus(null);
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [selectedCourseForSyllabus]);

  useEffect(() => {
    if (!user?.id) return;

    const userApps = getApplicationsByStudentId(user.id);
    const paidApps = userApps.filter((a) => a.paymentStatus === "successful");

    // If user has paid applications, construct enrolled courses
    let items: EnrolledCourseItem[] = paidApps.map((app, index) => {
      const courseObj = courses.find((c) => c.id === app.courseId) || courses[0];
      const instObj = instructors.find((i) => i.id === courseObj.instructorIds?.[0]) || instructors[0];
      const progresses = [45, 15, 80, 0];
      const statuses: ("in_progress" | "upcoming" | "completed")[] = [
        "in_progress",
        "in_progress",
        "in_progress",
        "upcoming",
      ];
      const startDates = ["Oct 14, 2026", "Nov 02, 2026", "Sep 15, 2026", "Dec 01, 2026"];
      const schedules = [
        "Mon & Wed · 10:00 AM - 1:00 PM",
        "Tue & Thu · 2:00 PM - 5:00 PM",
        "Fri & Sat · 11:00 AM - 3:00 PM",
        "Weekends · 9:00 AM - 2:00 PM",
      ];

      const prog = progresses[index % progresses.length];
      const totalMods = courseObj.curriculum?.length || 5;
      const compMods = Math.round((prog / 100) * totalMods);

      return {
        id: app.id,
        application: app,
        course: courseObj,
        instructor: instObj,
        progress: prog,
        completedModules: compMods,
        totalModules: totalMods,
        status: statuses[index % statuses.length],
        startDate: startDates[index % startDates.length],
        schedule: schedules[index % schedules.length],
        classroomLink: "https://meet.google.com/dta-live-class",
      };
    });

    // If no paid apps yet, provide an initial preview if user is demo or showcase
    if (items.length === 0 && user.email === "student@devtechs.ng") {
      const demoCourse1 = courses[1]; // Frontend
      const demoCourse2 = courses[0]; // UI/UX
      items = [
        {
          id: "enr-demo-1",
          application: {
            id: "app-demo-1",
            applicationNumber: "DTA-2026-FEND1",
            studentId: user.id,
            studentName: user.fullName,
            studentEmail: user.email,
            studentPhone: user.phone,
            studentCountry: "Nigeria",
            preferredContactMethod: "whatsapp",
            courseId: demoCourse1.id,
            courseTitle: demoCourse1.title,
            tuitionAmount: demoCourse1.price,
            learningMode: "online",
            cohort: "Morning Batch (10:00 AM - 1:00 PM)",
            paymentStatus: "successful",
            applicationStatus: "confirmed",
            paymentReference: "DTA_PAY_DEMO_01",
            createdAt: new Date().toISOString(),
          },
          course: demoCourse1,
          instructor: instructors[0],
          progress: 55,
          completedModules: 3,
          totalModules: 5,
          status: "in_progress",
          startDate: "Oct 15, 2026",
          schedule: "Mon & Wed · 10:00 AM - 1:00 PM",
          classroomLink: "https://meet.google.com/dta-fend-live",
        },
        {
          id: "enr-demo-2",
          application: {
            id: "app-demo-2",
            applicationNumber: "DTA-2026-UIUX2",
            studentId: user.id,
            studentName: user.fullName,
            studentEmail: user.email,
            studentPhone: user.phone,
            studentCountry: "Nigeria",
            preferredContactMethod: "email",
            courseId: demoCourse2.id,
            courseTitle: demoCourse2.title,
            tuitionAmount: demoCourse2.price,
            learningMode: "physical",
            branchId: "branch-abeokuta",
            branchName: "Dave Techs — Abeokuta Main Campus",
            cohort: "Afternoon Batch (2:00 PM - 5:00 PM)",
            paymentStatus: "successful",
            applicationStatus: "confirmed",
            paymentReference: "DTA_PAY_DEMO_02",
            createdAt: new Date().toISOString(),
          },
          course: demoCourse2,
          instructor: instructors[1],
          progress: 25,
          completedModules: 1,
          totalModules: 5,
          status: "in_progress",
          startDate: "Nov 01, 2026",
          schedule: "Tue & Thu · 2:00 PM - 5:00 PM",
          classroomLink: "https://meet.google.com/dta-uiux-live",
        },
      ];
    }

    setEnrolledList(items);
  }, [user]);

  const filteredCourses = enrolledList.filter((item) => {
    const matchesTab = activeTab === "all" || item.status === activeTab;
    const matchesQuery =
      item.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="my-courses-page">
      {/* Header */}
      <div className="my-courses-header">
        <div>
          <h1 className="dash-page-title">My Enrolled Courses</h1>
          <p className="dash-page-subtitle">
            Access your curriculum, virtual classrooms, progress milestones, and mentors.
          </p>
        </div>
        <Link to="/courses">
          <Button variant="primary" size="md">
            + Enroll in Another Course
          </Button>
        </Link>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="my-courses-controls">
        <div className="my-courses-tabs">
          <button
            className={`my-courses-tab ${activeTab === "all" ? "my-courses-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Courses ({enrolledList.length})
          </button>
          <button
            className={`my-courses-tab ${activeTab === "in_progress" ? "my-courses-tab--active" : ""}`}
            onClick={() => setActiveTab("in_progress")}
          >
            In Progress ({enrolledList.filter((i) => i.status === "in_progress").length})
          </button>
          <button
            className={`my-courses-tab ${activeTab === "upcoming" ? "my-courses-tab--active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({enrolledList.filter((i) => i.status === "upcoming").length})
          </button>
          <button
            className={`my-courses-tab ${activeTab === "completed" ? "my-courses-tab--active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed ({enrolledList.filter((i) => i.status === "completed").length})
          </button>
        </div>

        <div className="my-courses-search">
          <input
            type="text"
            className="my-courses-search-input"
            placeholder="Search enrolled courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="my-courses-grid">
          {filteredCourses.map((item) => (
            <div key={item.id} className="enrolled-card">
              {/* Card Thumbnail & Badges */}
              <div className="enrolled-card__media">
                <img
                  src={item.course.image}
                  alt={item.course.title}
                  className="enrolled-card__img"
                />
                <div className="enrolled-card__badges">
                  <Badge variant={item.status === "completed" ? "success" : "gold"}>
                    {item.status === "in_progress" ? "In Progress" : item.status === "upcoming" ? "Upcoming" : "Completed"}
                  </Badge>
                  <span className="enrolled-mode-pill">
                    {item.application.learningMode === "online" ? "🌐 Online Live" : "🏫 Physical Campus"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="enrolled-card__body">
                <div className="enrolled-card__category">{item.course.category}</div>
                <h3 className="enrolled-card__title">{item.course.title}</h3>

                {/* Progress Bar */}
                <div className="enrolled-progress-section">
                  <div className="enrolled-progress-header">
                    <span>
                      Module {item.completedModules} of {item.totalModules} Completed
                    </span>
                    <span className="enrolled-progress-pct">{item.progress}%</span>
                  </div>
                  <div className="enrolled-progress-bar">
                    <div
                      className="enrolled-progress-fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                {/* Details List */}
                <div className="enrolled-details-grid">
                  <div className="enrolled-detail-item">
                    <span className="enrolled-detail-lbl">👨‍🏫 Lead Instructor</span>
                    <span className="enrolled-detail-val">{item.instructor?.name || "Dave Techs Faculty"}</span>
                  </div>

                  <div className="enrolled-detail-item">
                    <span className="enrolled-detail-lbl">📅 Schedule & Timetable</span>
                    <span className="enrolled-detail-val">{item.schedule}</span>
                  </div>

                  <div className="enrolled-detail-item">
                    <span className="enrolled-detail-lbl">🚀 Batch Start Date</span>
                    <span className="enrolled-detail-val">{item.startDate}</span>
                  </div>

                  {item.application.branchName && (
                    <div className="enrolled-detail-item">
                      <span className="enrolled-detail-lbl">📍 Campus Branch</span>
                      <span className="enrolled-detail-val">{item.application.branchName}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="enrolled-card__actions">
                  <Link
                    to={`/learn/${item.course.id}`}
                    className="enrolled-action-btn enrolled-action-btn--primary"
                  >
                    🚀 Enter Interactive Classroom
                  </Link>
                  <button
                    type="button"
                    className="enrolled-action-btn enrolled-action-btn--secondary"
                    onClick={() => setSelectedCourseForSyllabus(item.course)}
                  >
                    📖 View Curriculum
                  </button>
                  <Link
                    to={`/courses/${item.course.slug}`}
                    className="enrolled-action-btn enrolled-action-btn--ghost"
                  >
                    Course Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="my-courses-empty">
          <div className="my-courses-empty-icon">📚</div>
          <h3 className="my-courses-empty-title">No Enrolled Courses Found</h3>
          <p className="my-courses-empty-desc">
            {searchQuery
              ? `No courses matching "${searchQuery}". Try a different keyword.`
              : "You do not have any active or confirmed courses in this tab. Explore our catalog and enroll today to start learning."}
          </p>
          <Link to="/courses">
            <Button variant="primary" size="md">
              Browse Available Courses →
            </Button>
          </Link>
        </div>
      )}

      {/* Syllabus Modal */}
      {selectedCourseForSyllabus && (
        <div className="syllabus-modal-backdrop" role="dialog" aria-modal="true">
          <div className="syllabus-modal-box">
            <div className="syllabus-modal-header">
              <div>
                <span className="syllabus-modal-tag">COURSE SYLLABUS</span>
                <h3 className="syllabus-modal-title">{selectedCourseForSyllabus.title}</h3>
                <p className="syllabus-modal-sub">
                  {selectedCourseForSyllabus.durationWeeks} Weeks · {selectedCourseForSyllabus.level} Level
                </p>
              </div>
              <button
                className="syllabus-modal-close"
                onClick={() => setSelectedCourseForSyllabus(null)}
              >
                ✕
              </button>
            </div>

            <div className="syllabus-modal-body">
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "var(--sp-4)" }}>
                Curriculum Modules
              </h4>
              <div className="syllabus-modules-list">
                {selectedCourseForSyllabus.curriculum?.map((mod, idx) => (
                  <div key={idx} className="syllabus-module-card">
                    <div className="syllabus-module-header">
                      <span className="syllabus-module-num">Module {idx + 1}</span>
                      <h5 className="syllabus-module-title">{mod.title}</h5>
                    </div>
                    {mod.duration && (
                      <div className="syllabus-module-duration">⏱️ {mod.duration}</div>
                    )}
                    <ul className="syllabus-topics-list">
                      {mod.topics.map((t, tIdx) => (
                        <li key={tIdx} className="syllabus-topic-item">
                          ✓ {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="syllabus-modal-footer">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCourseForSyllabus(null)}
              >
                Close Syllabus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
