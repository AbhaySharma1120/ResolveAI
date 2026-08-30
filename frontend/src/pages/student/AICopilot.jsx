import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  FileSearch,
  Lightbulb,
  MessageSquareText,
  User,
} from "lucide-react";

const suggestions = [
  {
    icon: FileSearch,
    title: "Check complaint status",
    prompt: "What is the current status of complaint RA-1043?",
  },
  {
    icon: Lightbulb,
    title: "Improve my complaint",
    prompt: "Help me write a clear complaint about hostel Wi-Fi.",
  },
  {
    icon: MessageSquareText,
    title: "Summarize complaints",
    prompt: "Summarize my recently submitted complaints.",
  },
];

function AICopilot() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello Abhay! I’m ResolveAI Copilot. I can help you write complaints, understand their status, and find the correct campus department.",
    },
  ]);

  const sendMessage = (text = message) => {
    const cleanMessage = text.trim();

    if (!cleanMessage) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: cleanMessage,
    };

    const demoResponse = {
      id: Date.now() + 1,
      sender: "ai",
      text: "I have understood your request. AI-generated answers will be connected when we build the backend. For now, this is a demo response.",
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      demoResponse,
    ]);

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Page heading */}
      <section>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Sparkles size={17} />
          AI-powered campus assistance
        </div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          ResolveAI Copilot
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Get help writing complaints, checking progress and finding the right
          department for your issue.
        </p>
      </section>

      <section className="grid min-h-[650px] gap-5 xl:grid-cols-[1fr_320px]">
        {/* Chat section */}
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Bot size={23} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Campus Support Assistant
              </h2>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online and ready to help
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
            {messages.map((chat) => {
              const isUser = chat.sender === "user";

              return (
                <div
                  key={chat.id}
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[70%] ${
                      isUser
                        ? "rounded-br-md bg-emerald-700 text-white"
                        : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {chat.text}
                  </div>

                  {isUser && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-200 text-slate-600">
                      <User size={18} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 bg-white p-3 sm:p-5"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
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
                placeholder="Ask ResolveAI anything..."
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
              AI responses may contain mistakes. Verify important information.
            </p>
          </form>
        </div>

        {/* Suggestions */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Sparkles size={20} />
            </div>

            <h2 className="font-bold text-slate-900">How Copilot helps</h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              It analyzes your message and helps classify the issue, determine
              priority and select the responsible department.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Suggested questions</h2>

            <div className="mt-4 space-y-3">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;

                return (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => sendMessage(suggestion.prompt)}
                    className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:text-emerald-700">
                      <Icon size={17} />
                    </span>

                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        {suggestion.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {suggestion.prompt}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bot size={18} className="text-emerald-400" />
              Responsible AI
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-300">
              ResolveAI does not make the final administrative decision. Campus
              staff review every important recommendation.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default AICopilot;
