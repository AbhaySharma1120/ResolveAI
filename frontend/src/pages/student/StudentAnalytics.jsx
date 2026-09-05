import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Droplets,
  FileText,
  LoaderCircle,
  ShieldAlert,
  TrendingUp,
  Wifi,
  Wrench,
} from "lucide-react";

import api from "../../services/api";

const categoryConfiguration = {
  Network: {
    label: "Internet & Wi-Fi",
    icon: Wifi,
    color: "bg-cyan-500",
    iconStyle: "bg-cyan-50 text-cyan-700",
  },
  Electrical: {
    label: "Electrical",
    icon: Wrench,
    color: "bg-amber-500",
    iconStyle: "bg-amber-50 text-amber-700",
  },
  Civil: {
    label: "Civil & Infrastructure",
    icon: Building2,
    color: "bg-violet-500",
    iconStyle: "bg-violet-50 text-violet-700",
  },
  Sanitation: {
    label: "Water & Sanitation",
    icon: Droplets,
    color: "bg-blue-500",
    iconStyle: "bg-blue-50 text-blue-700",
  },
  Hostel: {
    label: "Hostel Facilities",
    icon: ShieldAlert,
    color: "bg-orange-500",
    iconStyle: "bg-orange-50 text-orange-700",
  },
};

const emptyAnalytics = {
  summary: {
    totalComplaints: 0,
    submittedThisMonth: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0,
    remainingComplaints: 0,
    resolutionRate: 0,
    averageResolutionDays: 0,
    previousAverageResolutionDays: 0,
  },
  monthlyActivity: [],
  categories: [],
  insight: {
    title: "Your complaint activity is being tracked",
    description: "Submit complaints to view personalized analytics.",
    recommendation:
      "Include complete complaint details to help departments respond faster.",
    improvementPercentage: 0,
    topCategory: "",
  },
};

function StudentAnalytics() {
  const [period, setPeriod] = useState("6");
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get(`/analytics/student?period=${period}`);

      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error("Load student analytics error:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to load your analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const summary = analytics.summary || emptyAnalytics.summary;
  const monthlyData = analytics.monthlyActivity || [];

  const categories = useMemo(() => {
    return (analytics.categories || []).map((category) => {
      const configuration =
        categoryConfiguration[category.name] || categoryConfiguration.Civil;

      return {
        ...category,
        label: configuration.label,
        icon: configuration.icon,
        color: configuration.color,
        iconStyle: configuration.iconStyle,
      };
    });
  }, [analytics.categories]);

  const maximumMonthlyValue = useMemo(() => {
    const values = monthlyData.flatMap((item) => [
      item.submitted,
      item.resolved,
    ]);

    return Math.max(...values, 1);
  }, [monthlyData]);

  const resolutionDegrees = Math.min(
    Math.max(summary.resolutionRate * 3.6, 0),
    360,
  );

  const averageResolutionInformation =
    summary.averageResolutionDays > 0
      ? "Average for resolved complaints"
      : "No resolved complaint data yet";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <BarChart3 size={17} />
            Personal complaint insights
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            My Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your submitted complaints and resolution performance.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
          <option value="year">This year</option>
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
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Complaints"
              value={summary.totalComplaints}
              information={`+${summary.submittedThisMonth} this month`}
              icon={FileText}
              style="bg-emerald-50 text-emerald-700"
            />

            <SummaryCard
              title="Resolved"
              value={summary.resolvedComplaints}
              information={`${summary.resolutionRate}% resolution rate`}
              icon={CheckCircle2}
              style="bg-cyan-50 text-cyan-700"
            />

            <SummaryCard
              title="In Progress"
              value={summary.inProgressComplaints}
              information="Currently being handled"
              icon={Clock3}
              style="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              title="Average Resolution"
              value={`${summary.averageResolutionDays} days`}
              information={averageResolutionInformation}
              icon={TrendingUp}
              style="bg-violet-50 text-violet-700"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Complaint Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submitted and resolved complaints
                  </p>
                </div>

                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-emerald-600" />
                    Submitted
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-cyan-400" />
                    Resolved
                  </span>
                </div>
              </div>

              {monthlyData.length > 0 ? (
                <div className="mt-8 overflow-x-auto">
                  <div
                    className={`flex h-64 min-w-full items-end justify-between gap-3 border-b border-slate-200 ${
                      monthlyData.length > 8 ? "w-[760px]" : ""
                    }`}
                  >
                    {monthlyData.map((item) => {
                      const submittedHeight =
                        (item.submitted / maximumMonthlyValue) * 190;

                      const resolvedHeight =
                        (item.resolved / maximumMonthlyValue) * 190;

                      return (
                        <div
                          key={`${item.month}-${item.year}`}
                          className="flex h-full min-w-12 flex-1 flex-col items-center justify-end"
                        >
                          <div className="flex h-[200px] w-full items-end justify-center gap-1 sm:gap-2">
                            <div
                              className="w-3 rounded-t-lg bg-emerald-600 transition hover:bg-emerald-700 sm:w-6"
                              style={{
                                height:
                                  item.submitted > 0
                                    ? `${Math.max(submittedHeight, 8)}px`
                                    : "0px",
                              }}
                              title={`${item.submitted} submitted`}
                            />

                            <div
                              className="w-3 rounded-t-lg bg-cyan-400 transition hover:bg-cyan-500 sm:w-6"
                              style={{
                                height:
                                  item.resolved > 0
                                    ? `${Math.max(resolvedHeight, 8)}px`
                                    : "0px",
                              }}
                              title={`${item.resolved} resolved`}
                            />
                          </div>

                          <span className="py-3 text-xs font-medium text-slate-500">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyChart />
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-bold text-slate-900">Resolution Rate</h2>

              <p className="mt-1 text-sm text-slate-500">
                Overall complaint performance
              </p>

              <div className="mt-8 flex justify-center">
                <div
                  className="grid h-48 w-48 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #047857 0deg ${resolutionDegrees}deg,
                      #e2e8f0 ${resolutionDegrees}deg 360deg
                    )`,
                  }}
                >
                  <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center">
                    <div>
                      <p className="text-4xl font-bold text-slate-900">
                        {Math.round(summary.resolutionRate)}%
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
                    {summary.resolvedComplaints}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">Remaining</p>

                  <p className="mt-1 text-xl font-bold text-slate-700">
                    {summary.remainingComplaints}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-bold text-slate-900">Top Categories</h2>

              <p className="mt-1 text-sm text-slate-500">
                Your most frequently reported issues
              </p>

              {categories.length > 0 ? (
                <div className="mt-6 space-y-5">
                  {categories.map((category) => {
                    const Icon = category.icon;

                    return (
                      <div key={category.name}>
                        <div className="mb-2 flex items-center gap-3">
                          <span
                            className={`grid h-9 w-9 place-items-center rounded-xl ${category.iconStyle}`}
                          >
                            <Icon size={17} />
                          </span>

                          <div className="flex flex-1 items-center justify-between">
                            <p className="text-sm font-semibold text-slate-700">
                              {category.label}
                            </p>

                            <p className="text-sm font-bold text-slate-900">
                              {category.count}
                            </p>
                          </div>
                        </div>

                        <div className="ml-12 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${category.color}`}
                            style={{
                              width: `${category.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">
                  <BarChart3 size={30} className="mx-auto text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No category data available
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Categories appear after you submit complaints.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <TrendingUp size={18} />
                Analytics insight
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {analytics.insight?.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {analytics.insight?.description}
              </p>

              <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Recommended action
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {analytics.insight?.recommendation}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-3xl border border-slate-200 bg-white">
      <div className="text-center">
        <LoaderCircle
          size={36}
          className="mx-auto animate-spin text-emerald-700"
        />

        <p className="mt-4 text-sm font-semibold text-slate-700">
          Loading your analytics...
        </p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="mt-8 grid h-64 place-items-center rounded-2xl bg-slate-50">
      <div className="text-center">
        <BarChart3 size={32} className="mx-auto text-slate-300" />

        <p className="mt-3 text-sm font-semibold text-slate-700">
          No complaint activity available
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Submit a complaint to begin tracking activity.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, information, icon: Icon, style }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>

          <p className="mt-2 text-xs text-slate-500">{information}</p>
        </div>

        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl ${style}`}
        >
          <Icon size={20} />
        </span>
      </div>
    </article>
  );
}

export default StudentAnalytics;
