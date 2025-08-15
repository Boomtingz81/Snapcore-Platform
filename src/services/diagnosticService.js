// ✅ diagnosticService.js – Handles all OBD API calls

const BASE_URL = process.env.REACT_APP_OBD_URL || "http://localhost:5000"; 
// ⬆️ Uses environment variable if available

/**
 * ✅ Generic Fetch Helper
 * Handles timeout, retries, and JSON parsing
 */
const fetchData = async (endpoint, retries = 2, timeout = 5000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    console.info(`📡 Fetching: ${BASE_URL}${endpoint}`);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    let jsonData;
    try {
      jsonData = await response.json();
    } catch {
      throw new Error("Invalid JSON response");
    }

    console.info(`✅ Success: ${endpoint}`, jsonData);
    return jsonData;
  } catch (error) {
    clearTimeout(timer);
    console.error(`❌ Error fetching ${endpoint}:`, error.message);

    if (retries > 0) {
      console.warn(`🔄 Retrying ${endpoint}... (${retries} retries left)`);
      return fetchData(endpoint, retries - 1, timeout);
    }

    return {
      error:
        error.name === "AbortError"
          ? "Request timed out"
          : error.message || "Unknown error",
    };
  }
};

/**
 * ✅ Ensures consistent API response
 */
const validateData = (data, fallbackError) => {
  if (data && typeof data === "object" && !data.error) {
    return data;
  }
  return { error: data?.error || fallbackError };
};

/**
 * ✅ Check OBD Connection Status
 */
export const getConnectionStatus = async () => {
  const data = await fetchData("/status");
  return data?.connected !== undefined
    ? { connected: Boolean(data.connected), ...data }
    : { connected: false, error: data?.error || "Unknown error" };
};

/**
 * ✅ Get Live OBD Readings
 */
export const getReadings = async () => {
  const data = await fetchData("/readings");
  return validateData(data, "Failed to retrieve readings");
};

/**
 * ✅ Get Diagnostic Trouble Codes (DTCs)
 */
export const getDTCs = async () => {
  const data = await fetchData("/dtcs");
  return Array.isArray(data)
    ? data
    : validateData(data, "Failed to retrieve DTCs");
};

/**
 * ✅ Send Custom OBD Command (NEW)
 * @param {string} command - e.g., "010C" for RPM
 * @returns {Promise<object>} - Response or error
 */
export const sendOBDCommand = async (command) => {
  try {
    const response = await fetch(`${BASE_URL}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error sending OBD command:", error.message);
    return { error: error.message || "Command failed" };
  }
};

/**
 * ✅ Create WebSocket Connection for Real-time OBD Data
 * Includes auto-retry up to 3 times
 */
export const createOBDSocket = (onMessage, onError) => {
  let retries = 0;
  let ws;

  const connect = () => {
    try {
      const wsUrl = BASE_URL.replace(/^http/, "ws") + "/ws";
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        retries = 0;
        console.info("🔌 WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMessage?.(parsed);
        } catch {
          console.warn("⚠️ Non-JSON message received:", event.data);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        onError?.(err);
      };

      ws.onclose = () => {
        console.warn("⚠️ WebSocket closed");
        if (retries < 3) {
          retries++;
          console.warn(`🔄 Retrying WebSocket in 3s... (${retries}/3)`);
          setTimeout(connect, 3000);
        }
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket:", error.message);
    }
  };

  connect();
  return ws || null;
};

/**
 * ✅ Centralized Export
 */
export default {
  getConnectionStatus,
  getReadings,
  getDTCs,
  sendOBDCommand, // 🔥 Added new feature
  createOBDSocket,
};
