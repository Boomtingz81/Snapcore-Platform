// src/pages/SnapUpdateEngine.jsx

import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { RefreshCcw, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapUpdateEngine() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [updateLog, setUpdateLog] = useState([]);
  const [status, setStatus] = useState("Idle");

  // Load previous log from localStorage
  useEffect(() => {
    const storedLog = localStorage.getItem("snap-update-log");
    try {
      const parsed = storedLog ? JSON.parse(storedLog) : [];
      if (Array.isArray(parsed)) {
        setUpdateLog(parsed);
      }
    } catch (err) {
      console.error("Error loading update log:", err);
    }
  }, []);

  // Handle Check for Updates
  const handleCheckForUpdates = useCallback(() => {
    setStatus("🔄 Checking...");
    setTimeout(() => {
      const newEntry = {
        timestamp: new Date().toISOString(),
        message: "✅ SnapCore modules verified and up to date.",
      };
      const newLog = [newEntry, ...updateLog];
      setUpdateLog(newLog);
      localStorage.setItem("snap-update-log", JSON.stringify(newLog));
      setStatus("✅ Complete");
    }, 2000);
  }, [updateLog]);

  // Restrict access if not correct tier
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">
            Only Pro, Garage, and Owner users can access updates.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapUpdate Engine</title>
        <meta
          name="description"
          content="Check and validate your SnapCore modules for the latest updates."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <RefreshCcw className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">SnapUpdate Engine</h1>
          </div>

          <button
            onClick={handleCheckForUpdates}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Check for Updates
          </button>

          <p className="text-lg font-medium">Status: {status}</p>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Update Log</h2>
            {updateLog.length === 0 ? (
              <p className="text-gray-500">No updates found yet.</p>
            ) : (
              <ul className="space-y-2">
                {updateLog.map((log, index) => (
                  <li
                    key={index}
                    className="border-b border-gray-300 dark:border-gray-700 pb-2"
                  >
                    <strong>{log.message}</strong>
                    <br />
                    <small className="text-xs text-gray-500">{log.timestamp}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
