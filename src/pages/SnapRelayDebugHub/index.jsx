// src/pages/SnapRelayDebugHub.jsx

import { useEffect, useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ServerCrash, Lock, RefreshCcw } from "lucide-react";

const ALLOWED_TIERS = ["owner"];

export default function SnapRelayDebugHub() {
  const tier = useMemo(() => localStorage.getItem("user-tier") || "lite", []);
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchRelayLogs = useCallback(() => {
    try {
      const raw = localStorage.getItem("snap-relay-logs");
      if (!raw) {
        setLogs([]);
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const reversed = parsed.slice().reverse(); // avoid in-place reversal
        setLogs(reversed);
      } else {
        setLogs([{ error: "Invalid log format" }]);
      }
    } catch (error) {
      console.error("Relay log fetch failed:", error);
      setLogs([{ error: "Malformed log data or JSON parse failed." }]);
    }
  }, []);

  useEffect(() => {
    fetchRelayLogs();
  }, [fetchRelayLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchRelayLogs, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchRelayLogs]);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">Owner tier is required to access SnapRelay Debug Hub.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapRelay Debug Hub</title>
        <meta name="description" content="Monitor SnapRelay events and debug AI relay communication." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <ServerCrash className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            <h1 className="text-3xl font-bold">SnapRelay Debug Hub</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={fetchRelayLogs}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded inline-flex items-center"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Logs
              </button>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh((prev) => !prev)}
                />
                Auto Refresh
              </label>
            </div>

            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">No relay logs found.</p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2 text-xs font-mono">
                {logs.map((entry, index) => (
                  <pre
                    key={index}
                    className="bg-black text-green-400 rounded p-3 whitespace-pre-wrap break-all"
                  >
                    {typeof entry === "string"
                      ? entry
                      : entry.error
                        ? `❌ ${entry.error}`
                        : JSON.stringify(entry, null, 2)}
                  </pre>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
