import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  BarChart3,
  Bot,
  Building2,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import HeaderTools from "../components/common/HeaderTools";

const workspaceItems = [
  {
    title: "Operations",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "All Complaints",
    path: "/admin/complaints",
    icon: FileText,
  },
  {
    title: "Departments",
    path: "/admin/departments",
    icon: Building2,
  },
  {
    title: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    title: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "AI Monitoring",
    path: "/admin/ai-monitoring",
    icon: Bot,
  },
];

const generalItems = [
  {
    title: "Help & Support",
    path: "/admin/help",
    icon: CircleHelp,
  },
  {
    title: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

function AdminLayout() {
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
    <div className="min-h-screen bg-[#f6f8f7]">
      {/* Mobile overlay */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() => {
              navigate("/admin/dashboard");
              closeSidebar();
            }}
            className="flex items-center gap-3"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/30">
              <ShieldCheck size={23} />
            </span>

            <span className="text-left">
              <span className="block text-lg font-bold">ResolveAI</span>

              <span className="block text-xs font-medium text-emerald-400">
                Admin Control Centre
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={closeSidebar}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Administration
          </p>

          <nav className="mt-3 space-y-1">
            {workspaceItems.map((item) => (
              <NavigationLink
                key={item.path}
                item={item}
                closeSidebar={closeSidebar}
              />
            ))}
          </nav>

          <p className="mt-7 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
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

          {/* System status */}
          <div className="mt-7 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <Bot size={17} />
              ResolveAI System
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              AI classification, duplicate detection and routing are active.
            </p>

            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              System operational
            </div>
          </div>
        </div>

        {/* Admin profile */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 font-bold text-slate-950">
              AK
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">Anil Kumar</p>

              <p className="truncate text-xs text-slate-400">
                System Administrator
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
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

            <HeaderTools role="admin" />
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
            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/20"
            : "text-slate-400 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <Icon size={19} />
      {item.title}
    </NavLink>
  );
}

export default AdminLayout;
