import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import api from "../../services/api";

const priorityStyles = {
  Urgent: "bg-red-50 text-red-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

const statusStyles = {
  New: "bg-cyan-50 text-cyan-700",
  Submitted: "bg-cyan-50 text-cyan-700",
  Assigned: "bg-blue-50 text-blue-700",
  "In Progress": "bg-violet-50 text-violet-700",
  "Pending Student": "bg-amber-50 text-amber-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-700",
};

const workloadColors = [
  "bg-cyan-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
];

function OfficerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    officer: {
      name: "",
      department: "",
    },

    summary: {
      unassignedCases: 0,
      myActiveCases: 0,
      urgentCases: 0,
      resolvedToday: 0,
    },

    recentCases: [],

    slaPerformance: {
      percentage: 100,
      withinSla: 0,
      atRisk: 0,
      overdue: 0,
    },

    departmentWorkload: [],

    insight: "Complaint workload is currently balanced.",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOfficerDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard/officer");

        setDashboard(response.data);
      } catch (requestError) {
        console.error("Officer Dashboard request failed:", requestError);

        setError(
          requestError.response?.data?.message ||
            "Unable to load Officer Dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOfficerDashboard();
  }, []);

  const {
    officer,
    summary,
    recentCases,
    slaPerformance,
    departmentWorkload,
    insight,
  } = dashboard;

  const officerFirstName = officer.name?.trim().split(" ")[0] || "Officer";

  const slaDegrees =
    Math.min(Math.max(Number(slaPerformance.percentage) || 0, 0), 100) * 3.6;

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading Officer Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertTriangle size={34} className="mx-auto text-red-500" />

        <h2 className="mt-4 font-bold text-red-800">
          Officer Dashboard could not be loaded
        </h2>

        <p className="mt-2 text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            {formatCurrentDate()}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {getGreeting()}, {officerFirstName}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here is your current complaint-resolution overview.
          </p>

          {officer.department && (
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Department: {officer.department}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/officer/triage")}
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
          value={formatNumber(summary.unassignedCases)}
          information={
            summary.unassignedCases > 0
              ? "Waiting for assignment"
              : "No cases waiting"
          }
          icon={ClipboardList}
          iconStyle="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="My Active Cases"
          value={formatNumber(summary.myActiveCases)}
          information={
            summary.myActiveCases > 0
              ? "Currently assigned to you"
              : "No active assigned cases"
          }
          icon={FileWarning}
          iconStyle="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Urgent Cases"
          value={formatNumber(summary.urgentCases)}
          information={
            summary.urgentCases > 0 ? "Review immediately" : "No urgent cases"
          }
          icon={AlertTriangle}
          iconStyle="bg-red-50 text-red-700"
        />

        <SummaryCard
          title="Resolved Today"
          value={formatNumber(summary.resolvedToday)}
          information="Completed by you today"
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
              onClick={() => navigate("/officer/triage")}
              className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all
            </button>
          </div>

          {recentCases.length > 0 ? (
            <>
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
                        className="border-b border-slate-100 transition last:border-none hover:bg-slate-50"
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
                            style={
                              priorityStyles[complaint.priority] ||
                              "bg-slate-100 text-slate-700"
                            }
                          />
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            text={complaint.status}
                            style={
                              statusStyles[complaint.status] ||
                              "bg-slate-100 text-slate-700"
                            }
                          />
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatTimeAgo(complaint.createdAt)}
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
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800">
                          {complaint.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {complaint.id} · {complaint.category}
                        </p>
                      </div>

                      <StatusBadge
                        text={complaint.priority}
                        style={
                          priorityStyles[complaint.priority] ||
                          "bg-slate-100 text-slate-700"
                        }
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
                        style={
                          statusStyles[complaint.status] ||
                          "bg-slate-100 text-slate-700"
                        }
                      />
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      Received {formatTimeAgo(complaint.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyCases />
          )}
        </div>

        {/* Right section */}
        <aside className="space-y-5">
          {/* SLA performance */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">SLA Performance</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Active assigned-case compliance
                </p>
              </div>

              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <TrendingUp size={20} />
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <div
                className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(
                    #047857 0deg ${slaDegrees}deg,
                    #e2e8f0 ${slaDegrees}deg 360deg
                  )`,
                }}
              >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                  <span className="text-2xl font-bold text-slate-900">
                    {slaPerformance.percentage}%
                  </span>
                </div>
              </div>

              <div className="w-full space-y-3 text-sm">
                <PerformanceItem
                  color="bg-emerald-500"
                  label="Within SLA"
                  value={slaPerformance.withinSla}
                />

                <PerformanceItem
                  color="bg-amber-500"
                  label="At risk"
                  value={slaPerformance.atRisk}
                />

                <PerformanceItem
                  color="bg-red-500"
                  label="Overdue"
                  value={slaPerformance.overdue}
                />
              </div>
            </div>
          </div>

          {/* Department workload */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users size={19} className="text-emerald-700" />

              <h2 className="font-bold text-slate-900">Department workload</h2>
            </div>

            {departmentWorkload.length > 0 ? (
              <div className="mt-5 space-y-4">
                {departmentWorkload.map((department, index) => (
                  <WorkloadItem
                    key={department.department}
                    department={department.department}
                    cases={department.cases}
                    width={`${department.percentage}%`}
                    color={workloadColors[index % workloadColors.length]}
                  />
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">
                No active department workload.
              </p>
            )}
          </div>

          {/* Dynamic workload insight */}
          <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-800">
              <Bot size={18} />
              Workload insight
            </div>

            <p className="mt-3 text-sm leading-6 text-cyan-800">{insight}</p>
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
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>

          <p className="mt-2 text-xs text-slate-500">{information}</p>
        </div>

        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${iconStyle}`}
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
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {text}
    </span>
  );
}

function PerformanceItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />

      <span className="text-slate-500">{label}</span>

      <span className="ml-auto font-bold text-slate-800">{value}</span>
    </div>
  );
}

function WorkloadItem({ department, cases, width, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-semibold text-slate-700">
          {department}
        </span>

        <span className="shrink-0 text-xs text-slate-500">
          {cases} {cases === 1 ? "case" : "cases"}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

function EmptyCases() {
  return (
    <div className="px-5 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Search size={24} />
      </span>

      <h3 className="mt-4 font-bold text-slate-800">No unassigned cases</h3>

      <p className="mt-2 text-sm text-slate-500">
        New complaints requiring assignment will appear here.
      </p>
    </div>
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatCurrentDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good morning";
  }

  if (currentHour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatTimeAgo(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference = Date.now() - date.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const minutes = Math.floor(difference / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default OfficerDashboard;
