import { LoaderCircle, MessageCircle, Send, UserRound, X } from "lucide-react";

const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

const priorityOptions = ["Low", "Medium", "High"];

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

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

function SupportTicketModal({
  ticket,
  isAdmin,
  reply,
  replying,
  updating,
  onReplyChange,
  onReplySubmit,
  onAdminUpdate,
  onClose,
}) {
  if (!ticket) {
    return null;
  }

  const ticketIsClosed = ticket.status === "Closed";

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-700">
              {ticket.ticketId}
            </p>

            <h2 className="mt-1 break-words text-xl font-bold text-slate-900">
              {ticket.subject}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {ticket.category} · {formatDate(ticket.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            aria-label="Close support request"
          >
            <X size={19} />
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          {isAdmin && ticket.user && (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-slate-600 shadow-sm">
                <UserRound size={20} />
              </span>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">Submitted by</p>

                <p className="truncate font-bold text-slate-900">
                  {ticket.user.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {ticket.user.email} · {ticket.user.role}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                statusStyles[ticket.status] || statusStyles.Closed
              }`}
            >
              {ticket.status}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                priorityStyles[ticket.priority] || priorityStyles.Medium
              }`}
            >
              {ticket.priority} priority
            </span>
          </div>

          {isAdmin && (
            <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
              <SelectField
                label="Ticket status"
                value={ticket.status}
                options={statusOptions}
                disabled={updating}
                onChange={(event) =>
                  onAdminUpdate("status", event.target.value)
                }
              />

              <SelectField
                label="Ticket priority"
                value={ticket.priority}
                options={priorityOptions}
                disabled={updating}
                onChange={(event) =>
                  onAdminUpdate("priority", event.target.value)
                }
              />

              {updating && (
                <div className="flex items-center gap-2 text-xs text-slate-500 sm:col-span-2">
                  <LoaderCircle
                    size={15}
                    className="animate-spin text-emerald-700"
                  />
                  Updating support ticket...
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Original message
            </h3>

            <p className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {ticket.message}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-700" />

              <h3 className="text-sm font-bold text-slate-900">Conversation</h3>
            </div>

            <div className="mt-4 space-y-3">
              {ticket.replies?.length > 0 ? (
                ticket.replies.map((item) => {
                  const replyIsFromAdmin = item.senderRole === "admin";

                  return (
                    <article
                      key={item._id}
                      className={`rounded-2xl border p-4 ${
                        replyIsFromAdmin
                          ? "ml-4 border-emerald-100 bg-emerald-50 sm:ml-10"
                          : "mr-4 border-slate-200 bg-slate-50 sm:mr-10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-lg ${
                              replyIsFromAdmin
                                ? "bg-white text-emerald-700"
                                : "bg-white text-slate-600"
                            }`}
                          >
                            <UserRound size={15} />
                          </span>

                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {item.sender?.name ||
                                (replyIsFromAdmin
                                  ? "ResolveAI Support"
                                  : "User")}
                            </p>

                            <p className="text-[10px] capitalize text-slate-500">
                              {replyIsFromAdmin
                                ? "Support administrator"
                                : item.senderRole}
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {item.message}
                      </p>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-slate-50 p-7 text-center">
                  <MessageCircle size={27} className="mx-auto text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No replies yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    New messages will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {ticketIsClosed ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
              This support request is closed. New replies cannot be added.
            </div>
          ) : (
            <form onSubmit={onReplySubmit}>
              <label
                htmlFor="support-ticket-reply"
                className="block text-sm font-bold text-slate-900"
              >
                Add reply
              </label>

              <textarea
                id="support-ticket-reply"
                value={reply}
                onChange={onReplyChange}
                rows={4}
                minLength={2}
                maxLength={2000}
                placeholder={
                  isAdmin
                    ? "Write a response for the user..."
                    : "Write your message for the support team..."
                }
                disabled={replying}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={replying || reply.trim().length < 2}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {replying ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Send reply
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function SelectField({ label, value, options, disabled, onChange }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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

export default SupportTicketModal;
