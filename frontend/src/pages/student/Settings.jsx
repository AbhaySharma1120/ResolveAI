import { useState } from "react";
import {
  Bell,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "Abhay Sharma",
    universityId: "BBDU/23/1234",
    email: "abhay.sharma@bbdu.ac.in",
    phone: "+91 98765 43210",
    department: "Computer Science and Engineering",
    semester: "7th Semester",
  });

  const [notifications, setNotifications] = useState({
    statusUpdates: true,
    newMessages: true,
    resolutionAlerts: true,
    emailNotifications: false,
  });

  const updateProfile = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const saveChanges = (event) => {
    event.preventDefault();
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const toggleNotification = (name) => {
    setNotifications((previousNotifications) => ({
      ...previousNotifications,
      [name]: !previousNotifications[name],
    }));
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

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white">
            <Check size={15} />
          </span>
          Your changes have been saved successfully.
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
                  onClick={() => setActiveTab(tab.id)}
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
            onSubmit={saveChanges}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Profile information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your personal and academic details.
            </p>

            <div className="mt-6 flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                AS
              </div>

              <div>
                <h3 className="font-bold text-slate-900">{profile.fullName}</h3>

                <p className="mt-1 text-sm text-slate-500">
                  B.Tech Computer Science student
                </p>

                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Change profile photo
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InputField
                label="Full name"
                name="fullName"
                value={profile.fullName}
                onChange={updateProfile}
              />

              <InputField
                label="University ID"
                name="universityId"
                value={profile.universityId}
                onChange={updateProfile}
                disabled
              />

              <InputField
                label="Email address"
                name="email"
                type="email"
                value={profile.email}
                onChange={updateProfile}
              />

              <InputField
                label="Phone number"
                name="phone"
                value={profile.phone}
                onChange={updateProfile}
              />

              <SelectField
                label="Department"
                name="department"
                value={profile.department}
                onChange={updateProfile}
                options={[
                  "Computer Science and Engineering",
                  "Information Technology",
                  "Electronics and Communication",
                  "Mechanical Engineering",
                  "Civil Engineering",
                ]}
              />

              <SelectField
                label="Current semester"
                name="semester"
                value={profile.semester}
                onChange={updateProfile}
                options={[
                  "1st Semester",
                  "2nd Semester",
                  "3rd Semester",
                  "4th Semester",
                  "5th Semester",
                  "6th Semester",
                  "7th Semester",
                  "8th Semester",
                ]}
              />
            </div>

            <SaveButton />
          </form>
        )}

        {/* Notifications tab */}
        {activeTab === "notifications" && (
          <form
            onSubmit={saveChanges}
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

            <SaveButton />
          </form>
        )}

        {/* Security tab */}
        {activeTab === "security" && (
          <form
            onSubmit={saveChanges}
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
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword((currentValue) => !currentValue)
                }
              />

              <PasswordField
                label="New password"
                visible={showNewPassword}
                onToggle={() =>
                  setShowNewPassword((currentValue) => !currentValue)
                }
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm new password
                </label>

                <input
                  type="password"
                  placeholder="Enter new password again"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
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
                    Use at least eight characters with uppercase, lowercase,
                    number and special characters.
                  </p>
                </div>
              </div>
            </div>

            <SaveButton label="Update password" />
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function NotificationOption({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-5 py-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>

        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled ? "bg-emerald-600" : "bg-slate-300"
        }`}
        aria-label={`Toggle ${title}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function PasswordField({ label, visible, onToggle }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function SaveButton({ label = "Save changes" }) {
  return (
    <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
      >
        <Save size={17} />
        {label}
      </button>
    </div>
  );
}

export default Settings;
