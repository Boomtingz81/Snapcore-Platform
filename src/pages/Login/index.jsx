// ✅ src/pages/Login.jsx
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Fingerprint, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

// Small helpers
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const redirectTarget = () =>
  `${window.location.origin}/dashboard`;

const fieldBase =
  "w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none";

const tabBtn =
  "px-3 py-1.5 rounded-full text-sm border transition";
const tabBtnActive =
  "text-white bg-blue-600 border-blue-600";
const tabBtnIdle =
  "text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800";

export default function Login() {
  const [mode, setMode] = useState/** @type{"password"|"magic"|"otp"} */("password");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // On mount, hydrate remembered email
  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = localStorage.getItem("snapcoreRememberEmail");
    if (saved) {
      setForm((f) => ({ ...f, email: saved }));
      setRemember(true);
    }
  }, []);

  // Derived flags
  const emailValid = useMemo(() => emailRegex.test(form.email.trim()), [form.email]);
  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!emailValid) return false;
    if (mode === "password") return Boolean(form.password);
    if (mode === "otp") return otpCode.trim().length === 6;
    return true; // magic
  }, [loading, emailValid, mode, form.password, otpCode]);

  function setField(name, value) {
    setErr("");
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!canSubmit) return;

    setLoading(true);
    setErr("");

    // Remember email preference
    if (remember) localStorage.setItem("snapcoreRememberEmail", form.email.trim());
    else localStorage.removeItem("snapcoreRememberEmail");

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        navigate("/dashboard", { replace: true });
      } else if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email: form.email.trim(),
          options: { emailRedirectTo: redirectTarget() },
        });
        if (error) throw error;
        alert("📩 Magic link sent. Check your email.");
      } else if (mode === "otp") {
        const { error } = await supabase.auth.verifyOtp({
          email: form.email.trim(),
          token: otpCode.trim(),
          type: "email",
        });
        if (error) throw error;
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      setErr(
        e?.message ||
          "Login failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleBiometricLogin() {
    alert("🔐 WebAuthn / Passkey sign-in coming soon.");
  }

  // Renderers
  function PasswordRow() {
    if (mode !== "password") return null;
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
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            className={`${fieldBase} pr-10 border-gray-300 dark:border-gray-600`}
            placeholder="••••••••"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-2 text-right">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    );
  }

  function OtpRow() {
    if (mode !== "otp") return null;
    return (
      <div>
        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
          <KeyRound className="w-4 h-4" /> OTP Code
        </label>
        <input
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          placeholder="Enter 6-digit code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
          className={`${fieldBase} border-gray-300 dark:border-gray-600`}
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login – SnapCore AI</title>
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            SnapCore Login
          </h1>

          {/* Mode tabs */}
          <div className="flex items-center justify-center gap-2 my-5">
            {[
              { key: "password", label: "Password" },
              { key: "magic", label: "Magic Link" },
              { key: "otp", label: "OTP" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setMode(t.key)}
                className={`${tabBtn} ${mode === t.key ? tabBtnActive : tabBtnIdle}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
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
                autoComplete="username"
                onChange={(e) => setField("email", e.target.value)}
                className={`${fieldBase} border-gray-300 dark:border-gray-600`}
                placeholder="you@garage.com"
                aria-invalid={!emailValid}
              />
              {!emailValid && form.email.length > 0 && (
                <p className="mt-1 text-xs text-red-600">Enter a valid email.</p>
              )}
            </div>

            {/* Conditional rows */}
            <PasswordRow />
            <OtpRow />

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember email on this device
              </label>

              {mode === "magic" && (
                <span className="text-xs text-gray-500">
                  We’ll email you a one-time sign-in link
                </span>
              )}
            </div>

            {err && (
              <div className="text-red-600 text-sm" role="alert">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 font-semibold rounded-xl text-white transition ${
                canSubmit
                  ? "bg-blue-600 hover:bg-blue-700 hover:scale-[1.01]"
                  : "bg-gray-400 cursor-not-allowed"
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

          {/* Alt actions */}
          <div className="mt-6 flex flex-col gap-3 text-sm text-center">
            <button
              onClick={handleBiometricLogin}
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:scale-105 transition"
              type="button"
            >
              <Fingerprint className="w-4 h-4" />
              Biometric Login
            </button>

            <div className="mt-4 text-gray-600 dark:text-gray-300">
              New to SnapCore?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
