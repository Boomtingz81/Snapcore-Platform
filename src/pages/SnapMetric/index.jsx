// src/pages/SnapMetrics.jsx

import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { BarChart3, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapMetrics() {
  const [tier] = useState("pro"); // Replace with real auth logic
  const [metrics, setMetrics] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("snapcore-metrics");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMetrics(parsed);
      }
    } catch (err) {
      console.error("❌ Failed to parse metrics:", err);
    }
  }, []);

  const filteredMetrics = useMemo(() => {
    const search = filter.toLowerCase();
    return metrics.filter(
      (m) =>
        m?.vehicle?.toLowerCase().includes(search) ||
        m?.technician?.toLowerCase().includes(search) ||
        m?.timestamp?.toLowerCase().includes(search)
    );
  }, [metrics, filter]);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">
            SnapMetrics is available to Pro, Garage, and Owner tiers only.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapMetrics – Job Analytics</title>
        <meta
          name="description"
          content="Analyze job trends, technician performance, and vehicle data."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapMetrics</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
            <input
              type="text"
              placeholder="Search by technician, vehicle, or date..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
          </div>

          {filteredMetrics.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No metrics found.
            </p>
          ) : (
            <ul className="grid md:grid-cols-2 gap-6">
              {filteredMetrics.map((entry, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-lg shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-semibold text-green-600">
                      {entry.vehicle || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.timestamp
                        ? new Date(entry.timestamp).toLocaleString()
                        : "No Date"}
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Technician:</strong>{" "}
                      {entry.technician || "N/A"}
                    </p>
                    <p>
                      <strong>Jobs Done:</strong> {entry.jobs ?? 0}
                    </p>
                    <p>
                      <strong>Avg Time:</strong> {entry.avgTime || "N/A"}
                    </p>
                    <p>
                      <strong>Rating:</strong> {entry.rating || "N/A"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </main>
    </>
  );
}
