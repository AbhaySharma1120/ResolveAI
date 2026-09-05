import { useEffect, useState } from "react";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import api from "../../services/api";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    avatar: "",
  });

  const [systemSettings, setSystemSettings] = useState({
    autoClassification: true,
    duplicateDetection: true,
    autoAssignment: false,
    humanReview: true,
  });

  const [notifications, setNotifications] = useState({
    urgentComplaints: true,
    systemErrors: true,
    aiWarnings: true,
    dailyReports: false,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, systemResponse] = await Promise.all([
          api.get("/profile"),
          api.get("/system-settings"),
        ]);

        const user = profileResponse.data.user;

        setProfile({
          name: user.name || "",
          employeeId: user.universityId || "",
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "Administration",
          designation: user.designation || "System Administrator",
          avatar: user.avatar || "",
        });

        setNotifications({
          urgentComplaints:
            user.notificationPreferences?.urgentComplaints ?? true,

          systemErrors: user.notificationPreferences?.systemErrors ?? true,

          aiWarnings: user.notificationPreferences?.aiWarnings ?? true,

          dailyReports: user.notificationPreferences?.dailyReports ?? false,
        });

        const receivedSystemSettings = systemResponse.data.settings;

        setSystemSettings({
          autoClassification:
            receivedSystemSettings?.autoClassification ?? true,

          duplicateDetection:
            receivedSystemSettings?.duplicateDetection ?? true,

          autoAssignment: receivedSystemSettings?.autoAssignment ?? false,

          humanReview: receivedSystemSettings?.humanReview ?? true,
        });
      } catch (requestError) {
        console.error("Admin Settings request failed:", requestError);

        setError(
          requestError.response?.data?.message ||
            "Unable to load Admin Settings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const clearMessages = () => {
    setSuccess("");
    setError("");
  };

  const displaySuccess = (message) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const updateProfile = (event) => {
    const { name, value } = event.target;

    clearMessages();

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const updatePassword = (event) => {
    const { name, value } = event.target;

    clearMessages();

    setPasswords((previousPasswords) => ({
      ...previousPasswords,
      [name]: value,
    }));
  };

  const toggleSystemSetting = (settingName) => {
    clearMessages();

    setSystemSettings((previousSettings) => ({
      ...previousSettings,
      [settingName]: !previousSettings[settingName],
    }));
  };

  const toggleNotification = (settingName) => {
    clearMessages();

    setNotifications((previousSettings) => ({
      ...previousSettings,
      [settingName]: !previousSettings[settingName],
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const response = await api.put("/profile", {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
      });

      const updatedUser = response.data.user;

      setProfile((previousProfile) => ({
        ...previousProfile,
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        department: updatedUser.department || "",
        designation: updatedUser.designation || previousProfile.designation,
      }));

      updateStoredUser(updatedUser);

      displaySuccess(
        response.data.message || "Administrator profile updated successfully",
      );
    } catch (requestError) {
      console.error("Admin profile update failed:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update Administrator profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveSystemSettings = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const response = await api.put("/system-settings", systemSettings);

      const savedSettings = response.data.settings;

      setSystemSettings({
        autoClassification: savedSettings?.autoClassification ?? true,

        duplicateDetection: savedSettings?.duplicateDetection ?? true,

        autoAssignment: savedSettings?.autoAssignment ?? false,

        humanReview: savedSettings?.humanReview ?? true,
      });

      displaySuccess(
        response.data.message || "System settings updated successfully",
      );
    } catch (requestError) {
      console.error("System Settings update failed:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update system settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const response = await api.put("/profile/notifications", notifications);

      const savedPreferences = response.data.notificationPreferences;

      setNotifications({
        urgentComplaints: savedPreferences?.urgentComplaints ?? true,

        systemErrors: savedPreferences?.systemErrors ?? true,

        aiWarnings: savedPreferences?.aiWarnings ?? true,

        dailyReports: savedPreferences?.dailyReports ?? false,
      });

      displaySuccess(
        response.data.message || "Administrative alerts updated successfully",
      );
    } catch (requestError) {
      console.error("Admin notification update failed:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update administrative alerts",
      );
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    clearMessages();

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setError("Please complete all password fields");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError("New password must contain at least 8 characters");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/profile/password", passwords);

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      displaySuccess(
        response.data.message || "Administrator password updated successfully",
      );
    } catch (requestError) {
      console.error("Admin password update failed:", requestError);

      setError(
        requestError.response?.data?.message || "Unable to update password",
      );
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: UserRound,
    },
    {
      id: "system",
      label: "System",
      icon: Settings,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "security",
      label: "Security",
      icon: LockKeyhole,
    },
  ];

  const initials = getInitials(profile.name);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-slate-900"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading Admin Settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Admin Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your account and ResolveAI system preferences.
        </p>
      </section>

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} className="shrink-0" />

          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertTriangle size={20} className="shrink-0" />

          {error}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[250px_1fr]">
        {/* Tabs */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearMessages();
                  }}
                  className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition lg:w-full ${
                    activeTab === tab.id
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Profile */}
        {activeTab === "profile" && (
          <form
            onSubmit={saveProfile}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Administrator profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your personal Administrator information.
            </p>

            <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-6">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-20 w-20 shrink-0 rounded-3xl object-cover"
                />
              ) : (
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-slate-950 text-2xl font-bold text-white">
                  {initials}
                </span>
              )}

              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900">
                  {profile.name || "System Administrator"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {profile.designation || "System Administrator"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Profile photo upload will be added with the evidence-upload
                  module.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InputField
                label="Full name"
                name="name"
                value={profile.name}
                onChange={updateProfile}
                required
              />

              <InputField
                label="Employee ID"
                name="employeeId"
                value={profile.employeeId}
                onChange={updateProfile}
                disabled
              />

              <InputField
                label="Official email"
                name="email"
                type="email"
                value={profile.email}
                onChange={updateProfile}
                required
              />

              <InputField
                label="Phone number"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={updateProfile}
                placeholder="+91 9876543210"
              />

              <InputField
                label="Department"
                name="department"
                value={profile.department}
                onChange={updateProfile}
                required
              />

              <InputField
                label="Designation"
                name="designation"
                value={profile.designation}
                onChange={updateProfile}
                disabled
              />
            </div>

            <SaveButton label="Save profile" saving={saving} />
          </form>
        )}

        {/* System controls */}
        {activeTab === "system" && (
          <form
            onSubmit={saveSystemSettings}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={21} />
              </span>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  AI and system controls
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure global automated complaint-processing features.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-slate-100">
              <ToggleOption
                title="AI complaint classification"
                description="Automatically suggest complaint categories and priorities."
                enabled={systemSettings.autoClassification}
                onToggle={() => toggleSystemSetting("autoClassification")}
              />

              <ToggleOption
                title="Duplicate complaint detection"
                description="Detect complaints reporting the same campus problem."
                enabled={systemSettings.duplicateDetection}
                onToggle={() => toggleSystemSetting("duplicateDetection")}
              />

              <ToggleOption
                title="Automatic department assignment"
                description="Automatically assign complaints using AI recommendations."
                enabled={systemSettings.autoAssignment}
                onToggle={() => toggleSystemSetting("autoAssignment")}
              />

              <ToggleOption
                title="Mandatory human review"
                description="Require Officer approval before applying AI recommendations."
                enabled={systemSettings.humanReview}
                onToggle={() => toggleSystemSetting("humanReview")}
              />
            </div>

            <SaveButton label="Save system settings" saving={saving} />
          </form>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <form
            onSubmit={saveNotifications}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Administrative alerts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the operational alerts you want to receive.
            </p>

            <div className="mt-6 divide-y divide-slate-100">
              <ToggleOption
                title="Urgent complaints"
                description="Notify me when an urgent complaint is submitted."
                enabled={notifications.urgentComplaints}
                onToggle={() => toggleNotification("urgentComplaints")}
              />

              <ToggleOption
                title="System errors"
                description="Notify me when a platform service fails."
                enabled={notifications.systemErrors}
                onToggle={() => toggleNotification("systemErrors")}
              />

              <ToggleOption
                title="AI accuracy warnings"
                description="Alert me when AI confidence or accuracy decreases."
                enabled={notifications.aiWarnings}
                onToggle={() => toggleNotification("aiWarnings")}
              />

              <ToggleOption
                title="Daily performance report"
                description="Email a daily ResolveAI operations summary."
                enabled={notifications.dailyReports}
                onToggle={() => toggleNotification("dailyReports")}
              />
            </div>

            <SaveButton label="Save alerts" saving={saving} />
          </form>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <form
            onSubmit={changePassword}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Password and security
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your Administrator password.
            </p>

            <div className="mt-6 max-w-xl space-y-5">
              <PasswordField
                label="Current password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={updatePassword}
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword((currentValue) => !currentValue)
                }
                autoComplete="current-password"
              />

              <PasswordField
                label="New password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={updatePassword}
                visible={showNewPassword}
                onToggle={() =>
                  setShowNewPassword((currentValue) => !currentValue)
                }
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirm new password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={updatePassword}
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((currentValue) => !currentValue)
                }
                autoComplete="new-password"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Administrator accounts should use a unique password containing
              uppercase and lowercase letters, numbers and special characters.
            </div>

            <SaveButton label="Update password" saving={saving} />
          </form>
        )}
      </section>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function ToggleOption({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
          enabled ? "bg-emerald-600" : "bg-slate-300"
        }`}
        aria-label={`Toggle ${title}`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete={autoComplete}
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function SaveButton({ label = "Save changes", saving }) {
  return (
    <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
      <button
        type="submit"
        disabled={saving}
        className="flex min-w-40 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <Save size={17} />
        )}

        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}

function getInitials(name) {
  if (!name?.trim()) {
    return "AD";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function updateStoredUser(updatedUser) {
  try {
    const storedUser = JSON.parse(
      localStorage.getItem("resolveaiUser") || "{}",
    );

    localStorage.setItem(
      "resolveaiUser",
      JSON.stringify({
        ...storedUser,
        ...updatedUser,
      }),
    );

    window.dispatchEvent(new Event("resolveaiUserUpdated"));
  } catch (storageError) {
    console.error("Unable to update stored Admin:", storageError);
  }
}

export default AdminSettings;
