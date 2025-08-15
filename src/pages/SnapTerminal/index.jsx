// src/pages/Terminal.jsx

import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { TerminalSquare, Lock, Download, UploadCloud } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function Terminal() {
  const [tier] = useState("pro"); // Simulated tier (can be made dynamic)
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([]);
  const [relayStatus] = useState("Connected");
  const logEndRef = useRef(null);

  // Load saved logs on mount
  useEffect(() => {
    const saved = localStorage.getItem("snapcore-terminal-logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setLogs(parsed);
      } catch {
        console.error("Invalid logs in localStorage.");
      }
    }
  }, []);

  // Save logs and scroll to bottom on update
  useEffect(() => {
    localStorage.setItem("snapcore-terminal-logs", JSON.stringify(logs));
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const runCommand = () => {
    if (!command.trim()) return;

    const timestamp = new Date().toISOString();
    const simulatedOutput = `> ${command}\n✅ SnapRelay executed "${command}" at ${timestamp}`;

    const newLog = {
      command,
      response: simulatedOutput,
      timestamp,
    };

    setLogs((prev) => [...prev, newLog]);
    setCommand("");
  };

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "snapcore-terminal-logs.json";
    link.click();
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem("snapcore-terminal-logs");
  };

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">Terminal access is restricted to Pro, Garage, and Owner tiers.</p>
          <button
            onClick={() => window.location.href = "/pricing"}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Upgrade Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapCore Terminal – Command Console</title>
        <meta name="description" content="Execute SnapRelay commands and monitor live responses from SnapCore AI." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <TerminalSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapCore Command Terminal</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Relay Status: <strong className="text-green-600">{relayStatus}</strong>
              </span>
              <div className="flex gap-3">
                <button
                  onClick={exportLogs}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={clearLogs}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                >
                  <UploadCloud className="w-4 h-4" /> Clear
                </button>
              </div>
            </div>

            <div className="rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 bg-black text-green-400 font-mono text-sm h-64 p-3 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 italic">No commands run yet.</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="mb-3 whitespace-pre-wrap">
                    <span className="text-gray-400">[{log.timestamp}]</span><br />
                    {log.response}
                  </div>
                ))
              )}
              <div ref={logEndRef}></div>
            </div>

            <div className="flex mt-4 gap-3">
              <input
                type="text"
                className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                placeholder="Enter SnapRelay command..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCommand()}
              />
              <button
                onClick={runCommand}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Run
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
