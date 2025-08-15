import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    // TODO: Integrate Google Recaptcha v3 here (optional)
    // Example: loadRecaptcha().then(token => setRecaptchaToken(token));
  }, []);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Simulated secure API call (replace this with real backend call)
      const result = await new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 1200)
      );

      if (result.success) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password – SnapCore AI</title>
        <meta
          name="description"
          content="Request a secure password reset link for your SnapCore AI account."
        />
        <link rel="canonical" href="https://snapcore.ai/forgot-password" />
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
              Forgot Your Password?
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              We'll send you a reset link if the email is linked to an account.
            </p>
          </div>

          {submitted ? (
            <div className="text-green-600 text-sm text-center font-medium space-y-2">
              ✅ If an account exists for{" "}
              <span className="font-mono">{email}</span>, a reset link has been sent.
              <br />
              Please check your inbox and spam folder.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1"
                >
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="you@example.com"
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
                {loading ? "Sending..." : "Send Reset Link"}
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
