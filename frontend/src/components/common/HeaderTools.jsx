import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Bell,
  CheckCheck,
  FilePlus2,
  LoaderCircle,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import api from "../../services/api";

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

function HeaderTools({ role }) {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchResults, setSearchResults] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);

  const [activePanel, setActivePanel] = useState(null);

  const [messages, setMessages] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [counts, setCounts] = useState({
    unreadMessages: 0,
    unreadNotifications: 0,
  });

  const [panelLoading, setPanelLoading] = useState(true);

  const [panelError, setPanelError] = useState("");

  const fetchHeaderData = useCallback(async () => {
    try {
      setPanelError("");

      const response = await api.get("/header");

      setMessages(response.data.messages || []);

      setNotifications(response.data.notifications || []);

      setCounts({
        unreadMessages: response.data.counts?.unreadMessages || 0,

        unreadNotifications: response.data.counts?.unreadNotifications || 0,
      });
    } catch (requestError) {
      console.error("Header data request failed:", requestError);

      setPanelError(
        requestError.response?.data?.message || "Unable to load recent updates",
      );
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    setPanelLoading(true);

    fetchHeaderData();

    /*
      Refresh unread counts every
      30 seconds.
    */
    const intervalId = window.setInterval(() => {
      fetchHeaderData();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchHeaderData, role]);

  useEffect(() => {
    const trimmedSearch = searchText.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    setSearchLoading(true);

    /*
      Wait briefly before sending a
      search request while the user types.
    */
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get("/header/search", {
          params: {
            q: trimmedSearch,
          },
        });

        setSearchResults(response.data.results || []);
      } catch (requestError) {
        console.error("Header search failed:", requestError);

        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchText, role]);

  const openPath = (path) => {
    if (!path) {
      return;
    }

    navigate(path);

    setSearchText("");
    setSearchResults([]);
    setSearchOpen(false);
    setActivePanel(null);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchResults.length > 0) {
      openPath(searchResults[0].path);
    }
  };

  const togglePanel = async (panelName) => {
    setSearchOpen(false);

    const shouldClose = activePanel === panelName;

    setActivePanel(shouldClose ? null : panelName);

    if (!shouldClose && panelName === "messages" && counts.unreadMessages > 0) {
      try {
        await api.patch("/header/messages/read-all");

        setMessages((currentMessages) =>
          currentMessages.map((messageItem) => ({
            ...messageItem,
            isRead: true,
          })),
        );

        setCounts((currentCounts) => ({
          ...currentCounts,
          unreadMessages: 0,
        }));
      } catch (requestError) {
        console.error("Unable to mark messages as read:", requestError);
      }
    }
  };

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.patch(`/header/notifications/${notification._id}/read`);

        setNotifications((currentNotifications) =>
          currentNotifications.map((currentNotification) =>
            currentNotification._id === notification._id
              ? {
                  ...currentNotification,
                  isRead: true,
                }
              : currentNotification,
          ),
        );

        setCounts((currentCounts) => ({
          ...currentCounts,

          unreadNotifications: Math.max(
            currentCounts.unreadNotifications - 1,
            0,
          ),
        }));
      } catch (requestError) {
        console.error("Unable to mark notification as read:", requestError);
      }
    }

    openPath(notification.path);
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch("/header/notifications/read-all");

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setCounts((currentCounts) => ({
        ...currentCounts,
        unreadNotifications: 0,
      }));
    } catch (requestError) {
      console.error("Unable to mark notifications as read:", requestError);
    }
  };

  const action = roleAction[role] || roleAction.student;

  const ActionIcon = action.icon;

  const displayedItems = activePanel === "messages" ? messages : notifications;

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
              setSearchResults([]);
              setSearchOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}

        {searchOpen && searchText.trim() && (
          <div className="absolute left-0 right-0 top-14 z-50 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            {searchLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
                <LoaderCircle size={18} className="animate-spin" />
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => openPath(result.path)}
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-none hover:bg-emerald-50"
                >
                  <span className="block text-sm font-semibold text-slate-800">
                    {result.title}
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    {result.subtitle}
                  </span>

                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    {result.type}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No results found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try another complaint ID, name or page.
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
          className={`relative grid h-11 w-11 place-items-center rounded-xl border transition ${
            activePanel === "messages"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          aria-label="Messages"
          title="Messages"
        >
          <MessageSquareText size={19} />

          {counts.unreadMessages > 0 && (
            <UnreadBadge count={counts.unreadMessages} />
          )}
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

          {counts.unreadNotifications > 0 && (
            <UnreadBadge count={counts.unreadNotifications} />
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
            items={displayedItems}
            loading={panelLoading}
            error={panelError}
            panelType={activePanel}
            unreadCount={
              activePanel === "messages"
                ? counts.unreadMessages
                : counts.unreadNotifications
            }
            onClose={() => setActivePanel(null)}
            onOpenMessage={(item) => openPath(item.path)}
            onOpenNotification={openNotification}
            onMarkAll={
              activePanel === "notifications" ? markAllNotificationsRead : null
            }
          />
        )}
      </div>
    </>
  );
}

function UnreadBadge({ count }) {
  return (
    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function HeaderPanel({
  title,
  items,
  loading,
  error,
  panelType,
  unreadCount,
  onClose,
  onOpenMessage,
  onOpenNotification,
  onMarkAll,
}) {
  return (
    <div className="fixed left-3 right-3 top-[76px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-96">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>

          <p className="mt-1 text-xs text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You are all caught up"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onMarkAll && unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAll}
              className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
              title="Mark all as read"
              aria-label="Mark all notifications as read"
            >
              <CheckCheck size={18} />
            </button>
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

      <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading updates...
          </div>
        ) : error ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-center">
            {panelType === "messages" ? (
              <MessageSquareText size={30} className="mx-auto text-slate-300" />
            ) : (
              <Bell size={30} className="mx-auto text-slate-300" />
            )}

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No recent {title.toLowerCase()}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              New updates will appear here.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const itemId = item._id || item.id;

            const isUnread = item.isRead === false;

            return (
              <button
                key={itemId}
                type="button"
                onClick={() => {
                  if (panelType === "notifications") {
                    onOpenNotification(item);
                  } else {
                    onOpenMessage(item);
                  }
                }}
                className={`block w-full px-4 py-4 text-left transition hover:bg-slate-50 ${
                  isUnread ? "bg-emerald-50/40" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      isUnread ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>

                    {item.complaintTitle && (
                      <p className="mt-1 truncate text-[11px] font-semibold text-emerald-700">
                        {item.complaintTitle}
                      </p>
                    )}

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {item.text}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference = Date.now() - date.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const minutes = Math.floor(difference / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default HeaderTools;
