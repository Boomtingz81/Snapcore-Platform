// src/pages/SnapSecure.jsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound, Lock, Eye, Activity, ShieldAlert } from "lucide-react";

export default function SnapSecure() {
  const [tier] = useState("owner"); // Simulate owner tier access
  const [sessionLogs, setSessionLogs] = useState([]);
  const [status, setStatus] = useState("Initializing...");
  const [uptime, setUptime] = useState(0);
  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(true);
  const [threatsDetected, setThreatsDetected] = useState(0);

  // Uptime + Status simulation
  useEffect(() => {
    const boot = Date.now();
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - boot) / 1000);
      setUptime(seconds);
      setStatus(
        seconds < 10
          ? "Initializing..."
          : seconds < 30
          ? "Monitoring Sessions..."
          : seconds < 60
          ? "Verifying Shield Integrity..."
          : "✅ Secure Runtime"
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulated recent security log
  useEffect(() => {
    const logs = [
      {
        id: 1,
        event: "Login success",
        ip: "192.168.1.24",
        location: "London, UK",
        time: new Date().toLocaleString(),
      },
      {
        id: 2,
        event: "Attempted access to admin panel",
        ip: "10.0.0.76",
        location: "Unknown",
        time: new Date().toLocaleString(),
      },
    ];
    setSessionLogs(logs);
    setThreatsDetected(1);
  }, []);

  // If user is not owner
  if (tier !== "owner") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapSecure is available for Owner tier users only.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapSecure – AI Security Operations</title>
        <meta
          name="description"
          content="Encrypted monitoring, session control, and AI threat management for SnapCore."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapSecure Admin Node</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* STATUS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Eye className="text-purple-500" /> Status:
                </div>
                <span className="text-purple-600 font-semibold">{status}</span>
              </div>

              {/* UPTIME */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <Activity className="text-green-500" /> Uptime:
                </div>
                <span className="font-mono text-green-600">{uptime}s</span>
              </div>

              {/* THREATS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <ShieldAlert className="text-red-500" /> Threats Detected:
                </div>
                <span className="font-mono text-red-600">{threatsDetected}</span>
              </div>

              {/* AUTO LOGOUT */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <KeyRound className="text-yellow-500" /> Auto Logout:
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5"
                    checked={autoLogoutEnabled}
                    onChange={() => setAutoLogoutEnabled(!autoLogoutEnabled)}
                  />
                  <span className="text-sm">
                    {autoLogoutEnabled ? "Enabled" : "Disabled"}
                  </span>
                </label>
              </div>
            </div>

            {/* RECENT SECURITY EVENTS */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Recent Security Events</h2>
              <ul className="space-y-2">
                {sessionLogs.map((log) => (
                  <li
                    key={log.id}
                    className="border-b border-gray-300 dark:border-gray-700 pb-2"
                  >
                    <strong>{log.event}</strong> from <code>{log.ip}</code> –{" "}
                    {log.location} <br />
                    <small className="text-xs text-gray-500">{log.time}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
