import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";

import api from "../../services/api";

const dashboardPaths = {
  student: "/student/dashboard",
  officer: "/officer/dashboard",
  admin: "/admin/dashboard",
};

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
        role,
      });

      const { token, user } = response.data;

      localStorage.setItem("resolveaiToken", token);

      localStorage.setItem("resolveaiUser", JSON.stringify(user));

      navigate(dashboardPaths[user.role], {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Please check your details and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f7faf8] lg:grid-cols-[1.1fr_0.9fr]">
      {/* Left visual section */}
      <section className="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#075c3b] to-[#0c8757] px-7 py-8 text-white sm:px-12 lg:min-h-screen lg:px-14 lg:py-10">
        {/* Decorative background circles */}
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-emerald-300/20 blur-2xl" />

        <div className="absolute -bottom-32 -right-28 h-96 w-96 rounded-full border-[55px] border-white/5" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-700 shadow-lg">
            <ShieldCheck size={28} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">
              Resolve
              <span className="text-emerald-200">AI</span>
            </h2>

            <p className="text-[10px] font-semibold tracking-[0.2em] text-emerald-100">
              SMART CAMPUS
            </p>
          </div>
        </div>

        {/* Main message */}
        <div className="relative z-10 my-12 max-w-xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-emerald-50 backdrop-blur">
            AI-powered campus support
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Report issues.
            <br />
            Get faster resolutions.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-emerald-50/90 sm:text-base">
            Submit campus complaints, receive intelligent priority
            recommendations and track every resolution transparently.
          </p>

          <div className="mt-8 hidden flex-wrap gap-6 sm:flex">
            <div className="flex items-center gap-3 text-sm text-emerald-50">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
                <Sparkles size={18} />
              </div>
              AI-assisted triage
            </div>

            <div className="flex items-center gap-3 text-sm text-emerald-50">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
                <Waypoints size={18} />
              </div>
              Smart department routing
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-emerald-100/70">
          © 2026 ResolveAI · Smart Complaint Management
        </p>
      </section>

      {/* Right login section */}
      <section className="grid place-items-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#17231d]">
              Sign in to ResolveAI
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              Access your campus complaint management portal.
            </p>
          </div>

          {/* Future university SSO button */}
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:border-emerald-600 hover:bg-emerald-50"
          >
            <ShieldCheck size={19} />
            Sign in with University SSO
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-xs text-gray-400">
              or continue with email
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Role selection */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700">
                Sign in as
              </label>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {["student", "officer", "admin"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRoleChange(item)}
                    disabled={isSubmitting}
                    className={`rounded-xl border px-3 py-3 text-xs font-semibold capitalize transition disabled:cursor-not-allowed sm:text-sm ${
                      role === item
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Email field */}
            <label className="block text-sm font-semibold text-gray-700">
              University email
              <div className="relative mt-2">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="yourname@university.edu"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
            </label>

            {/* Password field */}
            <label className="mt-5 block text-sm font-semibold text-gray-700">
              Password
              <div className="relative mt-2">
                <LockKeyhole
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((currentValue) => !currentValue)
                  }
                  disabled={isSubmitting}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-700 disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {/* Form options */}
            <div className="my-6 flex items-center justify-between gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                <input type="checkbox" className="h-4 w-4 accent-emerald-700" />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {role === "student" && (
            <p className="mt-7 text-center text-sm text-gray-500">
              New to ResolveAI?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Create an account
              </Link>
            </p>
          )}

          {/* Account information */}
          <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-bold text-emerald-800">
              Account information
            </p>

            <div className="mt-2 space-y-1 text-xs leading-5 text-emerald-700">
              {role === "student" && (
                <p>
                  Use the email and password you entered during student
                  registration.
                </p>
              )}

              {role === "officer" && (
                <p>
                  Use the Officer email and password configured by the
                  administrator.
                </p>
              )}

              {role === "admin" && (
                <p>
                  Use the Admin email and password configured during account
                  setup.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
