import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  FilePlus2,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const searchData = {
  student: [
    {
      title: "Wi-Fi disconnecting in Block C",
      subtitle: "Complaint RA-1057",
      path: "/student/complaints/RA-1057",
    },
    {
      title: "My Complaints",
      subtitle: "View submitted complaints",
      path: "/student/complaints",
    },
    {
      title: "Report a new issue",
      subtitle: "Submit a campus complaint",
      path: "/student/report",
    },
    {
      title: "AI Copilot",
      subtitle: "Get complaint assistance",
      path: "/student/ai-copilot",
    },
  ],

  officer: [
    {
      title: "Wi-Fi disconnecting in Block C",
      subtitle: "Case RA-1057",
      path: "/officer/cases/RA-1057",
    },
    {
      title: "Assigned Cases",
      subtitle: "View your current workload",
      path: "/officer/cases",
    },
    {
      title: "Triage Queue",
      subtitle: "Review new complaints",
      path: "/officer/triage",
    },
    {
      title: "AI Assistant",
      subtitle: "Analyze complaint cases",
      path: "/officer/ai-assistant",
    },
  ],

  admin: [
    {
      title: "Wi-Fi disconnecting in Block C",
      subtitle: "Complaint RA-1057",
      path: "/admin/complaints/RA-1057",
    },
    {
      title: "All Complaints",
      subtitle: "Monitor university complaints",
      path: "/admin/complaints",
    },
    {
      title: "User Management",
      subtitle: "Manage system accounts",
      path: "/admin/users",
    },
    {
      title: "Departments",
      subtitle: "Manage complaint departments",
      path: "/admin/departments",
    },
  ],
};

const panelData = {
  student: {
    messages: [
      {
        id: 1,
        title: "IT Support",
        text: "We are inspecting the Block C network.",
        time: "10 min ago",
        path: "/student/complaints/RA-1057",
      },
      {
        id: 2,
        title: "Campus Maintenance",
        text: "Your complaint has been assigned.",
        time: "1 hour ago",
        path: "/student/complaints/RA-1053",
      },
    ],
    notifications: [
      {
        id: 1,
        title: "Complaint updated",
        text: "RA-1057 is now In Progress.",
        time: "8 min ago",
        path: "/student/complaints/RA-1057",
      },
      {
        id: 2,
        title: "Resolution completed",
        text: "Your attendance complaint was resolved.",
        time: "Yesterday",
        path: "/student/complaints",
      },
    ],
  },

  officer: {
    messages: [
      {
        id: 1,
        title: "Aman Verma",
        text: "The Wi-Fi issue is still occurring.",
        time: "5 min ago",
        path: "/officer/cases/RA-1057",
      },
      {
        id: 2,
        title: "Priya Singh",
        text: "I have uploaded another image.",
        time: "25 min ago",
        path: "/officer/cases/RA-1058",
      },
    ],
    notifications: [
      {
        id: 1,
        title: "Urgent case assigned",
        text: "RA-1058 requires immediate review.",
        time: "4 min ago",
        path: "/officer/triage",
      },
      {
        id: 2,
        title: "SLA warning",
        text: "RA-1057 is due within four hours.",
        time: "20 min ago",
        path: "/officer/cases/RA-1057",
      },
    ],
  },

  admin: {
    messages: [
      {
        id: 1,
        title: "IT Support Department",
        text: "Additional officer access is required.",
        time: "15 min ago",
        path: "/admin/departments",
      },
      {
        id: 2,
        title: "Complaint Officer",
        text: "Please review complaint RA-1058.",
        time: "40 min ago",
        path: "/admin/complaints/RA-1058",
      },
    ],
    notifications: [
      {
        id: 1,
        title: "AI accuracy warning",
        text: "One classification requires review.",
        time: "6 min ago",
        path: "/admin/ai-monitoring",
      },
      {
        id: 2,
        title: "Urgent complaint",
        text: "RA-1058 has been escalated.",
        time: "12 min ago",
        path: "/admin/complaints/RA-1058",
      },
    ],
  },
};

function HeaderTools({ role }) {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [notificationsRead, setNotificationsRead] = useState(false);

  const filteredResults = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    if (!value) return [];

    return searchData[role].filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.subtitle.toLowerCase().includes(value),
    );
  }, [searchText, role]);

  const openPath = (path) => {
    navigate(path);
    setSearchText("");
    setSearchOpen(false);
    setActivePanel(null);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (filteredResults.length > 0) {
      openPath(filteredResults[0].path);
    }
  };

  const togglePanel = (panel) => {
    setSearchOpen(false);
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel));

    if (panel === "notifications") {
      setNotificationsRead(true);
    }
  };

  const roleAction = {
    student: {
      label: "Report issue",
      icon: FilePlus2,
      path: "/student/report",
      buttonStyle: "bg-emerald-700 hover:bg-emerald-800",
    },
    officer: {
      label: "Officer",
      icon: UserRound,
      path: "/officer/settings",
      buttonStyle: "bg-emerald-700 hover:bg-emerald-800",
    },
    admin: {
      label: "Administrator",
      icon: ShieldCheck,
      path: "/admin/settings",
      buttonStyle: "bg-slate-950 hover:bg-slate-800",
    },
  };

  const action = roleAction[role];
  const ActionIcon = action.icon;
  const messages = panelData[role].messages;
  const notifications = panelData[role].notifications;

  return (
    <>
      {/* Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative min-w-0 flex-1 sm:max-w-xl"
      >
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-4"
        />

        <input
          type="text"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setSearchOpen(true);
            setActivePanel(null);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder={
            role === "student"
              ? "Search complaints..."
              : role === "officer"
                ? "Search cases..."
                : "Search users or cases..."
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 sm:pl-11"
        />

        {searchText && (
          <button
            type="button"
            onClick={() => {
              setSearchText("");
              setSearchOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}

        {searchOpen && searchText.trim() && (
          <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <button
                  key={result.path}
                  type="button"
                  onClick={() => openPath(result.path)}
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-none hover:bg-emerald-50"
                >
                  <span className="block text-sm font-semibold text-slate-800">
                    {result.title}
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    {result.subtitle}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No results found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try another complaint ID or page name.
                </p>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Header actions */}
      <div className="relative ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => togglePanel("messages")}
          className={`grid h-11 w-11 place-items-center rounded-xl border transition ${
            activePanel === "messages"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          aria-label="Messages"
          title="Messages"
        >
          <MessageSquareText size={19} />
        </button>

        <button
          type="button"
          onClick={() => togglePanel("notifications")}
          className={`relative grid h-11 w-11 place-items-center rounded-xl border transition ${
            activePanel === "notifications"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />

          {!notificationsRead && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => openPath(action.path)}
          className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-white transition sm:px-4 ${action.buttonStyle}`}
          aria-label={action.label}
          title={action.label}
        >
          <ActionIcon size={18} />

          <span className="hidden md:inline">{action.label}</span>
        </button>

        {activePanel && (
          <HeaderPanel
            title={activePanel === "messages" ? "Messages" : "Notifications"}
            items={activePanel === "messages" ? messages : notifications}
            showReadAction={activePanel === "notifications"}
            onClose={() => setActivePanel(null)}
            onOpen={openPath}
          />
        )}
      </div>
    </>
  );
}

function HeaderPanel({ title, items, showReadAction, onClose, onOpen }) {
  return (
    <div className="fixed left-3 right-3 top-[76px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-96">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {items.length} recent updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showReadAction && (
            <span
              className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"
              title="Marked as read"
            >
              <CheckCheck size={18} />
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Close ${title}`}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.path)}
            className="block w-full px-4 py-4 text-left hover:bg-slate-50"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.text}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HeaderTools;
