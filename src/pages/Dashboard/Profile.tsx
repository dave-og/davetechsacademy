import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import "./Profile.css";

export const Profile: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "Nigeria");
  const [stateVal, setStateVal] = useState(user?.state || "Ogun State");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Communication Preferences State (NDPR / GDPR compliant)
  const [commPrefs, setCommPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(`comm_prefs_${user?.id}`);
      return saved
        ? JSON.parse(saved)
        : { emailMarketing: true, whatsappAlerts: true, smsAlerts: false };
    } catch {
      return { emailMarketing: true, whatsappAlerts: true, smsAlerts: false };
    }
  });
  const [commSavedMsg, setCommSavedMsg] = useState(false);

  const handleTogglePref = (key: "emailMarketing" | "whatsappAlerts" | "smsAlerts") => {
    const updated = { ...commPrefs, [key]: !commPrefs[key] };
    setCommPrefs(updated);
    if (user?.id) {
      localStorage.setItem(`comm_prefs_${user.id}`, JSON.stringify(updated));
    }
    setCommSavedMsg(true);
    setTimeout(() => setCommSavedMsg(false), 3000);
  };

  // Logout modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!fullName.trim()) {
      setProfileMsg({ type: "error", text: "Please enter your full name." });
      return;
    }

    setIsSavingProfile(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      country,
      state: stateVal,
    });
    setIsSavingProfile(false);
    setProfileMsg({ type: "success", text: "Your profile details have been saved successfully." });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (!currentPass) {
      setPassMsg({ type: "error", text: "Please provide your current password." });
      return;
    }

    if (newPass.length < 8) {
      setPassMsg({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsUpdatingPass(true);
    const res = await changePassword(currentPass, newPass);
    setIsUpdatingPass(false);

    if (res.success) {
      setPassMsg({ type: "success", text: res.message || "Password updated successfully." });
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } else {
      setPassMsg({ type: "error", text: res.error || "Failed to update password." });
    }
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  const studentInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-page__header">
        <div>
          <h1 className="dash-page-title">Profile & Security</h1>
          <p className="dash-page-subtitle">
            Manage your personal student details, credentials, and session settings.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column: Personal Info & Avatar */}
        <div className="profile-column">
          {/* Avatar Card */}
          <div className="profile-card profile-avatar-card">
            <div className="profile-avatar-large">{studentInitials}</div>
            <div className="profile-avatar-info">
              <h3 className="profile-user-name">{user?.fullName}</h3>
              <p className="profile-user-email">{user?.email}</p>
              <div className="profile-role-badge">Verified Academy Student</div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Personal Information</h3>
              <p className="profile-card__sub">Update your contact information</p>
            </div>

            <div className="profile-card__body">
              {profileMsg && (
                <div
                  className={`profile-alert profile-alert--${profileMsg.type}`}
                >
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="profile-form">
                <Input
                  label="Full Name"
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adeosun David"
                  required
                />

                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  helperText="Email cannot be changed directly for security compliance."
                />

                <Input
                  label="Phone Number"
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  required
                />

                <div className="profile-form-row">
                  <div className="input-group">
                    <label className="input__label" htmlFor="country">
                      Country
                    </label>
                    <select
                      id="country"
                      className="input__field"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input__label" htmlFor="state">
                      State of Residence
                    </label>
                    <input
                      id="state"
                      type="text"
                      className="input__field"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      placeholder="e.g. Ogun State, Lagos"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSavingProfile}
                >
                  Save Profile Changes
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Security, Password & Account */}
        <div className="profile-column">
          {/* Change Password Card */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Security & Password</h3>
              <p className="profile-card__sub">Change your account password</p>
            </div>

            <div className="profile-card__body">
              {passMsg && (
                <div
                  className={`profile-alert profile-alert--${passMsg.type}`}
                >
                  {passMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="profile-form">
                <Input
                  label="Current Password"
                  id="currentPass"
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="New Password"
                  id="newPass"
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 8 characters"
                  helperText="Use uppercase, lowercase, numbers, and symbols."
                  required
                />

                <Input
                  label="Confirm New Password"
                  id="confirmPass"
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  loading={isUpdatingPass}
                >
                  Update Password
                </Button>
              </form>
            </div>
          </div>

          {/* Communication & Marketing Preferences Card (NDPR / GDPR) */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Communication & Consent Preferences</h3>
              <p className="profile-card__sub">
                Manage your permission-based alerts and marketing notifications (NDPR & GDPR Compliant).
              </p>
            </div>

            <div className="profile-card__body">
              {commSavedMsg && (
                <div className="profile-alert profile-alert--success">
                  Preferences updated and persisted.
                </div>
              )}

              <div className="profile-pref-list">
                <label className="profile-pref-item">
                  <div className="profile-pref-info">
                    <span className="profile-pref-label">Email Announcements & Curriculum Updates</span>
                    <span className="profile-pref-sub">Cohort start dates, guest masterclasses, and graduation notices.</span>
                  </div>
                  <input
                    type="checkbox"
                    className="profile-toggle-checkbox"
                    checked={commPrefs.emailMarketing}
                    onChange={() => handleTogglePref("emailMarketing")}
                  />
                </label>

                <label className="profile-pref-item">
                  <div className="profile-pref-info">
                    <span className="profile-pref-label">WhatsApp Class Reminders & Broadcasts</span>
                    <span className="profile-pref-sub">Instant Google Meet links, lab schedule changes, and cohort alerts.</span>
                  </div>
                  <input
                    type="checkbox"
                    className="profile-toggle-checkbox"
                    checked={commPrefs.whatsappAlerts}
                    onChange={() => handleTogglePref("whatsappAlerts")}
                  />
                </label>

                <label className="profile-pref-item">
                  <div className="profile-pref-info">
                    <span className="profile-pref-label">SMS Critical Notifications</span>
                    <span className="profile-pref-sub">Campus security advisories, emergency branch closures, and OTP codes.</span>
                  </div>
                  <input
                    type="checkbox"
                    className="profile-toggle-checkbox"
                    checked={commPrefs.smsAlerts}
                    onChange={() => handleTogglePref("smsAlerts")}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Account Actions & Danger Zone */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Account Session</h3>
              <p className="profile-card__sub">Session control and sign out</p>
            </div>

            <div className="profile-card__body">
              <div className="profile-account-meta">
                <div className="profile-meta-row">
                  <span>Student ID</span>
                  <span style={{ fontFamily: "monospace", color: "var(--gold-primary)" }}>
                    {user?.id}
                  </span>
                </div>
                <div className="profile-meta-row">
                  <span>Member Since</span>
                  <span>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-NG", {
                          dateStyle: "medium",
                        })
                      : "2026"}
                  </span>
                </div>
              </div>

              <div className="profile-danger-actions">
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={() => setShowLogoutModal(true)}
                >
                  🚪 Sign Out of Academy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="dash-modal-overlay" role="dialog" aria-modal="true">
          <div className="dash-modal">
            <h3 className="dash-modal__title">Sign Out Confirmation</h3>
            <p className="dash-modal__desc">
              Are you sure you want to end your student session? You can sign back in at any time.
            </p>
            <div className="dash-modal__actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
