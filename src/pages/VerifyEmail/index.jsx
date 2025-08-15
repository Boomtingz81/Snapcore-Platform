// src/pages/VerifyEmail.jsx

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { MailCheck, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error | expired | invalid
  const [message, setMessage] = useState("");

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://api.snapcore.ai"; // fallback for testing

  const isValidToken = (t) =>
    typeof t === "string" &&
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(t); // simple JWT check

  useEffect(() => {
    window.scrollTo(0, 0);
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    if (!isValidToken(token)) {
      setStatus("invalid");
      setMessage("Your verification link appears invalid or corrupted.");
      return;
    }

    try {
      // 🧪 TEMP: Local simulation logic — remove this block when live
      if (token.startsWith("expired")) {
        await new Promise((res) => setTimeout(res, 1000));
        setStatus("expired");
        setMessage("This verification link has expired. Please request a new one.");
        return;
      }
      if (token.startsWith("used")) {
        await new Promise((res) => setTimeout(res, 1000));
        setStatus("error");
        setMessage("This email has already been verified.");
        return;
      }

      // ✅ Real live API call (to be enabled when backend is connected)
      const response = await fetch(`${API_BASE}/auth/verify-email?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (result?.error === "expired") {
          setStatus("expired");
          setMessage("This link has expired. Please request a new verification email.");
        } else if (result?.error === "already_verified") {
          setStatus("error");
          setMessage("This email has already been verified.");
        } else {
          setStatus("error");
          setMessage(result?.message || "Verification failed. Please try again.");
        }

        // 🔍 Optional: Log to SnapPulse
        console.warn("📉 Email verification error:", result);
        return;
      }

      // ✅ Verified!
      setStatus("success");
      setMessage("✅ Your email has been verified successfully.");
    } catch (err) {
      console.error("🚨 Network or server error:", err);
      setStatus("error");
      setMessage("Unexpected error. Please try again later.");
    }
  };

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-10 w-10 mx-auto animate-spin text-blue-600 dark:text-blue-400 mb-4" />;
      case "success":
        return <ShieldCheck className="h-10 w-10 mx-auto text-green-600 dark:text-green-400 mb-4" />;
      case "expired":
      case "invalid":
      case "error":
        return <AlertTriangle className="h-10 w-10 mx-auto text-red-600 dark:text-red-400 mb-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Email Verification – SnapCore AI</title>
        <meta name="description" content="Verify your SnapCore AI account email securely." />
        <link rel="canonical" href="https://snapcore.ai/verify-email" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-center"
        >
          <div role="status" aria-live="polite">
            {renderIcon()}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {status === "success" && "Email Verified!"}
              {status === "loading" && "Verifying your email…"}
              {status === "expired" && "Link Expired"}
              {status === "invalid" && "Invalid Link"}
              {status === "error" && "Verification Failed"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">{message}</p>

            {(status === "error" || status === "expired" || status === "invalid") && (
              <Link
                to="/resend-verification"
                className="inline-block mt-4 px-4 py-2 font-medium rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white transition"
              >
                Resend Verification Link
              </Link>
            )}

            {status === "success" && (
              <Link
                to="/login"
                className="inline-block mt-4 px-5 py-2 font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                → Continue to Login
              </Link>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}