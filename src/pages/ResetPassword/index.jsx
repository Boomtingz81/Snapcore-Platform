// src/pages/ResetPassword.jsx

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const isValidPassword = (value) => value.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset link is invalid or expired.");
      return;
    }

    if (!isValidPassword(form.password)) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Simulated API request (replace with real call)
      await new Promise((res) => setTimeout(res, 1500));

      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password – SnapCore AI</title>
        <meta
          name="description"
          content="Set a new password for your SnapCore AI account using your secure reset link."
        />
        <link rel="canonical" href="https://snapcore.ai/reset-password" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800"
        >
          <div className="text-center mb-6">
            <ShieldCheck className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400 mb-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Set New Password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Enter a strong new password for your account.
            </p>
          </div>

          {success ? (
            <div className="text-green-600 text-sm text-center font-semibold">
              ✅ Your password has been reset successfully!
              <br />
              <Link
                to="/login"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                → Proceed to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1"
                >
                  <Lock className="w-4 h-4" /> New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1"
                >
                  <Lock className="w-4 h-4" /> Confirm Password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm font-medium -mt-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-semibold rounded-xl text-white transition transform ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-105"
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <Link
              to="/login"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              ← Back to Login
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}