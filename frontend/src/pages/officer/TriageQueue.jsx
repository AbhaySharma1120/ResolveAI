import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  LoaderCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import api from "../../services/api";

const priorities = ["All", "Critical", "High", "Medium", "Low"];

const priorityStyles = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
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

function formatWaitingTime(minutes = 0) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function TriageQueue() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({
    waiting: 0,
    critical: 0,
    assignedToday: 0,
    averageWaitMinutes: 0,
  });

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");

  const [assigningId, setAssigningId] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const fetchTriageQueue = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get("/complaints/triage", {
        params: {
          page: 1,
          limit: 50,
        },
      });

      setComplaints(response.data.complaints || []);

      setSummary(
        response.data.summary || {
          waiting: 0,
          critical: 0,
          assignedToday: 0,
          averageWaitMinutes: 0,
        },
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to retrieve the triage queue.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTriageQueue();
  }, []);

  const filteredComplaints = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !normalizedSearch ||
        complaint.title?.toLowerCase().includes(normalizedSearch) ||
        complaint.trackingId?.toLowerCase().includes(normalizedSearch) ||
        complaint.category?.toLowerCase().includes(normalizedSearch) ||
        complaint.student?.name?.toLowerCase().includes(normalizedSearch);

      const matchesPriority =
        priority === "All" || complaint.priority === priority;

      return matchesSearch && matchesPriority;
    });
  }, [complaints, search, priority]);

  const assignComplaint = async (trackingId) => {
    if (assigningId) {
      return;
    }

    try {
      setAssigningId(trackingId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.patch(`/complaints/${trackingId}/assign`);

      setComplaints((currentComplaints) =>
        currentComplaints.filter(
          (complaint) => complaint.trackingId !== trackingId,
        ),
      );

      setSummary((currentSummary) => ({
        ...currentSummary,
        waiting: Math.max(currentSummary.waiting - 1, 0),
        assignedToday: currentSummary.assignedToday + 1,
      }));

      setSuccessMessage(
        `${response.data.complaint.trackingId} assigned to you successfully.`,
      );
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to assign the complaint.";

      setErrorMessage(message);

      /*
        Refresh the queue after a conflict because
        another Officer may have claimed the case.
      */
      if (error.response?.status === 409) {
        fetchTriageQueue();
      }
    } finally {
      setAssigningId("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Sparkles size={17} />
            AI-prioritized complaints
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Triage Queue
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review, verify and assign newly submitted complaints.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
          <Bot size={18} />
          {summary.waiting} AI-classified cases
        </div>
      </section>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={19} />
          {successMessage}
        </div>
      )}

      {errorMessage && !isLoading && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-3 text-sm font-semibold text-red-700">
            <AlertCircle className="shrink-0" size={19} />

            {errorMessage}
          </div>

          <button
            type="button"
            onClick={fetchTriageQueue}
            className="shrink-0 text-red-700"
            aria-label="Retry"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QueueSummary
          title="Waiting"
          value={summary.waiting}
          icon={Clock3}
          style="bg-cyan-50 text-cyan-700"
        />

        <QueueSummary
          title="Critical"
          value={summary.critical}
          icon={AlertTriangle}
          style="bg-red-50 text-red-700"
        />

        <QueueSummary
          title="Assigned today"
          value={summary.assignedToday}
          icon={CheckCircle2}
          style="bg-emerald-50 text-emerald-700"
        />

        <QueueSummary
          title="Average wait"
          value={formatWaitingTime(summary.averageWaitMinutes)}
          icon={SlidersHorizontal}
          style="bg-violet-50 text-violet-700"
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
              placeholder="Search by case ID, title, student or category..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="hidden text-slate-400 sm:block">
              <Filter size={18} />
            </span>

            {priorities.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPriority(item)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  priority === item
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
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
              Loading triage queue...
            </p>
          </div>
        </section>
      )}

      {/* Complaint list */}
      {!isLoading && !errorMessage && (
        <section className="space-y-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => {
              const isAssigning = assigningId === complaint.trackingId;

              return (
                <article
                  key={complaint._id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700">
                          {complaint.trackingId}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            priorityStyles[complaint.priority] ||
                            priorityStyles.Medium
                          }`}
                        >
                          {complaint.priority}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {complaint.category}
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-bold text-slate-900">
                        {complaint.title}
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {complaint.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                        <span>
                          Reported by{" "}
                          <strong className="text-slate-700">
                            {complaint.student?.name || "Student"}
                          </strong>
                        </span>

                        <span>{formatRelativeTime(complaint.createdAt)}</span>
                      </div>
                    </div>

                    {/* AI recommendation */}
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 xl:w-64">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-800">
                        <Bot size={16} />
                        AI Recommendation
                      </div>

                      <p className="mt-3 text-xs text-cyan-700">Assign to</p>

                      <p className="mt-1 text-sm font-bold text-cyan-950">
                        {complaint.aiAnalysis?.suggestedDepartment ||
                          complaint.department}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-xs text-cyan-700">
                        <span>Confidence</span>

                        <span className="font-bold">
                          {complaint.aiAnalysis?.confidence || 0}%
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-100">
                        <div
                          className="h-full rounded-full bg-cyan-600"
                          style={{
                            width: `${complaint.aiAnalysis?.confidence || 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row gap-2 xl:w-40 xl:flex-col">
                      <button
                        type="button"
                        onClick={() => assignComplaint(complaint.trackingId)}
                        disabled={Boolean(assigningId)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isAssigning ? (
                          <>
                            <LoaderCircle className="animate-spin" size={17} />
                            Assigning
                          </>
                        ) : (
                          "Accept & assign"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/officer/cases/${complaint.trackingId}`)
                        }
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Review
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Search size={32} className="mx-auto text-slate-300" />

              <h2 className="mt-4 font-bold text-slate-800">
                {complaints.length === 0
                  ? "Triage queue is clear"
                  : "No complaints found"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {complaints.length === 0
                  ? "There are no new complaints waiting for assignment."
                  : "Try changing your search or priority filter."}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function QueueSummary({ title, value, icon: Icon, style }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 sm:text-sm">{title}</p>

          <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {value}
          </p>
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

export default TriageQueue;
