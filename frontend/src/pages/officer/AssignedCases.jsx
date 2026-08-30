import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import api from "../../services/api";

const filters = ["All", "Assigned", "In Progress", "Resolved"];

const priorityStyles = {
  Critical: "bg-red-50 text-red-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

const statusStyles = {
  Assigned: "bg-blue-50 text-blue-700",
  "In Progress": "bg-violet-50 text-violet-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Reopened: "bg-orange-50 text-orange-700",
};

const statusProgress = {
  Assigned: 25,
  "In Progress": 65,
  Resolved: 100,
  Reopened: 35,
};

function formatRelativeTime(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  const difference = Date.now() - new Date(dateValue).getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) {
    return "Just now";
  }

  if (difference < hour) {
    const minutes = Math.floor(difference / minute);

    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (difference < day) {
    const hours = Math.floor(difference / hour);

    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(difference / day);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDeadline(dateValue, status) {
  if (status === "Resolved") {
    return "Completed";
  }

  if (!dateValue) {
    return "No deadline";
  }

  const deadline = new Date(dateValue);
  const now = new Date();

  const dateText =
    deadline.toDateString() === now.toDateString()
      ? "Today"
      : new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
        }).format(deadline);

  const timeText = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(deadline);

  return `${dateText}, ${timeText}`;
}

function AssignedCases() {
  const [cases, setCases] = useState([]);
  const [summary, setSummary] = useState({
    totalAssigned: 0,
    inProgress: 0,
    dueToday: 0,
    resolved: 0,
  });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchAssignedCases = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get("/complaints/assigned", {
        params: {
          page: 1,
          limit: 50,
        },
      });

      setCases(response.data.complaints || []);

      setSummary(
        response.data.summary || {
          totalAssigned: 0,
          inProgress: 0,
          dueToday: 0,
          resolved: 0,
        },
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to retrieve assigned cases.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedCases();
  }, []);

  const filteredCases = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return cases.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.title?.toLowerCase().includes(normalizedSearch) ||
        item.trackingId?.toLowerCase().includes(normalizedSearch) ||
        item.student?.name?.toLowerCase().includes(normalizedSearch) ||
        item.category?.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        activeFilter === "All" || item.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [cases, search, activeFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Assigned Cases
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage complaints currently assigned to you.
        </p>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Total Assigned"
          value={summary.totalAssigned}
          icon={FileText}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="In Progress"
          value={summary.inProgress}
          icon={Clock3}
          style="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Due Today"
          value={summary.dueToday}
          icon={AlertTriangle}
          style="bg-orange-50 text-orange-700"
        />

        <SummaryCard
          title="Resolved"
          value={summary.resolved}
          icon={CheckCircle2}
          style="bg-emerald-50 text-emerald-700"
        />
      </section>

      {/* Filters */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assigned cases..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <section className="grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-emerald-700"
              size={38}
            />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading assigned cases...
            </p>
          </div>
        </section>
      )}

      {/* Error */}
      {!isLoading && errorMessage && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <AlertCircle className="mx-auto text-red-600" size={36} />

          <h2 className="mt-4 font-bold text-red-800">
            Unable to load assigned cases
          </h2>

          <p className="mt-2 text-sm text-red-700">{errorMessage}</p>

          <button
            type="button"
            onClick={fetchAssignedCases}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </section>
      )}

      {/* Case list */}
      {!isLoading && !errorMessage && (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredCases.length > 0 ? (
            filteredCases.map((item) => {
              const progress = statusProgress[item.status] || 0;

              return (
                <article
                  key={item._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-emerald-700">
                        {item.trackingId}
                      </span>

                      <h2 className="mt-2 font-bold text-slate-900">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.category} · Reported by{" "}
                        {item.student?.name || "Student"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        priorityStyles[item.priority] || priorityStyles.Medium
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        statusStyles[item.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={15} />

                      {formatDeadline(item.slaDeadline, item.status)}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        Resolution progress
                      </span>

                      <span className="font-bold text-slate-800">
                        {progress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          progress === 100 ? "bg-emerald-500" : "bg-cyan-500"
                        }`}
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400">
                      Updated {formatRelativeTime(item.updatedAt)}
                    </p>

                    <Link
                      to={`/officer/cases/${item.trackingId}`}
                      className="flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Open case
                      <ChevronRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm xl:col-span-2">
              <Search size={32} className="mx-auto text-slate-300" />

              <h2 className="mt-4 font-bold text-slate-800">
                {cases.length === 0
                  ? "No cases assigned yet"
                  : "No assigned cases found"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {cases.length === 0
                  ? "Accept a complaint from the Triage Queue to begin."
                  : "Try another search or status filter."}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, style }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 sm:text-sm">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <span
          className={`hidden h-10 w-10 place-items-center rounded-xl sm:grid ${style}`}
        >
          <Icon size={19} />
        </span>
      </div>
    </article>
  );
}

export default AssignedCases;
