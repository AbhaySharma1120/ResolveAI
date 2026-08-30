import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  LockKeyhole,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Anil Kumar",
    employeeId: "BBDU-ADM-101",
    email: "anil.kumar@bbdu.ac.in",
    phone: "+91 98765 43210",
    designation: "System Administrator",
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

  const updateProfile = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const toggleSetting = (setter, settingName) => {
    setter((previousSettings) => ({
      ...previousSettings,
      [settingName]: !previousSettings[settingName],
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
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "system", label: "System", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: LockKeyhole },
  ];

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
            onSubmit={saveChanges}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-bold text-slate-900">
              Administrator profile
            </h2>

            <div className="mt-6 flex items-center gap-4 border-b border-slate-100 pb-6">
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-slate-950 text-2xl font-bold text-white">
                AK
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
                label="Designation"
                name="designation"
                value={profile.designation}
                onChange={updateProfile}
              />
            </div>

            <SaveButton />
          </form>
        )}

        {/* System */}
        {activeTab === "system" && (
          <form
            onSubmit={saveChanges}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={21} />
              </span>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  AI and system controls
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure automated complaint-processing features.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-slate-100">
              <ToggleOption
                title="AI complaint classification"
                description="Automatically suggest complaint categories and priorities."
                enabled={systemSettings.autoClassification}
                onToggle={() =>
                  toggleSetting(setSystemSettings, "autoClassification")
                }
              />

              <ToggleOption
                title="Duplicate complaint detection"
                description="Detect complaints reporting the same campus problem."
                enabled={systemSettings.duplicateDetection}
                onToggle={() =>
                  toggleSetting(setSystemSettings, "duplicateDetection")
                }
              />

              <ToggleOption
                title="Automatic department assignment"
                description="Automatically assign complaints using AI recommendations."
                enabled={systemSettings.autoAssignment}
                onToggle={() =>
                  toggleSetting(setSystemSettings, "autoAssignment")
                }
              />

              <ToggleOption
                title="Mandatory human review"
                description="Require officer approval before applying AI recommendations."
                enabled={systemSettings.humanReview}
                onToggle={() => toggleSetting(setSystemSettings, "humanReview")}
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
              Administrative alerts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the alerts you want to receive.
            </p>

            <div className="mt-6 divide-y divide-slate-100">
              <ToggleOption
                title="Urgent complaints"
                description="Notify me when an urgent complaint is submitted."
                enabled={notifications.urgentComplaints}
                onToggle={() =>
                  toggleSetting(setNotifications, "urgentComplaints")
                }
              />

              <ToggleOption
                title="System errors"
                description="Notify me when a platform service fails."
                enabled={notifications.systemErrors}
                onToggle={() => toggleSetting(setNotifications, "systemErrors")}
              />

              <ToggleOption
                title="AI accuracy warnings"
                description="Alert me when AI confidence or accuracy decreases."
                enabled={notifications.aiWarnings}
                onToggle={() => toggleSetting(setNotifications, "aiWarnings")}
              />

              <ToggleOption
                title="Daily performance report"
                description="Email a daily ResolveAI operations summary."
                enabled={notifications.dailyReports}
                onToggle={() => toggleSetting(setNotifications, "dailyReports")}
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
              Update your administrator password.
            </p>

            <div className="mt-6 max-w-xl space-y-5">
              <PasswordField label="Current password" />
              <PasswordField label="New password" />
              <PasswordField label="Confirm new password" />
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Administrator accounts should use a unique password containing
              uppercase and lowercase letters, numbers and special characters.
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function ToggleOption({ title, description, enabled, onToggle }) {
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

function PasswordField({ label }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type="password"
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function SaveButton({ label = "Save changes" }) {
  return (
    <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Save size={17} />
        {label}
      </button>
    </div>
  );
}

export default AdminSettings;
