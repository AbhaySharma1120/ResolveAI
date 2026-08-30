import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Save,
  UserRound,
} from "lucide-react";

function OfficerSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "Rajesh Kumar",
    employeeId: "BBDU-OFC-102",
    email: "rajesh.kumar@bbdu.ac.in",
    phone: "+91 98765 43210",
    department: "Campus Grievance Cell",
    designation: "Complaint Officer",
  });

  const [notifications, setNotifications] = useState({
    newComplaints: true,
    urgentCases: true,
    slaWarnings: true,
    studentMessages: true,
    dailySummary: false,
  });

  const updateProfile = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const toggleNotification = (name) => {
    setNotifications((previousSettings) => ({
      ...previousSettings,
      [name]: !previousSettings[name],
    }));
  };

  const saveChanges = (event) => {
    event.preventDefault();
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const tabs = [
    {
      id: "profile",
      label: "Officer Profile",
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
      icon: LockKeyhole,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Officer Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your officer profile, alerts and account security.
        </p>
      </section>

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} />
          Settings saved successfully.
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition lg:w-full ${
                    activeTab === tab.id
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

        {/* Profile */}
        {activeTab === "profile" && (
          <form
            onSubmit={saveChanges}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Profile information
            </h2>

            <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-emerald-100 text-2xl font-bold text-emerald-700">
                RK
              </span>

              <div>
                <p className="font-bold text-slate-900">{profile.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {profile.designation}
                </p>

                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-emerald-700"
                >
                  Change profile photo
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InputField
                label="Full name"
                name="name"
                value={profile.name}
                onChange={updateProfile}
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
              />

              <InputField
                label="Phone number"
                name="phone"
                value={profile.phone}
                onChange={updateProfile}
              />

              <InputField
                label="Department"
                name="department"
                value={profile.department}
                onChange={updateProfile}
              />

              <InputField
                label="Designation"
                name="designation"
                value={profile.designation}
                onChange={updateProfile}
              />
            </div>

            <SaveButton />
          </form>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <form
            onSubmit={saveChanges}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Notification preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select which operational alerts you want to receive.
            </p>

            <div className="mt-6 divide-y divide-slate-100">
              <NotificationToggle
                title="New complaints"
                description="Notify me when a complaint enters the triage queue."
                enabled={notifications.newComplaints}
                onToggle={() => toggleNotification("newComplaints")}
              />

              <NotificationToggle
                title="Urgent cases"
                description="Immediately notify me about urgent complaints."
                enabled={notifications.urgentCases}
                onToggle={() => toggleNotification("urgentCases")}
              />

              <NotificationToggle
                title="SLA warnings"
                description="Alert me when an assigned case approaches its deadline."
                enabled={notifications.slaWarnings}
                onToggle={() => toggleNotification("slaWarnings")}
              />

              <NotificationToggle
                title="Student messages"
                description="Notify me when a student sends a case message."
                enabled={notifications.studentMessages}
                onToggle={() => toggleNotification("studentMessages")}
              />

              <NotificationToggle
                title="Daily summary"
                description="Email a daily summary of assigned and resolved cases."
                enabled={notifications.dailySummary}
                onToggle={() => toggleNotification("dailySummary")}
              />
            </div>

            <SaveButton />
          </form>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <form
            onSubmit={saveChanges}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Password and security
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your officer-portal password.
            </p>

            <div className="mt-6 max-w-xl space-y-5">
              <PasswordField label="Current password" />

              <PasswordField
                label="New password"
                visible={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />

              <PasswordField label="Confirm new password" />
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your password should contain at least eight characters, a number
              and a special character.
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
  value,
  onChange,
  type = "text",
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function NotificationToggle({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-5 py-5">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
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

function PasswordField({ label, visible = false, onToggle }) {
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

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SaveButton({ label = "Save changes" }) {
  return (
    <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        <Save size={17} />
        {label}
      </button>
    </div>
  );
}

export default OfficerSettings;
