import { useEffect, useState } from "react";

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

import api from "../../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    summary: {
      totalComplaints: 0,
      activeComplaints: 0,
      resolvedComplaints: 0,
      resolutionRate: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalDepartments: 0,
    },
    weeklyData: [],
    departmentPerformance: [],
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard/admin");

        setDashboard(response.data);
      } catch (requestError) {
        console.error("Dashboard request failed:", requestError);

        setError(
          requestError.response?.data?.message || "Unable to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const { summary, weeklyData, departmentPerformance, recentActivity } =
    dashboard;

  const maximumWeeklyValue = Math.max(
    ...weeklyData.flatMap((item) => [item.received, item.resolved]),
    1,
  );

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertTriangle size={32} className="mx-auto text-red-500" />

        <h2 className="mt-4 font-bold text-red-800">
          Dashboard could not be loaded
        </h2>

        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

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
            Monitor complaints, departments, users and system performance.
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
          value={formatNumber(summary.totalComplaints)}
          information={`${formatNumber(
            summary.resolvedComplaints,
          )} complaints resolved`}
          icon={FileText}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="Active Complaints"
          value={formatNumber(summary.activeComplaints)}
          information="Currently requiring attention"
          icon={Clock3}
          style="bg-orange-50 text-orange-700"
        />

        <SummaryCard
          title="Resolution Rate"
          value={`${summary.resolutionRate}%`}
          information={`${formatNumber(
            summary.resolvedComplaints,
          )} of ${formatNumber(summary.totalComplaints)} resolved`}
          icon={TrendingUp}
          style="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          title="Registered Users"
          value={formatNumber(summary.totalUsers)}
          information={`${formatNumber(summary.activeUsers)} active accounts`}
          icon={Users}
          style="bg-violet-50 text-violet-700"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        {/* Weekly complaint chart */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Weekly complaint activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complaints received and resolved during the last seven days
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

          {weeklyData.length > 0 ? (
            <div className="mt-8 flex h-64 items-end justify-between gap-2 border-b border-slate-200 sm:gap-5">
              {weeklyData.map((item, index) => (
                <div
                  key={`${item.day}-${index}`}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div className="flex h-[215px] w-full items-end justify-center gap-1 sm:gap-2">
                    <div
                      className="w-3 min-h-[2px] rounded-t-lg bg-slate-900 transition hover:bg-slate-700 sm:w-6"
                      style={{
                        height: `${
                          (item.received / maximumWeeklyValue) * 190
                        }px`,
                      }}
                      title={`${item.received} received`}
                    />

                    <div
                      className="w-3 min-h-[2px] rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600 sm:w-6"
                      style={{
                        height: `${
                          (item.resolved / maximumWeeklyValue) * 190
                        }px`,
                      }}
                      title={`${item.resolved} resolved`}
                    />
                  </div>

                  <span className="py-3 text-xs font-semibold text-slate-500">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No weekly activity"
              description="Complaint activity will appear here."
            />
          )}
        </article>

        {/* System health */}
        <article className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">System health</h2>

              <p className="mt-1 text-sm text-slate-400">Platform services</p>
            </div>

            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck size={20} />
            </span>
          </div>

          <div className="mt-6 space-y-3">
            <HealthItem
              name="Complaint API"
              value="Operational"
              percentage="Online"
            />

            <HealthItem name="Database" value="Connected" percentage="Online" />

            <HealthItem
              name="Authentication"
              value="Operational"
              percentage="Online"
            />

            <HealthItem
              name="Authorization"
              value="Role protected"
              percentage="Secure"
            />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Bot size={17} />
              Complaint processing
            </div>

            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(summary.totalComplaints)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Total complaints processed
                </p>
              </div>

              <span className="text-sm font-semibold text-emerald-400">
                {summary.resolutionRate}% resolved
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Active departments</p>

                <p className="mt-1 text-xs text-slate-400">
                  Available for complaint assignment
                </p>
              </div>

              <span className="text-2xl font-bold text-cyan-300">
                {formatNumber(summary.totalDepartments)}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Department performance */}
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

            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Building2 size={20} />
            </span>
          </div>

          {departmentPerformance.length > 0 ? (
            <div className="mt-6 space-y-5">
              {departmentPerformance.map((department) => (
                <div key={department.id || department.name}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {department.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {department.resolved} of {department.complaints}{" "}
                        resolved
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-slate-800">
                      {department.rate}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(department.rate, 0),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No department data"
              description="Add departments and assign complaints to see their performance."
            />
          )}
        </article>

        {/* Recent activity */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Recent activity</h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest complaint and user events
              </p>
            </div>

            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="View recent activity"
              title="Recent activity"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>

          {recentActivity.length > 0 ? (
            <div className="mt-5 space-y-5">
              {recentActivity.map((activity) => {
                const activityDisplay = getActivityDisplay(activity);

                const Icon = activityDisplay.icon;

                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex gap-3"
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${activityDisplay.style}`}
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
                        {formatTimeAgo(activity.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Clock3}
              title="No recent activity"
              description="Recent complaint and account activity will appear here."
            />
          )}
        </article>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, information, icon: Icon, style }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>

          <p className="mt-2 text-xs text-slate-500">{information}</p>
        </div>

        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${style}`}
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
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>

        <p className="mt-1 text-xs text-slate-400">{value}</p>
      </div>

      <span className="shrink-0 text-xs font-bold text-emerald-300">
        {percentage}
      </span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={22} />
      </span>

      <h3 className="mt-4 text-sm font-bold text-slate-700">{title}</h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function getActivityDisplay(activity) {
  if (activity.type === "user") {
    return {
      icon: Users,
      style: "bg-cyan-50 text-cyan-700",
    };
  }

  if (activity.title?.toLowerCase().includes("resolved")) {
    return {
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-700",
    };
  }

  if (activity.priority === "Urgent") {
    return {
      icon: AlertTriangle,
      style: "bg-red-50 text-red-700",
    };
  }

  return {
    icon: FileText,
    style: "bg-violet-50 text-violet-700",
  };
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
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

export default AdminDashboard;
