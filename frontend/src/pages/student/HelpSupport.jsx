import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileText,
  LoaderCircle,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Send,
  TicketCheck,
} from "lucide-react";

import SupportTicketModal from "../../components/support/SupportTicketModal";
import api from "../../services/api";

const faqs = [
  {
    question: "How do I submit a new complaint?",
    answer:
      "Open Report Issue from the sidebar, select a category, enter the complaint details, attach evidence if available, review the AI classification and submit it.",
  },
  {
    question: "How can I track my complaint?",
    answer:
      "Go to My Complaints and select View Details. You will see the complaint status, assigned department, activity timeline and resolution progress.",
  },
  {
    question: "How does AI classify complaints?",
    answer:
      "ResolveAI analyzes complaint text to recommend its category, priority and responsible department.",
  },
  {
    question: "Can I edit a submitted complaint?",
    answer:
      "Important complaint fields cannot be changed after the responsible department starts reviewing it. Contact support if corrections are required.",
  },
  {
    question: "What should I do if my complaint is delayed?",
    answer:
      "Open the complaint details and request an update. You can also submit a support request from this page.",
  },
];

const helpTopics = [
  {
    icon: FileText,
    title: "Submitting complaints",
    description: "Learn how to report an issue correctly.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: BookOpen,
    title: "Tracking and updates",
    description: "Understand complaint statuses and progress.",
    color: "bg-cyan-50 text-cyan-700",
  },
  {
    icon: Bot,
    title: "Using AI Assistant",
    description: "Get better results from ResolveAI AI tools.",
    color: "bg-violet-50 text-violet-700",
  },
];

const categories = [
  "Account",
  "Complaint",
  "Technical",
  "AI Assistant",
  "Notification",
  "Other",
];

const priorities = ["Low", "Medium", "High"];

const initialForm = {
  category: "Technical",
  priority: "Medium",
  subject: "",
  message: "",
};

const statusStyles = {
  Open: "bg-amber-50 text-amber-700",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
};

const priorityStyles = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("resolveaiUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

function HelpSupport() {
  const currentUser = getStoredUser();
  const isAdmin = currentUser?.role === "admin";

  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState(0);

  const [form, setForm] = useState(initialForm);

  const [tickets, setTickets] = useState([]);

  const [statistics, setStatistics] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [openingTicket, setOpeningTicket] = useState("");

  const [replying, setReplying] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return faqs;
    }

    return faqs.filter((faq) => {
      return (
        faq.question.toLowerCase().includes(normalizedSearch) ||
        faq.answer.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search]);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint = isAdmin ? "/support/admin" : "/support/my";

      const response = await api.get(endpoint);

      setTickets(response.data?.tickets || []);

      setStatistics(
        response.data?.statistics || {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        },
      );
    } catch (requestError) {
      console.error("Load support requests error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load support requests.",
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    if (!form.subject.trim() || !form.message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await api.post("/support", {
        category: form.category,
        priority: form.priority,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSuccess(
        response.data?.message || "Support request submitted successfully.",
      );

      setForm(initialForm);

      await loadTickets();
    } catch (requestError) {
      console.error("Create support request error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to submit the support request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTicket = async (ticketId) => {
    try {
      setOpeningTicket(ticketId);
      setError("");
      setSuccess("");

      const response = await api.get(`/support/${ticketId}`);

      setSelectedTicket(response.data.ticket);
      setReply("");
    } catch (requestError) {
      console.error("Open support request error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to open the support request.",
      );
    } finally {
      setOpeningTicket("");
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!selectedTicket || reply.trim().length < 2) {
      return;
    }

    try {
      setReplying(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/support/${selectedTicket.ticketId}/replies`,
        {
          message: reply.trim(),
        },
      );

      setSelectedTicket(response.data.ticket);
      setReply("");

      setSuccess(response.data?.message || "Reply added successfully.");

      await loadTickets();
    } catch (requestError) {
      console.error("Add support reply error:", requestError);

      setError(
        requestError.response?.data?.message || "Unable to add your reply.",
      );
    } finally {
      setReplying(false);
    }
  };

  const handleAdminUpdate = async (field, value) => {
    if (!isAdmin || !selectedTicket) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/support/admin/${selectedTicket.ticketId}`,
        {
          [field]: value,
        },
      );

      setSelectedTicket(response.data.ticket);

      setSuccess(
        response.data?.message || "Support ticket updated successfully.",
      );

      await loadTickets();
    } catch (requestError) {
      console.error("Update support ticket error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update the support ticket.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
    setReply("");
  };

  const resolvedCount = (statistics.resolved || 0) + (statistics.closed || 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-900 px-5 py-9 text-white sm:px-10">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CircleHelp size={18} />
            ResolveAI Support
          </div>

          <h1 className="text-2xl font-bold sm:text-4xl">
            How can we help you?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Search the help centre or contact the campus support team.
          </p>

          <div className="relative mt-6">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search help topics..."
              className="w-full rounded-2xl border border-white/10 bg-white px-12 py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-500/30"
            />
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          <CheckCircle2 size={19} />
          {success}
        </div>
      )}

      <section>
        <h2 className="text-lg font-bold text-slate-900">Browse help topics</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;

            return (
              <article
                key={topic.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${topic.color}`}
                >
                  <Icon size={21} />
                </span>

                <h3 className="mt-4 font-bold text-slate-900">{topic.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {topic.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className={`grid gap-5 ${isAdmin ? "" : "xl:grid-cols-[0.9fr_1.1fr]"}`}
      >
        {!isAdmin && (
          <form
            onSubmit={handleCreateTicket}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <MessageCircle size={21} />
              </span>

              <div>
                <h2 className="font-bold text-slate-900">
                  Create support request
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tell us what assistance you need.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Category"
                name="category"
                value={form.category}
                options={categories}
                onChange={handleFormChange}
                disabled={submitting}
              />

              <SelectField
                label="Priority"
                name="priority"
                value={form.priority}
                options={priorities}
                onChange={handleFormChange}
                disabled={submitting}
              />
            </div>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Subject
              <input
                name="subject"
                value={form.subject}
                onChange={handleFormChange}
                placeholder="Briefly describe the problem"
                minLength={5}
                maxLength={120}
                required
                disabled={submitting}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </label>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Message
              <textarea
                name="message"
                value={form.message}
                onChange={handleFormChange}
                placeholder="Explain the problem clearly..."
                rows={5}
                minLength={10}
                maxLength={2000}
                required
                disabled={submitting}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit support request
                </>
              )}
            </button>
          </form>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isAdmin ? "Support request queue" : "My support requests"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isAdmin
                  ? "Open a request to reply or update it."
                  : "Open a request to view or send replies."}
              </p>
            </div>

            <button
              type="button"
              onClick={loadTickets}
              disabled={loading}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              aria-label="Refresh support requests"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox label="Total" value={statistics.total || 0} />

            <StatBox label="Open" value={statistics.open || 0} />

            <StatBox label="In progress" value={statistics.inProgress || 0} />

            <StatBox label="Resolved" value={resolvedCount} />
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="py-12 text-center">
                <LoaderCircle
                  size={28}
                  className="mx-auto animate-spin text-emerald-700"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading support requests...
                </p>
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => {
                const isOpening = openingTicket === ticket.ticketId;

                return (
                  <button
                    key={ticket._id}
                    type="button"
                    onClick={() => handleOpenTicket(ticket.ticketId)}
                    disabled={Boolean(openingTicket)}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 disabled:cursor-wait disabled:opacity-70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                          {ticket.ticketId}

                          {isOpening && (
                            <LoaderCircle size={13} className="animate-spin" />
                          )}
                        </p>

                        <h3 className="mt-1 truncate font-bold text-slate-900">
                          {ticket.subject}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {ticket.category}

                          {isAdmin && ticket.user?.name
                            ? ` · ${ticket.user.name}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[ticket.status] || statusStyles.Closed
                          }`}
                        >
                          {ticket.status}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            priorityStyles[ticket.priority] ||
                            priorityStyles.Medium
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-400">
                        {formatDate(ticket.createdAt)}
                      </p>

                      <p className="text-xs font-semibold text-emerald-700">
                        {ticket.replies?.length || 0} replies · Open
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl bg-slate-50 py-12 text-center">
                <TicketCheck size={32} className="mx-auto text-slate-300" />

                <p className="mt-3 font-semibold text-slate-700">
                  No support requests found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {isAdmin
                    ? "New requests will appear here."
                    : "Submit a request when you need assistance."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Frequently asked questions
          </h2>

          <div className="mt-5 space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openQuestion === index;

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left"
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-500">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <CircleHelp size={30} className="mx-auto text-slate-400" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No matching questions found
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <MessageCircle size={22} className="text-emerald-700" />

            <h2 className="mt-4 font-bold text-slate-900">
              Still need assistance?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Submit a support request and track the conversation on this page.
            </p>
          </div>

          <ContactCard
            icon={Mail}
            title="Email support"
            value="support@resolveai.edu"
          />

          <ContactCard
            icon={Phone}
            title="Campus helpline"
            value="+91 522 123 4567"
          />

          <div className="rounded-3xl bg-emerald-700 p-5 text-white">
            <p className="text-sm font-semibold">Support hours</p>

            <p className="mt-3 text-sm text-emerald-100">Monday–Friday</p>

            <p className="mt-1 text-lg font-bold">9:00 AM–5:00 PM</p>
          </div>
        </aside>
      </section>

      <SupportTicketModal
        ticket={selectedTicket}
        isAdmin={isAdmin}
        reply={reply}
        replying={replying}
        updating={updating}
        onReplyChange={(event) => setReply(event.target.value)}
        onReplySubmit={handleReplySubmit}
        onAdminUpdate={handleAdminUpdate}
        onClose={handleCloseTicket}
      />
    </div>
  );
}

function SelectField({ label, name, value, options, onChange, disabled }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ContactCard({ icon: Icon, title, value }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon size={20} />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{title}</p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default HelpSupport;
