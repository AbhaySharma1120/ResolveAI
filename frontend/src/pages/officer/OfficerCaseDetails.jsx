import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

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
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

import api from "../../services/api";

const slaHoursByPriority = {
  Urgent: 2,
  Critical: 2,
  High: 6,
  Medium: 24,
  Low: 48,
};

const recommendedActions = {
  Network:
    "Check the network access point, router and connectivity at the reported location.",

  Electrical:
    "Inspect the electrical equipment and isolate any immediate safety risk.",

  Civil:
    "Inspect the affected infrastructure and arrange the required repair work.",

  Sanitation: "Notify the sanitation team and inspect the reported location.",

  Hostel:
    "Coordinate with the hostel administration and inspect the reported facility.",
};

function getStoredUser() {
  try {
    const value = localStorage.getItem("resolveaiUser");

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getInitials(name = "") {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "US";
}

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function formatMessageTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
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

function calculateSla(complaint) {
  const slaHours = slaHoursByPriority[complaint.priority] || 24;

  const createdTime = new Date(complaint.createdAt).getTime();

  const deadlineTime = createdTime + slaHours * 60 * 60 * 1000;

  const totalDuration = slaHours * 60 * 60 * 1000;

  const remainingTime = deadlineTime - Date.now();

  const elapsedTime = Date.now() - createdTime;

  const progress = Math.min(
    Math.max(Math.round((elapsedTime / totalDuration) * 100), 0),
    100,
  );

  if (["Resolved", "Closed"].includes(complaint.status)) {
    return {
      deadline: new Date(deadlineTime),
      text: "Completed",
      progress: 100,
      overdue: false,
    };
  }

  if (remainingTime <= 0) {
    const overdueMinutes = Math.abs(Math.floor(remainingTime / (1000 * 60)));

    const hours = Math.floor(overdueMinutes / 60);

    const minutes = overdueMinutes % 60;

    return {
      deadline: new Date(deadlineTime),
      text: `${hours}h ${minutes}m overdue`,
      progress: 100,
      overdue: true,
    };
  }

  const totalMinutes = Math.floor(remainingTime / (1000 * 60));

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  return {
    deadline: new Date(deadlineTime),
    text: `${hours}h ${minutes}m remaining`,
    progress,
    overdue: false,
  };
}

function getAvailableStatuses(status) {
  if (status === "Assigned") {
    return ["Assigned", "In Progress"];
  }

  if (status === "In Progress") {
    return ["In Progress", "Pending Student", "Resolved"];
  }

  if (status === "Pending Student") {
    return ["Pending Student", "In Progress", "Resolved"];
  }

  return [status];
}

function OfficerCaseDetails() {
  const { complaintId } = useParams();

  const officer = getStoredUser();

  const [complaint, setComplaint] = useState(null);

  const [status, setStatus] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [message, setMessage] = useState("");

  const [conversation, setConversation] = useState([]);

  const [isSending, setIsSending] = useState(false);

  const [messageError, setMessageError] = useState("");

  const fetchComplaint = async () => {
    if (!complaintId) {
      setErrorMessage("Complaint tracking ID is missing.");

      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setMessageError("");

      const [complaintResponse, conversationResponse] = await Promise.all([
        api.get(`/complaints/${complaintId}`),

        api.get(`/complaints/${complaintId}/messages`),
      ]);

      const complaintData = complaintResponse.data.complaint;

      setComplaint(complaintData);
      setStatus(complaintData.status);

      setConversation(conversationResponse.data.messages || []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to retrieve case details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const updateStatus = async (newStatus, updateMessage) => {
    if (!complaint || newStatus === complaint.status) {
      return;
    }

    const previousStatus = complaint.status;

    try {
      setIsUpdating(true);
      setErrorMessage("");
      setStatus(newStatus);

      const response = await api.patch(
        `/complaints/${complaint.trackingId}/status`,
        {
          status: newStatus,
          message: updateMessage,
        },
      );

      setComplaint(response.data.complaint);

      setStatus(response.data.complaint.status);
    } catch (error) {
      setStatus(previousStatus);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update the complaint status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;

    updateStatus(
      newStatus,

      newStatus === "In Progress"
        ? "Investigation has started."
        : newStatus === "Pending Student"
          ? "Additional information is required from the student."
          : `Complaint status updated to ${newStatus}.`,
    );
  };

  const handleMarkResolved = () => {
    updateStatus(
      "Resolved",
      "The issue has been fixed and marked as resolved.",
    );
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setMessageError("");

      const response = await api.post(`/complaints/${complaintId}/messages`, {
        message: trimmedMessage,
      });

      setConversation((previousMessages) => [
        ...previousMessages,

        response.data.conversationMessage,
      ]);

      setMessage("");
    } catch (error) {
      setMessageError(
        error.response?.data?.message || "Unable to send message.",
      );
    } finally {
      setIsSending(false);
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
            Loading case details...
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage && !complaint) {
    return (
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-xl place-items-center">
        <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto text-red-600" size={40} />

          <h1 className="mt-5 text-xl font-bold text-red-900">
            Case unavailable
          </h1>

          <p className="mt-3 text-sm text-red-700">{errorMessage}</p>

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
              to="/officer/cases"
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

  const sla = calculateSla(complaint);

  const availableStatuses = getAvailableStatuses(complaint.status);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Link
        to="/officer/cases"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft size={18} />
        Back to assigned cases
      </Link>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="shrink-0" size={18} />

          {errorMessage}
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-emerald-700">
              {complaint.trackingId}
            </span>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              {complaint.priority} Priority
            </span>

            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {complaint.category}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
            {complaint.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Submitted by {complaint.student?.name || "Student"} ·{" "}
            {formatDateTime(complaint.createdAt)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={
              isUpdating || ["Resolved", "Closed"].includes(complaint.status)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {availableStatuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleMarkResolved}
            disabled={
              isUpdating ||
              !["In Progress", "Pending Student"].includes(complaint.status)
            }
            title={
              complaint.status === "Assigned"
                ? "Change the status to In Progress first"
                : ""
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            {["Resolved", "Closed"].includes(complaint.status)
              ? "Resolved"
              : "Mark resolved"}
          </button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* Complaint details */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">Complaint details</h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {complaint.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <DetailItem
                icon={MapPin}
                label="Location"
                value={location || "Campus location"}
              />

              <DetailItem
                icon={CalendarDays}
                label="Submitted"
                value={formatDateTime(complaint.createdAt)}
              />

              <DetailItem
                icon={Clock3}
                label="SLA deadline"
                value={formatDateTime(sla.deadline)}
              />
            </div>
          </article>

          {/* Evidence */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">Evidence</h2>

            {complaint.evidence?.length > 0 ? (
              <div className="mt-4 space-y-3">
                {complaint.evidence.map((file, index) => (
                  <div
                    key={file.publicId || `${file.url}-${index}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                      <FileImage size={21} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {file.originalName || `Evidence ${index + 1}`}
                      </p>

                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {file.resourceType || "file"}
                      </p>
                    </div>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                      aria-label="Open attachment"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                <FileImage className="mx-auto text-slate-400" size={28} />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  No evidence attached
                </p>
              </div>
            )}
          </article>

          {/* Conversation */}
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:px-6">
              <div className="flex items-center gap-2">
                <MessageSquare size={19} className="text-emerald-700" />

                <h2 className="font-bold text-slate-900">
                  Student conversation
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Conversation with {complaint.student?.name || "Student"}
              </p>
            </div>

            <div className="max-h-96 space-y-5 overflow-y-auto bg-slate-50/60 p-5 sm:p-6">
              {conversation.length === 0 && (
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto text-slate-300" size={30} />

                  <p className="mt-3 text-xs text-slate-500">
                    No messages yet.
                  </p>
                </div>
              )}

              {conversation.map((chat) => {
                const senderId =
                  chat.sender?._id || chat.sender?.id || chat.sender;

                const officerId = officer?.id || officer?._id;

                const isOfficer =
                  senderId?.toString() === officerId?.toString();

                const senderName =
                  chat.sender?.name ||
                  (isOfficer
                    ? officer?.name
                    : complaint.student?.name || "Student");

                return (
                  <div
                    key={chat._id}
                    className={`flex gap-3 ${
                      isOfficer ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOfficer && (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-200 text-xs font-bold text-slate-600">
                        {getInitials(senderName)}
                      </span>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                        isOfficer
                          ? "rounded-br-md bg-emerald-700 text-white"
                          : "rounded-tl-md border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold ${
                          isOfficer ? "text-emerald-100" : "text-slate-700"
                        }`}
                      >
                        {senderName}
                      </p>

                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                        {chat.message}
                      </p>

                      <p
                        className={`mt-2 text-[11px] ${
                          isOfficer ? "text-emerald-100" : "text-slate-400"
                        }`}
                      >
                        {formatMessageTime(chat.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {messageError && (
              <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-center text-xs font-semibold text-red-600">
                {messageError}
              </p>
            )}

            {complaint.status === "Closed" ? (
              <div className="border-t border-slate-100 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500">
                This conversation is closed.
              </div>
            ) : (
              <form
                onSubmit={sendMessage}
                className="flex gap-2 border-t border-slate-100 p-4"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);

                    setMessageError("");
                  }}
                  placeholder="Write a message to the student..."
                  maxLength={2000}
                  disabled={isSending}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="Send message"
                >
                  {isSending ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            )}
          </article>
        </div>

        <aside className="space-y-5">
          {/* AI analysis */}
          <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-800">
              <Sparkles size={17} />
              AI case analysis
            </div>

            <div className="mt-5 space-y-4">
              <AnalysisItem
                label="Category"
                value={
                  complaint.aiAnalysis?.suggestedCategory || complaint.category
                }
              />

              <AnalysisItem
                label="Priority"
                value={
                  complaint.aiAnalysis?.suggestedPriority || complaint.priority
                }
              />

              <AnalysisItem
                label="Department"
                value={
                  complaint.aiAnalysis?.suggestedDepartment ||
                  complaint.department
                }
              />

              <AnalysisItem
                label="Confidence"
                value={`${complaint.aiAnalysis?.confidence || 0}%`}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Bot size={17} className="text-cyan-700" />
                Recommended action
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                {recommendedActions[complaint.category] ||
                  "Review the complaint and coordinate with the assigned department."}
              </p>
            </div>
          </article>

          {/* SLA */}
          <article
            className={`rounded-3xl border p-5 ${
              sla.overdue
                ? "border-red-100 bg-red-50"
                : "border-orange-100 bg-orange-50"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-sm font-bold ${
                sla.overdue ? "text-red-800" : "text-orange-800"
              }`}
            >
              <AlertTriangle size={18} />
              SLA status
            </div>

            <p
              className={`mt-4 text-2xl font-bold ${
                sla.overdue ? "text-red-900" : "text-orange-900"
              }`}
            >
              {sla.text}
            </p>

            <div
              className={`mt-4 h-2 overflow-hidden rounded-full ${
                sla.overdue ? "bg-red-100" : "bg-orange-100"
              }`}
            >
              <div
                className={`h-full rounded-full ${
                  ["Resolved", "Closed"].includes(complaint.status)
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
                sla.overdue ? "text-red-700" : "text-orange-700"
              }`}
            >
              {["Resolved", "Closed"].includes(complaint.status)
                ? "This complaint has been marked as resolved."
                : `Resolve or update the complaint before ${formatDateTime(
                    sla.deadline,
                  )}.`}
            </p>
          </article>

          {/* Activity */}
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Case activity</h2>

            <div className="mt-5">
              {complaint.timeline?.map((activity, index) => (
                <div
                  key={activity._id || `${activity.status}-${index}`}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={16} />
                    </span>

                    {index !== complaint.timeline.length - 1 && (
                      <span className="h-12 w-px bg-slate-200" />
                    )}
                  </div>

                  <div className="pb-5">
                    <p className="text-sm font-semibold text-slate-800">
                      {activity.status}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {activity.message}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatTime(activity.createdAt)}

                      {activity.updatedBy?.name
                        ? ` · ${activity.updatedBy.name}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}

              {!complaint.timeline?.length && (
                <p className="text-sm text-slate-500">No activity available.</p>
              )}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon size={18} className="text-emerald-700" />

      <p className="mt-3 text-xs text-slate-500">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function AnalysisItem({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-cyan-700">{label}</span>

      <span className="text-right font-bold text-cyan-950">
        {value || "Not available"}
      </span>
    </div>
  );
}

export default OfficerCaseDetails;
