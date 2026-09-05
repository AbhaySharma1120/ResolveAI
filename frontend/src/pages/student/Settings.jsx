import { useEffect, useState } from "react";

import {
  AlertTriangle,
  Bell,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import api from "../../services/api";

const semesterOptions = [
  "",
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
];

const departmentOptions = [
  "Computer Science and Engineering",
  "Information Technology",
  "Electronics and Communication",
  "Mechanical Engineering",
  "Civil Engineering",
];

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    fullName: "",
    universityId: "",
    email: "",
    phone: "",
    department: "",
    semester: "",
    designation: "",
    avatar: "",
  });

  const [notifications, setNotifications] = useState({
    statusUpdates: true,
    newMessages: true,
    resolutionAlerts: true,
    emailNotifications: false,
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
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/profile");

        const user = response.data.user;

        setProfile({
          fullName: user.name || "",
          universityId: user.universityId || "",
          email: user.email || "",
          phone: user.phone || "",
          department: user.department || "",
          semester: user.semester || "",
          designation: user.designation || "Student",
          avatar: user.avatar || "",
        });

        setNotifications({
          statusUpdates: user.notificationPreferences?.statusUpdates ?? true,

          newMessages: user.notificationPreferences?.newMessages ?? true,

          resolutionAlerts:
            user.notificationPreferences?.resolutionAlerts ?? true,

          emailNotifications:
            user.notificationPreferences?.emailNotifications ?? false,
        });
      } catch (requestError) {
        console.error("Profile request failed:", requestError);

        setError(
          requestError.response?.data?.message ||
            "Unable to load your settings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const clearMessages = () => {
    setSuccess("");
    setError("");
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const updateProfileField = (event) => {
    const { name, value } = event.target;

    clearMessages();

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;

    clearMessages();

    setPasswords((previousPasswords) => ({
      ...previousPasswords,
      [name]: value,
    }));
  };

  const toggleNotification = (name) => {
    clearMessages();

    setNotifications((previousNotifications) => ({
      ...previousNotifications,
      [name]: !previousNotifications[name],
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const response = await api.put("/profile", {
        name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        semester: profile.semester,
      });

      const updatedUser = response.data.user;

      setProfile((previousProfile) => ({
        ...previousProfile,
        fullName: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        department: updatedUser.department || "",
        semester: updatedUser.semester || "",
      }));

      updateStoredUser(updatedUser);

      showSuccessMessage(
        response.data.message || "Profile updated successfully",
      );
    } catch (requestError) {
      console.error("Profile update failed:", requestError);

      setError(
        requestError.response?.data?.message || "Unable to update profile",
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

      setNotifications({
        statusUpdates:
          response.data.notificationPreferences?.statusUpdates ?? true,

        newMessages: response.data.notificationPreferences?.newMessages ?? true,

        resolutionAlerts:
          response.data.notificationPreferences?.resolutionAlerts ?? true,

        emailNotifications:
          response.data.notificationPreferences?.emailNotifications ?? false,
      });

      showSuccessMessage(
        response.data.message || "Notification preferences updated",
      );
    } catch (requestError) {
      console.error("Notification update failed:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update notification preferences",
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

      showSuccessMessage(
        response.data.message || "Password updated successfully",
      );
    } catch (requestError) {
      console.error("Password update failed:", requestError);

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
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
    },
  ];

  const availableDepartments = [
    ...new Set([profile.department, ...departmentOptions].filter(Boolean)),
  ];

  const initials = getInitials(profile.fullName);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-emerald-700"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Heading */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your profile, notifications and account security.
        </p>
      </section>

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <Check size={15} />
          </span>

          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={20} className="shrink-0" />

          {error}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* Tabs */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearMessages();
                  }}
                  className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition lg:w-full ${
                    isActive
                      ? "bg-emerald-700 text-white"
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

        {/* Profile tab */}
        {activeTab === "profile" && (
          <form
            onSubmit={saveProfile}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Profile information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your personal and academic details.
            </p>

            <div className="mt-6 flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  className="h-20 w-20 shrink-0 rounded-3xl object-cover"
                />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                  {initials}
                </div>
              )}

              <div>
                <h3 className="font-bold text-slate-900">
                  {profile.fullName || "Student"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {profile.designation || "Student"}
                  {profile.department ? ` · ${profile.department}` : ""}
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
                name="fullName"
                value={profile.fullName}
                onChange={updateProfileField}
                required
              />

              <InputField
                label="University ID"
                name="universityId"
                value={profile.universityId}
                onChange={updateProfileField}
                disabled
              />

              <InputField
                label="Email address"
                name="email"
                type="email"
                value={profile.email}
                onChange={updateProfileField}
                required
              />

              <InputField
                label="Phone number"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={updateProfileField}
                placeholder="+91 9876543210"
              />

              <SelectField
                label="Department"
                name="department"
                value={profile.department}
                onChange={updateProfileField}
                options={availableDepartments}
                required
              />

              <SelectField
                label="Current semester"
                name="semester"
                value={profile.semester}
                onChange={updateProfileField}
                options={semesterOptions}
                emptyLabel="Select semester"
              />
            </div>

            <SaveButton label="Save profile" saving={saving} />
          </form>
        )}

        {/* Notifications tab */}
        {activeTab === "notifications" && (
          <form
            onSubmit={saveNotifications}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Notification preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose which complaint updates you want to receive.
            </p>

            <div className="mt-6 divide-y divide-slate-100">
              <NotificationOption
                title="Complaint status updates"
                description="Receive notifications when the status of your complaint changes."
                enabled={notifications.statusUpdates}
                onToggle={() => toggleNotification("statusUpdates")}
              />

              <NotificationOption
                title="New messages"
                description="Receive notifications when a department sends you a message."
                enabled={notifications.newMessages}
                onToggle={() => toggleNotification("newMessages")}
              />

              <NotificationOption
                title="Resolution alerts"
                description="Receive an alert when your complaint is resolved."
                enabled={notifications.resolutionAlerts}
                onToggle={() => toggleNotification("resolutionAlerts")}
              />

              <NotificationOption
                title="Email notifications"
                description="Send important complaint updates to your university email."
                enabled={notifications.emailNotifications}
                onToggle={() => toggleNotification("emailNotifications")}
              />
            </div>

            <SaveButton label="Save preferences" saving={saving} />
          </form>
        )}

        {/* Security tab */}
        {activeTab === "security" && (
          <form
            onSubmit={changePassword}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Password and security
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Use a strong password to protect your ResolveAI account.
            </p>

            <div className="mt-6 max-w-xl space-y-5">
              <PasswordField
                label="Current password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={updatePasswordField}
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
                onChange={updatePasswordField}
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
                onChange={updatePasswordField}
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((currentValue) => !currentValue)
                }
                autoComplete="new-password"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <LockKeyhole
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Password recommendation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Use at least eight characters with uppercase, lowercase, a
                    number and a special character.
                  </p>
                </div>
              </div>
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
  type = "text",
  value,
  onChange,
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  emptyLabel = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option}>
            {option || emptyLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function NotificationOption({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>

        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
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
        className="flex min-w-40 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
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
    return "ST";
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

    const mergedUser = {
      ...storedUser,
      ...updatedUser,
      name: updatedUser.name,
      email: updatedUser.email,
      department: updatedUser.department,
    };

    localStorage.setItem("resolveaiUser", JSON.stringify(mergedUser));

    window.dispatchEvent(new Event("resolveaiUserUpdated"));
  } catch (storageError) {
    console.error("Unable to update stored user:", storageError);
  }
}

export default Settings;
