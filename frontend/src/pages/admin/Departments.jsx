import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

const initialDepartments = [
  {
    id: 1,
    name: "IT Support",
    head: "Dr. Amit Verma",
    email: "itsupport@bbdu.ac.in",
    officers: 8,
    activeCases: 14,
    resolutionRate: 85,
    status: "Active",
    color: "bg-cyan-500",
  },
  {
    id: 2,
    name: "Campus Maintenance",
    head: "Rajesh Kumar",
    email: "maintenance@bbdu.ac.in",
    officers: 11,
    activeCases: 19,
    resolutionRate: 76,
    status: "Active",
    color: "bg-violet-500",
  },
  {
    id: 3,
    name: "Academic Office",
    head: "Dr. Neha Singh",
    email: "academic@bbdu.ac.in",
    officers: 6,
    activeCases: 8,
    resolutionRate: 89,
    status: "Active",
    color: "bg-emerald-500",
  },
  {
    id: 4,
    name: "Hostel Administration",
    head: "Vivek Mishra",
    email: "hostel@bbdu.ac.in",
    officers: 9,
    activeCases: 17,
    resolutionRate: 72,
    status: "Active",
    color: "bg-amber-500",
  },
  {
    id: 5,
    name: "Campus Security",
    head: "Sanjay Yadav",
    email: "security@bbdu.ac.in",
    officers: 12,
    activeCases: 5,
    resolutionRate: 91,
    status: "Active",
    color: "bg-red-500",
  },
];

function Departments() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    head: "",
    email: "",
  });

  const filteredDepartments = useMemo(() => {
    const searchText = search.toLowerCase();

    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(searchText) ||
        department.head.toLowerCase().includes(searchText),
    );
  }, [departments, search]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNewDepartment((previousDepartment) => ({
      ...previousDepartment,
      [name]: value,
    }));
  };

  const addDepartment = (event) => {
    event.preventDefault();

    if (
      !newDepartment.name.trim() ||
      !newDepartment.head.trim() ||
      !newDepartment.email.trim()
    ) {
      return;
    }

    const department = {
      id: Date.now(),
      name: newDepartment.name,
      head: newDepartment.head,
      email: newDepartment.email,
      officers: 0,
      activeCases: 0,
      resolutionRate: 0,
      status: "Active",
      color: "bg-blue-500",
    };

    setDepartments((previousDepartments) => [
      ...previousDepartments,
      department,
    ]);

    setNewDepartment({
      name: "",
      head: "",
      email: "",
    });

    setShowModal(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Heading */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Departments
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage complaint departments and monitor their workload.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add department
        </button>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Departments"
          value={departments.length}
          icon={Building2}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="Total Officers"
          value="46"
          icon={Users}
          style="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Active Cases"
          value="63"
          icon={Clock3}
          style="bg-orange-50 text-orange-700"
        />

        <SummaryCard
          title="Average Resolution"
          value="82.6%"
          icon={CheckCircle2}
          style="bg-emerald-50 text-emerald-700"
        />
      </section>

      {/* Search */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search department or department head..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      </section>

      {/* Department cards */}
      <section className="grid gap-4 lg:grid-cols-2">
        {filteredDepartments.map((department) => (
          <article
            key={department.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start gap-4">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white ${department.color}`}
              >
                <Building2 size={22} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      {department.name}
                    </h2>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {department.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {department.status}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-600">
                    <UserRound size={17} />
                  </span>

                  <div>
                    <p className="text-[11px] text-slate-400">
                      Department head
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {department.head}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Information label="Officers" value={department.officers} />

              <Information
                label="Active cases"
                value={department.activeCases}
              />

              <Information
                label="Resolution"
                value={`${department.resolutionRate}%`}
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">
                  Resolution performance
                </span>

                <span className="font-bold text-slate-800">
                  {department.resolutionRate}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${department.color}`}
                  style={{
                    width: `${department.resolutionRate}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Manage department
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Add department modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={addDepartment}
            className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add department
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new complaint-handling department.
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
                label="Department name"
                name="name"
                value={newDepartment.name}
                onChange={handleInputChange}
                placeholder="Example: Transport Department"
              />

              <InputField
                label="Department head"
                name="head"
                value={newDepartment.head}
                onChange={handleInputChange}
                placeholder="Enter department head name"
              />

              <InputField
                label="Official email"
                name="email"
                type="email"
                value={newDepartment.email}
                onChange={handleInputChange}
                placeholder="department@bbdu.ac.in"
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
                Add department
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

function Information({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{label}</p>
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

export default Departments;
