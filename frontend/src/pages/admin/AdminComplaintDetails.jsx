import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileImage,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const activity = [
  {
    title: "Complaint submitted",
    description: "Submitted by Aman Verma",
    time: "Today, 10:02 AM",
  },
  {
    title: "AI classification completed",
    description: "Category: Network · Priority: High",
    time: "Today, 10:03 AM",
  },
  {
    title: "Assigned to IT Support",
    description: "Officer: Rajesh Kumar",
    time: "Today, 10:20 AM",
  },
  {
    title: "Investigation started",
    description: "Network access point is being inspected",
    time: "Today, 11:10 AM",
  },
];

function AdminComplaintDetails() {
  const { complaintId } = useParams();

  const [status, setStatus] = useState("In Progress");
  const [department, setDepartment] = useState("IT Support");
  const [priority, setPriority] = useState("High");
  const [saved, setSaved] = useState(false);

  const saveChanges = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} />
          Administrative changes saved successfully.
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-emerald-700">
              {complaintId || "RA-1057"}
            </span>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              {priority} Priority
            </span>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {status}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
            Wi-Fi disconnecting in Block C
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Submitted by Aman Verma · Today, 10:02 AM
          </p>
        </div>

        <button
          type="button"
          onClick={saveChanges}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw size={17} />
          Save changes
        </button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* Description */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">Complaint information</h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              The campus Wi-Fi frequently disconnects on the second floor of
              Block C. The issue affects multiple classrooms and interrupts
              access to online lectures and learning resources.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InformationCard
                icon={MapPin}
                label="Location"
                value="Block C, Second Floor"
              />

              <InformationCard
                icon={CalendarDays}
                label="Submitted"
                value="25 August, 10:02 AM"
              />

              <InformationCard
                icon={Clock3}
                label="SLA deadline"
                value="Today, 4:00 PM"
              />
            </div>
          </article>

          {/* Student and officer */}
          <article className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <PersonCard
              title="Reported by"
              name="Aman Verma"
              detail="B.Tech CSE · BBDU/23/1567"
              initials="AV"
              color="bg-cyan-100 text-cyan-700"
            />

            <PersonCard
              title="Assigned officer"
              name="Rajesh Kumar"
              detail="Complaint Officer · IT Support"
              initials="RK"
              color="bg-emerald-100 text-emerald-700"
            />
          </article>

          {/* Evidence */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">Evidence</h2>

            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                <FileImage size={21} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  wifi-error-screenshot.png
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PNG image · 1.8 MB
                </p>
              </div>

              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                View
              </button>
            </div>
          </article>

          {/* Activity */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">
              Complete activity history
            </h2>

            <div className="mt-6">
              {activity.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={17} />
                    </span>

                    {index !== activity.length - 1 && (
                      <span className="h-14 w-px bg-slate-200" />
                    )}
                  </div>

                  <div className="pb-6">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-5">
          {/* Admin controls */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-700" />
              <h2 className="font-bold text-slate-900">
                Administrative controls
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <SelectField
                label="Complaint status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                options={[
                  "New",
                  "Assigned",
                  "In Progress",
                  "Pending Student",
                  "Resolved",
                  "Closed",
                ]}
              />

              <SelectField
                label="Assigned department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                options={[
                  "IT Support",
                  "Maintenance",
                  "Facilities",
                  "Academic Office",
                  "Campus Security",
                ]}
              />

              <SelectField
                label="Priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                options={["Urgent", "High", "Medium", "Low"]}
              />
            </div>
          </article>

          {/* AI details */}
          <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-900">
              <Bot size={19} />
              AI classification
            </div>

            <div className="mt-5 space-y-4">
              <AIInformation label="Suggested category" value="Network" />

              <AIInformation label="Suggested priority" value="High" />

              <AIInformation label="Suggested department" value="IT Support" />

              <AIInformation label="Confidence" value="92%" />
            </div>
          </article>

          {/* SLA */}
          <article className="rounded-3xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-orange-900">
              <AlertTriangle size={18} />
              SLA monitoring
            </div>

            <p className="mt-4 text-2xl font-bold text-orange-900">
              3h 24m remaining
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-orange-100">
              <div className="h-full w-[68%] rounded-full bg-orange-500" />
            </div>

            <p className="mt-3 text-xs leading-5 text-orange-700">
              The complaint must be resolved or updated before 4:00 PM.
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}

function InformationCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon size={18} className="text-emerald-700" />
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function PersonCard({ title, name, detail, initials, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${color}`}
      >
        {initials}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{title}</p>
        <p className="mt-1 font-semibold text-slate-800">{name}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function AIInformation({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-cyan-700">{label}</span>
      <span className="font-bold text-cyan-950">{value}</span>
    </div>
  );
}

export default AdminComplaintDetails;
