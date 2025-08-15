// src/pages/SnapLive.jsx

import { useState, useEffect } from "react";

import { Helmet } from "react-helmet";

import { motion } from "framer-motion";

import { Zap, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

const WS_URL = import.meta.env?.VITE_OBD_WS_URL || "ws://localhost:8765";

export default function SnapLive() {

  const [tier] = useState(localStorage.getItem("user-tier") || "lite");

  const [mode, setMode] = useState(() => localStorage.getItem("snaplive-mode") || "manual"); // "manual" | "obd"

  const [status, setStatus] = useState("disconnected");

  const [liveData, setLiveData] = useState([]);

  useEffect(() => {

    localStorage.setItem("snaplive-mode", mode);

  }, [mode]);

  useEffect(() => {

    let socket;

    if (mode === "obd") {

      setStatus("connecting");

      try {

        socket = new WebSocket(WS_URL);

        socket.onopen = () => setStatus("connected");

        socket.onmessage = (event) => {

          try {

            const data = JSON.parse(event.data);

            setLiveData((prev) => [data, ...prev.slice(0, 19)]);

          } catch (err) {

            console.error("Invalid WebSocket data", err);

          }

        };

        socket.onerror = () => setStatus("error");

        socket.onclose = () => setStatus("disconnected");

      } catch {

        setStatus("error");

      }

    }

    return () => {

      try {

        if (socket && socket.readyState === WebSocket.OPEN) socket.close();

      } catch {}

    };

  }, [mode]);

  if (!ALLOWED_TIERS.includes(tier)) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">

        <div className="text-center">

          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />

          <h1 className="text-2xl font-bold">Access Denied</h1>

          <p className="mt-2">SnapLive is only available to Pro, Garage, and Owner tiers.</p>

        </div>

      </main>

    );

  }

  return (

    <>

      <Helmet>

        <title>SnapLive – Real-Time Diagnostics</title>

        <meta name="description" content="Run live vehicle diagnostics with OBD or manual AI-assisted mode." />

      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">

        <motion.div

          initial={{ opacity: 0, y: 30 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.4 }}

          className="max-w-4xl mx-auto"

        >

          <div className="flex items-center gap-3 mb-6">

            <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />

            <h1 className="text-3xl font-bold">SnapLive</h1>

          </div>

          {/* Mode Toggle */}

          <div className="flex gap-4 mb-8">

            <button

              className={`px-4 py-2 rounded-full text-sm font-medium ${

                mode === "manual" ? "bg-blue-600 text-white" : "bg-gray-300 dark:bg-gray-800"

              }`}

              onClick={() => setMode("manual")}

            >

              Manual AI Mode

            </button>

            <button

              className={`px-4 py-2 rounded-full text-sm font-medium ${

                mode === "obd" ? "bg-green-600 text-white" : "bg-gray-300 dark:bg-gray-800"

              }`}

              onClick={() => setMode("obd")}

            >

              OBD Live Mode

            </button>

          </div>

          {/* Status Panel */}

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-md">

            {mode === "manual" ? (

              <div>

                <p className="text-lg font-semibold text-blue-600">Manual Mode Activated</p>

                <p className="text-sm mt-2">

                  Input fault codes or symptoms for SnapTech to analyze in real time.

                </p>

                <input

                  type="text"

                  placeholder="e.g. P0301, slow acceleration, DPF full..."

                  className="mt-4 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"

                />

              </div>

            ) : (

              <div>

                <p className="text-lg font-semibold text-green-600">OBD Mode</p>

                <p className="text-sm mt-2 mb-1">

                  Status:{" "}

                  <span

                    className={`font-bold ${

                      status === "connected"

                        ? "text-green-500"

                        : status === "connecting"

                        ? "text-yellow-500"

                        : status === "error"

                        ? "text-red-500"

                        : "text-gray-400"

                    }`}

                  >

                    {status}

                  </span>

                </p>

                <p className="text-sm">

                  Waiting for ThinkDiag tool. Make sure Bluetooth is on and paired with your device.

                </p>

              </div>

            )}

          </div>

          {mode === "obd" && liveData.length > 0 && (

            <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">

              <div className="w-full overflow-x-auto">

                <table className="min-w-[640px] w-full table-auto text-sm">

                  <thead className="bg-gray-200 dark:bg-gray-800">

                    <tr>

                      <th className="px-4 py-2 text-left">Timestamp</th>

                      <th className="px-4 py-2 text-left">Label</th>

                      <th className="px-4 py-2 text-left">Value</th>

                      <th className="px-4 py-2 text-left">Units</th>

                    </tr>

                  </thead>

                  <tbody>

                    {liveData.map((entry, index) => (

                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700">

                        <td className="px-4 py-2">{entry.timestamp}</td>

                        <td className="px-4 py-2">{entry.label}</td>

                        <td className="px-4 py-2">{entry.value}</td>

                        <td className="px-4 py-2">{entry.units}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          <SnapLiveFuturePreview />

        </motion.div>

      </main>

    </>

  );

}

function SnapLiveFuturePreview() {

  return (

    <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">

      <p>

        🔄 <strong>Coming Soon:</strong> SnapTech Live AI overlay, sensor graph mode, fault stream logs,

        SnapPredict engine, and instant repair suggestions.

      </p>

    </div>

  );

}

