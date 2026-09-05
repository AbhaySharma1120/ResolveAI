import { useEffect, useState } from "react";

import { useNavigate, useOutletContext } from "react-router-dom";

import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Droplets,
  FileText,
  MapPin,
  Network,
  Sparkles,
  TicketCheck,
  Wifi,
  Zap,
} from "lucide-react";

import api from "../../services/api";

const categoryStyles = [
  {
    icon: Wifi,
    style: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Zap,
    style: "bg-yellow-100 text-yellow-700",
  },
  {
    icon: Building2,
    style: "bg-blue-100 text-blue-700",
  },
  {
    icon: Droplets,
    style: "bg-cyan-100 text-cyan-700",
  },
  {
    icon: MapPin,
    style: "bg-orange-100 text-orange-700",
  },
];

function getPriorityStyle(priority) {
  const styles = {
    Urgent: "bg-red-50 text-red-700 ring-red-600/10",
    Critical: "bg-red-50 text-red-700 ring-red-600/10",
    High: "bg-orange-50 text-orange-700 ring-orange-600/10",
    Medium: "bg-yellow-50 text-yellow-700 ring-yellow-600/10",
    Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  };

  return styles[priority] || "bg-gray-100 text-gray-700 ring-gray-600/10";
}

function getStatusStyle(status) {
  const styles = {
    New: "bg-gray-100 text-gray-700",
    Submitted: "bg-gray-100 text-gray-700",
    Assigned: "bg-blue-50 text-blue-700",
    "In Progress": "bg-purple-50 text-purple-700",
    "Pending Student": "bg-yellow-50 text-yellow-700",
    Resolved: "bg-emerald-50 text-emerald-700",
    Closed: "bg-slate-100 text-slate-700",
  };

  return styles[status] || "bg-gray-100 text-gray-700";
}

function StudentDashboard() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};

  const [dashboard, setDashboard] = useState({
    student: {
      name: "",
      department: "",
      universityId: "",
    },

    summary: {
      totalComplaints: 0,
      openComplaints: 0,
      inProgressComplaints: 0,
      resolvedComplaints: 0,
      resolutionRate: 0,
      averageResolutionHours: 0,
    },

    categories: [],
    locations: [],
    recentComplaints: [],
    insight: "Your complaint information will appear here.",
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard/student");

        setDashboard(response.data);
      } catch (requestError) {
        console.error("Student Dashboard request failed:", requestError);

        setError(
          requestError.response?.data?.message ||
            "Unable to load Student Dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboard();
  }, []);

  const { student, summary, categories, locations, recentComplaints, insight } =
    dashboard;

  const studentName = student.name || outletContext.user?.name || "Student";

  const firstName = studentName.trim().split(/\s+/)[0];

  const resolutionRate = Math.min(
    Math.max(Number(summary.resolutionRate) || 0, 0),
    100,
  );

  const resolutionDegrees = resolutionRate * 3.6;

  const summaryCards = [
    {
      title: "Total complaints",
      value: formatNumber(summary.totalComplaints),
      information: "All complaints submitted by you",
      icon: FileText,
      iconStyle: "bg-cyan-100 text-cyan-700",
    },
    {
      title: "Open complaints",
      value: formatNumber(summary.openComplaints),
      information:
        summary.openComplaints > 0
          ? "Currently awaiting resolution"
          : "No open complaints",
      icon: TicketCheck,
      iconStyle: "bg-orange-100 text-orange-700",
    },
    {
      title: "In progress",
      value: formatNumber(summary.inProgressComplaints),
      information:
        summary.inProgressComplaints > 0
          ? "Being handled by an officer"
          : "No complaints in progress",
      icon: Clock3,
      iconStyle: "bg-blue-100 text-blue-700",
    },
    {
      title: "Resolved",
      value: formatNumber(summary.resolvedComplaints),
      information: `${resolutionRate}% overall resolution rate`,
      icon: CheckCircle2,
      iconStyle: "bg-emerald-100 text-emerald-700",
    },
  ];

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading Student Dashboard...
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
          Student Dashboard could not be loaded
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
    <section className="mx-auto max-w-[1500px]">
      {/* Page heading */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Student complaint overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {getGreeting()}, {firstName} 👋
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track your complaints and their resolution progress.
          </p>

          {(student.department || student.universityId) && (
            <p className="mt-2 text-xs font-semibold text-gray-400">
              {student.department}
              {student.department && student.universityId && " · "}
              {student.universityId}
            </p>
          )}
        </div>

        <div className="flex w-fit items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <Sparkles size={20} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Resolution rate
            </p>

            <p className="text-lg font-extrabold text-gray-900">
              {resolutionRate}%
            </p>
          </div>

          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
            Live
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl ${card.iconStyle}`}
              >
                <Icon size={21} />
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
                {card.value}
              </p>

              <p className="mt-2 text-xs text-gray-400">{card.information}</p>
            </article>
          );
        })}
      </div>

      {/* Main dashboard content */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
        {/* Complaint locations */}
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-gray-900">
                Your complaint locations
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Active complaints grouped by campus location
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/student/complaints")}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              View complaints
            </button>
          </div>

          <div className="relative min-h-[390px] overflow-hidden bg-[#edf4eb]">
            {/* Map roads */}
            <div className="absolute left-[8%] top-[18%] h-2 w-[85%] rotate-6 rounded-full bg-white/90" />

            <div className="absolute left-[3%] top-[57%] h-2 w-[95%] -rotate-3 rounded-full bg-white/90" />

            <div className="absolute left-[29%] top-[-10%] h-[120%] w-2 rotate-12 rounded-full bg-white/90" />

            <div className="absolute right-[23%] top-[-10%] h-[120%] w-2 -rotate-6 rounded-full bg-white/90" />

            {locations.length > 0 ? (
              <>
                <LocationMarker
                  location={locations[0]}
                  position="left-[12%] top-[20%]"
                  markerPosition="left-[20%] top-[29%]"
                  color="red"
                />

                {locations[1] && (
                  <LocationMarker
                    location={locations[1]}
                    position="left-[38%] top-[46%]"
                    markerPosition="left-[52%] top-[53%]"
                    color="yellow"
                  />
                )}

                {locations[2] && (
                  <LocationMarker
                    location={locations[2]}
                    position="right-[9%] top-[23%]"
                    markerPosition="right-[17%] top-[31%]"
                    color="blue"
                  />
                )}

                {locations[3] && (
                  <LocationMarker
                    location={locations[3]}
                    position="bottom-[12%] right-[20%]"
                    markerPosition="bottom-[18%] right-[27%]"
                    color="emerald"
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                    <MapPin size={24} />
                  </span>

                  <h3 className="mt-4 font-bold text-gray-800">
                    No active complaint locations
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Locations will appear when you submit an active complaint.
                  </p>
                </div>
              </div>
            )}

            {locations.length > 0 && (
              <div className="absolute bottom-4 left-4 rounded-xl border border-white/70 bg-white/90 px-4 py-3 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur">
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  Higher concentration
                </span>
              </div>
            )}
          </div>
        </article>

        {/* Resolution and categories */}
        <div className="grid gap-5">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">Resolution progress</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Status of your submitted complaints
                </p>
              </div>

              <span
                className={`rounded-lg px-2 py-1 text-xs font-bold ${
                  resolutionRate >= 70
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {resolutionRate >= 70 ? "On track" : "In progress"}
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
              <div
                className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(
                    #059669 0deg ${resolutionDegrees}deg,
                    #e2e8f0 ${resolutionDegrees}deg 360deg
                  )`,
                }}
              >
                <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900">
                      {resolutionRate}%
                    </p>

                    <p className="text-[10px] font-semibold text-emerald-700">
                      Resolved
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <ProgressItem
                  color="bg-emerald-500"
                  label="Resolved"
                  value={summary.resolvedComplaints}
                />

                <ProgressItem
                  color="bg-purple-500"
                  label="In progress"
                  value={summary.inProgressComplaints}
                />

                <ProgressItem
                  color="bg-orange-500"
                  label="Open"
                  value={summary.openComplaints}
                />
              </div>
            </div>

            {summary.averageResolutionHours > 0 && (
              <p className="mt-5 rounded-xl bg-gray-50 px-3 py-2 text-center text-xs text-gray-500">
                Average resolution time:{" "}
                <strong className="text-gray-700">
                  {formatHours(summary.averageResolutionHours)}
                </strong>
              </p>
            )}
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">
              Your complaints by category
            </h2>

            {categories.length > 0 ? (
              <div className="mt-4 space-y-3">
                {categories.map((category, index) => {
                  const visual = categoryStyles[index % categoryStyles.length];

                  const Icon = getCategoryIcon(category.name, visual.icon);

                  return (
                    <div
                      key={category.name}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                    >
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-xl ${visual.style}`}
                      >
                        <Icon size={18} />
                      </div>

                      <p className="flex-1 text-sm font-semibold text-gray-700">
                        {category.name}
                      </p>

                      <span className="text-sm font-extrabold text-gray-900">
                        {category.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                No complaint categories available.
              </p>
            )}
          </article>
        </div>
      </div>

      {/* Dynamic summary */}
      <article className="mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white">
            <Bot size={24} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-emerald-950">Complaint summary</h2>

              <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                Live
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-emerald-900/70">
              {insight}
            </p>
          </div>

          <div className="rounded-xl border border-white bg-white/70 px-5 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total submitted
            </p>

            <p className="mt-1 text-2xl font-extrabold text-emerald-700">
              {formatNumber(summary.totalComplaints)}
            </p>
          </div>
        </div>
      </article>

      {/* Recent complaints */}
      <article className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Recent complaints</h2>

            <p className="mt-1 text-xs text-gray-500">
              Your latest submitted complaints
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/complaints")}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            View all complaints
          </button>
        </div>

        {recentComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-4">Complaint</th>

                  <th className="px-5 py-4">Category</th>

                  <th className="px-5 py-4">Location</th>

                  <th className="px-5 py-4">Priority</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Submitted</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    onClick={() =>
                      navigate(`/student/complaints/${complaint.id}`)
                    }
                    className="cursor-pointer transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-800">
                        {complaint.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {complaint.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {complaint.category}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {complaint.location || "Campus"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${getPriorityStyle(
                          complaint.priority,
                        )}`}
                      >
                        {complaint.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                          complaint.status,
                        )}`}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatTimeAgo(complaint.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileText size={24} />
            </span>

            <h3 className="mt-4 font-bold text-gray-800">
              No complaints submitted
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Your submitted complaints will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/student/report")}
              className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Report an issue
            </button>
          </div>
        )}
      </article>
    </section>
  );
}

function LocationMarker({ location, position, markerPosition, color }) {
  const colorClasses = {
    red: {
      building: "border-red-200 bg-white/80",
      pulse: "bg-red-400/20",
      marker: "bg-red-500",
    },
    yellow: {
      building: "border-yellow-200 bg-white/80",
      pulse: "bg-yellow-400/20",
      marker: "bg-yellow-500",
    },
    blue: {
      building: "border-blue-200 bg-white/80",
      pulse: "bg-blue-400/20",
      marker: "bg-blue-500",
    },
    emerald: {
      building: "border-emerald-200 bg-white/80",
      pulse: "bg-emerald-400/20",
      marker: "bg-emerald-500",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.emerald;

  return (
    <>
      <div
        className={`absolute h-20 w-36 rounded-xl border p-3 text-xs font-bold text-gray-600 shadow-sm ${position} ${selectedColor.building}`}
      >
        <p className="line-clamp-2">{location.name}</p>

        <p className="mt-2 text-[10px] font-semibold text-gray-400">
          {location.count} active{" "}
          {location.count === 1 ? "complaint" : "complaints"}
        </p>
      </div>

      <div className={`absolute ${markerPosition}`}>
        <div
          className={`absolute -inset-6 animate-pulse rounded-full ${selectedColor.pulse}`}
        />

        <div
          className={`relative grid h-9 w-9 place-items-center rounded-full text-white shadow-lg ring-4 ring-white/70 ${selectedColor.marker}`}
        >
          {color === "yellow" ? (
            <Network size={17} />
          ) : color === "red" ? (
            <CircleAlert size={17} />
          ) : (
            <MapPin size={16} />
          )}
        </div>
      </div>
    </>
  );
}

function ProgressItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />

      <span className="text-gray-600">{label}</span>

      <b className="ml-auto text-gray-900">{value}</b>
    </div>
  );
}

function getCategoryIcon(categoryName, fallbackIcon) {
  const normalizedName = categoryName?.toLowerCase() || "";

  if (
    normalizedName.includes("network") ||
    normalizedName.includes("wifi") ||
    normalizedName.includes("wi-fi")
  ) {
    return Wifi;
  }

  if (normalizedName.includes("electric") || normalizedName.includes("power")) {
    return Zap;
  }

  if (
    normalizedName.includes("water") ||
    normalizedName.includes("sanitation")
  ) {
    return Droplets;
  }

  if (
    normalizedName.includes("hostel") ||
    normalizedName.includes("location")
  ) {
    return MapPin;
  }

  if (
    normalizedName.includes("civil") ||
    normalizedName.includes("building") ||
    normalizedName.includes("facility") ||
    normalizedName.includes("maintenance")
  ) {
    return Building2;
  }

  return fallbackIcon || FileText;
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

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatHours(hoursValue) {
  const hours = Number(hoursValue) || 0;

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}m`;
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

export default StudentDashboard;
