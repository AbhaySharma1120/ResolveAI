import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Filter,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  TicketCheck,
  Timer,
} from "lucide-react";

import api from "../../services/api";

const statusFilters = ["All", "New", "Assigned", "In Progress", "Resolved"];

function getPriorityStyle(priority) {
  const styles = {
    Critical: "bg-red-50 text-red-700 ring-red-600/10",

    High: "bg-orange-50 text-orange-700 ring-orange-600/10",

    Medium: "bg-yellow-50 text-yellow-700 ring-yellow-600/10",

    Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  };

  return styles[priority] || styles.Low;
}

function getStatusStyle(status) {
  const styles = {
    New: {
      badge: "bg-gray-100 text-gray-700",
      line: "bg-gray-400",
    },

    Assigned: {
      badge: "bg-blue-50 text-blue-700",
      line: "bg-blue-500",
    },

    "In Progress": {
      badge: "bg-purple-50 text-purple-700",
      line: "bg-purple-500",
    },

    Resolved: {
      badge: "bg-emerald-50 text-emerald-700",
      line: "bg-emerald-500",
    },

    Rejected: {
      badge: "bg-red-50 text-red-700",
      line: "bg-red-500",
    },

    Reopened: {
      badge: "bg-orange-50 text-orange-700",
      line: "bg-orange-500",
    },
  };

  return styles[status] || styles.New;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function formatRelativeTime(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  const currentTime = Date.now();
  const updatedTime = new Date(dateValue).getTime();

  const difference = currentTime - updatedTime;

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

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("All");

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get("/complaints/my", {
        params: {
          page: 1,
          limit: 50,
        },
      });

      setComplaints(response.data?.complaints || []);
    } catch (error) {
      console.error("Fetch student complaints error:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to retrieve your complaints.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const requestDelay = window.setTimeout(() => {
      fetchComplaints();
    }, 0);

    return () => {
      window.clearTimeout(requestDelay);
    };
  }, [fetchComplaints]);

  const statistics = useMemo(() => {
    const total = complaints.length;

    const active = complaints.filter(
      (complaint) =>
        complaint.status === "Assigned" || complaint.status === "In Progress",
    ).length;

    const awaitingAction = complaints.filter(
      (complaint) =>
        complaint.status === "New" || complaint.status === "Reopened",
    ).length;

    const resolved = complaints.filter(
      (complaint) => complaint.status === "Resolved",
    ).length;

    return {
      total,
      active,
      awaitingAction,
      resolved,
    };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const locationText = [
        complaint.location?.campusArea,
        complaint.location?.specificArea,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const title = complaint.title?.toLowerCase() || "";

      const trackingId = complaint.trackingId?.toLowerCase() || "";

      const category = complaint.category?.toLowerCase() || "";

      const description = complaint.description?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        trackingId.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        locationText.includes(normalizedSearch);

      const matchesStatus =
        selectedStatus === "All" || complaint.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchQuery, selectedStatus]);

  return (
    <section className="mx-auto max-w-[1400px]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Complaint tracking
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            My Complaints
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor every complaint from submission to resolution.
          </p>
        </div>

        <Link
          to="/student/report"
          className="flex h-11 w-fit items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
        >
          <Plus size={18} />
          New complaint
        </Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticCard
          label="Total complaints"
          value={statistics.total}
          icon={TicketCheck}
          iconStyle="bg-gray-100 text-gray-700"
        />

        <StatisticCard
          label="Active complaints"
          value={statistics.active}
          icon={Clock3}
          iconStyle="bg-blue-100 text-blue-700"
        />

        <StatisticCard
          label="Awaiting action"
          value={statistics.awaitingAction}
          icon={Timer}
          iconStyle="bg-orange-100 text-orange-700"
        />

        <StatisticCard
          label="Resolved"
          value={statistics.resolved}
          icon={CheckCircle2}
          iconStyle="bg-emerald-100 text-emerald-700"
        />
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, category or tracking ID..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            <div className="mr-1 flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-500">
              <Filter size={17} />
              Status:
            </div>

            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  selectedStatus === status
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-5 grid min-h-72 place-items-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-emerald-700"
              size={36}
            />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading your complaints...
            </p>
          </div>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto text-red-600" size={34} />

          <h2 className="mt-4 font-bold text-red-800">
            Unable to load complaints
          </h2>

          <p className="mt-2 text-sm text-red-700">{errorMessage}</p>

          <button
            type="button"
            onClick={fetchComplaints}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="mt-5 space-y-4">
          {filteredComplaints.map((complaint) => {
            const statusStyle = getStatusStyle(complaint.status);

            const location = [
              complaint.location?.campusArea,
              complaint.location?.specificArea,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article
                key={complaint._id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`absolute inset-y-0 left-0 w-1.5 ${statusStyle.line}`}
                />

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">
                          {complaint.trackingId}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle.badge}`}
                        >
                          {complaint.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${getPriorityStyle(
                            complaint.priority,
                          )}`}
                        >
                          {complaint.priority}
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-bold text-gray-900">
                        {complaint.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                        {complaint.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                          <MapPin size={15} />
                          {location || "Location unavailable"}
                        </span>

                        <span className="flex items-center gap-2">
                          <Clock3 size={15} />
                          Reported {formatDate(complaint.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 border-t border-gray-100 pt-4 lg:w-52 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <div className="lg:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Last updated
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {formatRelativeTime(complaint.updatedAt)}
                        </p>
                      </div>

                      <Link
                        to={`/student/complaints/${complaint.trackingId}`}
                        className="flex items-center gap-2 text-sm font-bold text-emerald-700 transition group-hover:gap-3"
                      >
                        View details
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredComplaints.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-gray-400">
                <Search size={25} />
              </div>

              <h2 className="mt-5 font-bold text-gray-800">
                {complaints.length === 0
                  ? "No complaints submitted yet"
                  : "No complaints found"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {complaints.length === 0
                  ? "Submit your first campus complaint to begin tracking it."
                  : "Try changing the search term or status filter."}
              </p>

              {complaints.length === 0 && (
                <Link
                  to="/student/report"
                  className="mx-auto mt-5 flex h-11 w-fit items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800"
                >
                  <Plus size={17} />
                  Report an issue
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StatisticCard({ label, value, icon: Icon, iconStyle }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${iconStyle}`}
        >
          <Icon size={21} />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
      </div>
    </article>
  );
}

export default MyComplaints;
