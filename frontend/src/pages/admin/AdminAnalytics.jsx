import {
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

const monthlyData = [
  { month: "Mar", received: 142, resolved: 121 },
  { month: "Apr", received: 168, resolved: 143 },
  { month: "May", received: 194, resolved: 172 },
  { month: "Jun", received: 176, resolved: 158 },
  { month: "Jul", received: 218, resolved: 192 },
  { month: "Aug", received: 236, resolved: 208 },
];

const categories = [
  {
    name: "Network & Wi-Fi",
    complaints: 284,
    percentage: 88,
    color: "bg-cyan-500",
  },
  {
    name: "Campus Maintenance",
    complaints: 231,
    percentage: 72,
    color: "bg-violet-500",
  },
  {
    name: "Academic Issues",
    complaints: 196,
    percentage: 61,
    color: "bg-emerald-500",
  },
  {
    name: "Hostel Facilities",
    complaints: 164,
    percentage: 51,
    color: "bg-amber-500",
  },
  {
    name: "Security",
    complaints: 98,
    percentage: 30,
    color: "bg-red-500",
  },
];

const departmentData = [
  {
    department: "Academic Office",
    received: 196,
    resolved: 176,
    rate: "89.8%",
    time: "1.8 days",
  },
  {
    department: "IT Support",
    received: 284,
    resolved: 243,
    rate: "85.6%",
    time: "2.1 days",
  },
  {
    department: "Campus Maintenance",
    received: 231,
    resolved: 178,
    rate: "77.1%",
    time: "2.8 days",
  },
  {
    department: "Hostel Administration",
    received: 164,
    resolved: 119,
    rate: "72.6%",
    time: "3.2 days",
  },
];

function AdminAnalytics() {
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

        <select className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
          <option>This academic year</option>
        </select>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          title="Complaints Received"
          value="1,284"
          change="+8.4%"
          positive
          icon={FileText}
          style="bg-cyan-50 text-cyan-700"
        />

        <AnalyticsCard
          title="Resolution Rate"
          value="86.7%"
          change="+3.2%"
          positive
          icon={CheckCircle2}
          style="bg-emerald-50 text-emerald-700"
        />

        <AnalyticsCard
          title="Average Resolution"
          value="2.4 days"
          change="-12.6%"
          positive
          icon={Clock3}
          style="bg-violet-50 text-violet-700"
        />

        <AnalyticsCard
          title="Active Students"
          value="4,126"
          change="+5.1%"
          positive
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

          <div className="mt-8 flex h-72 items-end justify-between gap-2 border-b border-slate-200 sm:gap-6">
            {monthlyData.map((item) => (
              <div
                key={item.month}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div className="flex h-[235px] w-full items-end justify-center gap-1 sm:gap-2">
                  <div
                    className="w-4 rounded-t-lg bg-slate-900 transition hover:bg-slate-700 sm:w-8"
                    style={{
                      height: `${item.received * 0.9}px`,
                    }}
                    title={`${item.received} received`}
                  />

                  <div
                    className="w-4 rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600 sm:w-8"
                    style={{
                      height: `${item.resolved * 0.9}px`,
                    }}
                    title={`${item.resolved} resolved`}
                  />
                </div>

                <span className="py-3 text-xs font-semibold text-slate-500">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
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
                background:
                  "conic-gradient(#10b981 0deg 312deg, #e2e8f0 312deg 360deg)",
              }}
            >
              <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-4xl font-bold text-slate-900">86.7%</p>

                  <p className="mt-1 text-xs text-slate-500">Resolved</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-slate-500">Resolved</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">1,113</p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="text-xs text-slate-500">Open</p>
              <p className="mt-1 text-xl font-bold text-orange-700">171</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        {/* Category distribution */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-900">Complaint categories</h2>

          <p className="mt-1 text-sm text-slate-500">
            Most frequently reported issues
          </p>

          <div className="mt-6 space-y-5">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {category.name}
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    {category.complaints}
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Department table */}
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:px-6">
            <h2 className="font-bold text-slate-900">Department comparison</h2>

            <p className="mt-1 text-sm text-slate-500">
              Resolution performance by department
            </p>
          </div>

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
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {department.rate}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {department.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* AI insight */}
      <section className="flex flex-col gap-5 rounded-3xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-slate-950">
          <Bot size={22} />
        </span>

        <div className="flex-1">
          <p className="font-bold">AI performance insight</p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Wi-Fi complaints increased by 18% this month, primarily from Blocks
            B and C. Increasing IT Support coverage between 12 PM and 4 PM may
            reduce average resolution time.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 px-5 py-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">97.4%</p>

          <p className="mt-1 text-xs text-slate-400">AI accuracy</p>
        </div>
      </section>
    </div>
  );
}

function AnalyticsCard({ title, value, change, positive, icon: Icon, style }) {
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
            {change} from previous period
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
