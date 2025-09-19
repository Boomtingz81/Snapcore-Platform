// 📄 FILE: src/pages/SnapLiveExport.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Lock, FileDown, RefreshCcw, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";

const ALLOWED_TIERS = ["pro", "garage", "owner"];
const WS_URL = import.meta.env?.VITE_OBD_WS_URL || "ws://localhost:8765";

export default function SnapLiveExport() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [liveData, setLiveData] = useState([]);
  const [socketStatus, setSocketStatus] = useState("disconnected"); // disconnected|connecting|connected|error
  const [autoscroll, setAutoscroll] = useState(true);

  const wsRef = useRef(null);
  const backoffRef = useRef({ n: 0, timer: null });
  const mountedRef = useRef(false);
  const hiddenRef = useRef(document.visibilityState === "hidden");

  /** ---------------- WebSocket lifecycle ---------------- */
  useEffect(() => {
    if (!ALLOWED_TIERS.includes(tier)) return;
    mountedRef.current = true;

    const clearTimer = () => {
      if (backoffRef.current.timer) {
        clearTimeout(backoffRef.current.timer);
        backoffRef.current.timer = null;
      }
    };

    const connect = () => {
      if (!mountedRef.current || hiddenRef.current) return;
      setSocketStatus("connecting");

      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mountedRef.current) return;
          setSocketStatus("connected");
          backoffRef.current.n = 0;
        };

        ws.onerror = () => {
          if (!mountedRef.current) return;
          setSocketStatus("error");
        };

        ws.onclose = () => {
          if (!mountedRef.current) return;
          setSocketStatus("disconnected");
          // 0.5s, 1s, 2s, 4s (cap at 4s)
          const delay = Math.min(4000, Math.max(500, 500 * 2 ** backoffRef.current.n));
          backoffRef.current.n = Math.min(backoffRef.current.n + 1, 3);
          clearTimer();
          backoffRef.current.timer = setTimeout(connect, delay);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            // Accept { label, value, timestamp? }
            if (msg && typeof msg.label === "string" && msg.value !== undefined) {
              const row = {
                t: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                label: String(msg.label),
                value: msg.value,
              };
              setLiveData((prev) => {
                const next = [...prev.slice(-999), row]; // keep last 1000
                if (autoscroll) queueMicrotask(scrollToLatest);
                return next;
              });
            }
          } catch (e) {
            // keep running on bad packets
            console.warn("[SnapLiveExport] Bad packet:", e);
          }
        };
      } catch (err) {
        console.error("WebSocket error:", err);
        setSocketStatus("error");
      }
    };

    // pause/resume stream on tab hide/show (saves battery)
    const onVisibility = () => {
      hiddenRef.current = document.visibilityState === "hidden";
      if (!hiddenRef.current && socketStatus !== "connected") connect();
      if (hiddenRef.current) {
        try {
          wsRef.current?.close();
        } catch {}
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    connect();

    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimer();
      try {
        wsRef.current?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]); // keep WS_URL stable via env; changing it should reload the app anyway

  /** ---------------- Helpers ---------------- */
  const latestList = useMemo(
    () =>
      liveData.slice(-10).map((d) => ({
        time: d.t.toLocaleTimeString(),
        label: d.label,
        value: d.value,
      })),
    [liveData]
  );

  const hasData = liveData.length > 0;

  const csvEscape = (s) => `"${String(s).replace(/"/g, '""')}"`;

  const csvBlob = useMemo(() => {
    if (!hasData) return null;
    const header = "Time,Label,Value\n";
    const rows = liveData
      .map((d) => [csvEscape(d.t.toLocaleTimeString()), csvEscape(d.label), csvEscape(d.value)].join(","))
      .join("\n");
    return new Blob([header + rows], { type: "text/csv;charset=utf-8" });
  }, [liveData, hasData]);

  const txtBlob = useMemo(() => {
    if (!hasData) return null;
    const lines = liveData.map((d) => `${d.t.toLocaleTimeString()} - ${d.label}: ${d.value}`).join("\n");
    return new Blob([lines], { type: "text/plain;charset=utf-8" });
  }, [liveData, hasData]);

  function exportCSV() {
    if (!csvBlob) {
      alert("No data to export yet.");
      return;
    }
    saveAs(csvBlob, `snaplive_${Date.now()}.csv`);
  }

  function exportTXT() {
    if (!txtBlob) {
      alert("No data to export yet.");
      return;
    }
    saveAs(txtBlob, `snaplive_${Date.now()}.txt`);
  }

  async function exportPDF() {
    if (!hasData) {
      alert("No data to export yet.");
      return;
    }
    try {
      const mod = await import("jspdf"); // lazy-load
      const doc = new mod.jsPDF();
      doc.setFontSize(12);
      doc.text("SnapLive Export — Sensor Snapshot", 14, 12);
      doc.setFontSize(10);

      liveData.slice(-400).forEach((d, i) => {
        const y = 22 + (i % 36) * 6;
        if (i && i % 36 === 0) doc.addPage();
        // ⚠️ This line must use paired backticks; leaving as-is prevents the "Unterminated template" error
        doc.text(`${d.t.toLocaleTimeString()}  •  ${d.label}: ${d.value}`, 14, y);
      });

      doc.save(`snaplive_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Check console for details.");
    }
  }

  function clearData() {
    setLiveData([]);
  }

  function manualReconnect() {
    try {
      wsRef.current?.close();
    } catch {}
    // onclose will trigger the backoff reconnect
  }

  function scrollToLatest() {
    const el = document.getElementById("snaplive-list");
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  /** ---------------- Auth gate ---------------- */
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

  /** ---------------- UI ---------------- */
  return (
    <>
      <Helmet>
        <title>SnapLive Export – Save Diagnostics</title>
        <meta name="description" content="Download real-time vehicle sensor data for records or analysis." />
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

            <span className="ml-auto flex gap-2 w-full sm:w-auto">
              <button
                onClick={manualReconnect}
                className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-700 inline-flex items-center gap-1"
                title="Force reconnect"
              >
                <RefreshCcw size={16} /> Reconnect
              </button>
              <button
                onClick={clearData}
                className="bg-slate-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-700 inline-flex items-center gap-1"
                title="Clear buffer"
              >
                <Trash2 size={16} /> Clear
              </button>
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm px-2">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={autoscroll}
                  onChange={(e) => setAutoscroll(e.target.checked)}
                />
                Autoscroll
              </label>
            </span>
          </div>

          <div
            id="snaplive-list"
            className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 overflow-y-auto text-xs sm:text-sm"
            style={{ maxHeight: 260 }}
          >
            {latestList.length === 0 ? (
              <div className="opacity-70">Waiting for data…</div>
            ) : (
              latestList.map((d, i) => <div key={i}>{`${d.time} — ${d.label}: ${d.value}`}</div>)
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
