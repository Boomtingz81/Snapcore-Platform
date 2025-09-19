// 📂 FILE: src/pages/SnapLabToolkit.jsx

import React, { useEffect, useMemo, useReducer, useState } from "react";

/** ---- Small helpers ----------------------------------------------------- */

const STORAGE_KEYS = {
  token: "snaplab.tesla.token",
  vehicleId: "snaplab.tesla.vehicleId",
};

const BASE_URL =
  import.meta?.env?.VITE_TESLA_API_URL?.replace(/\/$/, "") ||
  "https://owner-api.teslamotors.com/api/1"; // default

const now = () => new Date().toLocaleTimeString();

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** ---- Logs reducer (structured log items) ------------------------------- */

function logsReducer(state, action) {
  switch (action.type) {
    case "push":
      return [
        ...state,
        {
          id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
          time: now(),
          level: action.level || "info",
          title: action.title,
          data:
            typeof action.data === "string"
              ? action.data
              : JSON.stringify(action.data, null, 2),
        },
      ];
    case "clear":
      return [];
    default:
      return state;
  }
}

/** ---- Fetch with timeout & nicer errors -------------------------------- */

async function requestTesla({ token, endpoint, method = "GET", body, timeoutMs = 15000 }) {
  if (!token) throw new Error("Missing access token");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    let json;
    try {
      json = await res.json();
    } catch {
      json = { error: "Non-JSON response", status: res.status, statusText: res.statusText };
    }

    return { ok: res.ok, status: res.status, data: json };
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, status: 408, data: { error: "Request timeout" } };
    }
    return { ok: false, status: 0, data: { error: err?.message || "Network error" } };
  } finally {
    clearTimeout(timer);
  }
}

/** ---- UI ---------------------------------------------------------------- */

const row = { display: "flex", gap: 8, alignItems: "center", margin: "8px 0" };
const label = { width: 110, color: "#c7d2fe" };
const input = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #2a2f3a",
  background: "#1a1f29",
  color: "#e5e7eb",
  outline: "none",
};
const button = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #3a4152",
  background: "#1f2937",
  color: "#e5e7eb",
  cursor: "pointer",
};
const buttonPrimary = {
  ...button,
  background: "linear-gradient(90deg,#06b6d4,#7c3aed)",
  border: "none",
};
const badge = (ok) => ({
  display: "inline-block",
  fontSize: 12,
  padding: "2px 6px",
  borderRadius: 999,
  background: ok ? "#065f46" : "#7f1d1d",
  color: ok ? "#d1fae5" : "#fecaca",
});

/** ----------------------------------------------------------------------- */

export default function SnapLabToolkit() {
  const [accessToken, setAccessToken] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [loadingKey, setLoadingKey] = useState(null); // which action is loading
  const [showToken, setShowToken] = useState(false);
  const [logs, dispatch] = useReducer(logsReducer, []);

  // load persisted values
  useEffect(() => {
    setAccessToken(localStorage.getItem(STORAGE_KEYS.token) || "");
    setVehicleId(localStorage.getItem(STORAGE_KEYS.vehicleId) || "");
  }, []);

  // persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.token, accessToken || "");
  }, [accessToken]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.vehicleId, vehicleId || "");
  }, [vehicleId]);

  const canVehicleActions = useMemo(
    () => Boolean(accessToken && vehicleId && !loadingKey),
    [accessToken, vehicleId, loadingKey]
  );

  const log = (level, title, data) => dispatch({ type: "push", level, title, data });

  async function doCall(key, endpoint, method = "GET", body) {
    if (!accessToken) {
      alert("⚠️ Please enter an access token.");
      return;
    }
    setLoadingKey(key);
    log("info", `Call ${method} ${endpoint}`, { method, endpoint });

    const { ok, status, data } = await requestTesla({ token: accessToken, endpoint, method, body });

    if (ok) {
      log("success", `✅ ${method} ${endpoint} [${status}]`, data);
    } else {
      // helpful message
      const hint =
        status === 401
          ? "Unauthorized: token expired or invalid"
          : status === 404
          ? "Not found: check Vehicle ID / endpoint"
          : status === 408
          ? "Timeout: Tesla server took too long"
          : "Request failed";
      log("error", `❌ ${method} ${endpoint} [${status}] — ${hint}`, data);
    }
    setLoadingKey(null);
  }

  return (
    <div
      style={{
        background: "#0b1120",
        color: "#e5e7eb",
        padding: 20,
        borderRadius: 12,
        border: "1px solid #1f2937",
        maxWidth: 980,
        margin: "20px auto",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        🚀 SnapLabToolkit <span style={{ fontWeight: 400, color: "#93c5fd" }}>– Tesla API Tester</span>
      </h2>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
        Base URL: <code>{BASE_URL}</code>
      </div>

      {/* Token */}
      <div style={row}>
        <div style={label}>🔑 Access Token</div>
        <input
          type={showToken ? "text" : "password"}
          placeholder="Paste Tesla OAuth Access Token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value.trim())}
          style={input}
        />
        <button style={button} onClick={() => setShowToken((s) => !s)}>
          {showToken ? "Hide" : "Show"}
        </button>
        <button
          style={button}
          onClick={() => navigator.clipboard.writeText(accessToken || "")}
          disabled={!accessToken}
          title="Copy token"
        >
          Copy
        </button>
      </div>

      {/* Vehicle Id */}
      <div style={row}>
        <div style={label}>🚗 Vehicle ID</div>
        <input
          type="text"
          placeholder="Vehicle ID (optional for list)"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value.trim())}
          style={input}
        />
        <button style={button} onClick={() => setVehicleId("")} disabled={!vehicleId}>
          Clear
        </button>
      </div>

      {/* Actions */}
      <div style={{ ...row, flexWrap: "wrap", marginTop: 14 }}>
        <button
          style={buttonPrimary}
          disabled={!accessToken || !!loadingKey}
          onClick={() => doCall("list", "/vehicles")}
        >
          🔍 List Vehicles
        </button>

        <button
          style={button}
          disabled={!accessToken || !!loadingKey}
          onClick={() => doCall("wake", `/vehicles/${vehicleId || "0"}/wake_up`)}
          title="Wake vehicle (Vehicle ID required)"
        >
          🛌 Wake Up
        </button>

        <button
          style={button}
          disabled={!canVehicleActions}
          onClick={() => doCall("data", `/vehicles/${vehicleId}/vehicle_data`)}
        >
          📡 Get Vehicle Data
        </button>

        <button
          style={button}
          disabled={!canVehicleActions}
          onClick={() => doCall("unlock", `/vehicles/${vehicleId}/command/door_unlock`, "POST")}
        >
          🔓 Unlock Doors
        </button>

        <button
          style={button}
          disabled={!canVehicleActions}
          onClick={() => doCall("charge", `/vehicles/${vehicleId}/command/charge_start`, "POST")}
        >
          ⚡ Start Charging
        </button>

        <span style={{ marginLeft: "auto", fontSize: 12 }}>
          Status:{" "}
          <span style={badge(!loadingKey)}>
            {loadingKey ? `Running: ${loadingKey}` : "Idle"}
          </span>
        </span>
      </div>

      {/* Logs toolbar */}
      <div style={{ ...row, marginTop: 18 }}>
        <div style={{ fontWeight: 600 }}>📜 Logs</div>
        <button style={button} onClick={() => dispatch({ type: "clear" })} disabled={!logs.length}>
          Clear
        </button>
        <button
          style={button}
          onClick={() =>
            downloadText(
              "tesla-api-logs.txt",
              logs
                .map(
                  (l) =>
                    `[${l.time}] ${l.level.toUpperCase()} ${l.title}\n${l.data}\n`
                )
                .join("\n")
            )
          }
          disabled={!logs.length}
        >
          Export
        </button>
      </div>

      {/* Logs list */}
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1f2937",
          padding: 12,
          borderRadius: 10,
          maxHeight: 320,
          overflow: "auto",
          marginTop: 8,
        }}
      >
        {!logs.length ? (
          <p style={{ opacity: 0.7, margin: 0 }}>No logs yet.</p>
        ) : (
          logs
            .slice()
            .reverse()
            .map((log) => (
              <div key={log.id} style={{ borderBottom: "1px dashed #223046", padding: "8px 0" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <code style={{ opacity: 0.7 }}>{log.time}</code>
                  <span style={badge(log.level === "success")}>{log.level}</span>
                  <strong style={{ color: "#e2e8f0" }}>{log.title}</strong>
                </div>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: "#cbd5e1",
                    background: "#0b1222",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #1e293b",
                  }}
                >
                  {log.data}
                </pre>
              </div>
            ))
        )}
      </div>

      {/* CORS hint */}
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 10 }}>
        ⚠️ If requests fail due to CORS in your environment, route them through your backend
        (simple proxy) and keep tokens off the client in production.
      </div>
    </div>
  );
}
