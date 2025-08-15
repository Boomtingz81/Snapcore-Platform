// src/pages/SnapSensorGraph.jsx

import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Lock, LineChart as LineChartIcon, Gauge } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const ALLOWED_TIERS = ["pro", "garage", "owner"];
// 🔁 Use env var in production; falls back to localhost for dev
const WS_URL = import.meta.env?.VITE_OBD_WS_URL || "ws://localhost:8765";
const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function SnapSensorGraph() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [graphData, setGraphData] = useState([]);
  const [activePIDs, setActivePIDs] = useState(() => {
    try {
      const saved = localStorage.getItem("snap-sensor-activePIDs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [availableLabels, setAvailableLabels] = useState([]);
  const socketRef = useRef(null);

  // Persist PID selections
  useEffect(() => {
    try {
      localStorage.setItem("snap-sensor-activePIDs", JSON.stringify(activePIDs));
    } catch {}
  }, [activePIDs]);

  useEffect(() => {
    if (!ALLOWED_TIERS.includes(tier)) return;

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => setSocketStatus("connected");
    ws.onerror = () => setSocketStatus("error");
    ws.onclose = () => setSocketStatus("disconnected");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg.label || msg.value === undefined || isNaN(Number(msg.value))) return;

        // Build label list (unique)
        setAvailableLabels((prev) => (prev.includes(msg.label) ? prev : [...prev, msg.label]));

        // Build rolling dataset (max ~50 rows)
        setGraphData((prev) => {
          const time = msg.timestamp || new Date().toLocaleTimeString();
          const val = parseFloat(msg.value);
          const last = prev[prev.length - 1];

          if (last && last.time === time) {
            const nextRow = { ...last, [msg.label]: val };
            return [...prev.slice(0, -1), nextRow].slice(-50);
          }
          const newRow = { time, [msg.label]: val };
          return [...prev, newRow].slice(-50);
        });

        // Auto-select first label if none chosen yet
        if (activePIDs.length === 0) setActivePIDs([msg.label]);
      } catch (err) {
        console.error("Graph data error:", err);
      }
    };

    return () => {
      try {
        ws.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, WS_URL]); // don't re-open on activePIDs change

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">Sensor Graphs are only available to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapSensor Graph – Live PID Chart</title>
        <meta name="description" content="View dynamic PID sensor values as a live chart in real-time." />
      </Helmet>

      <main className="min-h-screen px-6 py-12 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <header className="mb-2 flex items-center gap-2">
            <LineChartIcon className="text-blue-500" />
            <h1 className="text-3xl font-bold">SnapSensor Graph</h1>
          </header>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
            Status:{" "}
            <span
              className={
                socketStatus === "connected"
                  ? "text-green-500 font-medium"
                  : socketStatus === "error"
                  ? "text-red-500 font-medium"
                  : "text-yellow-500 font-medium"
              }
            >
              {socketStatus}
            </span>
            {" · "}
            This module visualizes live sensor data (PIDs) streamed via WebSocket.
          </p>

          {availableLabels.length > 0 && (
            <div className="flex gap-3 flex-wrap mb-4">
              {availableLabels.map((label) => (
                <label key={label} className="flex items-center gap-2 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={activePIDs.includes(label)}
                    onChange={() => {
                      setActivePIDs((prev) =>
                        prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
                      );
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          )}

          {graphData.length > 0 && activePIDs.length > 0 ? (
            <div className="w-full h-[420px] sm:h-[460px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} minTickGap={16} />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend />
                  {activePIDs.map((pid, i) => (
                    <Line
                      key={pid}
                      type="monotone"
                      dataKey={pid}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-400 flex items-center gap-2">
              <Gauge className="text-gray-400" />
              <span>No PID data yet...</span>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
