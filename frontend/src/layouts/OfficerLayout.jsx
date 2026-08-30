import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  Bot,
  CircleHelp,
  ClipboardList,
  FileWarning,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

import HeaderTools from "../components/common/HeaderTools";

const navigationItems = [
  {
    title: "Overview",
    path: "/officer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Triage Queue",
    path: "/officer/triage",
    icon: ClipboardList,
  },
  {
    title: "Assigned Cases",
    path: "/officer/cases",
    icon: FileWarning,
  },
  {
    title: "AI Assistant",
    path: "/officer/ai-assistant",
    icon: Bot,
  },
];

const generalItems = [
  {
    title: "Help & Support",
    path: "/officer/help",
    icon: CircleHelp,
  },
  {
    title: "Settings",
    path: "/officer/settings",
    icon: Settings,
  },
];

function OfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("resolveaiToken");
    localStorage.removeItem("resolveaiUser");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      {/* Mobile overlay */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <button
            type="button"
            onClick={() => {
              navigate("/officer/dashboard");
              closeSidebar();
            }}
            className="flex items-center gap-3"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-700 text-white shadow-sm">
              <ShieldCheck size={23} />
            </span>

            <span className="text-left">
              <span className="block text-lg font-bold text-slate-900">
                ResolveAI
              </span>

              <span className="block text-xs font-medium text-emerald-700">
                Officer Portal
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={closeSidebar}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="mt-3 space-y-1">
            {navigationItems.map((item) => (
              <NavigationLink
                key={item.path}
                item={item}
                closeSidebar={closeSidebar}
              />
            ))}
          </nav>

          <p className="mt-7 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            General
          </p>

          <nav className="mt-3 space-y-1">
            {generalItems.map((item) => (
              <NavigationLink
                key={item.path}
                item={item}
                closeSidebar={closeSidebar}
              />
            ))}
          </nav>

          {/* AI status */}
          <div className="mt-7 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-800">
              <Bot size={17} />
              AI Triage Active
            </div>

            <p className="mt-2 text-xs leading-5 text-cyan-700">
              Complaint classification and priority detection are operational.
            </p>

            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-cyan-700">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              All systems operational
            </div>
          </div>
        </div>

        {/* Officer profile */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
              RK
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">
                Rajesh Kumar
              </p>

              <p className="truncate text-xs text-slate-500">
                Complaint Officer
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center gap-2 px-3 sm:gap-3 sm:px-6">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>

            <HeaderTools role="officer" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavigationLink({ item, closeSidebar }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={closeSidebar}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
          isActive
            ? "bg-emerald-700 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      <Icon size={19} />
      {item.title}
    </NavLink>
  );
}

export default OfficerLayout;
