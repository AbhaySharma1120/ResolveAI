import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CalendarDays,
  Check,
  Clock3,
  Download,
  FileImage,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  Network,
  Paperclip,
  RefreshCw,
  Send,
  Wifi,
} from "lucide-react";

import api from "../../services/api";

const progressNames = ["New", "Assigned", "In Progress", "Resolved"];

const statusPosition = {
  New: 0,
  Submitted: 0,
  Assigned: 1,
  "In Progress": 2,
  "Pending Student": 2,
  Resolved: 3,
  Closed: 3,
  Rejected: 0,
  Reopened: 1,
};

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("resolveaiUser");

    return storedUser ? JSON.parse(storedUser) : null;
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

  return initials || "ST";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
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

function formatDateTime(dateValue) {
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

function getPriorityStyle(priority) {
  const styles = {
    Urgent: "bg-red-50 text-red-700",
    Critical: "bg-red-50 text-red-700",
    High: "bg-orange-50 text-orange-700",
    Medium: "bg-yellow-50 text-yellow-700",
    Low: "bg-emerald-50 text-emerald-700",
  };

  return styles[priority] || styles.Medium;
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
    Rejected: "bg-red-50 text-red-700",
    Reopened: "bg-orange-50 text-orange-700",
  };

  return styles[status] || styles.New;
}

function ComplaintDetails() {
  const routeParams = useParams();

  const complaintId = routeParams.complaintId || routeParams.trackingId;

  const currentUser = getStoredUser();

  const [complaint, setComplaint] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

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

      const [complaintResponse, messagesResponse] = await Promise.all([
        api.get(`/complaints/${complaintId}`),

        api.get(`/complaints/${complaintId}/messages`),
      ]);

      setComplaint(complaintResponse.data.complaint);

      setMessages(messagesResponse.data.messages || []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to retrieve complaint details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

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

      setMessages((currentMessages) => [
        ...currentMessages,
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

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading complaint details...
          </p>
        </div>
      </section>
    );
  }

  if (errorMessage || !complaint) {
    return (
      <section className="mx-auto grid min-h-[calc(100vh-145px)] max-w-xl place-items-center">
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto text-red-600" size={40} />

          <h1 className="mt-5 text-xl font-bold text-red-900">
            Complaint unavailable
          </h1>

          <p className="mt-3 text-sm text-red-700">{errorMessage}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={fetchComplaint}
              className="flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800"
            >
              <RefreshCw size={17} />
              Try again
            </button>

            <Link
              to="/student/complaints"
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

  const location = [
    complaint.location?.campusArea,
    complaint.location?.specificArea,
  ]
    .filter(Boolean)
    .join(" · ");

  const assignedOfficerName =
    complaint.assignedOfficer?.name || "Not assigned yet";

  const currentStatusPosition = statusPosition[complaint.status] ?? 0;

  const duplicateComplaint = complaint.aiAnalysis?.duplicateComplaint;

  return (
    <section className="mx-auto max-w-[1500px]">
      {/* Back navigation */}
      <Link
        to="/student/complaints"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-emerald-700"
      >
        <ArrowLeft size={18} />
        Back to complaints
      </Link>

      {/* Complaint header */}
      <article className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400">
                #{complaint.trackingId}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                  complaint.priority,
                )}`}
              >
                {complaint.priority} priority
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                  complaint.status,
                )}`}
              >
                {complaint.status}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {complaint.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <Network size={16} />
                {complaint.category}
              </span>

              <span className="flex items-center gap-2">
                <MapPin size={16} />
                {location || "Campus location"}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays size={16} />
                {formatDate(complaint.createdAt)}
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={16} />
                {formatTime(complaint.createdAt)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 xl:w-72">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Assigned department
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-700 text-white">
                <Wifi size={21} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {complaint.department || "Not assigned"}
                </p>

                <p className="mt-1 truncate text-xs text-gray-500">
                  Officer: {assignedOfficerName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Main content */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Description */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-gray-900">Complaint description</h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {complaint.description}
            </p>
          </article>

          {/* AI classification */}
          <article className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white">
                <Bot size={21} />
              </div>

              <div>
                <h2 className="font-bold text-emerald-950">
                  ResolveAI classification
                </h2>

                <p className="mt-1 text-xs text-emerald-700">
                  Generated from the complaint description
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <ClassificationValue
                label="Category"
                value={
                  complaint.aiAnalysis?.suggestedCategory || complaint.category
                }
              />

              <ClassificationValue
                label="Priority"
                value={
                  complaint.aiAnalysis?.suggestedPriority || complaint.priority
                }
                valueClass="text-orange-700"
              />

              <ClassificationValue
                label="Confidence"
                value={`${complaint.aiAnalysis?.confidence || 0}%`}
                valueClass="text-emerald-700"
              />

              <ClassificationValue
                label="Department"
                value={
                  complaint.aiAnalysis?.suggestedDepartment ||
                  complaint.department
                }
                valueClass="text-blue-700"
              />
            </div>

            {duplicateComplaint && (
              <div className="mx-5 mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-bold text-yellow-900">
                  Possible related complaint
                </p>

                <p className="mt-2 text-xs text-yellow-800">
                  {duplicateComplaint.trackingId} · {duplicateComplaint.title}
                </p>
              </div>
            )}
          </article>

          {/* Resolution progress */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-gray-900">Resolution progress</h2>

            <div className="mt-7 overflow-x-auto pb-2">
              <div className="flex min-w-[560px] items-start">
                {progressNames.map((stepName, index) => {
                  const completed =
                    index <= currentStatusPosition &&
                    complaint.status !== "Rejected";

                  const timelineEvent = complaint.timeline?.find(
                    (event) => event.status === stepName,
                  );

                  return (
                    <div
                      key={stepName}
                      className="flex flex-1 items-start last:flex-none"
                    >
                      <div className="text-center">
                        <div
                          className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${
                            completed
                              ? "bg-emerald-600 text-white"
                              : "border-2 border-gray-200 bg-white text-gray-400"
                          }`}
                        >
                          {completed ? <Check size={17} /> : index + 1}
                        </div>

                        <p
                          className={`mt-3 text-xs font-bold ${
                            completed ? "text-gray-800" : "text-gray-400"
                          }`}
                        >
                          {stepName}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-400">
                          {timelineEvent
                            ? formatTime(timelineEvent.createdAt)
                            : "Pending"}
                        </p>
                      </div>

                      {index < progressNames.length - 1 && (
                        <div
                          className={`mt-4 h-0.5 flex-1 ${
                            index < currentStatusPosition
                              ? "bg-emerald-600"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          {/* Evidence */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">Evidence</h2>

                <p className="mt-1 text-xs text-gray-500">
                  Files attached to this complaint
                </p>
              </div>

              <span className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Paperclip size={16} />
                {complaint.evidence?.length || 0} files
              </span>
            </div>

            {complaint.evidence?.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {complaint.evidence.map((file, index) => (
                  <div
                    key={file.publicId || `${file.url}-${index}`}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 p-4"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                      <FileImage size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-800">
                        {file.originalName || `Evidence ${index + 1}`}
                      </p>

                      <p className="mt-1 text-xs capitalize text-gray-400">
                        {file.resourceType || "file"}
                      </p>
                    </div>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-emerald-700"
                      aria-label="Open evidence file"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                <FileImage className="mx-auto text-gray-400" size={28} />

                <p className="mt-3 text-sm font-semibold text-gray-600">
                  No evidence attached
                </p>
              </div>
            )}
          </article>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Activity timeline */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">Activity timeline</h2>

            <div className="mt-6">
              {complaint.timeline?.map((activity, index) => (
                <div
                  key={activity._id || `${activity.status}-${index}`}
                  className="relative flex gap-4 pb-7 last:pb-0"
                >
                  {index < complaint.timeline.length - 1 && (
                    <div className="absolute left-[7px] top-4 h-full w-px bg-gray-200" />
                  )}

                  <div className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-emerald-100 bg-emerald-600" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-gray-800">
                        {activity.status}
                      </p>

                      <span className="shrink-0 text-[10px] text-gray-400">
                        {formatTime(activity.createdAt)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {activity.message}
                    </p>

                    {activity.updatedBy?.name && (
                      <p className="mt-1 text-[10px] font-semibold text-gray-400">
                        By {activity.updatedBy.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {!complaint.timeline?.length && (
                <p className="text-sm text-gray-500">No activity available.</p>
              )}
            </div>
          </article>

          {/* Conversation */}
          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <MessageSquareText className="text-emerald-700" size={20} />

              <div>
                <h2 className="font-bold text-gray-900">
                  Department conversation
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  {complaint.department}
                </p>
              </div>
            </div>

            <div className="max-h-96 space-y-4 overflow-y-auto bg-gray-50 p-4">
              {messages.length === 0 && (
                <div className="py-8 text-center">
                  <MessageSquareText
                    className="mx-auto text-gray-300"
                    size={30}
                  />

                  <p className="mt-3 text-xs text-gray-500">
                    No messages yet. Start the conversation with the department.
                  </p>
                </div>
              )}

              {messages.map((item) => {
                const senderId =
                  item.sender?._id || item.sender?.id || item.sender;

                const currentUserId = currentUser?.id || currentUser?._id;

                const own = senderId?.toString() === currentUserId?.toString();

                const senderName =
                  item.sender?.name ||
                  (own ? currentUser?.name : "Complaint Officer");

                return (
                  <div
                    key={item._id}
                    className={`flex gap-2 ${
                      own ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        own
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                      title={senderName}
                    >
                      {getInitials(senderName)}
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                        own
                          ? "rounded-tr-sm bg-emerald-700 text-white"
                          : "rounded-tl-sm bg-white text-gray-700 shadow-sm"
                      }`}
                    >
                      {!own && (
                        <p className="mb-1 text-[10px] font-bold text-blue-700">
                          {senderName}
                        </p>
                      )}

                      <p className="whitespace-pre-wrap break-words text-xs leading-5">
                        {item.message}
                      </p>

                      <p
                        className={`mt-2 text-[9px] ${
                          own ? "text-emerald-100" : "text-gray-400"
                        }`}
                      >
                        {formatDateTime(item.createdAt)}
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
              <div className="border-t border-gray-100 bg-gray-50 p-4 text-center text-xs font-semibold text-gray-500">
                This conversation is closed.
              </div>
            ) : (
              <form
                onSubmit={sendMessage}
                className="flex gap-2 border-t border-gray-100 p-4"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);

                    setMessageError("");
                  }}
                  placeholder="Write a message..."
                  maxLength={2000}
                  disabled={isSending}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>
    </section>
  );
}

function ClassificationValue({ label, value, valueClass = "text-gray-900" }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className={`mt-2 break-words text-sm font-bold ${valueClass}`}>
        {value || "Not available"}
      </p>
    </div>
  );
}

export default ComplaintDetails;
