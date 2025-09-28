// 📂 FILE: src/pages/Reports/LastReport.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Reads and renders the most recent diagnostic report saved by /scan Quick Scan.
 * - Safe against missing/bad localStorage
 * - Nice summary, DTC table, readings grid
 * - Actions: Copy JSON, Download, Print, Clear
 */
export default function LastReport() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const REPORTS_KEY = "snapcore_reports";
  const LAST_ID_KEY = "snapcore_last_report_id";

  // -------- helpers --------
  const safeJSONParse = (text, fallback) => {
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  };

  const readFromStorage = useCallback(() => {
    if (typeof window === "undefined") return { report: null, error: "" };
    const lastId = window.localStorage.getItem(LAST_ID_KEY);
    const list = safeJSONParse(window.localStorage.getItem(REPORTS_KEY), []);
    if (!lastId || !Array.isArray(list)) {
      return { report: null, error: "" };
    }
    const found = list.find((r) => r?.id === lastId) || null;
    return { report: found, error: "" };
  }, []);

  useEffect(() => {
    const { report, error } = readFromStorage();
    setReport(report);
    setError(error);
  }, [readFromStorage]);

  // derived
  const createdAt = useMemo(() => {
    if (!report?.createdAt) return null;
    try {
      return new Date(report.createdAt).toLocaleString();
    } catch {
      return String(report.createdAt);
    }
  }, [report]);

  const dtcs = Array.isArray(report?.dtcs) ? report.dtcs : [];
  const readings = report?.readings && typeof report.readings === "object" ? report.readings : {};
  const connection = report?.connection || {};
  const vehicle = report?.vehicle || {};

  // -------- actions --------
  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      alert("Report JSON copied to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  const downloadJSON = () => {
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const namePlate = vehicle.plate ? `_${vehicle.plate}` : "";
      a.href = url;
      a.download = `snapcore_report${namePlate}_${report?.id || "last"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed.");
    }
  };

  const clearLastReport = () => {
    if (typeof window === "undefined") return;
    if (!confirm("Remove the stored last report? This cannot be undone.")) return;
    const list = safeJSONParse(localStorage.getItem(REPORTS_KEY), []);
    const lastId = localStorage.getItem(LAST_ID_KEY);
    const next = list.filter((r) => r?.id !== lastId);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
    localStorage.removeItem(LAST_ID_KEY);
    setReport(null);
  };

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Last Report</h1>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Last Report</h1>
        <p className="text-gray-400 mb-6">No saved report found.</p>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          Go to Scan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Last Report</h1>
          <p className="text-sm text-gray-400">
            Created: {createdAt || "Unknown"} • Source: {report?.meta?.source || "N/A"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition"
          >
            Back
          </button>
          <button
            onClick={copyJSON}
            className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition"
          >
            Copy JSON
          </button>
          <button
            onClick={downloadJSON}
            className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition"
          >
            Download
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 transition"
          >
            Print
          </button>
          <button
            onClick={clearLastReport}
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-gray-400 mb-1">Vehicle</p>
          <p className="text-sm font-semibold">
            {vehicle.plate || "—"}
            {vehicle.vin ? ` • ${vehicle.vin}` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-gray-400 mb-1">OBD Connection</p>
          <p className="text-sm font-semibold">
            {connection?.connected ? "Connected" : "Not Connected"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-gray-400 mb-1">DTC Count</p>
          <p className="text-sm font-semibold">{dtcs.length}</p>
        </div>
      </div>

      {/* DTC Table */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Diagnostic Trouble Codes</h2>
        {dtcs.length === 0 ? (
          <div className="text-gray-400 text-sm">No DTCs reported.</div>
        ) : (
          <div className="overflow-auto rounded-xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/40">
                <tr>
                  <th className="text-left px-3 py-2 border-b border-white/10">Code</th>
                  <th className="text-left px-3 py-2 border-b border-white/10">Description</th>
                  <th className="text-left px-3 py-2 border-b border-white/10">System</th>
                  <th className="text-left px-3 py-2 border-b border-white/10">Severity</th>
                </tr>
              </thead>
              <tbody>
                {dtcs.map((d, i) => {
                  const code = typeof d === "string" ? d : d?.code || `#${i + 1}`;
                  const desc =
                    typeof d === "string" ? "" : d?.description || d?.desc || "";
                  return (
                    <tr key={i} className="odd:bg-white/5">
                      <td className="px-3 py-2 font-medium">{code}</td>
                      <td className="px-3 py-2">{desc}</td>
                      <td className="px-3 py-2">{d?.system || "—"}</td>
                      <td className="px-3 py-2">{d?.severity || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Live Readings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Readings Snapshot</h2>
        {Object.keys(readings).length === 0 ? (
          <div className="text-gray-400 text-sm">No readings captured.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(readings).map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-white/10 bg-black/30 p-3"
              >
                <p className="text-xs text-gray-400">{k}</p>
                <p className="text-sm font-semibold break-all">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Raw JSON (collapsible) */}
      <details className="rounded-xl border border-white/10 bg-black/30">
        <summary className="cursor-pointer px-4 py-3 font-semibold">
          Raw JSON
        </summary>
        <pre className="p-4 overflow-auto text-xs">
          {JSON.stringify(report, null, 2)}
        </pre>
      </details>
    </div>
  );
}
