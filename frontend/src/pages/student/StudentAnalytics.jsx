import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  TrendingUp,
  Wifi,
  Building2,
  Droplets,
  ShieldAlert,
} from "lucide-react";

const monthlyData = [
  { month: "Jan", submitted: 3, resolved: 2 },
  { month: "Feb", submitted: 5, resolved: 4 },
  { month: "Mar", submitted: 4, resolved: 3 },
  { month: "Apr", submitted: 7, resolved: 6 },
  { month: "May", submitted: 5, resolved: 5 },
  { month: "Jun", submitted: 8, resolved: 6 },
];

const categories = [
  {
    name: "Internet & Wi-Fi",
    count: 8,
    percentage: 80,
    icon: Wifi,
    color: "bg-cyan-500",
    iconStyle: "bg-cyan-50 text-cyan-700",
  },
  {
    name: "Hostel Facilities",
    count: 6,
    percentage: 60,
    icon: Building2,
    color: "bg-violet-500",
    iconStyle: "bg-violet-50 text-violet-700",
  },
  {
    name: "Water & Sanitation",
    count: 4,
    percentage: 40,
    icon: Droplets,
    color: "bg-blue-500",
    iconStyle: "bg-blue-50 text-blue-700",
  },
  {
    name: "Security",
    count: 2,
    percentage: 20,
    icon: ShieldAlert,
    color: "bg-orange-500",
    iconStyle: "bg-orange-50 text-orange-700",
  },
];

function StudentAnalytics() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
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

        <select className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
          <option>This year</option>
        </select>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Complaints"
          value="32"
          information="+4 this month"
          icon={FileText}
          style="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          title="Resolved"
          value="26"
          information="81.2% resolution rate"
          icon={CheckCircle2}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="In Progress"
          value="4"
          information="Currently being handled"
          icon={Clock3}
          style="bg-amber-50 text-amber-700"
        />

        <SummaryCard
          title="Average Resolution"
          value="2.4 days"
          information="12% faster than average"
          icon={TrendingUp}
          style="bg-violet-50 text-violet-700"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Monthly chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Complaint Activity</h2>
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

          <div className="mt-8 flex h-64 items-end justify-between gap-2 border-b border-slate-200 sm:gap-5">
            {monthlyData.map((item) => (
              <div
                key={item.month}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div className="flex h-[210px] w-full items-end justify-center gap-1 sm:gap-2">
                  <div
                    className="w-3 rounded-t-lg bg-emerald-600 transition hover:bg-emerald-700 sm:w-6"
                    style={{ height: `${item.submitted * 22}px` }}
                    title={`${item.submitted} submitted`}
                  />

                  <div
                    className="w-3 rounded-t-lg bg-cyan-400 transition hover:bg-cyan-500 sm:w-6"
                    style={{ height: `${item.resolved * 22}px` }}
                    title={`${item.resolved} resolved`}
                  />
                </div>

                <span className="py-3 text-xs font-medium text-slate-500">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution rate */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-900">Resolution Rate</h2>

          <p className="mt-1 text-sm text-slate-500">
            Overall complaint performance
          </p>

          <div className="mt-8 flex justify-center">
            <div
              className="grid h-48 w-48 place-items-center rounded-full"
              style={{
                background:
                  "conic-gradient(#047857 0deg 292deg, #e2e8f0 292deg 360deg)",
              }}
            >
              <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-4xl font-bold text-slate-900">81%</p>
                  <p className="mt-1 text-xs text-slate-500">Resolved</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-slate-500">Resolved</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">26</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-4">
              <p className="text-xs text-slate-500">Remaining</p>
              <p className="mt-1 text-xl font-bold text-slate-700">6</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {/* Categories */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-900">Top Categories</h2>

          <p className="mt-1 text-sm text-slate-500">
            Your most frequently reported issues
          </p>

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
                        {category.name}
                      </p>

                      <p className="text-sm font-bold text-slate-900">
                        {category.count}
                      </p>
                    </div>
                  </div>

                  <div className="ml-12 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${category.color}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI insight */}
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <TrendingUp size={18} />
            AI-generated insight
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Your complaints are being resolved faster
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Your average resolution time has improved by 12% during the last six
            months. Internet and Wi-Fi remains your most frequently reported
            category.
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">
              Recommended action
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              If several students experience the same network problem, mention
              the building, floor and time of occurrence to help the technical
              team identify the issue faster.
            </p>
          </div>
        </div>
      </section>
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
