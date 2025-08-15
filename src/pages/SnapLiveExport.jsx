// src/pages/SnapLiveExport.jsx

import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Lock, FileDown } from "lucide-react";
import { saveAs } from "file-saver";

const ALLOWED_TIERS = ["pro", "garage", "owner"];
// 🔁 Use env var in production; fallback for dev
const WS_URL = import.meta.env?.VITE_OBD_WS_URL || "ws://localhost:8765";

export default function SnapLiveExport() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [liveData, setLiveData] = useState([]);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const socketRef = useRef(null);

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
        if (!msg.label || msg.value === undefined) return;

        setLiveData((prev) => [
          ...prev.slice(-49),
          {
            time: new Date(msg.timestamp || Date.now()).toLocaleTimeString(),
            label: msg.label,
            value: msg.value,
          },
        ]);
      } catch (err) {
        console.error("Data stream error:", err);
      }
    };

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [tier]);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapLive Export is only available to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  const exportCSV = () => {
    const header = "Time,Label,Value\n";
    const rows = liveData.map((d) => `${d.time},${d.label},${d.value}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `snaplive_${Date.now()}.csv`);
  };

  const exportTXT = () => {
    const lines = liveData.map((d) => `${d.time} - ${d.label}: ${d.value}`).join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `snaplive_${Date.now()}.txt`);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(10);
    doc.text("SnapLive Export - Sensor Snapshot", 14, 10);
    liveData.forEach((d, i) => {
      doc.text(`${d.time} - ${d.label}: ${d.value}`, 14, 20 + i * 6);
    });
    doc.save(`snaplive_${Date.now()}.pdf`);
  };

  return (
    <>
      <Helmet>
        <title>SnapLive Export – Save Diagnostics</title>
        <meta
          name="description"
          content="Download real-time vehicle sensor data for records or analysis."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-12 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <header className="mb-3 flex items-center gap-2">
            <FileDown className="text-blue-600" />
            <h1 className="text-3xl font-bold">SnapLive Export</h1>
          </header>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6">
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
            {" · "}Save current diagnostic session as a snapshot.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={exportCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 w-full sm:w-auto"
            >
              Export CSV
            </button>
            <button
              onClick={exportTXT}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 w-full sm:w-auto"
            >
              Export TXT
            </button>
            <button
              onClick={exportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 w-full sm:w-auto"
            >
              Export PDF
            </button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 overflow-x-auto text-xs sm:text-sm">
            {liveData.slice(-10).map((d, i) => (
              <div key={i}>
                {`${d.time} - ${d.label}: ${d.value}`}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </>
  );
}
