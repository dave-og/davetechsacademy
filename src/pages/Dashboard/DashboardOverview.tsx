import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getApplicationsByStudentId } from "../../data/applications";
import { getStoredTransactions } from "../../services/paystack";
import { getStoredNotifications } from "../../data/notifications";
import { courses } from "../../data/courses";
import { formatPrice } from "../../utils";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { PaystackModal } from "../../components/common/PaystackModal";
import type { Application } from "../../types";
import "./DashboardOverview.css";

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedPayApp, setSelectedPayApp] = useState<Application | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const userApps = getApplicationsByStudentId(user.id);
      setApplications(userApps);
    }
  }, [user?.id]);

  const userTransactions = getStoredTransactions().filter(
    (t) => t.studentId === user?.id || t.studentEmail === user?.email
  );

  const notifications = getStoredNotifications(user?.id);
  const recentNotifications = notifications.slice(0, 3);

  // Derive enrolled / active courses from paid applications
  const paidApps = applications.filter((a) => a.paymentStatus === "successful");
  const pendingApps = applications.filter((a) => a.paymentStatus !== "successful");

  // Simulated enrolled course cards with realistic progress & cohort schedules
  const enrolledCourses = paidApps.length > 0
    ? paidApps.map((app, idx) => {
        const courseData = courses.find((c) => c.id === app.courseId);
        const simulatedProgress = [45, 20, 75, 10][idx % 4];
        const nextClasses = [
          "Module 3: Advanced State & API Integration (Tomorrow, 10:00 AM)",
          "Module 1: Design Systems & Auto-Layout (Thursday, 2:00 PM)",
          "Module 4: Machine Learning Pipelines (Friday, 11:00 AM)",
        ];
        return {
          application: app,
          course: courseData,
          progress: simulatedProgress,
          nextClass: nextClasses[idx % nextClasses.length],
        };
      })
    : [];

  const handleOpenPay = (app: Application) => {
    setSelectedPayApp(app);
    setIsPayModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPayModalOpen(false);
    if (user?.id) {
      setApplications(getApplicationsByStudentId(user.id));
    }
  };

  const upcomingTimetable = [
    {
      course: "Frontend Development",
      topic: "React 19 Server Components & State Management",
      time: "Tomorrow · 10:00 AM - 1:00 PM",
      mode: "🌐 Online Live (Google Meet)",
      instructor: "Adebayo Johnson",
    },
    {
      course: "UI/UX Design",
      topic: "Design Systems & High-Fidelity Prototyping",
      time: "Thursday · 2:00 PM - 5:00 PM",
      mode: "🏫 Abeokuta Main Campus (Lab 2)",
      instructor: "Kemi Adeleke",
    },
    {
      course: "AI & Machine Learning",
      topic: "Neural Network Architectures with PyTorch",
      time: "Saturday · 11:00 AM - 2:00 PM",
      mode: "🌐 Online Live (Zoom)",
      instructor: "Dr. Emeka Nwosu",
    },
  ];

  return (
    <div className="dash-overview-page">
      {/* Welcome Banner */}
      <section className="dash-welcome-banner">
        <div className="dash-welcome-text">
          <div className="dash-welcome-badge">ACADEMY SESSION 2026</div>
          <h1 className="dash-welcome-title">
            Welcome back, <span className="dash-welcome-name">{user?.fullName?.split(" ")[0] || "Student"}</span>! 👋
          </h1>
          <p className="dash-welcome-sub">
            Track your course progress, upcoming timetable, application statuses, and verified tuition receipts.
          </p>
        </div>
        <div className="dash-welcome-actions">
          <Link to="/courses">
            <Button variant="primary" size="md">
              + Apply For Another Course
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Metrics Grid */}
      <section className="dash-metrics-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-icon">📚</div>
          <div className="dash-metric-info">
            <div className="dash-metric-num">{paidApps.length}</div>
            <div className="dash-metric-label">Active Courses</div>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon">📝</div>
          <div className="dash-metric-info">
            <div className="dash-metric-num">{applications.length}</div>
            <div className="dash-metric-label">Total Applications</div>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon">💳</div>
          <div className="dash-metric-info">
            <div className="dash-metric-num">{userTransactions.length}</div>
            <div className="dash-metric-label">Verified Payments</div>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon">📈</div>
          <div className="dash-metric-info">
            <div className="dash-metric-num">
              {enrolledCourses.length > 0
                ? `${Math.round(
                    enrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
                      enrolledCourses.length
                  )}%`
                : "0%"}
            </div>
            <div className="dash-metric-label">Average Progress</div>
          </div>
        </div>
      </section>

      {/* Main Grid: Courses & Timetable */}
      <div className="dash-sections-grid">
        {/* Left Column: Active Courses & Applications */}
        <div className="dash-column-left">
          {/* Active Courses Section */}
          <div className="dash-card">
            <div className="dash-card__header">
              <div>
                <h3 className="dash-card__title">My Active Courses</h3>
                <p className="dash-card__sub">Courses you are currently attending</p>
              </div>
              <Link to="/dashboard/courses" className="dash-card__link">
                View All →
              </Link>
            </div>

            <div className="dash-card__body">
              {enrolledCourses.length > 0 ? (
                <div className="dash-courses-list">
                  {enrolledCourses.map(({ application, course, progress, nextClass }) => (
                    <div key={application.id} className="dash-course-item">
                      <div className="dash-course-item__thumb">
                        <img
                          src={course?.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&auto=format&fit=crop&q=80"}
                          alt={application.courseTitle}
                          className="dash-course-item__img"
                        />
                      </div>
                      <div className="dash-course-item__content">
                        <div className="dash-course-item__header">
                          <h4 className="dash-course-item__title">{application.courseTitle}</h4>
                          <Badge variant="success">Active</Badge>
                        </div>
                        <div className="dash-course-item__meta">
                          <span>
                            {application.learningMode === "online" ? "🌐 Online Live" : `🏫 ${application.branchName || "Physical"}`}
                          </span>
                          <span>•</span>
                          <span>{application.cohort}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="dash-course-progress-block">
                          <div className="dash-course-progress-header">
                            <span>Syllabus Progress</span>
                            <span className="dash-progress-val">{progress}%</span>
                          </div>
                          <div className="dash-progress-track">
                            <div
                              className="dash-progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="dash-course-next-class">
                          <span className="dash-next-badge">Next Session</span>
                          <span className="dash-next-text">{nextClass}</span>
                        </div>

                        <div style={{ marginTop: "var(--sp-3)" }}>
                          <Link
                            to={`/learn/${application.courseId}`}
                            className="btn btn--primary btn--sm"
                          >
                            🚀 Open Interactive Classroom
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">
                  <div className="dash-empty-icon">📚</div>
                  <h4 className="dash-empty-title">No Active Enrollments Yet</h4>
                  <p className="dash-empty-desc">
                    {pendingApps.length > 0
                      ? "You have submitted course applications awaiting payment verification."
                      : "You have not enrolled in any tech courses yet. Explore our catalogue to get started."}
                  </p>
                  {pendingApps.length > 0 ? (
                    <Link to="/dashboard/applications">
                      <Button variant="primary" size="sm">
                        View Pending Applications →
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/courses">
                      <Button variant="primary" size="sm">
                        Browse Courses →
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pending Applications / Recent Applications */}
          <div className="dash-card">
            <div className="dash-card__header">
              <div>
                <h3 className="dash-card__title">Recent Applications</h3>
                <p className="dash-card__sub">Latest course registration submissions</p>
              </div>
              <Link to="/dashboard/applications" className="dash-card__link">
                All Applications →
              </Link>
            </div>

            <div className="dash-card__body">
              {applications.length > 0 ? (
                <div className="dash-apps-table-wrapper">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Application ID</th>
                        <th>Course</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 4).map((app) => (
                        <tr key={app.id}>
                          <td className="dash-table__code">{app.applicationNumber}</td>
                          <td>
                            <strong>{app.courseTitle}</strong>
                            <div className="dash-table__sub">{formatPrice(app.tuitionAmount)}</div>
                          </td>
                          <td>
                            {app.learningMode === "online" ? "🌐 Online" : "🏫 Physical"}
                          </td>
                          <td>
                            {app.paymentStatus === "successful" ? (
                              <Badge variant="success">Paid & Confirmed</Badge>
                            ) : (
                              <Badge variant="warning">Payment Pending</Badge>
                            )}
                          </td>
                          <td>
                            {app.paymentStatus !== "successful" ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenPay(app)}
                              >
                                Pay Now
                              </Button>
                            ) : (
                              <Link to="/dashboard/payments">
                                <Button variant="ghost" size="sm">
                                  Receipt
                                </Button>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dash-empty-state">
                  <p className="dash-empty-desc">No applications on record.</p>
                  <Link to="/courses">
                    <Button variant="secondary" size="sm">
                      Apply For a Course
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Timetable & Notifications */}
        <div className="dash-column-right">
          {/* Upcoming Timetable */}
          <div className="dash-card">
            <div className="dash-card__header">
              <div>
                <h3 className="dash-card__title">Upcoming Timetable</h3>
                <p className="dash-card__sub">Next scheduled live classes & workshops</p>
              </div>
            </div>
            <div className="dash-card__body">
              <div className="dash-timetable-list">
                {upcomingTimetable.map((item, idx) => (
                  <div key={idx} className="dash-timetable-item">
                    <div className="dash-timetable-dot" />
                    <div className="dash-timetable-content">
                      <div className="dash-timetable-header">
                        <h4 className="dash-timetable-course">{item.course}</h4>
                        <span className="dash-timetable-time">{item.time}</span>
                      </div>
                      <p className="dash-timetable-topic">{item.topic}</p>
                      <div className="dash-timetable-footer">
                        <span className="dash-timetable-mode">{item.mode}</span>
                        <span className="dash-timetable-mentor">👨‍🏫 {item.instructor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="dash-card">
            <div className="dash-card__header">
              <div>
                <h3 className="dash-card__title">Announcements</h3>
                <p className="dash-card__sub">Latest alerts from Dave Techs faculty</p>
              </div>
              <Link to="/dashboard/notifications" className="dash-card__link">
                View All →
              </Link>
            </div>
            <div className="dash-card__body">
              <div className="dash-notif-mini-list">
                {recentNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to="/dashboard/notifications"
                    className="dash-notif-mini-item"
                  >
                    <div className="dash-notif-mini-header">
                      <span className="dash-notif-mini-title">{notif.title}</span>
                      {!notif.read && <span className="dash-notif-mini-dot" />}
                    </div>
                    <p className="dash-notif-mini-msg">{notif.message}</p>
                    <span className="dash-notif-mini-time">
                      {new Date(notif.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Modal for resuming payment directly from overview */}
      {selectedPayApp && (
        <PaystackModal
          isOpen={isPayModalOpen}
          amount={selectedPayApp.tuitionAmount}
          email={selectedPayApp.studentEmail}
          reference={selectedPayApp.paymentReference || `DTA_PAY_${selectedPayApp.id}_${Date.now()}`}
          courseTitle={selectedPayApp.courseTitle}
          onSuccess={handlePaymentSuccess}
          onClose={() => setIsPayModalOpen(false)}
        />
      )}
    </div>
  );
};
