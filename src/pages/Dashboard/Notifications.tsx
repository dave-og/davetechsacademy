import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  getStoredNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteStoredNotification,
  type StudentNotification,
} from "../../data/notifications";
import { Button } from "../../components/ui/Button";
import "./Notifications.css";

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "announcement" | "payment" | "class">("all");

  const loadNotifications = () => {
    const list = getStoredNotifications(user?.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const handleToggleRead = (notif: StudentNotification) => {
    if (notif.read) {
      markNotificationAsUnread(notif.id);
    } else {
      markNotificationAsRead(notif.id);
    }
    loadNotifications();
  };

  const handleDelete = (id: string) => {
    deleteStoredNotification(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(user?.id);
    loadNotifications();
  };

  const filteredNotifs = notifications.filter((notif) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notif.read;
    if (activeTab === "announcement") return notif.category === "announcement" || notif.type === "announcement";
    if (activeTab === "payment") return notif.category === "payment" || notif.type === "payment";
    if (activeTab === "class") return notif.category === "class" || notif.type === "course";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category?: string, type?: string) => {
    if (category === "announcement" || type === "announcement") return "📢";
    if (category === "payment" || type === "payment") return "💳";
    if (category === "class" || type === "course") return "⏰";
    if (category === "application") return "📝";
    return "🔔";
  };

  return (
    <div className="notifs-page">
      {/* Header */}
      <div className="notifs-page__header">
        <div>
          <div className="notifs-page__title-row">
            <h1 className="dash-page-title">Notifications & Announcements</h1>
            {unreadCount > 0 && (
              <span className="notifs-count-pill">{unreadCount} Unread</span>
            )}
          </div>
          <p className="dash-page-subtitle">
            Stay updated with course schedules, payment confirmations, and academy broadcasts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            ✓ Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="notifs-tabs-bar">
        <button
          className={`notifs-tab ${activeTab === "all" ? "notifs-tab--active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All ({notifications.length})
        </button>
        <button
          className={`notifs-tab ${activeTab === "unread" ? "notifs-tab--active" : ""}`}
          onClick={() => setActiveTab("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`notifs-tab ${activeTab === "announcement" ? "notifs-tab--active" : ""}`}
          onClick={() => setActiveTab("announcement")}
        >
          📢 Announcements
        </button>
        <button
          className={`notifs-tab ${activeTab === "class" ? "notifs-tab--active" : ""}`}
          onClick={() => setActiveTab("class")}
        >
          ⏰ Class Reminders
        </button>
        <button
          className={`notifs-tab ${activeTab === "payment" ? "notifs-tab--active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          💳 Payment Alerts
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length > 0 ? (
        <div className="notifs-list">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`notif-card ${!notif.read ? "notif-card--unread" : ""}`}
            >
              <div className="notif-card__icon">
                {getCategoryIcon(notif.category, notif.type)}
              </div>

              <div className="notif-card__content">
                <div className="notif-card__top">
                  <h4 className="notif-card__title">{notif.title}</h4>
                  <span className="notif-card__date">
                    {new Date(notif.createdAt).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <p className="notif-card__msg">{notif.message}</p>

                <div className="notif-card__footer">
                  {notif.actionUrl && (
                    <Link to={notif.actionUrl} className="notif-action-link">
                      View details →
                    </Link>
                  )}

                  <div className="notif-card__actions">
                    <button
                      className="notif-toggle-btn"
                      onClick={() => handleToggleRead(notif)}
                    >
                      {notif.read ? "Mark as Unread" : "Mark as Read"}
                    </button>
                    <button
                      className="notif-del-btn"
                      onClick={() => handleDelete(notif.id)}
                      title="Delete notification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="notifs-empty">
          <div className="notifs-empty-icon">🔔</div>
          <h3 className="notifs-empty-title">No Notifications In This View</h3>
          <p className="notifs-empty-desc">
            You're all caught up! When you receive class schedules or admission announcements, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
