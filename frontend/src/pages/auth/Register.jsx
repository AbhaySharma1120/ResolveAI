import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  IdCard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import api from "../../services/api";

const initialFormData = {
  name: "",
  universityId: "",
  email: "",
  department: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        universityId: formData.universityId.trim(),
        email: formData.email.trim(),
        department: formData.department,
        password: formData.password,
      });

      localStorage.setItem("resolveaiToken", response.data.token);

      localStorage.setItem("resolveaiUser", JSON.stringify(response.data.user));

      navigate("/student/dashboard", {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f7faf8] lg:grid-cols-[0.9fr_1.1fr]">
      {/* Registration form section */}
      <section className="grid place-items-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-700 text-white">
              <ShieldCheck size={25} />
            </div>

            <h2 className="text-xl font-extrabold text-gray-900">
              Resolve
              <span className="text-emerald-700">AI</span>
            </h2>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Student registration
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Register using your university details to report and track campus
              complaints.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full name and university ID */}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full name
                <div className="relative mt-2">
                  <UserRound
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Abhay Sharma"
                    autoComplete="name"
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                University ID
                <div className="relative mt-2">
                  <IdCard
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    type="text"
                    name="universityId"
                    value={formData.universityId}
                    onChange={handleChange}
                    placeholder="University roll number"
                    autoComplete="off"
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>
              </label>
            </div>

            {/* University email */}
            <label className="mt-5 block text-sm font-semibold text-gray-700">
              University email
              <div className="relative mt-2">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@university.edu"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </label>

            {/* Department */}
            <label className="mt-5 block text-sm font-semibold text-gray-700">
              Department
              <div className="relative mt-2">
                <GraduationCap
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white px-11 text-sm text-gray-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    Select your department
                  </option>

                  <option value="Computer Science and Engineering">
                    Computer Science and Engineering
                  </option>

                  <option value="Electronics and Communication">
                    Electronics and Communication
                  </option>

                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>

                  <option value="Civil Engineering">Civil Engineering</option>

                  <option value="School of Management">
                    School of Management
                  </option>
                </select>
              </div>
            </label>

            {/* Password fields */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
                <div className="relative mt-2">
                  <LockKeyhole
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 disabled:cursor-not-allowed"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Confirm password
                <div className="relative mt-2">
                  <LockKeyhole
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    disabled={isSubmitting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 disabled:cursor-not-allowed"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>
            </div>

            {/* Terms */}
            <label className="my-6 flex cursor-pointer items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                required
                disabled={isSubmitting}
                className="mt-1 h-4 w-4 accent-emerald-700 disabled:cursor-not-allowed"
              />

              <span>
                I agree to the{" "}
                <button
                  type="button"
                  className="font-semibold text-emerald-700"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="font-semibold text-emerald-700"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Right information section */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-white">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Resolve
              <span className="text-emerald-700">AI</span>
            </h2>

            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500">
              SMART CAMPUS
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-lg">
          <div className="mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-emerald-100 text-emerald-700">
            <BookOpenCheck size={48} />
          </div>

          <h2 className="text-4xl font-extrabold leading-tight text-gray-900">
            Join a smarter campus support system.
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-600">
            Your account gives you one place to report problems, follow progress
            and confirm that each complaint has been resolved properly.
          </p>

          <div className="mt-8 space-y-5">
            <FeatureItem text="Submit complaints with photo evidence" />

            <FeatureItem text="Receive AI-assisted category and priority" />

            <FeatureItem text="Track department activity and resolution progress" />
          </div>
        </div>

        <div className="relative z-10 rounded-2xl border border-emerald-100 bg-white/70 p-5 backdrop-blur">
          <p className="text-sm font-semibold text-gray-800">
            Student registration only
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Department officer and administrator accounts are created and
            approved by the ResolveAI administrator.
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-4">
      <CheckCircle2 className="shrink-0 text-emerald-600" size={22} />

      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  );
}

export default Register;
