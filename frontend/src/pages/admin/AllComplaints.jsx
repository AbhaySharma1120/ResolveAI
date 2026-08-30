import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  AlertCircle,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import api from "../../services/api";

const statuses = [
  "All",
  "New",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
  "Reopened",
];

const priorityStyles = {
  Critical: "bg-red-50 text-red-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

const statusStyles = {
  New: "bg-cyan-50 text-cyan-700",
  Assigned: "bg-blue-50 text-blue-700",
  "In Progress": "bg-violet-50 text-violet-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Reopened: "bg-orange-50 text-orange-700",
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

    return `${minutes} min ago`;
  }

  if (difference < day) {
    const hours = Math.floor(difference / hour);

    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(difference / day);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

function AllComplaints() {
  const [complaints, setComplaints] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    open: 0,
    critical: 0,
    resolved: 0,
  });

  const [departments, setDepartments] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComplaints: 0,
    pageSize: 20,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [department, setDepartment] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get("/complaints/admin", {
        params: {
          search: search.trim() || undefined,

          status: status === "All" ? undefined : status,

          department: department === "All" ? undefined : department,

          page: currentPage,
          limit: 20,
        },
      });

      setComplaints(response.data.complaints || []);

      setSummary(
        response.data.summary || {
          total: 0,
          open: 0,
          critical: 0,
          resolved: 0,
        },
      );

      setDepartments(response.data.departments || []);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalComplaints: 0,
          pageSize: 20,
        },
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to retrieve complaints.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const requestDelay = setTimeout(() => {
      fetchComplaints();
    }, 300);

    return () => {
      clearTimeout(requestDelay);
    };
  }, [search, status, department, currentPage]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
    setCurrentPage(1);
  };

  const exportReport = () => {
    if (complaints.length === 0) {
      return;
    }

    const headings = [
      "Tracking ID",
      "Title",
      "Student",
      "Student Email",
      "Category",
      "Department",
      "Priority",
      "Status",
      "Assigned Officer",
      "Submitted",
    ];

    const rows = complaints.map((complaint) => [
      complaint.trackingId,
      complaint.title,
      complaint.student?.name || "",
      complaint.student?.email || "",
      complaint.category,
      complaint.department,
      complaint.priority,
      complaint.status,

      complaint.assignedOfficer?.name || "Not assigned",

      new Date(complaint.createdAt).toLocaleString("en-IN"),
    ]);

    const csvContent = [headings, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const fileBlob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8",
    });

    const fileUrl = URL.createObjectURL(fileBlob);

    const downloadLink = document.createElement("a");

    downloadLink.href = fileUrl;
    downloadLink.download = "resolveai-complaints.csv";

    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            All Complaints
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor every complaint submitted across the university.
          </p>
        </div>

        <button
          type="button"
          onClick={exportReport}
          disabled={complaints.length === 0}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={18} />
          Export current page
        </button>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Total"
          value={summary.total}
          icon={FileText}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="Open"
          value={summary.open}
          icon={Clock3}
          style="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Critical"
          value={summary.critical}
          icon={AlertTriangle}
          style="bg-red-50 text-red-700"
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
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search ID, complaint or student..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <select
            value={status}
            onChange={handleStatusChange}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All statuses" : item}
              </option>
            ))}
          </select>

          <select
            value={department}
            onChange={handleDepartmentChange}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All departments</option>

            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
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
              Loading complaints...
            </p>
          </div>
        </section>
      )}

      {/* Error */}
      {!isLoading && errorMessage && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <AlertCircle className="mx-auto text-red-600" size={36} />

          <h2 className="mt-4 font-bold text-red-800">
            Unable to load complaints
          </h2>

          <p className="mt-2 text-sm text-red-700">{errorMessage}</p>

          <button
            type="button"
            onClick={fetchComplaints}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </section>
      )}

      {!isLoading && !errorMessage && (
        <>
          {/* Desktop table */}
          <section className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4 font-semibold">Complaint</th>

                    <th className="px-4 py-4 font-semibold">Student</th>

                    <th className="px-4 py-4 font-semibold">Department</th>

                    <th className="px-4 py-4 font-semibold">Priority</th>

                    <th className="px-4 py-4 font-semibold">Status</th>

                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint._id}
                      className="border-b border-slate-100 last:border-none hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {complaint.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {complaint.trackingId} · {complaint.category} ·{" "}
                          {formatRelativeTime(complaint.createdAt)}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {complaint.student?.name || "Student"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {complaint.department}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          text={complaint.priority}
                          style={
                            priorityStyles[complaint.priority] ||
                            priorityStyles.Medium
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          text={complaint.status}
                          style={
                            statusStyles[complaint.status] ||
                            "bg-slate-100 text-slate-700"
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/complaints/${complaint.trackingId}`}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          aria-label={`View ${complaint.trackingId}`}
                        >
                          <Eye size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {complaints.length === 0 && <EmptyState />}
          </section>

          {/* Mobile cards */}
          <section className="grid gap-4 lg:hidden">
            {complaints.map((complaint) => (
              <article
                key={complaint._id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-700">
                      {complaint.trackingId}
                    </p>

                    <h2 className="mt-2 text-sm font-bold text-slate-900">
                      {complaint.title}
                    </h2>
                  </div>

                  <Badge
                    text={complaint.priority}
                    style={
                      priorityStyles[complaint.priority] ||
                      priorityStyles.Medium
                    }
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <Information
                    label="Student"
                    value={complaint.student?.name || "Student"}
                  />

                  <Information
                    label="Department"
                    value={complaint.department}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <Badge
                    text={complaint.status}
                    style={
                      statusStyles[complaint.status] ||
                      "bg-slate-100 text-slate-700"
                    }
                  />

                  <Link
                    to={`/admin/complaints/${complaint.trackingId}`}
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-700"
                  >
                    <Eye size={17} />
                    View details
                  </Link>
                </div>
              </article>
            ))}

            {complaints.length === 0 && <EmptyState />}
          </section>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <section className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
              <p className="text-sm text-slate-500">
                Page {pagination.currentPage} of {pagination.totalPages} ·{" "}
                {pagination.totalComplaints} matching complaints
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, pagination.totalPages),
                    )
                  }
                  disabled={currentPage >= pagination.totalPages}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {/* AI note */}
      <section className="flex gap-3 rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
        <Bot size={21} className="shrink-0 text-cyan-700" />

        <div>
          <p className="text-sm font-bold text-cyan-900">
            AI classification monitoring
          </p>

          <p className="mt-1 text-sm leading-6 text-cyan-700">
            Complaint category and priority labels are AI recommendations.
            Administrators can review corrected classifications from the AI
            Monitoring section.
          </p>
        </div>
      </section>
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

function Badge({ text, style }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {text}
    </span>
  );
}

function Information({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-slate-400">{label}</p>

      <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <Search size={30} className="mx-auto text-slate-300" />

      <p className="mt-3 font-semibold text-slate-700">No complaints found</p>

      <p className="mt-1 text-sm text-slate-500">
        Change your filters or search text.
      </p>
    </div>
  );
}

export default AllComplaints;
