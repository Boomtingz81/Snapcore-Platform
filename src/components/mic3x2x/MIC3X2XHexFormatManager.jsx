import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* =========================
   Utility helpers (exported)
   ========================= */

/** Normalize incoming text: keep hex only, optional group spacing */
export function normalizeHex(input, { uppercase = true } = {}) {
  const hex = (input || "")
    .replace(/0x/gi, " ")
    .replace(/[^0-9a-fA-F]/g, "")
    .toUpperCase();
  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}

/** Split a normalized hex string into byte array (numbers 0..255) */
export function hexToBytes(hex) {
  const clean = normalizeHex(hex);
  if (clean.length % 2 !== 0) throw new Error("HEX length must be even");
  const out = [];
  for (let i = 0; i < clean.length; i += 2) {
    out.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return out;
}

/** Bytes to hex (grouped) */
export function bytesToHex(bytes, { group = 1, uppercase = true } = {}) {
  const hex = (bytes || [])
    .map((b) => (b & 0xff).toString(16).padStart(2, "0"))
    .join("");
  if (!group || group < 1) return uppercase ? hex.toUpperCase() : hex.toLowerCase();
  const parts = [];
  for (let i = 0; i < hex.length; i += group * 2) parts.push(hex.slice(i, i + group * 2));
  const flat = parts.join(" ").trim();
  return uppercase ? flat.toUpperCase() : flat.toLowerCase();
}

/** Simple additive checksum (8-bit) */
export function checksumAdd8(bytes) {
  let sum = 0;
  for (const b of bytes) sum = (sum + (b & 0xff)) & 0xff;
  return sum;
}

/** XOR checksum (8-bit) */
export function checksumXor8(bytes) {
  let x = 0x00;
  for (const b of bytes) x ^= (b & 0xff);
  return x & 0xff;
}

/** Try to detect frame "shape" (single vs multi, ISO-TP hints) */
export function detectFrameInfo(bytes) {
  const len = bytes.length;
  const info = { length: len, hints: [], isIsoTp: false, type: "raw" };

  if (len > 0) {
    // ISO-TP nibble: first byte high-nibble = PCI type (0=SF,1=FF,2=CF,3=FC)
    const pciType = (bytes[0] & 0xF0) >> 4;
    if (pciType <= 3) {
      info.isIsoTp = true;
      info.type = ["SF", "FF", "CF", "FC"][pciType] || "raw";
      info.hints.push("ISO-TP/UDS candidate");
    }
  }

  // "Looks like" AT / ST / VT command (ASCII letters)
  const looksAscii = bytes.every((b) => b >= 0x20 && b <= 0x7E);
  if (looksAscii) {
    const ascii = String.fromCharCode(...bytes);
    if (/^(AT|ST|VT)\s/.test(ascii)) {
      info.hints.push(`${ascii.substring(0, 2)} command`);
      info.type = "command";
    } else {
      info.hints.push("ASCII text");
    }
  }

  return info;
}

/** Build a sendable payload (apply spacing, uppercase, optional trailing checksum) */
export function buildPayload(hexString, options) {
  const { appendChecksum = "none", checksumScope = "all", uppercase = true } = options || {};
  const bytes = hexToBytes(hexString);
  let toCheck = bytes.slice();
  // In case you only want checksum on payload (skip first header byte etc.)
  if (checksumScope === "payloadOnly") toCheck = bytes.slice(1);

  let chk = null;
  if (appendChecksum === "xor8") chk = checksumXor8(toCheck);
  if (appendChecksum === "add8") chk = checksumAdd8(toCheck);

  const finalBytes = chk === null ? bytes : [...bytes, chk];
  return bytesToHex(finalBytes, { group: 1, uppercase });
}

/** Validate a hex frame against a checksum mode */
export function validateChecksum(hexString, mode = "none", scope = "all") {
  if (mode === "none") return { ok: true, expected: null, actual: null };
  const bytes = hexToBytes(hexString);
  if (bytes.length < 1) return { ok: false, error: "Empty frame" };

  const data = scope === "payloadOnly" ? bytes.slice(1, -1) : bytes.slice(0, -1);
  const actual = bytes[bytes.length - 1];

  let expected = null;
  if (mode === "xor8") expected = checksumXor8(data);
  if (mode === "add8") expected = checksumAdd8(data);

  return { ok: expected === actual, expected, actual };
}

/* =========================
   React component
   ========================= */

const DEFAULT_SETTINGS = {
  uppercase: true,
  group: 1,
  echo: true,
  autoValidate: true,
  appendChecksum: "none", // "none" | "xor8" | "add8"
  checksumScope: "all",   // "all" | "payloadOnly"
};

export default function MIC3X2XHexFormatManager({
  /** Optional: provide live frames from your service to visualize */
  incomingFrames = [],               // array of { ts, direction: 'in'|'out', hex }
  /** Optional: called when user clicks "Send" */
  onSendHex,                         // (hex: string) => Promise<void>|void
  /** Optional: used to persist history between mounts */
  storageKey = "mic3x2x_hex_manager_v1",
}) {
  const [input, setInput] = useState("68 6A F1 01 0C");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [history, setHistory] = useState([
    { ts: Date.now() - 30000, hex: "686AF1010C", meta: { mode: "none" } },
    { ts: Date.now() - 15000, hex: "22F190", meta: { mode: "xor8" } },
    { ts: Date.now() - 5000, hex: "0100", meta: { mode: "none" } }
  ]); // { ts, hex, meta }
  const [parsed, setParsed] = useState(null); // { bytes, info, checksum }
  const [error, setError] = useState("");

  const inbox = useRef([
    { ts: Date.now() - 25000, direction: "out", hex: "68 6A F1 01 0C" },
    { ts: Date.now() - 24000, direction: "in", hex: "68 EA F1 6A 41 0C BE 3F A8 13" },
    { ts: Date.now() - 10000, direction: "out", hex: "22 F1 90" },
    { ts: Date.now() - 9000, direction: "in", hex: "62 F1 90 57 42 41 4A 42 39 43" },
    { ts: Date.now() - 2000, direction: "out", hex: "01 00" },
    { ts: Date.now() - 1000, direction: "in", hex: "41 00 BE 3F A8 13" }
  ]);

  useEffect(() => {
    // merge incoming frames into a local buffer (de-dup simple)
    if (incomingFrames?.length) {
      inbox.current = [...inbox.current, ...incomingFrames].slice(-500);
    }
  }, [incomingFrames]);

  const normalizedInput = useMemo(
    () => normalizeHex(input, { uppercase: settings.uppercase }),
    [input, settings.uppercase]
  );

  const groupedInput = useMemo(
    () => bytesToHex(hexToBytesSafe(normalizedInput), { group: settings.group, uppercase: settings.uppercase }),
    [normalizedInput, settings.group, settings.uppercase]
  );

  useEffect(() => {
    // live parse & validate
    try {
      setError("");
      const bytes = hexToBytes(normalizedInput);
      const info = detectFrameInfo(bytes);
      let checksum = { ok: true, expected: null, actual: null };
      if (settings.autoValidate && settings.appendChecksum !== "none" && bytes.length >= 2) {
        checksum = validateChecksum(normalizedInput, settings.appendChecksum, settings.checksumScope);
      }
      setParsed({ bytes, info, checksum });
    } catch (e) {
      setParsed(null);
      setError(e?.message || "Invalid HEX");
    }
  }, [normalizedInput, settings.autoValidate, settings.appendChecksum, settings.checksumScope]);

  const send = useCallback(async () => {
    try {
      setError("");
      if (!normalizedInput) throw new Error("Nothing to send");
      const payload = buildPayload(normalizedInput, settings);
      if (typeof onSendHex === "function") {
        await onSendHex(payload);
      }
      setHistory((h) => [
        ...h,
        { ts: Date.now(), hex: payload, meta: { mode: settings.appendChecksum, scope: settings.checksumScope } },
      ].slice(-500));
      if (settings.echo) {
        inbox.current.push({ ts: Date.now(), direction: "out", hex: payload });
      }
      setInput("");
    } catch (e) {
      setError(e?.message || "Send failed");
    }
  }, [normalizedInput, settings, onSendHex]);

  const clear = useCallback(() => {
    setInput("");
    setError("");
    setParsed(null);
  }, []);

  const exportHistory = useCallback(() => {
    const blob = new Blob([JSON.stringify({ history, inbox: inbox.current }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hex_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const loadSample = useCallback((sample) => {
    setInput(sample);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-lg space-y-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">MIC3X2X HEX Format Manager</h3>
          <p className="text-sm text-gray-600">Build • Parse • Validate • Visualize</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
            onClick={exportHistory}
            title="Export history JSON"
          >
            📁 Export
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium"
            onClick={() => setHistory([])}
            title="Clear history"
          >
            🗑️ Clear
          </button>
        </div>
      </header>

      {/* Sample data buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => loadSample("01 00")}
          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
        >
          Sample: PIDs Supported
        </button>
        <button
          onClick={() => loadSample("22 F1 90")}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
        >
          Sample: Read VIN
        </button>
        <button
          onClick={() => loadSample("VT TP_RTS 255, 50, 1")}
          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
        >
          Sample: VT Command
        </button>
        <button
          onClick={() => loadSample("10 14 62 F1 90 57 42 41")}
          className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
        >
          Sample: ISO-TP First Frame
        </button>
      </div>

      {/* Input + controls */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <label className="text-sm font-medium text-gray-700">HEX Input</label>
          <textarea
            className="w-full min-h-[100px] rounded-lg bg-gray-50 border border-gray-300 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 68 6A F1 01 0C or VT TP_RTS 255, 50, 1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              ⚠️ {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
              onClick={send}
            >
              🚀 Send
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium"
              onClick={clear}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">Settings</label>
          <div className="rounded-lg border border-gray-300 p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span>Uppercase</span>
              <input
                type="checkbox"
                checked={settings.uppercase}
                onChange={(e) => setSettings((s) => ({ ...s, uppercase: e.target.checked }))}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Group bytes</span>
              <select
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                value={settings.group}
                onChange={(e) => setSettings((s) => ({ ...s, group: Number(e.target.value) }))}
              >
                <option value={1}>1 byte</option>
                <option value={2}>2 bytes</option>
                <option value={4}>4 bytes</option>
                <option value={8}>8 bytes</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Echo to inbox</span>
              <input
                type="checkbox"
                checked={settings.echo}
                onChange={(e) => setSettings((s) => ({ ...s, echo: e.target.checked }))}
                className="rounded"
              />
            </div>
            <hr className="border-gray-300" />
            <div className="flex items-center justify-between text-sm">
              <span>Auto validate</span>
              <input
                type="checkbox"
                checked={settings.autoValidate}
                onChange={(e) => setSettings((s) => ({ ...s, autoValidate: e.target.checked }))}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Checksum</span>
              <select
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                value={settings.appendChecksum}
                onChange={(e) => setSettings((s) => ({ ...s, appendChecksum: e.target.value }))}
              >
                <option value="none">None</option>
                <option value="xor8">XOR-8</option>
                <option value="add8">ADD-8</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Checksum scope</span>
              <select
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                value={settings.checksumScope}
                onChange={(e) => setSettings((s) => ({ ...s, checksumScope: e.target.value }))}
              >
                <option value="all">All bytes</option>
                <option value="payloadOnly">Payload only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <label className="text-sm font-medium text-gray-700">Preview (formatted)</label>
          <div className="min-h-[60px] rounded-lg bg-blue-50 border border-blue-200 p-3 font-mono text-sm flex items-center">
            <span className="text-blue-800">
              {groupedInput || <span className="text-gray-400">— Enter HEX data above —</span>}
            </span>
          </div>

          {parsed && (
            <div className="rounded-lg bg-gray-50 border border-gray-300 p-4 text-sm space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge>📏 {parsed.bytes.length} bytes</Badge>
                <Badge tone={parsed.info.type === "command" ? "note" : "default"}>
                  🔍 {parsed.info.type}
                </Badge>
                {parsed.info.isIsoTp && <Badge tone="note">🚗 ISO-TP</Badge>}
                {parsed.info.hints.map((h, i) => (
                  <Badge key={i} tone="note">💡 {h}</Badge>
                ))}
              </div>
              {settings.appendChecksum !== "none" && parsed.bytes.length >= 2 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-gray-600">Checksum validation:</span>
                  {parsed.checksum.ok ? (
                    <Badge tone="ok">✅ Valid (0x{fmtByte(parsed.checksum.expected)})</Badge>
                  ) : (
                    <Badge tone="error">
                      ❌ Invalid — got 0x{fmtByte(parsed.checksum.actual)}, expected 0x{fmtByte(parsed.checksum.expected)}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inbox */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700">Live Inbox</label>
          <div className="rounded-lg bg-black text-green-400 p-3 max-h-[240px] overflow-auto font-mono text-xs">
            {inbox.current.slice(-12).reverse().map((f, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <span className={`${f.direction === "out" ? "text-yellow-400" : "text-cyan-400"}`}>
                  {f.direction === "out" ? "→" : "←"}
                </span>
                <code className="flex-1 break-all">
                  {bytesToHex(hexToBytesSafe(normalizeHex(f.hex)), { group: 1 })}
                </code>
                <span className="text-gray-500 text-[10px]">{timeAgo(f.ts)}</span>
              </div>
            ))}
            {inbox.current.length === 0 && (
              <div className="text-gray-500">No frames yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Transmission History</label>
        <div className="rounded-lg bg-gray-50 border border-gray-300 p-3 max-h-[200px] overflow-auto">
          {history.length === 0 ? (
            <div className="text-sm text-gray-500">No transmissions yet.</div>
          ) : (
            history.slice().reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-200 last:border-0">
                <code className="font-mono text-sm text-gray-800 flex-1 break-all">{h.hex}</code>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {h.meta.mode !== "none" && <Badge tone="note">{h.meta.mode}</Badge>}
                  <span>{timeAgo(h.ts)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Small presentational bits
   ========================= */

function Badge({ children, tone = "default" }) {
  const palette = {
    default: "bg-gray-100 text-gray-700 border border-gray-300",
    ok: "bg-green-100 text-green-700 border border-green-300",
    error: "bg-red-100 text-red-700 border border-red-300",
    warn: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    note: "bg-blue-100 text-blue-700 border border-blue-300",
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${palette[tone] || palette.default}`}>{children}</span>;
}

/* =========================
   Local helpers
   ========================= */

function hexToBytesSafe(hex) {
  try {
    return hexToBytes(hex);
  } catch {
    return [];
  }
}

function fmtByte(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toString(16).toUpperCase().padStart(2, "0");
}

function timeAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}