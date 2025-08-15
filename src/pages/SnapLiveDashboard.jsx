// File: /src/pages/SnapLiveDashboard.jsx

import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Lock,
  SatelliteDish,
  Activity,
  Car,
  CheckCircle,
} from "lucide-react";

// ✅ Access control + WebSocket settings
const ALLOWED_TIERS = ["pro", "garage", "owner"];
const WS_URL = "ws://localhost:8765"; // ⬅️ Change for production

export default function SnapLiveDashboard() {
  const [tier, setTier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [liveData, setLiveData] = useState([]);
  const [vin, setVin] = useState("Not Detected");
  const socketRef = useRef(null);

  // ✅ Setup WebSocket on mount
  useEffect(() => {
    if (!ALLOWED_TIERS.includes(tier)) return;

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => setSocketStatus("connected");
    ws.onerror = () => setSocketStatus("error");
    ws.onclose = () => setSocketStatus("disconnected");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveData((prev) => [data, ...prev.slice(0, 99)]); // Only keep last 100
        if (data.vin && vin === "Not Detected") setVin(data.vin);
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, [tier]);

  // ✅ Tier Lock Screen
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapLive Dashboard is only available to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  // ✅ Live View Dashboard
  return (
    <>
      <Helmet>
        <title>SnapLive Dashboard – Real-Time Vehicle Stream</title>
        <meta
          name="description"
          content="Live vehicle diagnostics streamed directly from your ThinkDiag device via WebSocket."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-12 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          {/* Page Title + Status */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SatelliteDish className="text-blue-600" />
              SnapLive Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Streaming vehicle data in real time...
            </p>
          </header>

          {/* Status Bar */}
          <div className="flex flex-wrap gap-4 mb-6">
            <StatusBlock icon={<Activity />} label="WebSocket" value={socketStatus} color={socketStatus === "connected" ? "text-green-500" : "text-red-500"} />
            <StatusBlock icon={<Car />} label="VIN" value={vin} color="text-yellow-500" />
            <StatusBlock icon={<CheckCircle />} label="Tier" value={tier} color="text-blue-600" />
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-xl bg-gray-100 dark:bg-gray-900 shadow">
            <table className="min-w-full text-sm table-auto">
              <thead className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">PID</th>
                  <th className="px-4 py-2 text-left">Label</th>
                  <th className="px-4 py-2 text-left">Value</th>
                  <th className="px-4 py-2 text-left">Units</th>
                </tr>
              </thead>
              <tbody>
                {liveData.map((entry, index) => (
                  <tr key={index} className="border-t border-gray-300 dark:border-gray-700">
                    <td className="px-4 py-2">{entry.timestamp}</td>
                    <td className="px-4 py-2">{entry.pid}</td>
                    <td className="px-4 py-2">{entry.label}</td>
                    <td className="px-4 py-2">{entry.value}</td>
                    <td className="px-4 py-2">{entry.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </>
  );
}

// ✅ Reusable block for status rows
function StatusBlock({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
      <span className={color}>{icon}</span>
      <span className="text-sm font-medium">{label}:</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
