import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import api from "../../services/api";

const categoryConfiguration = {
  Network: {
    label: "Network & Wi-Fi",
    color: "bg-cyan-500",
  },
  Electrical: {
    label: "Electrical",
    color: "bg-amber-500",
  },
  Civil: {
    label: "Civil & Infrastructure",
    color: "bg-violet-500",
  },
  Sanitation: {
    label: "Water & Sanitation",
    color: "bg-blue-500",
  },
  Hostel: {
    label: "Hostel Facilities",
    color: "bg-orange-500",
  },
};

const emptyAnalytics = {
  summary: {
    totalComplaints: 0,
    resolvedComplaints: 0,
    openComplaints: 0,
    resolutionRate: 0,
    averageResolutionDays: 0,
    activeStudents: 0,
    changes: {
      complaints: 0,
      resolutionRate: 0,
      averageResolution: 0,
      activeStudents: 0,
    },
  },
  monthlyActivity: [],
  categories: [],
  departments: [],
  insight: {
    text: "Analytics insights will appear after complaints are submitted.",
    aiConfidence: 0,
  },
};

function AdminAnalytics() {
  const [period, setPeriod] = useState("6");
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get(`/analytics/admin?period=${period}`);

      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error("Load Admin analytics error:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to load Admin analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const summary = analytics.summary || emptyAnalytics.summary;

  const changes = summary.changes || emptyAnalytics.summary.changes;

  const monthlyData = analytics.monthlyActivity || [];

  const categories = useMemo(() => {
    return (analytics.categories || []).map((category) => {
      const configuration = categoryConfiguration[category.name] || {
        label: category.name,
        color: "bg-slate-500",
      };

      return {
        ...category,
        label: configuration.label,
        color: configuration.color,
      };
    });
  }, [analytics.categories]);

  const departmentData = analytics.departments || [];

  const maximumMonthlyValue = useMemo(() => {
    const values = monthlyData.flatMap((item) => [
      item.received,
      item.resolved,
    ]);

    return Math.max(...values, 1);
  }, [monthlyData]);

  const resolutionDegrees = Math.min(
    Math.max(summary.resolutionRate * 3.6, 0),
    360,
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <BarChart3 size={17} />
            University-wide performance
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Analytics & Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Analyze complaint volume, response times and department results.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
          <option value="academic">This academic year</option>
        </select>
      </section>

      {errorMessage && (
        <section className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>

          <button
            type="button"
            onClick={loadAnalytics}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </section>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* Summary */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Complaints Received"
              value={summary.totalComplaints.toLocaleString()}
              change={changes.complaints}
              positive={changes.complaints >= 0}
              icon={FileText}
              style="bg-cyan-50 text-cyan-700"
            />

            <AnalyticsCard
              title="Resolution Rate"
              value={`${summary.resolutionRate}%`}
              change={changes.resolutionRate}
              positive={changes.resolutionRate >= 0}
              icon={CheckCircle2}
              style="bg-emerald-50 text-emerald-700"
            />

            <AnalyticsCard
              title="Average Resolution"
              value={`${summary.averageResolutionDays} days`}
              change={changes.averageResolution}
              positive={changes.averageResolution <= 0}
              icon={Clock3}
              style="bg-violet-50 text-violet-700"
            />

            <AnalyticsCard
              title="Active Students"
              value={summary.activeStudents.toLocaleString()}
              change={changes.activeStudents}
              positive={changes.activeStudents >= 0}
              icon={Users}
              style="bg-amber-50 text-amber-700"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
            {/* Monthly activity */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Complaint volume</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Received compared with resolved complaints
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

              {monthlyData.length > 0 ? (
                <div className="mt-8 overflow-x-auto">
                  <div
                    className={`flex h-72 min-w-full items-end justify-between gap-3 border-b border-slate-200 ${
                      monthlyData.length > 8 ? "w-[800px]" : ""
                    }`}
                  >
                    {monthlyData.map((item) => {
                      const receivedHeight =
                        (item.received / maximumMonthlyValue) * 220;

                      const resolvedHeight =
                        (item.resolved / maximumMonthlyValue) * 220;

                      return (
                        <div
                          key={`${item.month}-${item.year}`}
                          className="flex h-full min-w-12 flex-1 flex-col items-center justify-end"
                        >
                          <div className="flex h-[230px] w-full items-end justify-center gap-1 sm:gap-2">
                            <div
                              className="w-4 rounded-t-lg bg-slate-900 transition hover:bg-slate-700 sm:w-8"
                              style={{
                                height:
                                  item.received > 0
                                    ? `${Math.max(receivedHeight, 8)}px`
                                    : "0px",
                              }}
                              title={`${item.received} received`}
                            />

                            <div
                              className="w-4 rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600 sm:w-8"
                              style={{
                                height:
                                  item.resolved > 0
                                    ? `${Math.max(resolvedHeight, 8)}px`
                                    : "0px",
                              }}
                              title={`${item.resolved} resolved`}
                            />
                          </div>

                          <span className="py-3 text-xs font-semibold text-slate-500">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No complaint activity"
                  description="Complaint volume will appear after students submit complaints."
                />
              )}
            </article>

            {/* Resolution rate */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-bold text-slate-900">Overall resolution</h2>

              <p className="mt-1 text-sm text-slate-500">
                University complaint outcomes
              </p>

              <div className="mt-8 flex justify-center">
                <div
                  className="grid h-48 w-48 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #10b981 0deg ${resolutionDegrees}deg,
                      #e2e8f0 ${resolutionDegrees}deg 360deg
                    )`,
                  }}
                >
                  <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center">
                    <div>
                      <p className="text-4xl font-bold text-slate-900">
                        {summary.resolutionRate}%
                      </p>

                      <p className="mt-1 text-xs text-slate-500">Resolved</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs text-slate-500">Resolved</p>

                  <p className="mt-1 text-xl font-bold text-emerald-700">
                    {summary.resolvedComplaints.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs text-slate-500">Open</p>

                  <p className="mt-1 text-xl font-bold text-orange-700">
                    {summary.openComplaints.toLocaleString()}
                  </p>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
            {/* Categories */}
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-bold text-slate-900">Complaint categories</h2>

              <p className="mt-1 text-sm text-slate-500">
                Most frequently reported issues
              </p>

              {categories.length > 0 ? (
                <div className="mt-6 space-y-5">
                  {categories.map((category) => (
                    <div key={category.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-700">
                          {category.label}
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          {category.complaints}
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${category.color}`}
                          style={{
                            width: `${category.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No category data"
                  description="Complaint categories will appear here."
                  compact
                />
              )}
            </article>

            {/* Department table */}
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:px-6">
                <h2 className="font-bold text-slate-900">
                  Department comparison
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Resolution performance by department
                </p>
              </div>

              {departmentData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-6 py-4 font-semibold">Department</th>

                        <th className="px-4 py-4 font-semibold">Received</th>

                        <th className="px-4 py-4 font-semibold">Resolved</th>

                        <th className="px-4 py-4 font-semibold">Rate</th>

                        <th className="px-6 py-4 font-semibold">Avg. time</th>
                      </tr>
                    </thead>

                    <tbody>
                      {departmentData.map((department) => (
                        <tr
                          key={department.department}
                          className="border-b border-slate-100 last:border-none"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                            {department.department}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {department.received}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {department.resolved}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                department.rate >= 80
                                  ? "bg-emerald-50 text-emerald-700"
                                  : department.rate >= 60
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {department.rate}%
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {department.averageTime} days
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No department data"
                  description="Department performance will appear after complaints are submitted."
                  compact
                />
              )}
            </article>
          </section>

          {/* Analytics insight */}
          <section className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:p-6">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-slate-950">
              <Bot size={22} />
            </span>

            <div className="flex-1">
              <p className="font-bold">System performance insight</p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {analytics.insight?.text}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 px-5 py-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {analytics.insight?.aiConfidence || 0}%
              </p>

              <p className="mt-1 text-xs text-slate-400">AI confidence</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[450px] place-items-center rounded-3xl border border-slate-200 bg-white">
      <div className="text-center">
        <LoaderCircle
          size={38}
          className="mx-auto animate-spin text-emerald-600"
        />

        <p className="mt-4 text-sm font-semibold text-slate-700">
          Loading university analytics...
        </p>
      </div>
    </div>
  );
}

function EmptyState({ title, description, compact = false }) {
  return (
    <div
      className={`grid place-items-center bg-slate-50 ${
        compact ? "m-5 min-h-48 rounded-2xl" : "mt-8 min-h-64 rounded-2xl"
      }`}
    >
      <div className="px-5 text-center">
        <BarChart3 size={32} className="mx-auto text-slate-300" />

        <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function AnalyticsCard({ title, value, change, positive, icon: Icon, style }) {
  const formattedChange = `${change > 0 ? "+" : ""}${change}%`;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>

          <div
            className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
              positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {formattedChange} from previous period
          </div>
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

export default AdminAnalytics;
