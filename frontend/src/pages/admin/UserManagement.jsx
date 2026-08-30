import { useMemo, useState } from "react";
import {
  CheckCircle2,
  GraduationCap,
  MoreVertical,
  Plus,
  Search,
  UserCog,
  Users,
  X,
} from "lucide-react";

const initialUsers = [
  {
    id: 1,
    name: "Abhay Sharma",
    email: "abhay.sharma@bbdu.ac.in",
    identifier: "BBDU/23/1234",
    role: "Student",
    department: "Computer Science",
    status: "Active",
    initials: "AS",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@bbdu.ac.in",
    identifier: "BBDU-OFC-102",
    role: "Officer",
    department: "Campus Maintenance",
    status: "Active",
    initials: "RK",
  },
  {
    id: 3,
    name: "Neha Singh",
    email: "neha.singh@bbdu.ac.in",
    identifier: "BBDU-OFC-114",
    role: "Officer",
    department: "Academic Office",
    status: "Active",
    initials: "NS",
  },
  {
    id: 4,
    name: "Aman Verma",
    email: "aman.verma@bbdu.ac.in",
    identifier: "BBDU/23/1567",
    role: "Student",
    department: "Information Technology",
    status: "Inactive",
    initials: "AV",
  },
  {
    id: 5,
    name: "Anil Kumar",
    email: "anil.kumar@bbdu.ac.in",
    identifier: "BBDU-ADM-101",
    role: "Admin",
    department: "University Administration",
    status: "Active",
    initials: "AK",
  },
];

const roleStyles = {
  Student: "bg-cyan-50 text-cyan-700",
  Officer: "bg-violet-50 text-violet-700",
  Admin: "bg-slate-100 text-slate-700",
};

function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    identifier: "",
    role: "Student",
    department: "",
  });

  const filteredUsers = useMemo(() => {
    const searchText = search.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.identifier.toLowerCase().includes(searchText);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const updateNewUser = (event) => {
    const { name, value } = event.target;

    setNewUser((previousUser) => ({
      ...previousUser,
      [name]: value,
    }));
  };

  const addUser = (event) => {
    event.preventDefault();

    const initials = newUser.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setUsers((previousUsers) => [
      ...previousUsers,
      {
        id: Date.now(),
        ...newUser,
        initials,
        status: "Active",
      },
    ]);

    setNewUser({
      name: "",
      email: "",
      identifier: "",
      role: "Student",
      department: "",
    });

    setShowModal(false);
  };

  const toggleUserStatus = (userId) => {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user,
      ),
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage students, complaint officers and administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add user
        </button>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Total Users"
          value={users.length}
          icon={Users}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="Students"
          value={users.filter((user) => user.role === "Student").length}
          icon={GraduationCap}
          style="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          title="Officers"
          value={users.filter((user) => user.role === "Officer").length}
          icon={UserCog}
          style="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Active Accounts"
          value={users.filter((user) => user.status === "Active").length}
          icon={CheckCircle2}
          style="bg-orange-50 text-orange-700"
        />
      </section>

      {/* Filters */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or ID..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All roles</option>
            <option>Student</option>
            <option>Officer</option>
            <option>Admin</option>
          </select>
        </div>
      </section>

      {/* Desktop table */}
      <section className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-4 py-4 font-semibold">Identifier</th>
                <th className="px-4 py-4 font-semibold">Role</th>
                <th className="px-4 py-4 font-semibold">Department</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 last:border-none hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                        {user.initials}
                      </span>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {user.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {user.identifier}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        roleStyles[user.role]
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {user.department}
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user.id)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        user.status === "Active"
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {user.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile cards */}
      <section className="grid gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <article
            key={user.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                {user.initials}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">{user.name}</p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {user.email}
                </p>
              </div>

              <button
                type="button"
                className="text-slate-400"
                aria-label="More actions"
              >
                <MoreVertical size={19} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Information label="ID" value={user.identifier} />
              <Information label="Department" value={user.department} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    roleStyles[user.role]
                  }`}
                >
                  {user.role}
                </span>

                <StatusBadge status={user.status} />
              </div>

              <button
                type="button"
                onClick={() => toggleUserStatus(user.id)}
                className="text-xs font-semibold text-emerald-700"
              >
                {user.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Add user modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={addUser}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add new user
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new ResolveAI account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <InputField
                label="Full name"
                name="name"
                value={newUser.name}
                onChange={updateNewUser}
                placeholder="Enter full name"
              />

              <InputField
                label="Email address"
                name="email"
                type="email"
                value={newUser.email}
                onChange={updateNewUser}
                placeholder="user@bbdu.ac.in"
              />

              <InputField
                label="University or employee ID"
                name="identifier"
                value={newUser.identifier}
                onChange={updateNewUser}
                placeholder="Enter user identifier"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={newUser.role}
                  onChange={updateNewUser}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option>Student</option>
                  <option>Officer</option>
                  <option>Admin</option>
                </select>
              </div>

              <InputField
                label="Department"
                name="department"
                value={newUser.department}
                onChange={updateNewUser}
                placeholder="Enter department"
              />
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Add user
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, style }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 sm:text-sm">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <span
          className={`hidden h-10 w-10 place-items-center rounded-xl sm:grid ${style}`}
        >
          <Icon size={19} />
        </span>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === "Active"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}

function Information({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        required
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

export default UserManagement;
