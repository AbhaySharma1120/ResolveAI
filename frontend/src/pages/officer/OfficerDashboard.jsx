import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  TrendingUp,
  Users,
} from "lucide-react";

const recentCases = [
  {
    id: "RA-1052",
    title: "Wi-Fi unavailable in Block C",
    category: "Network",
    student: "Ananya Singh",
    priority: "High",
    status: "New",
    time: "8 min ago",
  },
  {
    id: "RA-1051",
    title: "Water leakage near hostel stairs",
    category: "Maintenance",
    student: "Rohit Verma",
    priority: "Urgent",
    status: "In Progress",
    time: "24 min ago",
  },
  {
    id: "RA-1049",
    title: "Library AC is not working",
    category: "Facilities",
    student: "Neha Kumari",
    priority: "Medium",
    status: "Assigned",
    time: "1 hour ago",
  },
  {
    id: "RA-1047",
    title: "Incorrect attendance record",
    category: "Academic",
    student: "Aman Mishra",
    priority: "Low",
    status: "Resolved",
    time: "3 hours ago",
  },
];

const priorityStyles = {
  Urgent: "bg-red-50 text-red-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

const statusStyles = {
  New: "bg-cyan-50 text-cyan-700",
  "In Progress": "bg-violet-50 text-violet-700",
  Assigned: "bg-blue-50 text-blue-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

function OfficerDashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Tuesday, 25 August
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Good morning, Rajesh
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here is today’s complaint-resolution overview.
          </p>
        </div>

        <button
          type="button"
          className="flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Open triage queue
          <ArrowRight size={17} />
        </button>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Unassigned Cases"
          value="18"
          information="6 require attention"
          icon={ClipboardList}
          iconStyle="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="My Active Cases"
          value="12"
          information="3 due today"
          icon={FileWarning}
          iconStyle="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Urgent Cases"
          value="4"
          information="Review immediately"
          icon={AlertTriangle}
          iconStyle="bg-red-50 text-red-700"
        />

        <SummaryCard
          title="Resolved Today"
          value="9"
          information="+18% from yesterday"
          icon={CheckCircle2}
          iconStyle="bg-emerald-50 text-emerald-700"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Recent complaints */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Recently received cases
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complaints requiring review and assignment
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[750px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-4 font-semibold">Case</th>
                  <th className="px-4 py-4 font-semibold">Student</th>
                  <th className="px-4 py-4 font-semibold">Priority</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Received</th>
                </tr>
              </thead>

              <tbody>
                {recentCases.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-slate-100 last:border-none hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">
                        {complaint.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {complaint.id} · {complaint.category}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {complaint.student}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        text={complaint.priority}
                        style={priorityStyles[complaint.priority]}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        text={complaint.status}
                        style={statusStyles[complaint.status]}
                      />
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {complaint.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {recentCases.map((complaint) => (
              <article key={complaint.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {complaint.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {complaint.id} · {complaint.category}
                    </p>
                  </div>

                  <StatusBadge
                    text={complaint.priority}
                    style={priorityStyles[complaint.priority]}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Reported by</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {complaint.student}
                    </p>
                  </div>

                  <StatusBadge
                    text={complaint.status}
                    style={statusStyles[complaint.status]}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right section */}
        <aside className="space-y-5">
          {/* SLA performance */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">SLA Performance</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Current resolution compliance
                </p>
              </div>

              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp size={20} />
              </span>
            </div>

            <div className="mt-6 flex items-center gap-5">
              <div
                className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#047857 0deg 320deg, #e2e8f0 320deg 360deg)",
                }}
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                  <span className="text-2xl font-bold text-slate-900">89%</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <PerformanceItem
                  color="bg-emerald-500"
                  label="Within SLA"
                  value="42"
                />

                <PerformanceItem
                  color="bg-amber-500"
                  label="At risk"
                  value="5"
                />

                <PerformanceItem color="bg-red-500" label="Overdue" value="2" />
              </div>
            </div>
          </div>

          {/* Team workload */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users size={19} className="text-emerald-700" />
              <h2 className="font-bold text-slate-900">Department workload</h2>
            </div>

            <div className="mt-5 space-y-4">
              <WorkloadItem
                department="IT Support"
                cases="14 cases"
                width="82%"
                color="bg-cyan-500"
              />

              <WorkloadItem
                department="Maintenance"
                cases="11 cases"
                width="68%"
                color="bg-violet-500"
              />

              <WorkloadItem
                department="Administration"
                cases="8 cases"
                width="50%"
                color="bg-amber-500"
              />

              <WorkloadItem
                department="Security"
                cases="5 cases"
                width="32%"
                color="bg-emerald-500"
              />
            </div>
          </div>

          {/* AI insight */}
          <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-800">
              <Bot size={18} />
              AI workload insight
            </div>

            <p className="mt-3 text-sm leading-6 text-cyan-800">
              Network complaints increased by 24% today. Consider assigning an
              additional officer to IT Support.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, information, icon: Icon, iconStyle }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{information}</p>
        </div>

        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl ${iconStyle}`}
        >
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

function StatusBadge({ text, style }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {text}
    </span>
  );
}

function PerformanceItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-slate-500">{label}</span>
      <span className="ml-auto font-bold text-slate-800">{value}</span>
    </div>
  );
}

function WorkloadItem({ department, cases, width, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{department}</span>
        <span className="text-xs text-slate-500">{cases}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

export default OfficerDashboard;
