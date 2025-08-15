import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { AlertTriangle, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapBulletin() {
  const [tier] = useState("pro"); // TODO: Replace with real user tier logic
  const [bulletins, setBulletins] = useState([]);
  const [filter, setFilter] = useState("");

  // Load bulletin data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("snap-bulletins");
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setBulletins(parsed);
      } else {
        console.warn("⚠️ Bulletin data format invalid.");
      }
    } catch (error) {
      console.error("❌ Failed to load SnapBulletin data:", error);
    }
  }, []);

  // Memoized search filter
  const filteredBulletins = useMemo(() => {
    const term = filter.toLowerCase();
    return bulletins.filter((b) =>
      [b?.vehicle, b?.title, b?.type]
        .some((field) => field?.toLowerCase().includes(term))
    );
  }, [bulletins, filter]);

  // Gate access by tier
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">
            SnapBulletin is available to Pro, Garage, and Owner users only.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapBulletin – Manufacturer Notices</title>
        <meta
          name="description"
          content="View technical service bulletins and recall alerts by manufacturer."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <h1 className="text-3xl font-bold">SnapBulletin</h1>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by vehicle, bulletin type, or keyword..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />

          {/* Result List */}
          {filteredBulletins.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No bulletins available.
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredBulletins.map((entry, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-lg shadow"
                >
                  <div className="mb-1 flex justify-between items-start">
                    <span className="text-sm font-semibold text-red-600">
                      {entry.vehicle || "Unknown Vehicle"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {entry.type === "recall" ? "📛 Recall" : "📄 TSB"}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    {entry.title || "Untitled Bulletin"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {entry.details || "No further details provided."}
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
