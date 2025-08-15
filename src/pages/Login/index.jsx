// ✅ src/pages/Login.jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Fingerprint, KeyRound, Link as LinkIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // ✅ Make sure you have this file setup

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [mode, setMode] = useState("password");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedEmail = localStorage.getItem("snapcoreRememberEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRemember(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    if (remember) {
      localStorage.setItem("snapcoreRememberEmail", form.email);
    } else {
      localStorage.removeItem("snapcoreRememberEmail");
    }

    try {
      if (mode === "password") {
        if (!form.password) {
          setError("Password is required.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw error;

        navigate("/dashboard"); // redirect after login
      }

      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email: form.email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });

        if (error) throw error;
        alert("📩 Magic link sent to your email.");
      }

      if (mode === "otp") {
        if (!otpCode) {
          setError("Enter the 6-digit OTP sent to your email.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          email: form.email,
          token: otpCode,
          type: "email",
        });

        if (error) throw error;

        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    alert("🔐 WebAuthn login coming soon!");
  };

  const renderInputFields = () => {
    if (mode === "otp") {
      return (
        <div>
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
            <KeyRound className="w-4 h-4" /> OTP Code
          </label>
          <input
            type="text"
            name="otp"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
            placeholder="Enter 6-digit code"
          />
        </div>
      );
    }

    if (mode === "password") {
      return (
        <div>
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
            <Lock className="w-4 h-4" /> Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Helmet>
        <title>Login – SnapCore AI</title>
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            SnapCore Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="you@garage.com"
              />
            </div>

            {renderInputFields()}

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold rounded-xl text-white transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
              }`}
            >
              {loading
                ? "Processing..."
                : mode === "magic"
                ? "Send Magic Link"
                : mode === "otp"
                ? "Verify OTP"
                : "Log In"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-center">
            <span className="text-xs uppercase tracking-wide text-gray-400">or login with</span>
            <div className="flex justify-center gap-4">
              <button onClick={() => setMode("password")}>Password</button>
              <button onClick={() => setMode("magic")}>Magic Link</button>
              <button onClick={() => setMode("otp")}>OTP</button>
            </div>

            <button
              onClick={handleBiometricLogin}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:scale-105 transition"
            >
              <Fingerprint className="w-4 h-4" />
              Biometric Login
            </button>
          </div>
        </motion.div>
      </main>
    </>
  );
}
