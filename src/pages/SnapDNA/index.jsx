// src/pages/SnapDNA.jsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Cpu, Lock, BookOpenCheck } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapDNA() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDNAProfile = async () => {
      try {
        // Simulated backend call
        const simulatedData = {
          vehicle: "VW Golf 1.6 TDI",
          faultHistory: [
            { code: "P0401", date: "2024-12-10", status: "resolved" },
            { code: "P2458", date: "2025-01-12", status: "active" },
          ],
          behaviouralPatterns: [
            "Frequent cold start cycles",
            "DPF regeneration failure logged twice",
            "Short-trip usage dominant",
          ],
          smartRiskRating: 72,
          lastSynced: "2025-07-20 15:42",
        };

        // Simulate delay
        await new Promise((res) => setTimeout(res, 600));
        setProfile(simulatedData);
      } catch (err) {
        console.error("❌ SnapDNA load error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDNAProfile();
  }, []);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">SnapDNA is only available to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapDNA – Vehicle Diagnostic Memory</title>
        <meta
          name="description"
          content="View historical fault data, usage patterns, and AI-calculated risk profiles."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            <h1 className="text-3xl font-bold">SnapDNA Profile</h1>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">🔍 Loading SnapDNA...</p>
          ) : error ? (
            <p className="text-center text-red-500">❌ Failed to load diagnostic profile. Please try again.</p>
          ) : !profile ? (
            <p className="text-center text-gray-600 dark:text-gray-400">No data found for this vehicle.</p>
          ) : (
            <section className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-cyan-600 mb-1">Vehicle</h2>
                <p>{profile.vehicle}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-cyan-600 mb-1">Fault History</h2>
                <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-300">
                  {profile.faultHistory.map((fault, idx) => (
                    <li key={idx}>
                      <strong>{fault.code}</strong> – {fault.status} ({fault.date})
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-cyan-600 mb-1">Behavioural Patterns</h2>
                <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-300">
                  {profile.behaviouralPatterns.map((pattern, idx) => (
                    <li key={idx}>{pattern}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last synced: {profile.lastSynced}
                </div>
                <div className="flex items-center gap-2 text-sm text-indigo-500">
                  <BookOpenCheck className="w-4 h-4" />
                  Smart Risk Score: <strong>{profile.smartRiskRating}%</strong>
                </div>
              </div>
            </section>
          )}
        </motion.div>
      </main>
    </>
  );
}