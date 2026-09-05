import { useEffect, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  UserCog,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";

const initialUser = {
  name: "",
  email: "",
  password: "",
  identifier: "",
  role: "Officer",
  department: "",
};

const roleStyles = {
  student: "bg-cyan-50 text-cyan-700",
  officer: "bg-violet-50 text-violet-700",
  admin: "bg-slate-100 text-slate-700",
};

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "NA"
  );
}

function capitalize(value = "") {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [summary, setSummary] = useState({
    totalUsers: 0,
    students: 0,
    officers: 0,
    admins: 0,
    activeAccounts: 0,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    pageSize: 20,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);

  const [newUser, setNewUser] = useState(initialUser);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [updatingUserId, setUpdatingUserId] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get("/users", {
        params: {
          search: search.trim() || undefined,

          role: roleFilter === "All" ? undefined : roleFilter,

          page: currentPage,
          limit: 20,
        },
      });

      setUsers(response.data.users || []);

      setSummary(
        response.data.summary || {
          totalUsers: 0,
          students: 0,
          officers: 0,
          admins: 0,
          activeAccounts: 0,
        },
      );

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          pageSize: 20,
        },
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to retrieve users.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");

      setDepartments(
        (response.data.departments || []).filter(
          (department) => department.status === "Active",
        ),
      );
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const requestDelay = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => {
      clearTimeout(requestDelay);
    };
  }, [search, roleFilter, currentPage]);

  const updateNewUser = (event) => {
    const { name, value } = event.target;

    setNewUser((previousUser) => ({
      ...previousUser,
      [name]: value,

      /*
        Clear the old department whenever
        the selected role changes.
      */
      ...(name === "role" ? { department: "" } : {}),
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const addUser = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await api.post("/users", newUser);

      setNewUser(initialUser);
      setShowModal(false);
      setCurrentPage(1);

      setSuccessMessage("User account created successfully.");

      await fetchUsers();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to create user account.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    if (updatingUserId) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.patch(`/users/${userId}/status`);

      const updatedUser = response.data.user;

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: updatedUser.isActive,
              }
            : user,
        ),
      );

      setSummary((currentSummary) => ({
        ...currentSummary,

        activeAccounts:
          currentSummary.activeAccounts + (updatedUser.isActive ? 1 : -1),
      }));

      setSuccessMessage(response.data.message);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to update account status.",
      );
    } finally {
      setUpdatingUserId("");
    }
  };

  const openAddModal = () => {
    setNewUser(initialUser);
    setErrorMessage("");
    setShowModal(true);
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
            Manage Students, Complaint Officers and Administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add user
        </button>
      </section>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && !showModal && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-red-700">
            <AlertCircle size={20} />
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            className="text-red-700"
            aria-label="Retry"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Total Users"
          value={summary.totalUsers}
          icon={Users}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="Students"
          value={summary.students}
          icon={GraduationCap}
          style="bg-emerald-50 text-emerald-700"
        />

        <SummaryCard
          title="Officers"
          value={summary.officers}
          icon={UserCog}
          style="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Active Accounts"
          value={summary.activeAccounts}
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
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, email or ID..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);

              setCurrentPage(1);
            }}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="All">All roles</option>

            <option value="Student">Student</option>

            <option value="Officer">Officer</option>

            <option value="Admin">Admin</option>
          </select>
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <section className="grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <LoaderCircle
              className="mx-auto animate-spin text-emerald-700"
              size={38}
            />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading users...
            </p>
          </div>
        </section>
      )}

      {/* Desktop table */}
      {!isLoading && (
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
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-100 last:border-none hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                          {getInitials(user.name)}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {user.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {user.universityId || "Not assigned"}
                    </td>

                    <td className="px-4 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {user.department}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge isActive={user.isActive} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusButton
                        user={user}
                        isUpdating={updatingUserId === user._id}
                        disabled={Boolean(updatingUserId)}
                        onClick={() => toggleUserStatus(user._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && <EmptyState />}
        </section>
      )}

      {/* Mobile cards */}
      {!isLoading && (
        <section className="grid gap-4 md:hidden">
          {users.map((user) => (
            <article
              key={user._id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                  {getInitials(user.name)}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800">{user.name}</p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Information
                  label="ID"
                  value={user.universityId || "Not assigned"}
                />

                <Information label="Department" value={user.department} />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  <RoleBadge role={user.role} />

                  <StatusBadge isActive={user.isActive} />
                </div>

                <StatusButton
                  user={user}
                  isUpdating={updatingUserId === user._id}
                  disabled={Boolean(updatingUserId)}
                  onClick={() => toggleUserStatus(user._id)}
                />
              </div>
            </article>
          ))}

          {users.length === 0 && <EmptyState />}
        </section>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <section className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
          <p className="text-sm text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages} ·{" "}
            {pagination.totalUsers} users
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, pagination.totalPages),
                )
              }
              disabled={currentPage >= pagination.totalPages}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      )}

      {/* Add user modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={addUser}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add new user
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a secure ResolveAI account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setErrorMessage("");
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}

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
                label="Temporary password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={updateNewUser}
                placeholder="Minimum 6 characters"
                minLength={6}
              />

              <InputField
                label="University or employee ID"
                name="identifier"
                value={newUser.identifier}
                onChange={updateNewUser}
                placeholder="Enter user identifier"
              />

              <SelectField
                label="Role"
                name="role"
                value={newUser.role}
                onChange={updateNewUser}
                options={["Student", "Officer", "Admin"]}
              />

              {newUser.role === "Officer" ? (
                <SelectField
                  label="Department"
                  name="department"
                  value={newUser.department}
                  onChange={updateNewUser}
                  options={[
                    "",
                    ...departments.map((department) => department.name),
                  ]}
                  emptyLabel="Select department"
                />
              ) : (
                <InputField
                  label="Department"
                  name="department"
                  value={newUser.department}
                  onChange={updateNewUser}
                  placeholder={
                    newUser.role === "Student"
                      ? "Example: Computer Science and Engineering"
                      : "Example: University Administration"
                  }
                />
              )}
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setErrorMessage("");
                }}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {isSaving ? "Creating..." : "Add user"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        roleStyles[role] || roleStyles.student
      }`}
    >
      {capitalize(role)}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function StatusButton({ user, isUpdating, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        user.isActive
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {isUpdating ? "Updating..." : user.isActive ? "Deactivate" : "Activate"}
    </button>
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
  minLength,
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
        minLength={minLength}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, emptyLabel }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        required
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
      >
        {options.map((option) => (
          <option key={option || "empty"} value={option} disabled={!option}>
            {option || emptyLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <Search size={30} className="mx-auto text-slate-300" />

      <p className="mt-3 font-semibold text-slate-700">No users found</p>

      <p className="mt-1 text-sm text-slate-500">
        Change your filters or search text.
      </p>
    </div>
  );
}

export default UserManagement;
