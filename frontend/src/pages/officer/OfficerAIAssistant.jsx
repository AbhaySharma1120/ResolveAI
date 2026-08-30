import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  FileSearch,
  ListChecks,
  Send,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";

const quickActions = [
  {
    title: "Summarize a case",
    description: "Create a short summary of complaint RA-1057.",
    prompt: "Summarize complaint RA-1057 for me.",
    icon: FileSearch,
  },
  {
    title: "Suggest a response",
    description: "Draft a professional response for the student.",
    prompt:
      "Draft a professional response for the student regarding the Wi-Fi complaint.",
    icon: WandSparkles,
  },
  {
    title: "Prioritize complaints",
    description: "Find which open complaints need attention first.",
    prompt: "Which complaints should I prioritize today?",
    icon: AlertTriangle,
  },
  {
    title: "Create action plan",
    description: "Generate resolution steps for an assigned case.",
    prompt: "Create an action plan to resolve complaint RA-1057.",
    icon: ListChecks,
  },
];

const aiResponses = {
  summary:
    "Complaint RA-1057 reports repeated Wi-Fi disconnections on the second floor of Block C. The issue affects multiple classrooms and interrupts access to online learning resources. AI recommends assigning it to IT Support with High priority.",

  response:
    "Suggested response: Thank you for reporting this issue. The IT Support team has been notified and is currently inspecting the network access point on the second floor of Block C. We will update you as soon as the investigation is completed.",

  priority:
    "Based on priority and SLA deadlines, review RA-1053 first because it is marked Urgent. Then handle RA-1057, which is High priority and due today at 4:00 PM.",

  action:
    "Recommended action plan: 1. Confirm the affected location and time. 2. Check the Block C access point. 3. Test network connectivity in nearby classrooms. 4. Restart or replace faulty equipment. 5. Confirm the resolution with the student.",
};

function OfficerAIAssistant() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello Rajesh! I can summarize complaints, recommend priorities, draft student responses and create resolution plans.",
    },
  ]);

  const generateResponse = (prompt) => {
    const lowercasePrompt = prompt.toLowerCase();

    if (lowercasePrompt.includes("summarize")) {
      return aiResponses.summary;
    }

    if (
      lowercasePrompt.includes("response") ||
      lowercasePrompt.includes("reply")
    ) {
      return aiResponses.response;
    }

    if (
      lowercasePrompt.includes("prioritize") ||
      lowercasePrompt.includes("priority")
    ) {
      return aiResponses.priority;
    }

    if (
      lowercasePrompt.includes("action plan") ||
      lowercasePrompt.includes("resolve")
    ) {
      return aiResponses.action;
    }

    return "I have analyzed your request. When the backend AI API is connected, I will generate a detailed answer using the latest complaint information.";
  };

  const sendMessage = (text = message) => {
    const cleanMessage = text.trim();

    if (!cleanMessage) return;

    const userMessage = {
      id: Date.now(),
      sender: "officer",
      text: cleanMessage,
    };

    const aiMessage = {
      id: Date.now() + 1,
      sender: "ai",
      text: generateResponse(cleanMessage),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      aiMessage,
    ]);

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-700">
          <Sparkles size={17} />
          AI-powered complaint assistance
        </div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Officer AI Assistant
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Analyze complaints, draft responses and create resolution plans
          faster.
        </p>
      </section>

      <section className="grid min-h-[650px] gap-5 xl:grid-cols-[1fr_340px]">
        {/* Chat */}
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:px-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-100 text-cyan-700">
              <Bot size={23} />
            </span>

            <div>
              <h2 className="font-bold text-slate-900">
                Complaint Intelligence Assistant
              </h2>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Ready to analyze cases
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
            {messages.map((chat) => {
              const isOfficer = chat.sender === "officer";

              return (
                <div
                  key={chat.id}
                  className={`flex gap-3 ${
                    isOfficer ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isOfficer && (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                      <Bot size={18} />
                    </span>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[72%] ${
                      isOfficer
                        ? "rounded-br-md bg-emerald-700 text-white"
                        : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {chat.text}
                  </div>

                  {isOfficer && (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-200 text-slate-600">
                      <UserRound size={18} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 bg-white p-3 sm:p-5"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows="1"
                placeholder="Ask about a complaint or request a response..."
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!message.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              Review AI suggestions before applying them to a complaint.
            </p>
          </form>
        </div>

        {/* Quick actions */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-800">
              <Bot size={18} />
              Quick actions
            </div>

            <p className="mt-2 text-sm leading-6 text-cyan-700">
              Select an action to test the complaint-assistance workflow.
            </p>
          </div>

          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => sendMessage(action.prompt)}
                className="group flex w-full items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:text-cyan-700">
                  <Icon size={19} />
                </span>

                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    {action.title}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {action.description}
                  </span>
                </span>
              </button>
            );
          })}

          <div className="rounded-3xl bg-slate-900 p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={18} className="text-cyan-400" />
              Human review required
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-300">
              AI provides recommendations only. The complaint officer remains
              responsible for final decisions and responses.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default OfficerAIAssistant;
