// 📂 src/pages/DTCsPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import MIC3X2XService from "../services/MIC3X2XService"; // <- updated from MIC3X1X

const Badge = ({ children, tone = "default" }) => {
  const tones = {
    default: "bg-white/10 text-white",
    warn: "bg-yellow-500/20 text-yellow-300",
    error: "bg-red-500/20 text-red-300",
    ok: "bg-emerald-500/20 text-emerald-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
};

export default function DTCsPage() {
  const [params] = useSearchParams();
  const ecu = params.get("ecu") || "auto";
  const bus = params.get("bus") || "auto";
  const proto = params.get("proto") || "auto";
  const session = params.get("session") || "default";
  const textFilter = (params.get("filter") || "").toLowerCase();

  const [loading, setLoading] = useState(false);
  const [milOn, setMilOn] = useState(false);
  const [summary, setSummary] = useState({ stored: 0, pending: 0, permanent: 0 });
  const [dtcs, setDtcs] = useState([]); // unified list
  const [freeze, setFreeze] = useState([]); // freeze frame(s)
  const [error, setError] = useState("");

  const svc = useMemo(
    () => new MIC3X2XService({ ecu, bus, proto, session }),
    [ecu, bus, proto, session]
  );

  const readAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [stored, pending, permanent, ff, mil] = await Promise.all([
        svc.readStoredDTCs(),
        svc.readPendingDTCs(),
        svc.readPermanentDTCs(),
        svc.readFreezeFrames(),
        svc.readMILStatus(),
      ]);

      const tag = (type, list) =>
        (list || []).map((d) => ({ ...d, type, ecu: d.ecu || ecu }));

      const unified = [
        ...tag("stored", stored),
        ...tag("pending", pending),
        ...tag("permanent", permanent),
      ];

      setDtcs(unified);
      setFreeze(ff || []);
      setMilOn(!!mil?.on);
      setSummary({
        stored: stored?.length || 0,
        pending: pending?.length || 0,
        permanent: permanent?.length || 0,
      });
    } catch (e) {
      setError(e?.message || "Failed to read DTCs");
    } finally {
      setLoading(false);
    }
  }, [svc, ecu]);

  const clearCodes = useCallback(async () => {
    if (!confirm("Clear diagnostic trouble codes? (This may turn off MIL temporarily)")) return;
    setLoading(true);
    setError("");
    try {
      await svc.clearDTCs();
      await readAll();
    } catch (e) {
      setError(e?.message || "Failed to clear DTCs");
      setLoading(false);
    }
  }, [svc, readAll]);

  const filtered = useMemo(() => {
    if (!textFilter) return dtcs;
    return dtcs.filter(
      (d) =>
        d.code?.toLowerCase().includes(textFilter) ||
        d.desc?.toLowerCase().includes(textFilter) ||
        d.type?.toLowerCase().includes(textFilter) ||
        (d.ecu || "").toLowerCase().includes(textFilter)
    );
  }, [dtcs, textFilter]);

  const exportJSON = useCallback(() => {
    const payload = {
      meta: { ecu, bus, proto, session, milOn, summary, at: new Date().toISOString() },
      dtcs: filtered,
      freezeFrames: freeze,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dtcs_${ecu}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered, freeze, ecu, bus, proto, session, milOn, summary]);

  useEffect(() => {
    readAll();
  }, [readAll]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">DTCs</h2>
          <p className="text-sm opacity-70">
            ECU: <Badge>{ecu}</Badge> Bus: <Badge>{bus}</Badge> Proto: <Badge>{proto}</Badge> Session: <Badge>{session}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={readAll}
            className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
          >
            Refresh
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
          >
            Export JSON
          </button>
          <button
            onClick={clearCodes}
            className="px-3 py-2 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm text-red-200"
          >
            Clear DTCs
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={milOn ? "error" : "ok"}>{milOn ? "MIL ON" : "MIL OFF"}</Badge>
        <Badge tone={summary.stored ? "error" : "ok"}>Stored: {summary.stored}</Badge>
        <Badge tone={summary.pending ? "warn" : "ok"}>Pending: {summary.pending}</Badge>
        <Badge tone={summary.permanent ? "error" : "ok"}>Permanent: {summary.permanent}</Badge>
      </div>

      {/* Error / loading */}
      {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded">{error}</div>}
      {loading && <div className="text-sm opacity-70">Reading DTCs…</div>}

      {/* DTC list */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 && !loading ? (
          <div className="opacity-60 text-sm">No DTCs found.</div>
        ) : (
          filtered.map((d, i) => (
            <div key={`${d.code}-${i}`} className="rounded-lg p-3 bg-black/20 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-lg font-mono">{d.code || "—"}</div>
                <Badge tone={d.type === "stored" || d.type === "permanent" ? "error" : "warn"}>{d.type}</Badge>
              </div>
              <div className="mt-1 text-sm">{d.desc || "No description"}</div>
              <div className="mt-2 text-xs opacity-70">
                ECU: {d.ecu || ecu}
                {d.severity && <span className="ml-2">Severity: {d.severity}</span>}
                {d.timestamp && <span className="ml-2">At: {new Date(d.timestamp).toLocaleString()}</span>}
              </div>
              {Array.isArray(d.causes) && d.causes.length > 0 && (
                <ul className="mt-2 text-xs list-disc pl-4 opacity-80">
                  {d.causes.map((c, idx) => <li key={idx}>{c}</li>)}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      {/* Freeze frame(s) */}
      {freeze?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Freeze Frame</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {freeze.map((ff, idx) => (
              <div key={idx} className="rounded-lg p-3 bg-black/20 border border-white/10">
                <div className="text-sm opacity-80 mb-2">Associated DTC: <span className="font-mono">{ff.code || "—"}</span></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(ff.data || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="opacity-70">{k}</span>
                      <span className="font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
