// ✅ diagnosticService.js – Handles all OBD API calls (refined, backward compatible)

/* -----------------------------------------------------------------------------
  BASE_URL resolution (Vite, CRA, Node) + normalization
----------------------------------------------------------------------------- */
const env = (k, fallback) => {
  // Vite style
  if (typeof import.meta !== "undefined" && import.meta.env && k in import.meta.env) {
    return import.meta.env[k] ?? fallback;
  }
  // CRA / Node style
  if (typeof process !== "undefined" && process.env && k in process.env) {
    return process.env[k] ?? fallback;
  }
  return fallback;
};

const RAW_BASE_URL =
  env("VITE_OBD_URL", undefined) ||
  env("REACT_APP_OBD_URL", undefined) ||
  env("OBD_URL", undefined) ||
  "http://localhost:5000";

const BASE_URL = RAW_BASE_URL.replace(/\/+$/, ""); // no trailing slash

// Cookie / credential toggle if your API uses session cookies
const WITH_CREDENTIALS =
  String(env("VITE_OBD_WITH_CREDENTIALS", env("REACT_APP_OBD_WITH_CREDENTIALS", "false"))).toLowerCase() ===
  "true";

/* -----------------------------------------------------------------------------
  Utilities
----------------------------------------------------------------------------- */

/** @typedef {{ ok: true, data: any } | { ok: false, error: string, status?: number }} FetchResult */

/**
 * Build absolute URL for an endpoint (accepts leading `/` or not)
 * @param {string} endpoint
 */
const buildURL = (endpoint) => `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

/**
 * Parse JSON safely
 * @param {Response} res
 */
const safeJSON = async (res) => {
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response");
  }
};

/**
 * Core fetch with timeout + retries
 * @param {"GET"|"POST"} method
 * @param {string} endpoint
 * @param {object} [opts]
 * @param {number} [opts.retries=2]
 * @param {number} [opts.timeout=8000]
 * @param {any}    [opts.body]
 * @returns {Promise<FetchResult>}
 */
const coreFetch = async (method, endpoint, opts = {}) => {
  const {
    retries = 2,
    timeout = 8000,
    body,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const fetchOnce = async () => {
    try {
      const res = await fetch(buildURL(endpoint), {
        method,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        ...(WITH_CREDENTIALS ? { credentials: "include" } : {}),
        ...(method === "POST" && body != null ? { body: JSON.stringify(body) } : {}),
      });

      clearTimeout(timer);

      if (!res.ok) {
        const status = res.status;
        let message = `HTTP ${status} - ${res.statusText}`;
        // try to extract error payload
        try {
          const maybeJSON = await res.clone().json();
          if (maybeJSON?.error) message = `${message}: ${maybeJSON.error}`;
        } catch {}
        return { ok: false, error: message, status };
      }

      const data = await safeJSON(res);
      return { ok: true, data };
    } catch (err) {
      clearTimeout(timer);
      const message = err?.name === "AbortError" ? "Request timed out" : err?.message || "Network error";
      return { ok: false, error: message };
    }
  };

  let attempt = 0;
  // simple retry loop
  while (attempt <= retries) {
    const result = await fetchOnce();
    if (result.ok) return result;

    attempt++;
    if (attempt > retries) return result;

    // Small backoff
    await new Promise((r) => setTimeout(r, 400 * attempt));
    console.warn(`🔄 Retry ${attempt}/${retries} for ${endpoint} (${result.error})`);
  }

  // fallback (should never hit)
  return { ok: false, error: "Unknown fetch error" };
};

/** GET helper */
const getJSON = (endpoint, opts) => coreFetch("GET", endpoint, opts);

/** POST helper */
const postJSON = (endpoint, body, opts) => coreFetch("POST", endpoint, { ...opts, body });

/** Normalize common return shape when caller expects plain object or array */
const unwrap = (result, fallbackError) => {
  if (result.ok) return result.data;
  return { error: result.error || fallbackError };
};

/* -----------------------------------------------------------------------------
  Public API (kept backward compatible)
----------------------------------------------------------------------------- */

/**
 * ✅ Check OBD Connection Status
 * @returns {Promise<{connected:boolean} | {connected:false, error:string}>}
 */
export const getConnectionStatus = async () => {
  const result = await getJSON("/status");
  if (!result.ok) return { connected: false, error: result.error };
  const data = result.data;
  return data?.connected !== undefined
    ? { connected: Boolean(data.connected), ...data }
    : { connected: false, error: "Malformed /status response" };
};

/**
 * ✅ Get Live OBD Readings
 * @returns {Promise<object | {error:string}>}
 */
export const getReadings = async () => {
  const result = await getJSON("/readings");
  return unwrap(result, "Failed to retrieve readings");
};

/**
 * ✅ Get Diagnostic Trouble Codes (DTCs)
 * @returns {Promise<any[] | {error:string}>}
 */
export const getDTCs = async () => {
  const result = await getJSON("/dtcs");
  if (result.ok && Array.isArray(result.data)) return result.data;
  return unwrap(result, "Failed to retrieve DTCs");
};

/**
 * ✅ Send Custom OBD Command
 * @param {string} command - e.g., "010C" for RPM
 * @returns {Promise<object | {error:string}>}
 */
export const sendOBDCommand = async (command) => {
  if (!command || typeof command !== "string") {
    return { error: "Command must be a non-empty string" };
  }
  const result = await postJSON("/command", { command });
  return unwrap(result, "Command failed");
};

/**
 * ✅ Create WebSocket Connection for Real-time OBD Data
 *  - Auto-retry (exponential backoff up to 3)
 *  - Heartbeat ping every 15s to keep proxies alive
 *  - Still returns the WebSocket instance for full backward compatibility
 *
 * @param {(msg:any)=>void} onMessage
 * @param {(err:any)=>void} [onError]
 * @returns {WebSocket|null}
 */
export const createOBDSocket = (onMessage, onError) => {
  let retries = 0;
  let ws;
  let heartbeatTimer;

  const wsUrl = buildURL("/ws").replace(/^http/i, "ws");

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping", t: Date.now() }));
        }
      } catch {}
    }, 15000);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const connect = () => {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        retries = 0;
        startHeartbeat();
        console.info("🔌 OBD WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onMessage?.(parsed);
        } catch {
          // allow non-JSON payloads if your server sometimes streams text
          onMessage?.(event.data);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        onError?.(err);
      };

      ws.onclose = () => {
        stopHeartbeat();
        console.warn("⚠️ WebSocket closed");
        if (retries < 3) {
          retries++;
          const backoff = Math.min(3000 * retries, 8000);
          console.warn(`🔄 Retrying WebSocket in ${Math.round(backoff / 1000)}s… (${retries}/3)`);
          setTimeout(connect, backoff);
        }
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket:", error.message);
    }
  };

  connect();
  return ws || null;
};

/* -----------------------------------------------------------------------------
  Default export (unchanged shape)
----------------------------------------------------------------------------- */
export default {
  getConnectionStatus,
  getReadings,
  getDTCs,
  sendOBDCommand,
  createOBDSocket,
};
