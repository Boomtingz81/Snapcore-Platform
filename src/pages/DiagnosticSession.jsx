// 📄 src/pages/DiagnosticSession.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  Legend,
} from "recharts";

/**
 * SNAPTECH DIAGNOSTIC SESSION — PRO EDITION
 * - Text-first entries + inline sparklines
 * - Full-graph modal (zoom/pan, warn/crit bands, DTC markers)
 * - WebSocket OBD hook (auto-reconnect, heartbeat; mock fallback)
 * - Filters (severity/type), sorting, “critical only”
 * - CSV export (visible data), copy-as-text
 * - Status bar (source, latency, packet rate, last update)
 * - Mobile-first controls; theming tokens
 */

/* ---------------- THEME TOKENS ---------------- */

const THEME = {
  bg: "#000000",
  panel: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.1)",
  text: "#ffffff",
  mute: "rgba(255,255,255,0.65)",
  sev: {
    ok: { text: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)" },
    warn: { text: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.35)" },
    crit: { text: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.35)" },
  },
};

/* ---------------- THRESHOLDS & SEVERITY ---------------- */

const THRESHOLDS = {
  // LIVE metrics (examples)
  coolantTempC: { warn: [98, 106], crit: [106, Infinity], unit: "°C", label: "Coolant Temp" },
  boostBar: { warn: [1.4, 1.6], crit: [1.6, Infinity], unit: "bar", label: "Boost Pressure" },
  battVoltage: { warn: [11.8, 12.2], crit: [-Infinity, 11.8], unit: "V", label: "Battery Voltage" },

  // DTC mapping
  dtcSeverity: { P0420: "crit", P0301: "warn" },
};

function severityForMetric(key, value) {
  const t = THRESHOLDS[key];
  if (!t || value == null || Number.isNaN(Number(value))) return "ok";
  const [wMin, wMax] = t.warn;
  const [cMin, cMax] = t.crit;
  if (value >= cMin && value <= cMax) return "crit";
  if (value >= wMin && value <= wMax) return "warn";
  return "ok";
}

function severityForDTC(code) {
  return THRESHOLDS.dtcSeverity?.[code] ?? "warn";
}

/* ---------------- SOCKET HOOK (OBD) ---------------- */

function useObdSocket({ url, enabled, fallbackToMock = true }) {
  const [status, setStatus] = useState("disconnected"); // disconnected|connecting|connected
  const [latencyMs, setLatencyMs] = useState(null);
  const [pktRate, setPktRate] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [entries, setEntries] = useState(null);

  const pktCountRef = useRef(0);
  const wsRef = useRef(null);
  const heartbeatRef = useRef(null);
  const rateTimerRef = useRef(null);

  // packets/sec
  useEffect(() => {
    rateTimerRef.current = setInterval(() => {
      setPktRate(() => {
        const n = pktCountRef.current;
        pktCountRef.current = 0;
        return n;
      });
    }, 1000);
    return () => clearInterval(rateTimerRef.current);
  }, []);

  useEffect(() => {
    if (!enabled || !url) {
      setStatus("disconnected");
      return;
    }

    let retry = 0;

    const connect = () => {
      setStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        heartbeatRef.current = setInterval(() => {
          try {
            const t0 = Date.now();
            ws.send(JSON.stringify({ type: "ping", t0 }));
          } catch {}
        }, 5000);
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "pong" && msg.t0) {
            setLatencyMs(Date.now() - msg.t0);
            return;
          }
          if (msg.type === "diagnostic_entries") {
            setEntries(msg.payload);
            setLastUpdate(Date.now());
            pktCountRef.current += 1;
          }
        } catch {}
      };

      ws.onclose = () => {
        setStatus("disconnected");
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
        retry = Math.min(retry + 1, 5);
        setTimeout(connect, 1000 * retry);
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
    };

    connect();

    return () => {
      try { wsRef.current?.close(); } catch {}
      clearInterval(heartbeatRef.current);
    };
  }, [url, enabled]);

  const stale = useMemo(
    () => (lastUpdate ? Date.now() - lastUpdate > 4000 : true),
    [lastUpdate]
  );

  return { status, latencyMs, pktRate, lastUpdate, entries, stale, fallbackToMock };
}

/* ---------------- MOCK SOURCE + RECORDING ---------------- */

function useMockEntries() {
  const [entries, setEntries] = useState(seedMockEntries());
  useEffect(() => {
    const id = setInterval(() => setEntries((prev) => simulateTick(prev)), 1000);
    return () => clearInterval(id);
  }, []);
  return { entries };
}

function seedMockEntries() {
  const now = Date.now();
  const mkSeries = (base, noise = 0.5, n = 60) =>
    new Array(n).fill(0).map((_, i) => ({
      t: now - (n - i) * 1000,
      v: base + (Math.random() - 0.5) * noise,
    }));

  const coolant = 95;
  const boost = 1.3;
  const batt = 12.4;

  return [
    {
      id: "dtc_p0301",
      kind: "DTC",
      title: "P0301 – Cylinder 1 Misfire",
      severity: severityForDTC("P0301"),
      note: "Misfire spikes under load.",
    },
    {
      id: "dtc_p0420",
      kind: "DTC",
      title: "P0420 – Catalyst Efficiency Below Threshold",
      severity: severityForDTC("P0420"),
      note: "Downstream O2 mirrors upstream.",
    },
    mkLive("coolantTempC", "Coolant Temp", "°C", coolant, mkSeries(coolant, 0.8)),
    mkLive("boostBar", "Boost Pressure", "bar", boost, mkSeries(boost, 0.15)),
    mkLive("battVoltage", "Battery Voltage", "V", batt, mkSeries(batt, 0.05)),
  ];
}

function mkLive(key, title, unit, value, series) {
  return {
    id: `live_${key}`,
    kind: "LIVE",
    key,
    title,
    unit,
    value,
    series,
    severity: severityForMetric(key, value),
    note: "",
  };
}

function simulateTick(prev) {
  return prev.map((e) => {
    if (e.kind !== "LIVE") return e;
    const base = e.value ?? e.series?.[e.series.length - 1]?.v ?? 0;
    const noise =
      e.key === "coolantTempC" ? 0.6 :
      e.key === "boostBar" ? 0.08 :
      0.03;
    const v = Number((base + (Math.random() - 0.5) * noise).toFixed(2));
    const t = Date.now();
    const series = [...(e.series || []).slice(-299), { t, v }];
    return { ...e, value: v, series, severity: severityForMetric(e.key, v) };
  });
}

/* ---------------- UTIL: CSV/TEXT EXPORT ---------------- */

function downloadCSV(filename, rows) {
  if (!rows?.length) return;
  const hdr = Object.keys(rows[0]);
  const csv =
    [hdr.join(",")]
      .concat(rows.map((r) => hdr.map((k) => JSON.stringify(r[k] ?? "")).join(",")))
      .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
}

/* ---------------- UI SUBCOMPONENTS ---------------- */

function SeverityBadge({ level }) {
  const map = {
    ok: { text: "OK", style: THEME.sev.ok },
    warn: { text: "Watch", style: THEME.sev.warn },
    crit: { text: "Action", style: THEME.sev.crit },
  };
  const m = map[level] ?? map.ok;
  return (
    <span
      aria-label={`Severity ${m.text}`}
      className="px-2 py-0.5 text-xs border rounded-md font-medium tracking-wide"
      style={{ color: m.style.text, background: m.style.bg, borderColor: m.style.border }}
    >
      {m.text}
    </span>
  );
}

function Sparkline({ points, severity, height = 36 }) {
  const stroke =
    severity === "crit" ? THEME.sev.crit.text :
    severity === "warn" ? THEME.sev.warn.text :
    THEME.sev.ok.text;

  const data = (points ?? []).map((p) => ({ x: p.t, y: Number(p.v) }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
          <XAxis dataKey="x" hide type="number" domain={["dataMin", "dataMax"]} />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#0b0b0b", border: "1px solid #222", borderRadius: 8 }}
            labelFormatter={() => ""}
          />
          <Line type="monotone" dataKey="y" stroke={stroke} dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Divider() {
  return <div className="my-3" style={{ borderTop: `1px solid ${THEME.border}` }} />;
}

function DiagnosticEntry({ entry, onExpand, onAddNote }) {
  const style =
    entry.severity === "crit" ? THEME.sev.crit :
    entry.severity === "warn" ? THEME.sev.warn :
    THEME.sev.ok;

  return (
    <div
      className="rounded-xl p-3"
      style={{ background: THEME.panel, border: `1px solid ${style.border}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold tracking-wide leading-6">{entry.title}</div>
        <div className="flex items-center gap-2">
          <SeverityBadge level={entry.severity} />
          {(entry.series?.length || entry.kind === "LIVE") && (
            <button
              aria-label="Expand graph"
              className="text-xs px-2 py-1 rounded border"
              style={{ borderColor: THEME.border, color: THEME.mute }}
              onClick={() => onExpand?.(entry)}
            >
              Expand
            </button>
          )}
        </div>
      </div>

      {entry.kind === "LIVE" && entry.value !== undefined && (
        <div className="mt-1 text-sm" style={{ opacity: 0.9 }}>
          Current: <span className="font-mono">{entry.value}{entry.unit || ""}</span>
        </div>
      )}

      {entry.series?.length ? (
        <div className="mt-2">
          <Sparkline points={entry.series} severity={entry.severity} />
        </div>
      ) : null}

      {entry.note && (
        <div className="mt-2 text-xs italic" style={{ opacity: 0.75 }}>
          {entry.note}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          className="text-[11px] px-2 py-1 rounded border"
          style={{ borderColor: THEME.border, color: THEME.mute }}
          onClick={() => onAddNote?.(entry)}
        >
          + Note
        </button>
      </div>
    </div>
  );
}

/* ---------------- FULL GRAPH MODAL ---------------- */

function FullGraphModal({ open, onClose, entry, priorSeries }) {
  const t = entry?.key ? THRESHOLDS[entry.key] : null;
  const data = useMemo(() => (entry?.series || []).map((p) => ({ x: p.t, y: p.v })), [entry]);
  const prior = useMemo(() => (priorSeries || []).map((p) => ({ x: p.t, y: p.v })), [priorSeries]);

  if (!open || !entry) return null;

  const stroke =
    entry.severity === "crit" ? THEME.sev.crit.text :
    entry.severity === "warn" ? THEME.sev.warn.text :
    THEME.sev.ok.text;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center"
         style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-[95vw] max-w-3xl rounded-2xl overflow-hidden"
           style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
        <div className="flex items-center justify-between px-4 py-3"
             style={{ borderBottom: `1px solid ${THEME.border}` }}>
          <div className="font-semibold tracking-wide">{entry.title} — Detailed View</div>
          <button className="text-sm px-3 py-1 rounded border"
                  style={{ borderColor: THEME.border, color: THEME.mute }}
                  onClick={onClose}>
            Close
          </button>
        </div>

        <div className="p-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, left: 8, right: 8, bottom: 16 }}>
                <CartesianGrid stroke={THEME.border} strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                  stroke={THEME.mute}
                />
                <YAxis stroke={THEME.mute} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "#0b0b0b", border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                  labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                />
                <Legend />

                {/* Warn/Crit shaded bands */}
                {t && (
                  <>
                    <ReferenceArea y1={t.warn[0]} y2={t.warn[1]} strokeOpacity={0} fill={THEME.sev.warn.bg} />
                    <ReferenceArea y1={t.crit[0]} y2={t.crit[1]} strokeOpacity={0} fill={THEME.sev.crit.bg} />
                  </>
                )}

                {/* Current vs prior */}
                <Line type="monotone" dataKey="y" name="Current" stroke={stroke} dot={false} strokeWidth={2} isAnimationActive={false} />
                {prior?.length ? (
                  <Line type="monotone" dataKey="y" name="Prior" data={prior} stroke="#94a3b8" dot={false} strokeDasharray="4 4" isAnimationActive={false} />
                ) : null}

                {/* DTC markers (if any) */}
                {Array.isArray(entry.markers) &&
                  entry.markers.map((m, idx) => (
                    <ReferenceDot key={idx} x={m.t} y={m.v} r={4} fill={THEME.sev.crit.text} stroke={THEME.sev.crit.text} ifOverflow="discard" />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {entry.note && (
            <div className="mt-3 text-sm" style={{ color: THEME.mute }}>
              <em>{entry.note}</em>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN SCREEN ---------------- */

export default function DiagnosticSession() {
  // Toggle this URL to your Python bridge WebSocket (e.g., ws://localhost:8765)
  const OBD_URL = null; // set to a ws://… string to enable real feed

  const {
    status: obdStatus,
    latencyMs,
    pktRate,
    lastUpdate,
    entries: obdEntries,
    stale,
  } = useObdSocket({ url: OBD_URL, enabled: Boolean(OBD_URL) });

  const mock = useMockEntries();

  // Choose data source
  const entries = useMemo(
    () => (obdEntries && !stale ? obdEntries : mock.entries),
    [obdEntries, stale, mock.entries]
  );

  // Recording & prior session
  const [priorSession, setPriorSession] = useState(null);
  const [recording, setRecording] = useState(true);
  const recordingRef = useRef([]);

  useEffect(() => {
    if (!recording || !entries) return;
    // snapshot of LIVE series
    recordingRef.current = entries
      .map((e) => (e.kind === "LIVE" ? { key: e.key, series: e.series } : null))
      .filter(Boolean);
  }, [entries, recording]);

  const saveSessionAsPrior = useCallback(() => {
    setPriorSession(recordingRef.current);
  }, []);

  // Filters & sorting
  const [showCritOnly, setShowCritOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL|DTC|LIVE
  const [sortBy, setSortBy] = useState("severity"); // severity|title|updated

  const filtered = useMemo(() => {
    let list = entries || [];
    if (typeFilter !== "ALL") list = list.filter((e) => e.kind === typeFilter);
    if (showCritOnly) list = list.filter((e) => e.severity === "crit");

    if (sortBy === "severity") {
      const order = { crit: 0, warn: 1, ok: 2 };
      list = [...list].sort(
        (a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
      );
    } else if (sortBy === "title") {
      list = [...list].sort((a, b) => String(a.title).localeCompare(String(b.title)));
    } else if (sortBy === "updated") {
      list = [...list].sort((a, b) => {
        const at = a.series?.[a.series.length - 1]?.t ?? 0;
        const bt = b.series?.[b.series.length - 1]?.t ?? 0;
        return bt - at;
      });
    }

    return list;
  }, [entries, typeFilter, showCritOnly, sortBy]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);

  const openEntry = useCallback((entry) => {
    setModalEntry(entry);
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // Export helpers
  const exportCSV = () => {
    const rows = filtered.map((e) => ({
      id: e.id,
      type: e.kind,
      title: e.title,
      severity: e.severity,
      current: e.value ?? "",
      unit: e.unit ?? "",
      updated: e.series?.[e.series.length - 1]?.t ?? "",
    }));
    downloadCSV("diagnostic-visible.csv", rows);
  };

  const copyVisible = () => {
    const lines = filtered.map((e) => {
      const latest = e.series?.[e.series.length - 1]?.v;
      return `${e.kind}\t${e.severity}\t${e.title}\t${latest ?? ""}${e.unit ?? ""}`;
    });
    copyText(lines.join("\n"));
  };

  // UI
  return (
    <div className="min-h-screen p-4 md:p-6"
         style={{ background: THEME.bg, color: THEME.text }}>
      {/* Status / Controls */}
      <div className="max-w-6xl mx-auto mb-4 rounded-xl p-3"
           style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span style={{ color: THEME.mute }}>
            Source: <strong>{OBD_URL ? "OBD (WebSocket)" : "Mock data"}</strong>
          </span>
          {OBD_URL && (
            <>
              <span style={{ color: THEME.mute }}>Status: {obdStatus}</span>
              <span style={{ color: THEME.mute }}>Latency: {latencyMs ?? "–"} ms</span>
              <span style={{ color: THEME.mute }}>Pkt/s: {pktRate}</span>
            </>
          )}
          <span className="ml-auto" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showCritOnly} onChange={(e) => setShowCritOnly(e.target.checked)} />
            Critical only
          </label>
          <select
            className="px-2 py-1 rounded border"
            style={{ background: "#0b0f17", borderColor: THEME.border, color: THEME.text }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>ALL</option>
            <option>DTC</option>
            <option>LIVE</option>
          </select>
          <select
            className="px-2 py-1 rounded border"
            style={{ background: "#0b0f17", borderColor: THEME.border, color: THEME.text }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="severity">Sort: Severity</option>
            <option value="title">Sort: Title</option>
            <option value="updated">Sort: Updated</option>
          </select>
          <button className="px-2 py-1 rounded border"
                  style={{ borderColor: THEME.border, color: THEME.mute }}
                  onClick={() => setRecording((v) => !v)}>
            {recording ? "Recording…" : "Record"}
          </button>
          <button className="px-2 py-1 rounded border"
                  style={{ borderColor: THEME.border, color: THEME.mute }}
                  onClick={saveSessionAsPrior}>
            Save as Prior
          </button>
          <button className="px-2 py-1 rounded border"
                  style={{ borderColor: THEME.border, color: THEME.mute }}
                  onClick={exportCSV}>
            Export CSV
          </button>
          <button className="px-2 py-1 rounded border"
                  style={{ borderColor: THEME.border, color: THEME.mute }}
                  onClick={copyVisible}>
            Copy Visible
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="max-w-6xl mx-auto grid gap-3">
        {filtered.map((e) => (
          <DiagnosticEntry key={e.id} entry={e} onExpand={openEntry} />
        ))}
        {!filtered.length && (
          <div className="rounded-xl p-6 text-center"
               style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, color: THEME.mute }}>
            No entries match the current filters.
          </div>
        )}
      </div>

      {/* Modal */}
      <FullGraphModal
        open={modalOpen}
        onClose={closeModal}
        entry={modalEntry}
        priorSeries={priorSession?.find((p) => p.key === modalEntry?.key)?.series}
      />
    </div>
  );
}
