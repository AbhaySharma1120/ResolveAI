import { useState } from "react";
import {
  BookOpen,
  Bot,
  ChevronDown,
  CircleHelp,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";

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
      "ResolveAI analyzes the complaint text to recommend its category, priority, responsible department and expected resolution time.",
  },
  {
    question: "Can I edit a submitted complaint?",
    answer:
      "You can add more information or evidence while the complaint is open. Important fields cannot be changed after the responsible department starts reviewing it.",
  },
  {
    question: "What should I do if my complaint is delayed?",
    answer:
      "Open the complaint details and use the conversation section to request an update. You can also contact the campus support team.",
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
    title: "Using AI Copilot",
    description: "Get better results from the AI assistant.",
    color: "bg-violet-50 text-violet-700",
  },
];

function HelpSupport() {
  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState(0);

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Hero */}
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

      {/* Help topics */}
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

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* FAQ */}
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

                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-500">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <CircleHelp size={30} className="mx-auto text-slate-400" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No matching questions found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try a different search or contact support.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700">
              <MessageCircle size={21} />
            </span>

            <h2 className="mt-4 font-bold text-slate-900">
              Still need assistance?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Contact the campus grievance support team during university
              working hours.
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
