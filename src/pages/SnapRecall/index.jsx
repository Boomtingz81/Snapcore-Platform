import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ShieldAlert, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapRecall() {
  const [tier] = useState("pro"); // 🔒 Replace with real auth system
  const [recalls, setRecalls] = useState([]);
  const [search, setSearch] = useState("");

  // 📦 Load recall data from localStorage
  useEffect(() => {
    try {
      const rawData = localStorage.getItem("snap-recalls");
      if (!rawData) return;

      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) return;

      const onlyRecalls = parsed.filter((item) => item.type === "recall");
      setRecalls(onlyRecalls);
    } catch (error) {
      console.error("❌ Failed to parse SnapRecall data:", error);
    }
  }, []);

  // 🔎 Filtered search results
  const filteredRecalls = useMemo(() => {
    const q = search.toLowerCase();
    return recalls.filter(
      (r) =>
        r?.vehicle?.toLowerCase().includes(q) ||
        r?.title?.toLowerCase().includes(q) ||
        r?.code?.toLowerCase().includes(q)
    );
  }, [search, recalls]);

  // 🔐 Tier restriction check
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapRecall is restricted to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapRecall – Vehicle Safety Notices</title>
        <meta name="description" content="Browse manufacturer-issued recall notices for vehicle safety." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* 🔴 Header */}
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            <h1 className="text-3xl font-bold">SnapRecall</h1>
          </div>

          {/* 🔍 Search Bar */}
          <input
            type="text"
            placeholder="Search by vehicle, recall code, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />

          {/* 📄 Results */}
          {filteredRecalls.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No active recalls found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredRecalls.map((r, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-lg shadow"
                >
                  <div className="mb-1 flex justify-between items-start">
                    <span className="text-sm font-semibold text-red-600">
                      {r.vehicle || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">Code: {r.code || "N/A"}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    {r.title || "Untitled Recall"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {r.details || "No further recall details provided."}
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
