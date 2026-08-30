import { useOutletContext } from "react-router-dom";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Droplets,
  MapPin,
  Network,
  Sparkles,
  TicketCheck,
  Wifi,
  Zap,
} from "lucide-react";

const summaryCards = [
  {
    title: "Total open",
    value: 126,
    change: "12%",
    trend: "up",
    icon: TicketCheck,
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "In progress",
    value: 48,
    change: "8%",
    trend: "up",
    icon: Clock3,
    iconStyle: "bg-blue-100 text-blue-700",
  },
  {
    title: "Resolved today",
    value: 32,
    change: "18%",
    trend: "up",
    icon: CheckCircle2,
    iconStyle: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Average response",
    value: "2h 18m",
    change: "14 min",
    trend: "down",
    icon: ArrowDownRight,
    iconStyle: "bg-orange-100 text-orange-700",
  },
];

const categories = [
  {
    name: "Network",
    value: 38,
    icon: Wifi,
    style: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Electrical",
    value: 26,
    icon: Zap,
    style: "bg-yellow-100 text-yellow-700",
  },
  {
    name: "Civil",
    value: 24,
    icon: Building2,
    style: "bg-blue-100 text-blue-700",
  },
  {
    name: "Sanitation",
    value: 18,
    icon: Droplets,
    style: "bg-cyan-100 text-cyan-700",
  },
  {
    name: "Hostel",
    value: 20,
    icon: MapPin,
    style: "bg-orange-100 text-orange-700",
  },
];

const recentComplaints = [
  {
    id: "RA-1042",
    title: "Wi-Fi unavailable in CSE Lab 3",
    category: "Network",
    location: "CSE Block",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "RA-1041",
    title: "Water leakage near Hostel Gate",
    category: "Civil",
    location: "Hostel Area",
    priority: "Critical",
    status: "Assigned",
  },
  {
    id: "RA-1039",
    title: "Projector not working in Room 204",
    category: "Electrical",
    location: "Academic Block",
    priority: "Medium",
    status: "New",
  },
];

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
    New: "bg-gray-100 text-gray-700",
    Assigned: "bg-blue-50 text-blue-700",
    "In Progress": "bg-purple-50 text-purple-700",
    Resolved: "bg-emerald-50 text-emerald-700",
  };

  return styles[status] || styles.New;
}

function StudentDashboard() {
  const { user } = useOutletContext();

  const studentName = user?.name || "Student";
  const firstName = studentName.trim().split(/\s+/)[0];

  const currentHour = new Date().getHours();

  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 17) {
    greeting = "Good afternoon";
  }

  return (
    <section className="mx-auto max-w-[1500px]">
      {/* Page heading */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Campus Pulse
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {greeting}, {firstName} 👋
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Here’s what’s happening across your campus today.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <Sparkles size={20} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              AI triage accuracy
            </p>

            <p className="text-lg font-extrabold text-gray-900">94.8%</p>
          </div>

          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
            +2.4%
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
              <div className="flex items-start justify-between">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon size={21} />
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  {card.trend === "up" ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}

                  {card.change}
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
                {card.value}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Compared with the previous week
              </p>
            </article>
          );
        })}
      </div>

      {/* Main dashboard content */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
        {/* Campus heatmap */}
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-gray-900">
                Campus complaint heatmap
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Live issue concentration by campus location
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              All locations
            </button>
          </div>

          {/* Map representation */}
          <div className="relative min-h-[390px] overflow-hidden bg-[#edf4eb]">
            {/* Map roads */}
            <div className="absolute left-[8%] top-[18%] h-2 w-[85%] rotate-6 rounded-full bg-white/90" />

            <div className="absolute left-[3%] top-[57%] h-2 w-[95%] -rotate-3 rounded-full bg-white/90" />

            <div className="absolute left-[29%] top-[-10%] h-[120%] w-2 rotate-12 rounded-full bg-white/90" />

            <div className="absolute right-[23%] top-[-10%] h-[120%] w-2 -rotate-6 rounded-full bg-white/90" />

            {/* Campus buildings */}
            <div className="absolute left-[12%] top-[20%] h-20 w-32 rounded-xl border border-emerald-200 bg-white/70 p-3 text-xs font-bold text-gray-600 shadow-sm">
              Hostel Area
            </div>

            <div className="absolute left-[38%] top-[46%] h-24 w-40 rounded-xl border border-emerald-200 bg-white/70 p-3 text-xs font-bold text-gray-600 shadow-sm">
              CSE Block
            </div>

            <div className="absolute right-[9%] top-[23%] h-20 w-32 rounded-xl border border-emerald-200 bg-white/70 p-3 text-xs font-bold text-gray-600 shadow-sm">
              Library
            </div>

            <div className="absolute bottom-[12%] right-[20%] h-20 w-36 rounded-xl border border-emerald-200 bg-white/70 p-3 text-xs font-bold text-gray-600 shadow-sm">
              Sports Complex
            </div>

            {/* Heatmap points */}
            <div className="absolute left-[20%] top-[25%]">
              <div className="absolute -inset-7 animate-pulse rounded-full bg-red-400/20" />

              <div className="absolute -inset-4 rounded-full bg-red-400/30" />

              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-red-500 text-white shadow-lg ring-4 ring-white/70">
                <CircleAlert size={17} />
              </div>
            </div>

            <div className="absolute left-[51%] top-[49%]">
              <div className="absolute -inset-8 animate-pulse rounded-full bg-yellow-400/20" />

              <div className="absolute -inset-4 rounded-full bg-yellow-400/30" />

              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-yellow-500 text-white shadow-lg ring-4 ring-white/70">
                <Network size={17} />
              </div>
            </div>

            <div className="absolute right-[17%] top-[27%]">
              <div className="absolute -inset-6 rounded-full bg-blue-400/20" />

              <div className="relative grid h-8 w-8 place-items-center rounded-full bg-blue-500 text-white shadow-lg ring-4 ring-white/70">
                <Wifi size={15} />
              </div>
            </div>

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-4 rounded-xl border border-white/70 bg-white/90 px-4 py-3 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur">
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Critical
              </span>

              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                Medium
              </span>

              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Low
              </span>
            </div>
          </div>
        </article>

        {/* SLA and categories */}
        <div className="grid gap-5">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">SLA compliance</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Current service performance
                </p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                On track
              </span>
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full bg-[conic-gradient(#059669_0deg_331deg,#fbbf24_331deg_346deg,#ef4444_346deg_360deg)]">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900">92%</p>

                    <p className="text-[10px] font-semibold text-emerald-700">
                      On track
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600">
                    <i className="h-2 w-2 rounded-full bg-emerald-500" />
                    On track
                  </span>

                  <b>92%</b>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600">
                    <i className="h-2 w-2 rounded-full bg-yellow-500" />
                    At risk
                  </span>

                  <b>6%</b>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600">
                    <i className="h-2 w-2 rounded-full bg-red-500" />
                    Breached
                  </span>

                  <b>2%</b>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">Complaints by category</h2>

            <div className="mt-4 space-y-3">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <div
                    key={category.name}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                  >
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-xl ${category.style}`}
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
          </article>
        </div>
      </div>

      {/* AI summary */}
      <article className="mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-700 text-white">
            <Bot size={24} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-emerald-950">AI campus summary</h2>

              <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                Live
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-emerald-900/70">
              Wi-Fi complaints in the CSE Block and water leakage reports near
              the hostel are trending today. Network inspection and plumbing
              maintenance are recommended.
            </p>
          </div>

          <div className="rounded-xl border border-white bg-white/70 px-5 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              AI confidence
            </p>

            <p className="mt-1 text-2xl font-extrabold text-emerald-700">
              94.8%
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
              Latest reports submitted across the campus
            </p>
          </div>

          <button
            type="button"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            View all complaints
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-4">Complaint</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {recentComplaints.map((complaint) => (
                <tr key={complaint.id} className="transition hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-gray-800">
                      {complaint.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">{complaint.id}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {complaint.category}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {complaint.location}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default StudentDashboard;
