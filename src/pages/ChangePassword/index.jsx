// src/pages/ChangePassword.jsx

import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://api.snapcore.ai";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const passwordRegex = useMemo(() => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, []);
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    if (pwd.length < 6) return 1;
    if (pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd)) return 3;
    return 2;
  };
  const strengthLevel = getStrength(newPassword);

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return "All fields are required.";
    if (newPassword !== confirmPassword) return "New passwords do not match.";
    if (!passwordRegex.test(newPassword)) return "Must include 8+ chars, uppercase, lowercase, and a number.";
    if (currentPassword === newPassword) return "New password must differ from current.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      // Replace with real API call
      await new Promise((res) => setTimeout(res, 1500));
      // const response = await fetch(`${API_BASE}/auth/change-password`, { ... })

      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error("Password change failed:", err);
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ label, value, onChange, id, showKey }) => (
    <div>
      <label htmlFor={id} className="text-gray-700 dark:text-gray-300 mb-1 block">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show[showKey] ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          onClick={() => setShow((prev) => ({ ...prev, [showKey]: !prev[showKey] }))}
        >
          {show[showKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Change Password – SnapCore AI</title>
        <meta name="description" content="Securely update your SnapCore AI account password." />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800"
        >
          <div className="text-center mb-6">
            <Lock className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400 mb-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Change Password</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Keep your SnapCore account secure by updating your password.
            </p>
          </div>

          {success ? (
            <div className="text-green-600 text-center text-sm font-medium">
              <ShieldCheck className="mx-auto mb-2 h-6 w-6" />
              Password updated successfully. Redirecting…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                id="current-password"
                showKey="current"
              />

              <PasswordInput
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                id="new-password"
                showKey="new"
              />

              {/* Password Strength Meter */}
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden -mt-3">
                <div
                  className={`h-full transition-all duration-300 ${
                    strengthLevel === 1 ? "w-1/3 bg-red-500" :
                    strengthLevel === 2 ? "w-2/3 bg-yellow-500" :
                    strengthLevel === 3 ? "w-full bg-green-500" : "w-0"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                {strengthLevel === 1 && "Weak"}
                {strengthLevel === 2 && "Moderate"}
                {strengthLevel === 3 && "Strong"}
              </p>

              <PasswordInput
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                id="confirm-password"
                showKey="confirm"
              />

              {error && (
                <div className="text-red-600 text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> {error}
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
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </>
  );
}