import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Edit3,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

const initialClassifications = [
  {
    id: "RA-1058",
    title: "Exposed electrical wire near laboratory",
    category: "Electrical",
    priority: "Urgent",
    department: "Maintenance",
    confidence: 96,
    status: "Pending Review",
  },
  {
    id: "RA-1057",
    title: "Wi-Fi disconnecting in Block C",
    category: "Network",
    priority: "High",
    department: "IT Support",
    confidence: 92,
    status: "Pending Review",
  },
  {
    id: "RA-1056",
    title: "Drinking-water cooler not working",
    category: "Water",
    priority: "Medium",
    department: "Facilities",
    confidence: 88,
    status: "Approved",
  },
  {
    id: "RA-1055",
    title: "Incorrect internal assessment marks",
    category: "Academic",
    priority: "Medium",
    department: "Academic Office",
    confidence: 84,
    status: "Corrected",
  },
];

const priorityStyles = {
  Urgent: "bg-red-50 text-red-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

function AIMonitoring() {
  const [classifications, setClassifications] = useState(
    initialClassifications,
  );

  const [selectedCase, setSelectedCase] = useState(null);

  const approveClassification = (caseId) => {
    setClassifications((previousClassifications) =>
      previousClassifications.map((item) =>
        item.id === caseId ? { ...item, status: "Approved" } : item,
      ),
    );
  };

  const correctClassification = (event) => {
    event.preventDefault();

    setClassifications((previousClassifications) =>
      previousClassifications.map((item) =>
        item.id === selectedCase.id
          ? {
              ...item,
              category: selectedCase.category,
              priority: selectedCase.priority,
              department: selectedCase.department,
              status: "Corrected",
            }
          : item,
      ),
    );

    setSelectedCase(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Sparkles size={17} />
            Responsible AI administration
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            AI Monitoring
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review AI performance, classifications and human corrections.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          AI service operational
        </div>
      </section>

      {/* AI summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Classification Accuracy"
          value="97.4%"
          information="+1.2% this month"
          icon={TrendingUp}
          style="bg-emerald-50 text-emerald-700"
        />

        <MetricCard
          title="AI Requests"
          value="2,946"
          information="This month"
          icon={Bot}
          style="bg-cyan-50 text-cyan-700"
        />

        <MetricCard
          title="Average Response"
          value="1.2 sec"
          information="Within target"
          icon={Clock3}
          style="bg-violet-50 text-violet-700"
        />

        <MetricCard
          title="Human Corrections"
          value="76"
          information="2.6% correction rate"
          icon={Edit3}
          style="bg-orange-50 text-orange-700"
        />
      </section>

      {/* System information */}
      <section className="grid gap-5 lg:grid-cols-3">
        <SystemCard
          icon={Cpu}
          title="Classification Model"
          value="Gemini 2.5 Flash"
          information="Complaint category and priority detection"
          status="Operational"
        />

        <SystemCard
          icon={Database}
          title="Knowledge Base"
          value="12 departments"
          information="42 complaint categories configured"
          status="Synced"
        />

        <SystemCard
          icon={CheckCircle2}
          title="Duplicate Detection"
          value="94.8% accuracy"
          information="126 duplicates detected this month"
          status="Operational"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Classification reviews */}
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:px-6">
            <h2 className="font-bold text-slate-900">
              Recent AI classifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review and correct AI-generated complaint labels.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {classifications.map((item) => (
              <div key={item.id} className="p-5 sm:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700">
                        {item.id}
                      </span>

                      <ReviewStatus status={item.status} />
                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {item.title}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                        {item.category}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          priorityStyles[item.priority]
                        }`}
                      >
                        {item.priority}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {item.department}
                      </span>
                    </div>
                  </div>

                  <div className="w-full xl:w-32">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-bold text-slate-800">
                        {item.confidence}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          item.confidence >= 90
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => approveClassification(item.id)}
                      disabled={item.status === "Approved"}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={16} />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCase({ ...item })}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Edit3 size={15} />
                      Correct
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* AI governance */}
        <aside className="space-y-5">
          <article className="rounded-3xl bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-2 font-bold">
              <Bot size={20} className="text-emerald-400" />
              AI governance
            </div>

            <div className="mt-5 space-y-4">
              <GovernanceItem title="Human review" value="Enabled" positive />

              <GovernanceItem title="Automatic assignment" value="Disabled" />

              <GovernanceItem
                title="Sensitive-data masking"
                value="Enabled"
                positive
              />

              <GovernanceItem
                title="Decision logging"
                value="Enabled"
                positive
              />
            </div>
          </article>

          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
              <AlertTriangle size={18} />
              Review recommendation
            </div>

            <p className="mt-3 text-sm leading-6 text-amber-800">
              Cases with confidence below 85% should be reviewed before
              department assignment.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Model feedback</h2>

            <div className="mt-5 space-y-4">
              <FeedbackItem
                label="Approved predictions"
                value="2,870"
                percentage="97.4%"
                color="bg-emerald-500"
              />

              <FeedbackItem
                label="Corrected predictions"
                value="76"
                percentage="2.6%"
                color="bg-orange-500"
              />
            </div>
          </article>
        </aside>
      </section>

      {/* Correction modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={correctClassification}
            className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Correct classification
                </h2>

                <p className="mt-1 text-sm text-slate-500">{selectedCase.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {selectedCase.title}
            </p>

            <div className="mt-5 space-y-5">
              <SelectField
                label="Category"
                value={selectedCase.category}
                onChange={(event) =>
                  setSelectedCase({
                    ...selectedCase,
                    category: event.target.value,
                  })
                }
                options={[
                  "Network",
                  "Electrical",
                  "Water",
                  "Academic",
                  "Furniture",
                  "Security",
                ]}
              />

              <SelectField
                label="Priority"
                value={selectedCase.priority}
                onChange={(event) =>
                  setSelectedCase({
                    ...selectedCase,
                    priority: event.target.value,
                  })
                }
                options={["Urgent", "High", "Medium", "Low"]}
              />

              <SelectField
                label="Department"
                value={selectedCase.department}
                onChange={(event) =>
                  setSelectedCase({
                    ...selectedCase,
                    department: event.target.value,
                  })
                }
                options={[
                  "IT Support",
                  "Maintenance",
                  "Facilities",
                  "Academic Office",
                  "Campus Security",
                ]}
              />
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Check size={17} />
                Save correction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, information, icon: Icon, style }) {
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
          <Icon size={21} />
        </span>
      </div>
    </article>
  );
}

function SystemCard({ icon: Icon, title, value, information, status }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon size={20} />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">{value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{information}</p>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {status}
          </div>
        </div>
      </div>
    </article>
  );
}

function ReviewStatus({ status }) {
  const styles = {
    "Pending Review": "bg-amber-50 text-amber-700",
    Approved: "bg-emerald-50 text-emerald-700",
    Corrected: "bg-violet-50 text-violet-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function GovernanceItem({ title, value, positive = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-300">{title}</span>

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          positive
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-slate-800 text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function FeedbackItem({ label, value, percentage, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{value}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default AIMonitoring;
