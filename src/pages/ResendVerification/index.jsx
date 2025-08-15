// src/pages/ResendVerification.jsx

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { MailCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [honeypot, setHoneypot] = useState("");

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://api.snapcore.ai";

  const t = (s) => s; // Future SnapGlobalTranslate hook

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);

    if (honeypot) return; // Bot detected, silently ignore

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again.`);
      return;
    }

    setLoading(true);
    setCooldown(30); // throttle for 30 seconds

    try {
      // 🚀 Replace with real API call once backend is ready
      await new Promise((res) => setTimeout(res, 1500));

      // const response = await fetch(`${API_BASE}/auth/resend-verification`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });

      // const data = await response.json();
      // if (!response.ok) throw new Error(data?.message || "Resend failed.");

      setSent(true);

      // 🔐 Optional: Trigger SnapPulse audit event here
    } catch (err) {
      console.error("🚨 Resend error:", err);
      setError(err.message || "Unexpected error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Resend Email Verification – SnapCore AI</title>
        <meta name="description" content="Resend your SnapCore verification link if you didn't receive it the first time." />
        <link rel="canonical" href="https://snapcore.ai/resend-verification" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          role="form"
          aria-live="polite"
          className="w-full max-w-md p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800"
        >
          <div className="text-center mb-6">
            <MailCheck className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400 mb-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("Resend Verification Link")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t("Didn't receive your verification email? We'll send it again.")}
            </p>
          </div>

          {sent ? (
            <div className="text-green-600 text-sm font-medium text-center">
              ✅ If <span className="font-mono">{email}</span> is registered, a new link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Honeypot Anti-Bot Field */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex="-1"
                autoComplete="off"
              />

              <div>
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("Email Address")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  aria-label="Email input for resend verification"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder={t("you@example.com")}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm font-medium -mt-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                aria-busy={loading}
                className={`w-full py-3 font-semibold rounded-xl text-white transition transform ${
                  loading || cooldown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-105"
                }`}
              >
                {loading ? (
                  <span className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("Sending...")}
                  </span>
                ) : cooldown > 0 ? (
                  t(`Wait ${cooldown}s`)
                ) : (
                  t("Send Verification Link")
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <Link
              to="/login"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              ← {t("Back to Login")}
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}