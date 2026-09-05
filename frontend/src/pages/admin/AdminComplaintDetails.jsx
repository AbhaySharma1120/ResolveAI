import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileImage,
  LoaderCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";

const statuses = [
  "New",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
  "Reopened",
];

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const defaultDepartments = [
  "Network Team",
  "Electrical Maintenance",
  "Civil Maintenance",
  "Sanitation Department",
  "Hostel Administration",
];

const slaHoursByPriority = {
  Critical: 2,
  High: 6,
  Medium: 24,
  Low: 48,
};

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function formatTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "NA"
  );
}

function calculateSla(complaint) {
  const slaHours =
    slaHoursByPriority[
      complaint.priority
    ] || 24;

  const createdTime = new Date(
    complaint.createdAt
  ).getTime();

  const deadlineTime =
    createdTime +
    slaHours * 60 * 60 * 1000;

  const totalDuration =
    slaHours * 60 * 60 * 1000;

  const remainingTime =
    deadlineTime - Date.now();

  const elapsedTime =
    Date.now() - createdTime;

  const progress = Math.min(
    Math.max(
      Math.round(
        (elapsedTime / totalDuration) * 100
      ),
      0
    ),
    100
  );

  if (complaint.status === "Resolved") {
    return {
      deadline: new Date(deadlineTime),
      text: "Completed",
      progress: 100,
      overdue: false,
    };
  }

  if (remainingTime <= 0) {
    const overdueMinutes = Math.abs(
      Math.floor(
        remainingTime / (1000 * 60)
      )
    );

    const hours = Math.floor(
      overdueMinutes / 60
    );

    const minutes =
      overdueMinutes % 60;

    return {
      deadline: new Date(deadlineTime),
      text: `${hours}h ${minutes}m overdue`,
      progress: 100,
      overdue: true,
    };
  }

  const totalMinutes = Math.floor(
    remainingTime / (1000 * 60)
  );

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  return {
    deadline: new Date(deadlineTime),
    text: `${hours}h ${minutes}m remaining`,
    progress,
    overdue: false,
  };
}

function AdminComplaintDetails() {
  const { complaintId } = useParams();

  const [complaint, setComplaint] =
    useState(null);

  const [status, setStatus] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const [originalValues, setOriginalValues] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const fetchComplaint = async () => {
    if (!complaintId) {
      setErrorMessage(
        "Complaint tracking ID is missing."
      );
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get(
        `/complaints/${complaintId}`
      );

      const complaintData =
        response.data.complaint;

      setComplaint(complaintData);
      setStatus(complaintData.status);
      setDepartment(
        complaintData.department
      );
      setPriority(
        complaintData.priority
      );

      setOriginalValues({
        status: complaintData.status,
        department:
          complaintData.department,
        priority: complaintData.priority,
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to retrieve complaint details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const hasChanges =
    originalValues &&
    (status !== originalValues.status ||
      department !==
        originalValues.department ||
      priority !==
        originalValues.priority);

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set([
        ...defaultDepartments,
        department,
      ])
    ).filter(Boolean);
  }, [department]);

  const saveChanges = async () => {
    if (!hasChanges || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.patch(
        `/complaints/admin/${complaint.trackingId}`,
        {
          status,
          department,
          priority,
        }
      );

      const updatedComplaint =
        response.data.complaint;

      setComplaint(updatedComplaint);
      setStatus(updatedComplaint.status);
      setDepartment(
        updatedComplaint.department
      );
      setPriority(
        updatedComplaint.priority
      );

      setOriginalValues({
        status: updatedComplaint.status,
        department:
          updatedComplaint.department,
        priority:
          updatedComplaint.priority,
      });

      setSuccessMessage(
        response.data.message
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to save administrative changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="grid min-h-[calc(100vh-145px)] place-items-center">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-emerald-700"
            size={40}
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading complaint details...
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage && !complaint) {
    return (
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-xl place-items-center">
        <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle
            className="mx-auto text-red-600"
            size={40}
          />

          <h1 className="mt-5 text-xl font-bold text-red-900">
            Complaint unavailable
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {errorMessage}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={fetchComplaint}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white"
            >
              <RefreshCw size={17} />
              Try again
            </button>

            <Link
              to="/admin/complaints"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700"
            >
              <ArrowLeft size={17} />
              Back
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!complaint) {
    return null;
  }

  const location = [
    complaint.location?.campusArea,
    complaint.location?.specificArea,
  ]
    .filter(Boolean)
    .join(" · ");

  const sla = calculateSla({
    ...complaint,
    priority,
    status,
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Link
        to="/admin/complaints"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft size={18} />
        Back to all complaints
      </Link>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle size={20} />
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-emerald-700">
              {complaint.trackingId}
            </span>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              {priority} Priority
            </span>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {status}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
            {complaint.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Submitted by{" "}
            {complaint.student?.name ||
              "Student"}{" "}
            ·{" "}
            {formatDateTime(
              complaint.createdAt
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={saveChanges}
          disabled={
            !hasChanges || isSaving
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <LoaderCircle
              className="animate-spin"
              size={17}
            />
          ) : (
            <RefreshCw size={17} />
          )}

          {isSaving
            ? "Saving..."
            : "Save changes"}
        </button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* Complaint information */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">
              Complaint information
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {complaint.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InformationCard
                icon={MapPin}
                label="Location"
                value={location}
              />

              <InformationCard
                icon={CalendarDays}
                label="Submitted"
                value={formatDateTime(
                  complaint.createdAt
                )}
              />

              <InformationCard
                icon={Clock3}
                label="SLA deadline"
                value={formatDateTime(
                  sla.deadline
                )}
              />
            </div>
          </article>

          {/* Student and Officer */}
          <article className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <PersonCard
              title="Reported by"
              name={
                complaint.student?.name ||
                "Student"
              }
              detail={[
                complaint.student
                  ?.department,
                complaint.student
                  ?.universityId,
              ]
                .filter(Boolean)
                .join(" · ")}
              initials={getInitials(
                complaint.student?.name
              )}
              color="bg-cyan-100 text-cyan-700"
            />

            <PersonCard
              title="Assigned officer"
              name={
                complaint.assignedOfficer
                  ?.name ||
                "Not assigned yet"
              }
              detail={
                complaint.assignedOfficer
                  ? [
                      complaint
                        .assignedOfficer
                        .designation,
                      complaint
                        .assignedOfficer
                        .department,
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : "Waiting for assignment"
              }
              initials={getInitials(
                complaint.assignedOfficer
                  ?.name
              )}
              color="bg-emerald-100 text-emerald-700"
            />
          </article>

          {/* Evidence */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">
              Evidence
            </h2>

            {complaint.evidence?.length >
            0 ? (
              <div className="mt-4 space-y-3">
                {complaint.evidence.map(
                  (file, index) => (
                    <div
                      key={
                        file.publicId ||
                        `${file.url}-${index}`
                      }
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                        <FileImage
                          size={21}
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {file.originalName ||
                            `Evidence ${
                              index + 1
                            }`}
                        </p>

                        <p className="mt-1 text-xs capitalize text-slate-500">
                          {file.resourceType}
                        </p>
                      </div>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Download
                          size={16}
                        />
                      </a>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                <FileImage
                  className="mx-auto text-slate-400"
                  size={28}
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No evidence attached
                </p>
              </div>
            )}
          </article>

          {/* Activity */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">
              Complete activity history
            </h2>

            <div className="mt-6">
              {complaint.timeline?.map(
                (item, index) => (
                  <div
                    key={
                      item._id ||
                      `${item.status}-${index}`
                    }
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2
                          size={17}
                        />
                      </span>

                      {index !==
                        complaint.timeline
                          .length -
                          1 && (
                        <span className="h-14 w-px bg-slate-200" />
                      )}
                    </div>

                    <div className="pb-6">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.status}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.message}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatTime(
                          item.createdAt
                        )}

                        {item.updatedBy
                          ?.name
                          ? ` · ${item.updatedBy.name}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </article>
        </div>

        <aside className="space-y-5">
          {/* Admin controls */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={20}
                className="text-emerald-700"
              />

              <h2 className="font-bold text-slate-900">
                Administrative controls
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <SelectField
                label="Complaint status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                options={statuses}
              />

              <SelectField
                label="Assigned department"
                value={department}
                onChange={(event) =>
                  setDepartment(
                    event.target.value
                  )
                }
                options={
                  departmentOptions
                }
              />

              <SelectField
                label="Priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value
                  )
                }
                options={priorities}
              />
            </div>
          </article>

          {/* AI details */}
          <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-900">
              <Bot size={19} />
              AI classification
            </div>

            <div className="mt-5 space-y-4">
              <AIInformation
                label="Suggested category"
                value={
                  complaint.aiAnalysis
                    ?.suggestedCategory ||
                  complaint.category
                }
              />

              <AIInformation
                label="Suggested priority"
                value={
                  complaint.aiAnalysis
                    ?.suggestedPriority ||
                  complaint.priority
                }
              />

              <AIInformation
                label="Suggested department"
                value={
                  complaint.aiAnalysis
                    ?.suggestedDepartment ||
                  complaint.department
                }
              />

              <AIInformation
                label="Confidence"
                value={`${
                  complaint.aiAnalysis
                    ?.confidence || 0
                }%`}
              />
            </div>
          </article>

          {/* SLA */}
          <article
            className={`rounded-3xl border p-5 ${
              sla.overdue
                ? "border-red-200 bg-red-50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-sm font-bold ${
                sla.overdue
                  ? "text-red-900"
                  : "text-orange-900"
              }`}
            >
              <AlertTriangle size={18} />
              SLA monitoring
            </div>

            <p
              className={`mt-4 text-2xl font-bold ${
                sla.overdue
                  ? "text-red-900"
                  : "text-orange-900"
              }`}
            >
              {sla.text}
            </p>

            <div
              className={`mt-4 h-2 overflow-hidden rounded-full ${
                sla.overdue
                  ? "bg-red-100"
                  : "bg-orange-100"
              }`}
            >
              <div
                className={`h-full rounded-full ${
                  status === "Resolved"
                    ? "bg-emerald-500"
                    : sla.overdue
                      ? "bg-red-500"
                      : "bg-orange-500"
                }`}
                style={{
                  width: `${sla.progress}%`,
                }}
              />
            </div>

            <p
              className={`mt-3 text-xs leading-5 ${
                sla.overdue
                  ? "text-red-700"
                  : "text-orange-700"
              }`}
            >
              {status === "Resolved"
                ? "This complaint is marked as resolved."
                : `Resolve or update this complaint before ${formatDateTime(
                    sla.deadline
                  )}.`}
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}

function InformationCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon
        size={18}
        className="text-emerald-700"
      />

      <p className="mt-3 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

function PersonCard({
  title,
  name,
  detail,
  initials,
  color,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${color}`}
      >
        {initials}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {title}
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {name}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {detail}
        </p>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
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
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function AIInformation({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-cyan-700">
        {label}
      </span>

      <span className="text-right font-bold text-cyan-950">
        {value}
      </span>
    </div>
  );
}

export default AdminComplaintDetails;