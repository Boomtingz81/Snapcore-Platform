import React, { useState } from "react";

export default function SnapLabToolkit() {
  const [accessToken, setAccessToken] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (title, data) => {
    setLogs((prev) => [
      ...prev,
      {
        title,
        data: typeof data === "object" ? JSON.stringify(data, null, 2) : String(data),
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const fetchTeslaAPI = async (endpoint, method = "GET") => {
    if (!accessToken) {
      alert("⚠️ Please enter an access token first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://owner-api.teslamotors.com/api/1${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({ error: "Invalid JSON response" }));

      if (!response.ok) {
        addLog(`❌ Error (${method} ${endpoint})`, data);
      } else {
        addLog(`✅ Success (${method} ${endpoint})`, data);
      }
    } catch (error) {
      addLog("🚨 Fetch Error", { message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#111", color: "#fff", padding: "20px", borderRadius: "10px" }}>
      <h2>🚀 SnapLab Toolkit – Tesla API Tester</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>🔑 Access Token:</label>
        <input
          type="text"
          placeholder="Paste Tesla OAuth Access Token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>🚗 Vehicle ID:</label>
        <input
          type="text"
          placeholder="Enter Tesla Vehicle ID (optional)"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <button disabled={loading} onClick={() => fetchTeslaAPI("/vehicles")}>
          🔍 List Vehicles
        </button>{" "}
        <button disabled={loading || !vehicleId} onClick={() => fetchTeslaAPI(`/vehicles/${vehicleId}/vehicle_data`)}>
          📡 Get Vehicle Data
        </button>{" "}
        <button
          disabled={loading || !vehicleId}
          onClick={() => fetchTeslaAPI(`/vehicles/${vehicleId}/command/door_unlock`, "POST")}
        >
          🔓 Unlock Doors
        </button>{" "}
        <button
          disabled={loading || !vehicleId}
          onClick={() => fetchTeslaAPI(`/vehicles/${vehicleId}/command/charge_start`, "POST")}
        >
          ⚡ Start Charging
        </button>
      </div>

      <h3>📜 API Logs:</h3>
      <div
        style={{
          background: "#222",
          padding: "10px",
          borderRadius: "5px",
          maxHeight: "250px",
          overflowY: "auto",
        }}
      >
        {logs.length === 0 ? (
          <p>No logs yet.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ borderBottom: "1px solid #444", marginBottom: "10px" }}>
              <strong>{log.time} – {log.title}</strong>
              <pre style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>{log.data}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}