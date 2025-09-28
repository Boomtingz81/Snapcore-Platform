// 📂 FILE: src/pages/PythonDiagnostic.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useVehicle } from "../context/VehicleContext";

export default function PythonDiagnostic() {
  const { current, isAudiRSQ3, isEV, supportsAdvancedDiag } = useVehicle();

  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const [logs, setLogs] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);

  const logRef = useRef(null);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // auto-scroll logs
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  const vehicleLabel = current
    ? `${current.make || ""} ${current.model || ""}${current.year ? " (" + current.year + ")" : ""}`.trim()
    : "No vehicle selected";

  function appendLog(line) {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  }

  // Mock async “python” workflow (replace with real API later)
  async function handleQuickScan() {
    if (!current) {
      appendLog("⚠️ No vehicle selected. Open the switcher and pick one first.");
      setStatus("error");
      return;
    }

    try {
      setStatus("running");
      setStartedAt(Date.now());
      setFinishedAt(null);
      setLogs([]);
      appendLog(`Starting Python quick scan for ${vehicleLabel} …`);
      if (isAudiRSQ3) appendLog("Profile: Audi RS Q3 → enabling advanced signals & AWD tests.");
      if (isEV) appendLog("EV detected → enabling HV battery & inverter checks.");
      if (supportsAdvancedDiag && !isAudiRSQ3) appendLog("Advanced diagnostics enabled (AWD / supported platform).");

      // Simulate steps
      await step("Connecting to OBD bus", 400);
      await step("Probing ECUs (CAN)", 600);
      await step("Reading DTCs", 700);
      await step("Pulling live PIDs", 700);
      if (isAudiRSQ3) await step("Running AWD torque split test", 900);
      await step("Capturing freeze-frame data", 600);
      await step("Generating summary", 500);

      appendLog("✅ Scan complete.");
      setStatus("done");
      setFinishedAt(Date.now());
    } catch (e) {
      appendLog(`❌ Scan failed: ${e.message || e}`);
      setStatus("error");
      setFinishedAt(Date.now());
    }

    function step(label, ms) {
      appendLog(`• ${label} …`);
      return new Promise((res) => setTimeout(res, prefersReducedMotion ? 100 : ms));
    }
  }

  function handleExportTrace() {
    const header = `SnapCore Python Diagnostic Trace
Vehicle: ${vehicleLabel}
Mode: ${isAudiRSQ3 ? "RS Q3 Advanced" : supportsAdvancedDiag ? "Advanced" : "Standard"}
Started: ${startedAt ? new Date(startedAt).toISOString() : "-"}
Finished: ${finishedAt ? new Date(finishedAt).toISOString() : "-"}
Status: ${status.toUpperCase()}

`;
    const content = header + logs.join("\n") + "\n";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fnameSafe =
      (current?.make || "vehicle") +
      "-" +
      (current?.model || "scan") +
      "-" +
      new Date().toISOString().replace(/[:.]/g, "-") +
      ".txt";
    a.href = url;
    a.download = fnameSafe;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statusColor =
    status === "running"
      ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
      : status === "done"
      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
      : status === "error"
      ? "bg-red-500/15 border-red-500/30 text-red-300"
      : "bg-gray-500/10 border-white/10 text-gray-300";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Python Diagnostic</h1>
        <p className="text-gray-400">
          Vehicle in session: <strong className="text-white/90">{vehicleLabel}</strong>
        </p>
      </header>

      {isAudiRSQ3 && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
          🔥 <span className="font-semibold">RS Q3 profile detected</span> — advanced signals & AWD tests enabled.
        </div>
      )}

      {supportsAdvancedDiag && !isAudiRSQ3 && (
        <div className="mb-6 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
          ✨ Advanced diagnostics supported for this platform.
        </div>
      )}

      {!current && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
          ⚠️ No vehicle selected. Use the vehicle switcher in the top bar.
        </div>
      )}

      <section className={`mb-6 px-4 py-3 rounded-xl border ${statusColor}`} aria-live="polite">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              status === "running"
                ? "bg-blue-400 animate-pulse"
                : status === "done"
                ? "bg-emerald-400"
                : status === "error"
                ? "bg-red-400"
                : "bg-gray-400"
            }`}
          />
          <span className="text-sm">
            {status === "idle" && "Idle — ready to scan"}
            {status === "running" && "Running quick scan…"}
            {status === "done" && "Scan complete"}
            {status === "error" && "Scan error"}
          </span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <button
          onClick={handleQuickScan}
          disabled={status === "running" || !current}
          className={`px-4 py-2 rounded-lg text-white transition ${
            status === "running" || !current
              ? "bg-blue-900/40 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          aria-busy={status === "running" ? "true" : "false"}
        >
          {status === "running" ? "Scanning…" : "Run quick scan (Python)"}
        </button>

        <button
          onClick={handleExportTrace}
          disabled={logs.length === 0}
          className={`px-4 py-2 rounded-lg text-white transition ${
            logs.length === 0 ? "bg-purple-900/40 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          }`}
          title={logs.length === 0 ? "Run a scan first to export a trace." : "Download trace file"}
        >
          Export latest trace
        </button>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Live log</h2>
        <div
          ref={logRef}
          className="min-h-[200px] max-h-[360px] overflow-auto rounded-lg border border-white/10 bg-black/30 p-3"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400">Logs will appear here as the scan runs.</p>
          ) : (
            <pre className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200">
              {logs.join("\n")}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
