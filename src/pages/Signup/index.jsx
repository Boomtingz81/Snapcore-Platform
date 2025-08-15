// src/pages/Signup.jsx

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!form.email.includes("@") || form.password.length < 6) {
      setError("Enter a valid email and password (6+ characters).");
      setLoading(false);
      return;
    }

    // Simulated async auth
    setTimeout(() => {
      setLoading(false);
      alert("✅ Account created! SnapCore AI is now at your command.");
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Sign Up – SnapCore AI</title>
        <meta name="description" content="Create your SnapCore account to unlock AI diagnostics, SnapTech, and Pro tools." />
        <link rel="canonical" href="https://snapcore.ai/signup" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Join SnapCore
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            AI-powered tools for technicians, garages, and creators of tomorrow.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="John Technician"
              />
            </div>

            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="tech@garage.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                <Lock className="w-4 h-4" /> Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm font-medium -mt-2">{error}</div>
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}