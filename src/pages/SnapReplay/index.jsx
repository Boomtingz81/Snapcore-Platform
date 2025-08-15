// src/pages/SnapReplay.jsx

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { History, Lock, FileDown } from "lucide-react";

// Simulated tier (replace with real auth in production)
const ALLOWED_TIERS = ["pro", "garage"];

export default function SnapReplay() {
  const [tier] = useState("pro"); // Replace with: const { tier } = useAuthContext()
  const [replayData, setReplayData] = useState([]);
  const [filter, setFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("snapcore-replay");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const sorted = [...parsed].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setReplayData(sorted);
        setFilteredData(sorted);
      } catch (err) {
        console.error("Replay data corrupted:", err);
        alert("Error loading replay data. Local storage may be corrupted.");
      }
    }
  }, []);

  // Debounced and trimmed filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      const search = filter.trim().toLowerCase();
      const result = replayData.filter((entry) =>
        entry?.jobRef?.toLowerCase().includes(search) ||
        entry?.vehicle?.toLowerCase().includes(search) ||
        entry?.timestamp?.toLowerCase().includes(search)
      );
      setFilteredData(result);
    }, 200);

    return () => clearTimeout(timeout);
  }, [filter, replayData]);

  const exportReplay = () => {
    const blob = new Blob([JSON.stringify(replayData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const filename = `snapcore-replay-${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  // Tier-based access control
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapReplay is available for Pro and Garage users only.</p>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Upgrade Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapReplay – Case Review Logs</title>
        <meta name="description" content="Review past SnapTech sessions and diagnostic flows." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold">SnapReplay – Session Timeline</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by job ref, vehicle, or date..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
            />
            <button
              onClick={exportReplay}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" /> Export Logs
            </button>
          </div>

          {filteredData.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No replay data found.
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredData.map((entry, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-lg shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-semibold text-purple-600">
                      {entry.jobRef || "No Ref"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.timestamp || "No Date"}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p><strong>Vehicle:</strong> {entry.vehicle || "Unknown"}</p>
                    <p><strong>Event:</strong> {entry.event || "N/A"}</p>
                    <p><strong>Details:</strong> {entry.details || "No details"}</p>
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
