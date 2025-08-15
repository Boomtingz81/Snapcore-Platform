// src/pages/GarageAdminDashboard.jsx

import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Wrench, Trash2, Lock } from "lucide-react";

const ALLOWED_TIERS = ["garage", "owner"];

export default function GarageAdminDashboard() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mot-reminders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sorted = parsed.sort((a, b) => new Date(a.motDate) - new Date(b.motDate));
          setReminders(sorted);
        } else {
          console.warn("⚠️ Invalid reminders format in localStorage.");
        }
      }
    } catch (error) {
      console.error("❌ Failed to load reminders:", error);
      alert("Could not load MOT reminders. Please check your saved data.");
    }
  }, []);

  const deleteReminder = (reg) => {
    const confirmed = window.confirm(`Delete MOT reminder for ${reg}?`);
    if (!confirmed) return;

    try {
      const filtered = reminders.filter((entry) => entry.reg !== reg);
      setReminders(filtered);
      localStorage.setItem("mot-reminders", JSON.stringify(filtered));
      alert("Reminder deleted successfully.");
    } catch (error) {
      console.error("❌ Error updating reminders:", error);
      alert("Failed to delete reminder. Try again.");
    }
  };

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => new Date(a.motDate) - new Date(b.motDate));
  }, [reminders]);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">Only Garage or Owner tier can access this dashboard.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>Garage Admin Dashboard</title>
        <meta name="description" content="Manage customer MOT reminders and view scheduled entries." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold">Garage Admin Dashboard</h1>
          </div>

          {sortedReminders.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No MOT reminders found in the system.
            </p>
          ) : (
            <section className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow space-y-4">
              {sortedReminders.map((entry, index) => (
                <article
                  key={index}
                  className="flex justify-between items-center bg-white dark:bg-gray-900 rounded p-3 border dark:border-gray-700"
                >
                  <div>
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      {entry.reg?.toUpperCase() || "UNKNOWN REG"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      MOT Date:{" "}
                      {entry.motDate
                        ? new Date(entry.motDate).toLocaleDateString("en-GB")
                        : "Unknown"}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteReminder(entry.reg)}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                    aria-label={`Delete reminder for ${entry.reg}`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </article>
              ))}
            </section>
          )}
        </motion.div>
      </main>
    </>
  );
}
