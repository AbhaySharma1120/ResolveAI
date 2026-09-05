import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

const initialFormData = {
  email: "",
  otp: "",
  newPassword: "",
  confirmPassword: "",
};

function ForgotPassword() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [resetToken, setResetToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendSeconds]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "otp") {
      updatedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: updatedValue,
    }));

    setError("");
  };

  const requestOtp = async (email) => {
    return api.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    });
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await requestOtp(email);

      setFormData((currentData) => ({
        ...currentData,
        email,
        otp: "",
      }));

      setSuccessMessage(
        response.data?.message ||
          "A password reset OTP has been sent to your email.",
      );

      setResendSeconds(60);
      setCurrentStep(2);
    } catch (requestError) {
      console.error("Request password reset OTP error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to send the OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(formData.otp)) {
      setError("Enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post("/auth/verify-reset-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      const receivedResetToken = response.data?.resetToken;

      if (!receivedResetToken) {
        throw new Error("Password-reset token was not received.");
      }

      setResetToken(receivedResetToken);

      setSuccessMessage(response.data?.message || "OTP verified successfully.");

      setCurrentStep(3);
    } catch (requestError) {
      console.error("Verify password reset OTP error:", requestError);

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to verify the OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || resending || loading) {
      return;
    }

    try {
      setResending(true);
      setError("");
      setSuccessMessage("");

      const response = await requestOtp(formData.email);

      setFormData((currentData) => ({
        ...currentData,
        otp: "",
      }));

      setSuccessMessage(
        response.data?.message || "A new OTP has been sent to your email.",
      );

      setResendSeconds(60);
    } catch (requestError) {
      console.error("Resend password reset OTP error:", requestError);

      const retryAfter = requestError.response?.data?.retryAfter;

      if (Number.isFinite(Number(retryAfter))) {
        setResendSeconds(Number(retryAfter));
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to resend the OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      setError("Enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError(
        "Password must contain an uppercase letter, a lowercase letter and a number.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (!resetToken) {
      setError("Your verification has expired. Request a new OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post("/auth/reset-password", {
        email: formData.email,
        resetToken,
        newPassword,
        confirmPassword,
      });

      setSuccessMessage(
        response.data?.message || "Password reset successfully.",
      );

      setCurrentStep(4);
      setResetToken("");

      setFormData((currentData) => ({
        ...currentData,
        otp: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (requestError) {
      console.error("Reset password error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to reset the password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setCurrentStep(1);
    setResetToken("");
    setResendSeconds(0);
    setError("");
    setSuccessMessage("");

    setFormData((currentData) => ({
      ...currentData,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleReturnToOtp = () => {
    setCurrentStep(2);
    setResetToken("");
    setError("");
    setSuccessMessage("");

    setFormData((currentData) => ({
      ...currentData,
      newPassword: "",
      confirmPassword: "",
    }));
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-7 shadow-2xl shadow-emerald-900/10 sm:p-10">
        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-white">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Resolve
              <span className="text-emerald-700">AI</span>
            </h2>

            <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400">
              SMART CAMPUS
            </p>
          </div>
        </div>

        {currentStep <= 3 && <PasswordResetSteps currentStep={currentStep} />}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
            {error}
          </div>
        )}

        {successMessage && currentStep !== 4 && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
            {successMessage}
          </div>
        )}

        {currentStep === 1 && (
          <EmailStep
            email={formData.email}
            loading={loading}
            onChange={handleInputChange}
            onSubmit={handleEmailSubmit}
          />
        )}

        {currentStep === 2 && (
          <OtpStep
            email={formData.email}
            otp={formData.otp}
            loading={loading}
            resending={resending}
            resendSeconds={resendSeconds}
            onChange={handleInputChange}
            onSubmit={handleOtpSubmit}
            onResend={handleResendOtp}
            onChangeEmail={handleChangeEmail}
          />
        )}

        {currentStep === 3 && (
          <PasswordStep
            formData={formData}
            loading={loading}
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            onChange={handleInputChange}
            onSubmit={handlePasswordSubmit}
            onToggleNewPassword={() =>
              setShowNewPassword((currentValue) => !currentValue)
            }
            onToggleConfirmPassword={() =>
              setShowConfirmPassword((currentValue) => !currentValue)
            }
            onReturnToOtp={handleReturnToOtp}
          />
        )}

        {currentStep === 4 && (
          <SuccessStep
            message={successMessage}
            onLogin={() => navigate("/login")}
          />
        )}

        {currentStep !== 4 && (
          <Link
            to="/login"
            className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-emerald-700"
          >
            <ArrowLeft size={17} />
            Back to login
          </Link>
        )}
      </section>
    </main>
  );
}

function PasswordResetSteps({ currentStep }) {
  const steps = [
    {
      number: 1,
      label: "Email",
    },
    {
      number: 2,
      label: "OTP",
    },
    {
      number: 3,
      label: "Password",
    },
  ];

  return (
    <div className="mb-7">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const completed = step.number < currentStep;
          const active = step.number === currentStep;

          return (
            <div
              key={step.number}
              className="relative flex flex-1 flex-col items-center"
            >
              {index > 0 && (
                <span
                  className={`absolute right-1/2 top-4 h-0.5 w-full ${
                    completed || active ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                />
              )}

              <span
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                  completed || active
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {completed ? <CheckCircle2 size={17} /> : step.number}
              </span>

              <span
                className={`mt-2 text-[11px] font-semibold ${
                  completed || active ? "text-emerald-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmailStep({ email, loading, onChange, onSubmit }) {
  return (
    <>
      <div className="text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Mail size={29} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Forgot your password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Enter your registered email address. We will send a six-digit
          verification code to your inbox.
        </p>
      </div>

      <form className="mt-8" onSubmit={onSubmit}>
        <label
          htmlFor="forgot-password-email"
          className="block text-sm font-semibold text-gray-700"
        >
          Registered email
        </label>

        <div className="relative mt-2">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            id="forgot-password-email"
            name="email"
            type="email"
            value={email}
            onChange={onChange}
            placeholder="yourname@university.edu"
            autoComplete="email"
            disabled={loading}
            required
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              <Mail size={18} />
              Send verification code
            </>
          )}
        </button>
      </form>
    </>
  );
}

function OtpStep({
  email,
  otp,
  loading,
  resending,
  resendSeconds,
  onChange,
  onSubmit,
  onResend,
  onChangeEmail,
}) {
  return (
    <>
      <div className="text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <KeyRound size={29} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Verify your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Enter the six-digit OTP sent to
        </p>

        <p className="mt-1 break-all text-sm font-bold text-gray-800">
          {email}
        </p>
      </div>

      <form className="mt-8" onSubmit={onSubmit}>
        <label
          htmlFor="password-reset-otp"
          className="block text-center text-sm font-semibold text-gray-700"
        >
          Verification code
        </label>

        <input
          id="password-reset-otp"
          name="otp"
          type="text"
          value={otp}
          onChange={onChange}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          disabled={loading}
          maxLength={6}
          required
          autoFocus
          className="mt-3 h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-center text-2xl font-bold tracking-[0.45em] text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Verify OTP
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">Didn&apos;t receive the code?</p>

        <button
          type="button"
          onClick={onResend}
          disabled={resendSeconds > 0 || resending || loading}
          className="mt-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {resending
            ? "Sending another OTP..."
            : resendSeconds > 0
              ? `Resend OTP in ${resendSeconds}s`
              : "Resend OTP"}
        </button>

        <button
          type="button"
          onClick={onChangeEmail}
          disabled={loading || resending}
          className="mt-3 block w-full text-sm font-semibold text-gray-500 transition hover:text-emerald-700 disabled:cursor-not-allowed"
        >
          Change email address
        </button>
      </div>
    </>
  );
}

function PasswordStep({
  formData,
  loading,
  showNewPassword,
  showConfirmPassword,
  onChange,
  onSubmit,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onReturnToOtp,
}) {
  return (
    <>
      <div className="text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <LockKeyhole size={29} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Create new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Create a strong password for your ResolveAI account.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-semibold text-gray-700"
          >
            New password
          </label>

          <div className="relative mt-2">
            <LockKeyhole
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              id="new-password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={onChange}
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={loading}
              required
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />

            <button
              type="button"
              onClick={onToggleNewPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-700"
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-new-password"
            className="block text-sm font-semibold text-gray-700"
          >
            Confirm new password
          </label>

          <div className="relative mt-2">
            <LockKeyhole
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              id="confirm-new-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={onChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={loading}
              required
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />

            <button
              type="button"
              onClick={onToggleConfirmPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-700"
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-700">
            Your password must contain:
          </p>

          <ul className="mt-2 space-y-1 text-xs leading-5 text-gray-500">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Resetting password...
            </>
          ) : (
            <>
              <LockKeyhole size={18} />
              Reset password
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={onReturnToOtp}
        disabled={loading}
        className="mt-5 w-full text-center text-sm font-semibold text-gray-500 transition hover:text-emerald-700 disabled:cursor-not-allowed"
      >
        Return to OTP verification
      </button>
    </>
  );
}

function SuccessStep({ message, onLogin }) {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={42} />
      </div>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Password changed
      </h1>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        {message || "Your password has been reset successfully."}
      </p>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        You can now log in using your new password.
      </p>

      <button
        type="button"
        onClick={onLogin}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
      >
        Continue to login
      </button>
    </div>
  );
}

export default ForgotPassword;
