import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

const departmentPerformance = [
  {
    name: "IT Support",
    complaints: 46,
    resolved: 39,
    rate: 85,
    color: "bg-cyan-500",
  },
  {
    name: "Campus Maintenance",
    complaints: 38,
    resolved: 29,
    rate: 76,
    color: "bg-violet-500",
  },
  {
    name: "Academic Office",
    complaints: 27,
    resolved: 24,
    rate: 89,
    color: "bg-emerald-500",
  },
  {
    name: "Hostel Administration",
    complaints: 32,
    resolved: 23,
    rate: 72,
    color: "bg-amber-500",
  },
];

const recentActivity = [
  {
    title: "Urgent complaint escalated",
    detail: "RA-1058 · Electrical hazard near Lab 204",
    time: "5 minutes ago",
    icon: AlertTriangle,
    style: "bg-red-50 text-red-700",
  },
  {
    title: "New officer account created",
    detail: "Vikram Singh · Campus Maintenance",
    time: "22 minutes ago",
    icon: Users,
    style: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "Complaint marked resolved",
    detail: "RA-1051 · Water leakage near hostel stairs",
    time: "36 minutes ago",
    icon: CheckCircle2,
    style: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "AI classification corrected",
    detail: "RA-1048 · Category changed to Academic",
    time: "1 hour ago",
    icon: Bot,
    style: "bg-violet-50 text-violet-700",
  },
];

const weeklyData = [
  { day: "Mon", received: 34, resolved: 25 },
  { day: "Tue", received: 46, resolved: 38 },
  { day: "Wed", received: 41, resolved: 35 },
  { day: "Thu", received: 55, resolved: 44 },
  { day: "Fri", received: 49, resolved: 43 },
  { day: "Sat", received: 28, resolved: 24 },
  { day: "Sun", received: 19, resolved: 17 },
];

function AdminDashboard() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <ShieldCheck size={17} />
            University operations overview
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Admin Control Centre
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor complaints, departments, users and AI performance.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          All systems operational
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Complaints"
          value="1,284"
          information="+8.4% this month"
          icon={FileText}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="Active Complaints"
          value="143"
          information="18 require attention"
          icon={Clock3}
          style="bg-orange-50 text-orange-700"
        />

        <SummaryCard
          title="Resolution Rate"
          value="86.7%"
          information="+3.2% from last month"
          icon={TrendingUp}
          style="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          title="Registered Users"
          value="4,832"
          information="126 active today"
          icon={Users}
          style="bg-violet-50 text-violet-700"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        {/* Weekly complaints chart */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Weekly complaint activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Received and resolved complaints
              </p>
            </div>

            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-slate-900" />
                Received
              </span>

              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-500" />
                Resolved
              </span>
            </div>
          </div>

          <div className="mt-8 flex h-64 items-end justify-between gap-2 border-b border-slate-200 sm:gap-5">
            {weeklyData.map((item) => (
              <div
                key={item.day}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div className="flex h-[215px] w-full items-end justify-center gap-1 sm:gap-2">
                  <div
                    className="w-3 rounded-t-lg bg-slate-900 transition hover:bg-slate-700 sm:w-6"
                    style={{ height: `${item.received * 3.5}px` }}
                    title={`${item.received} received`}
                  />

                  <div
                    className="w-3 rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600 sm:w-6"
                    style={{ height: `${item.resolved * 3.5}px` }}
                    title={`${item.resolved} resolved`}
                  />
                </div>

                <span className="py-3 text-xs font-semibold text-slate-500">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* System health */}
        <article className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">System health</h2>
              <p className="mt-1 text-sm text-slate-400">
                Live platform services
              </p>
            </div>

            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck size={20} />
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <HealthItem
              name="Complaint API"
              value="Operational"
              percentage="99.9%"
            />

            <HealthItem
              name="Database"
              value="Operational"
              percentage="99.8%"
            />

            <HealthItem
              name="AI Classification"
              value="Operational"
              percentage="98.7%"
            />

            <HealthItem
              name="Notification Service"
              value="Operational"
              percentage="99.5%"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Bot size={17} />
              AI processing
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">2,946</p>
                <p className="mt-1 text-xs text-slate-400">
                  Requests this month
                </p>
              </div>

              <span className="text-sm font-semibold text-emerald-400">
                97.4% accurate
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Departments */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">
                Department performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complaint resolution by department
              </p>
            </div>

            <Building2 size={21} className="text-emerald-700" />
          </div>

          <div className="mt-6 space-y-5">
            {departmentPerformance.map((department) => (
              <div key={department.name}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {department.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {department.resolved} of {department.complaints} resolved
                    </p>
                  </div>

                  <span className="text-sm font-bold text-slate-800">
                    {department.rate}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${department.color}`}
                    style={{ width: `${department.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Recent activity */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest administrative events
              </p>
            </div>

            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="View activity"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;

              return (
                <div key={activity.title} className="flex gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${activity.style}`}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {activity.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {activity.detail}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, information, icon: Icon, style }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{information}</p>
        </div>

        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl ${style}`}
        >
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

function HealthItem({ name, value, percentage }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="mt-1 text-xs text-slate-400">{value}</p>
      </div>

      <span className="text-xs font-bold text-emerald-300">{percentage}</span>
    </div>
  );
}

export default AdminDashboard;
