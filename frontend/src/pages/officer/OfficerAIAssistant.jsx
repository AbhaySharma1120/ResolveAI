import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  AlertTriangle,
  Bot,
  FileSearch,
  ListChecks,
  LoaderCircle,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
} from "lucide-react";

import api from "../../services/api";

const quickActions = [
  {
    title: "Summarize a case",
    description: "Create a short summary of an assigned complaint.",
    prompt: "Summarize my most recently assigned complaint.",
    icon: FileSearch,
  },
  {
    title: "Suggest a response",
    description: "Draft a professional response for the student.",
    prompt:
      "Draft a professional response for the student regarding my most recently assigned complaint.",
    icon: WandSparkles,
  },
  {
    title: "Prioritize complaints",
    description: "Find which assigned complaints need attention first.",
    prompt: "Which of my assigned complaints should I prioritize today?",
    icon: AlertTriangle,
  },
  {
    title: "Create action plan",
    description: "Generate resolution steps for an assigned case.",
    prompt: "Create an action plan for my most recently assigned complaint.",
    icon: ListChecks,
  },
];

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("resolveaiUser");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

const createWelcomeMessage = (name) => ({
  id: "officer-welcome-message",
  sender: "ai",
  text: `Hello ${name}! I can summarize your assigned complaints, recommend priorities, draft student responses and create resolution plans.`,
  isWelcomeMessage: true,
});

const getAIReply = (responseData) => {
  return (
    responseData?.reply ||
    responseData?.response ||
    responseData?.answer ||
    responseData?.aiMessage ||
    responseData?.message ||
    ""
  );
};

function OfficerAIAssistant() {
  const storedUser = getStoredUser();
  const firstName = storedUser?.name?.split(" ")[0] || "Officer";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([createWelcomeMessage(firstName)]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoadingHistory(true);
        setError("");

        const response = await api.get("/ai/history");
        const savedMessages = response.data?.messages || [];

        if (savedMessages.length > 0) {
          const formattedMessages = savedMessages.map(
            (savedMessage, index) => ({
              id:
                savedMessage._id ||
                `officer-saved-${index}-${savedMessage.createdAt}`,
              sender: savedMessage.sender,
              text: savedMessage.text,
              createdAt: savedMessage.createdAt,
            }),
          );

          setMessages([createWelcomeMessage(firstName), ...formattedMessages]);
        } else {
          setMessages([createWelcomeMessage(firstName)]);
        }
      } catch (requestError) {
        console.error("Load Officer AI history error:", requestError);

        setError(
          requestError.response?.data?.message ||
            "Unable to load your previous conversation.",
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  const sendMessage = async (text = message) => {
    const cleanMessage = text.trim();

    if (!cleanMessage || sending || loadingHistory) {
      return;
    }

    const userMessage = {
      id: `officer-user-${Date.now()}`,
      sender: "user",
      text: cleanMessage,
    };

    const previousMessages = messages
      .filter((chatMessage) => !chatMessage.isWelcomeMessage)
      .slice(-8)
      .map((chatMessage) => ({
        sender: chatMessage.sender,
        text: chatMessage.text,
      }));

    setMessages((currentMessages) => [...currentMessages, userMessage]);

    setMessage("");
    setSending(true);
    setError("");

    try {
      const response = await api.post("/ai/chat", {
        message: cleanMessage,
        conversation: previousMessages,
      });

      const reply = getAIReply(response.data);

      if (!reply) {
        throw new Error("The AI assistant returned an empty response.");
      }

      const aiMessage = {
        id: `officer-ai-${Date.now()}`,
        sender: "ai",
        text: reply,
      };

      setMessages((currentMessages) => [...currentMessages, aiMessage]);

      try {
        await api.post("/ai/history", {
          userMessage: cleanMessage,
          aiMessage: reply,
        });
      } catch (saveError) {
        console.error("Save Officer AI history error:", saveError);

        setError(
          "The AI answered successfully, but this conversation could not be saved.",
        );
      }
    } catch (requestError) {
      console.error("Officer AI Assistant error:", requestError);

      setMessages((currentMessages) =>
        currentMessages.filter(
          (chatMessage) => chatMessage.id !== userMessage.id,
        ),
      );

      setMessage(cleanMessage);

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to receive an AI response. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleClearChat = async () => {
    const savedMessageCount = messages.filter(
      (chatMessage) => !chatMessage.isWelcomeMessage,
    ).length;

    if (savedMessageCount === 0 || clearing || sending || loadingHistory) {
      return;
    }

    const shouldClear = window.confirm(
      "Do you want to permanently clear your AI conversation?",
    );

    if (!shouldClear) {
      return;
    }

    try {
      setClearing(true);
      setError("");

      await api.delete("/ai/history");

      setMessages([createWelcomeMessage(firstName)]);
    } catch (requestError) {
      console.error("Clear Officer AI history error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to clear the conversation.",
      );
    } finally {
      setClearing(false);
    }
  };

  const savedMessageCount = messages.filter(
    (chatMessage) => !chatMessage.isWelcomeMessage,
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Sparkles size={17} />
          AI-powered case assistance
        </div>

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Officer AI Assistant
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Analyze assigned complaints, prepare responses and create clear
          resolution plans.
        </p>
      </section>

      <section className="grid min-h-[650px] gap-5 xl:grid-cols-[1fr_330px]">
        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Bot size={23} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate font-bold text-slate-900">
                  Case Resolution Assistant
                </h2>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Ready to analyze your assigned cases
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearChat}
              disabled={
                savedMessageCount === 0 || clearing || sending || loadingHistory
              }
              className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {clearing ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}

              <span className="hidden sm:inline">
                {clearing ? "Clearing..." : "Clear chat"}
              </span>
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
              {error}
            </div>
          )}

          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
            {loadingHistory ? (
              <div className="flex h-full min-h-72 items-center justify-center">
                <div className="text-center">
                  <LoaderCircle
                    size={30}
                    className="mx-auto animate-spin text-emerald-700"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading your conversation...
                  </p>
                </div>
              </div>
            ) : (
              messages.map((chat) => {
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                        isUser
                          ? "rounded-br-md bg-emerald-700 text-white"
                          : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{chat.text}</p>
                      ) : (
                        <MarkdownMessage text={chat.text} />
                      )}
                    </div>

                    {isUser && (
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-200 text-slate-600">
                        <UserRound size={18} />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex justify-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Bot size={18} />
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <LoaderCircle
                    size={17}
                    className="animate-spin text-emerald-700"
                  />
                  ResolveAI is analyzing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 bg-white p-3 sm:p-5"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !sending) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={sending || loadingHistory}
                rows="1"
                placeholder="Ask ResolveAI about your assigned cases..."
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={!message.trim() || sending || loadingHistory}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                {sending ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-slate-400">
              AI recommendations must be reviewed before taking action.
            </p>
          </form>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Sparkles size={20} />
            </div>

            <h2 className="font-bold text-slate-900">Officer assistance</h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              ResolveAI uses the complaints assigned to your account to provide
              relevant summaries, priorities and resolution suggestions.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Quick actions</h2>

            <div className="mt-4 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    disabled={sending || loadingHistory}
                    className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:text-emerald-700">
                      <Icon size={17} />
                    </span>

                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        {action.title}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {action.description}
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
              AI recommendations support Officer decisions. Review the complaint
              evidence and details before changing its status.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function MarkdownMessage({ text }) {
  return (
    <div className="break-words">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-2 mt-3 text-lg font-bold text-slate-900 first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-2 mt-3 text-base font-bold text-slate-900 first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 font-bold text-slate-900 first:mt-0">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="my-2 first:mt-0 last:mb-0">{children}</p>
          ),

          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
          ),

          li: ({ children }) => <li>{children}</li>,

          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">{children}</strong>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2 text-slate-600">
              {children}
            </blockquote>
          ),

          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-emerald-800">
              {children}
            </code>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default OfficerAIAssistant;
