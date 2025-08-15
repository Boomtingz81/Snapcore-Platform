// src/pages/SnapLogViewer.jsx

import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Terminal, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapLogViewer() {
  const [tier, setTier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [logs, setLogs] = useState([]);
  const containerRef = useRef(null);

  // Load stored logs or simulate data
  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("snapcore-logs")) || [];
    setLogs(savedLogs);

    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toLocaleTimeString(),
        msg: "Sensor [RPM] = " + (600 + Math.floor(Math.random() * 5000)),
      };
      setLogs((prev) => {
        const updated = [...prev.slice(-199), newLog];
        localStorage.setItem("snapcore-logs", JSON.stringify(updated));
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to latest log
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">Log viewer is available only for Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapLog Viewer – Live Diagnostic Logs</title>
        <meta name="description" content="Scroll through recent AI commentary, alerts, and sensor logs in real-time." />
      </Helmet>

      <main className="min-h-screen px-6 py-14 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <header className="flex items-center gap-3 mb-6">
            <Terminal className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-3xl font-bold">SnapLog Viewer</h1>
          </header>

          <div
            ref={containerRef}
            className="h-96 overflow-y-auto bg-black text-green-400 font-mono p-4 rounded-lg border border-gray-700"
          >
            {logs.map((log, index) => (
              <div key={index}>
                [{log.time}] {log.msg}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Logs are stored in browser memory. Export via SnapLive Export.
          </p>
        </motion.div>
      </main>
    </>
  );
}
