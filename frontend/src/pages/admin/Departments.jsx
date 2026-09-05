import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";

const initialDepartment = {
  name: "",
  head: "",
  email: "",
  description: "",
  color: "blue",
};

const colorStyles = {
  cyan: "bg-cyan-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

function Departments() {
  const [departments, setDepartments] = useState([]);

  const [summary, setSummary] = useState({
    totalDepartments: 0,
    activeDepartments: 0,
    totalOfficers: 0,
    activeCases: 0,
    averageResolutionRate: 0,
  });

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [newDepartment, setNewDepartment] = useState(initialDepartment);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get("/departments");

      setDepartments(response.data.departments || []);

      setSummary(
        response.data.summary || {
          totalDepartments: 0,
          activeDepartments: 0,
          totalOfficers: 0,
          activeCases: 0,
          averageResolutionRate: 0,
        },
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to retrieve departments.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return departments;
    }

    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(searchText) ||
        department.head.toLowerCase().includes(searchText) ||
        department.email.toLowerCase().includes(searchText),
    );
  }, [departments, search]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNewDepartment((previousDepartment) => ({
      ...previousDepartment,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const addDepartment = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await api.post("/departments", newDepartment);

      setNewDepartment(initialDepartment);

      setShowAddModal(false);

      setSuccessMessage("Department created successfully.");

      await fetchDepartments();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to create department.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openManageModal = (department) => {
    setSelectedDepartment({
      ...department,

      slaHours: {
        critical: department.slaHours?.critical || 2,

        high: department.slaHours?.high || 6,

        medium: department.slaHours?.medium || 24,

        low: department.slaHours?.low || 48,
      },
    });

    setErrorMessage("");
  };

  const handleManageChange = (event) => {
    const { name, value } = event.target;

    setSelectedDepartment((currentDepartment) => ({
      ...currentDepartment,
      [name]: value,
    }));
  };

  const handleSlaChange = (event) => {
    const { name, value } = event.target;

    setSelectedDepartment((currentDepartment) => ({
      ...currentDepartment,

      slaHours: {
        ...currentDepartment.slaHours,

        [name]: Number.parseInt(value, 10) || 1,
      },
    }));
  };

  const updateDepartment = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await api.patch(`/departments/${selectedDepartment._id}`, {
        name: selectedDepartment.name,

        head: selectedDepartment.head,

        email: selectedDepartment.email,

        description: selectedDepartment.description,

        status: selectedDepartment.status,

        color: selectedDepartment.color,

        slaHours: selectedDepartment.slaHours,
      });

      setSelectedDepartment(null);

      setSuccessMessage("Department updated successfully.");

      await fetchDepartments();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to update department.",
      );
    } finally {
      setIsSaving(false);
    }
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
          onClick={() => {
            setNewDepartment(initialDepartment);

            setErrorMessage("");
            setShowAddModal(true);
          }}
          className="flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add department
        </button>
      </section>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && !showAddModal && !selectedDepartment && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-red-700">
            <AlertCircle size={20} />
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={fetchDepartments}
            aria-label="Retry"
            className="text-red-700"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Departments"
          value={summary.totalDepartments}
          icon={Building2}
          style="bg-cyan-50 text-cyan-700"
        />

        <SummaryCard
          title="Total Officers"
          value={summary.totalOfficers}
          icon={Users}
          style="bg-violet-50 text-violet-700"
        />

        <SummaryCard
          title="Active Cases"
          value={summary.activeCases}
          icon={Clock3}
          style="bg-orange-50 text-orange-700"
        />

        <SummaryCard
          title="Average Resolution"
          value={`${summary.averageResolutionRate}%`}
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
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search department or department head..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
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
              Loading departments...
            </p>
          </div>
        </section>
      )}

      {/* Department cards */}
      {!isLoading && (
        <section className="grid gap-4 lg:grid-cols-2">
          {filteredDepartments.map((department) => (
            <article
              key={department._id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white ${
                    colorStyles[department.color] || colorStyles.blue
                  }`}
                >
                  <Building2 size={22} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-bold text-slate-900">
                        {department.name}
                      </h2>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {department.email}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        department.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {department.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex min-h-20 items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-slate-600 shadow-sm">
                  <UserRound size={18} />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">Department head</p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                    {department.head}
                  </p>
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
                    className={`h-full rounded-full ${
                      colorStyles[department.color] || colorStyles.blue
                    }`}
                    style={{
                      width: `${department.resolutionRate}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => openManageModal(department)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Manage department
                </button>
              </div>
            </article>
          ))}

          {filteredDepartments.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center lg:col-span-2">
              <Building2 className="mx-auto text-slate-300" size={34} />

              <h2 className="mt-4 font-bold text-slate-800">
                No departments found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add a department or change your search.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Add modal */}
      {showAddModal && (
        <ModalContainer>
          <form
            onSubmit={addDepartment}
            className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <ModalHeading
              title="Add department"
              description="Create a new complaint-handling department."
              closeModal={() => {
                setShowAddModal(false);
                setErrorMessage("");
              }}
            />

            {errorMessage && <ModalError message={errorMessage} />}

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

              <InputField
                label="Description"
                name="description"
                value={newDepartment.description}
                onChange={handleInputChange}
                placeholder="Describe this department"
                required={false}
              />
            </div>

            <ModalActions
              isSaving={isSaving}
              cancel={() => {
                setShowAddModal(false);
                setErrorMessage("");
              }}
              submitText="Add department"
            />
          </form>
        </ModalContainer>
      )}

      {/* Manage modal */}
      {selectedDepartment && (
        <ModalContainer>
          <form
            onSubmit={updateDepartment}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <ModalHeading
              title="Manage department"
              description="Update department information and SLA targets."
              closeModal={() => {
                setSelectedDepartment(null);
                setErrorMessage("");
              }}
            />

            {errorMessage && <ModalError message={errorMessage} />}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InputField
                label="Department name"
                name="name"
                value={selectedDepartment.name}
                onChange={handleManageChange}
              />

              <InputField
                label="Department head"
                name="head"
                value={selectedDepartment.head}
                onChange={handleManageChange}
              />

              <InputField
                label="Official email"
                name="email"
                type="email"
                value={selectedDepartment.email}
                onChange={handleManageChange}
              />

              <SelectField
                label="Status"
                name="status"
                value={selectedDepartment.status}
                onChange={handleManageChange}
                options={["Active", "Inactive"]}
              />

              <SelectField
                label="Colour"
                name="color"
                value={selectedDepartment.color}
                onChange={handleManageChange}
                options={["cyan", "violet", "emerald", "amber", "red", "blue"]}
              />

              <InputField
                label="Description"
                name="description"
                value={selectedDepartment.description || ""}
                onChange={handleManageChange}
                required={false}
              />
            </div>

            <div className="mt-7">
              <h3 className="font-bold text-slate-900">SLA targets in hours</h3>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {["critical", "high", "medium", "low"].map((slaType) => (
                  <InputField
                    key={slaType}
                    label={slaType.charAt(0).toUpperCase() + slaType.slice(1)}
                    name={slaType}
                    type="number"
                    min={1}
                    value={selectedDepartment.slaHours[slaType]}
                    onChange={handleSlaChange}
                  />
                ))}
              </div>
            </div>

            <ModalActions
              isSaving={isSaving}
              cancel={() => {
                setSelectedDepartment(null);
                setErrorMessage("");
              }}
              submitText="Save changes"
            />
          </form>
        </ModalContainer>
      )}
    </div>
  );
}

function ModalContainer({ children }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

function ModalHeading({ title, description, closeModal }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={closeModal}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
        aria-label="Close modal"
      >
        <X size={20} />
      </button>
    </div>
  );
}

function ModalError({ message }) {
  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
      <AlertCircle size={18} />
      {message}
    </div>
  );
}

function ModalActions({ isSaving, cancel, submitText }) {
  return (
    <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={cancel}
        disabled={isSaving}
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? (
          <LoaderCircle className="animate-spin" size={17} />
        ) : (
          <Plus size={17} />
        )}

        {isSaving ? "Saving..." : submitText}
      </button>
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
  placeholder = "",
  type = "text",
  required = true,
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        required={required}
        type={type}
        min={min}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Departments;
