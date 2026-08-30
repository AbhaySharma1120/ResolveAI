import { useState } from "react";
import { Link } from "react-router-dom";

import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    setEmailSent(true);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-7 shadow-2xl shadow-emerald-900/10 sm:p-10">
        {/* Logo */}

        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-white">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Resolve<span className="text-emerald-700">AI</span>
            </h2>

            <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400">
              SMART CAMPUS
            </p>
          </div>
        </div>

        {!emailSent ? (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Forgot your password?
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your registered university email. We’ll send
                password-reset instructions to your inbox.
              </p>
            </div>

            <form className="mt-8" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-gray-700">
                University email
                <div className="relative mt-2">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  <input
                    type="email"
                    placeholder="yourname@university.edu"
                    required
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="mt-6 h-12 w-full rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                Send reset instructions
              </button>
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={40} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Check your email
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Password-reset instructions have been sent to your registered
              email address.
            </p>

            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Try another email
            </button>
          </div>
        )}

        <Link
          to="/login"
          className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Back to login
        </Link>
      </section>
    </main>
  );
}

export default ForgotPassword;
