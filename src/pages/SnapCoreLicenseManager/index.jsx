// src/pages/SnapLicenseManager.jsx

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { BadgeCheck, ShieldCheck, Lock, XCircle } from "lucide-react";

const ALLOWED_TIERS = ["owner"];

export default function SnapCoreLicenseManager() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [email, setEmail] = useState("");
  const [licenses, setLicenses] = useState([]);
  const [feedback, setFeedback] = useState("");

  // Load stored licenses on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("snapcore-licenses") || "[]");
      if (Array.isArray(stored)) {
        setLicenses(stored);
      }
    } catch (err) {
      console.error("Failed to parse stored licenses:", err);
    }
  }, []);

  // Update and persist licenses
  const updateLicenses = (newList) => {
    setLicenses(newList);
    localStorage.setItem("snapcore-licenses", JSON.stringify(newList));
  };

  const handleAssign = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !validateEmail(trimmed)) {
      setFeedback("❌ Please enter a valid email address.");
      return;
    }

    const alreadyExists = licenses.some((lic) => lic.email === trimmed);
    if (alreadyExists) {
      setFeedback(`❌ License already assigned to ${trimmed}`);
      return;
    }

    const updated = [...licenses, { email: trimmed, status: "active" }];
    updateLicenses(updated);
    setFeedback(`✅ License granted to ${trimmed}`);
    setEmail("");
  };

  const handleRevoke = (targetEmail) => {
    const updated = licenses.filter((lic) => lic.email !== targetEmail);
    updateLicenses(updated);
    setFeedback(`🚫 License revoked from ${targetEmail}`);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Restrict access
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">Only Owner tier can manage SnapCore licenses.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapCore License Manager</title>
        <meta name="description" content="Manage user licenses across the SnapCore platform." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapCore License Manager</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow space-y-5">
            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />

            <button
              onClick={handleAssign}
              disabled={!email.trim()}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded disabled:opacity-50"
            >
              Assign License
            </button>

            {feedback && (
              <div className="text-sm mt-2 text-blue-600 dark:text-blue-400 transition-all duration-200">
                {feedback}
              </div>
            )}

            {licenses.length > 0 && (
              <div className="mt-6 space-y-3">
                <h2 className="text-lg font-semibold mb-2">Active Licenses</h2>
                {licenses.map((lic, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white dark:bg-gray-900 border dark:border-gray-700 rounded p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                      {lic.email}
                    </div>
                    <button
                      onClick={() => handleRevoke(lic.email)}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
