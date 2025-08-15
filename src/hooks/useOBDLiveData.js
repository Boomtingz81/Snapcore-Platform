// ✅ useOBDLiveData.js – Hook for live OBD updates (now with pidRegistry support)
import { useState, useEffect, useRef } from "react";
import diagnosticService from "./diagnosticService";
import { pidMap } from "../utils/pidMap";          // ✅ Existing static map
import { getAllPidData } from "../utils/pidRegistry"; // ✅ NEW – Registry-based PIDs

// ✅ Merge registry-based PIDs with the local pidMap (registry always overrides)
const combinedPidMap = { ...pidMap };
getAllPidData().forEach((pid) => {
  combinedPidMap[pid.hex] = {
    name: pid.name,
    formula: pid.formula,
  };
});

// ✅ Parse raw ECU data safely
function parseOBDReadings(raw) {
  const readings = {};

  for (const [pidHex, { name, formula }] of Object.entries(combinedPidMap)) {
    const pid = parseInt(pidHex);
    const A = raw?.[`A${pid.toString(16).toUpperCase()}`];
    const B = raw?.[`B${pid.toString(16).toUpperCase()}`];
    const C = raw?.[`C${pid.toString(16).toUpperCase()}`];
    const D = raw?.[`D${pid.toString(16).toUpperCase()}`];

    try {
      readings[name] = formula(A ?? 0, B ?? 0, C ?? 0, D ?? 0);
    } catch {
      readings[name] = "--";
    }
  }

  return readings;
}

export default function useOBDLiveData(
  pollInterval = 3000,
  { onReadingsUpdate, onDTCsUpdate } = {}
) {
  const [data, setData] = useState({ readings: null, dtcs: null });
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null,
  });

  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const retryRef = useRef(0);

  useEffect(() => {
    let isWebSocketActive = false;

    // ✅ 1. Check connection first
    diagnosticService
      .getConnectionStatus()
      .then((res) =>
        setStatus({ connected: res.connected, loading: false, error: null })
      )
      .catch((err) =>
        setStatus({ connected: false, loading: false, error: err.message })
      );

    // ✅ 2. WebSocket connect with retry
    const connectWebSocket = () => {
      wsRef.current = diagnosticService.createOBDSocket(
        (msg) => {
          isWebSocketActive = true;
          retryRef.current = 0; // ✅ Reset retry count

          const parsedReadings = msg.readings
            ? parseOBDReadings(msg.readings)
            : null;

          setData((prev) => ({
            ...prev,
            readings: parsedReadings || prev.readings,
            dtcs: msg.dtcs || prev.dtcs,
          }));

          if (parsedReadings && onReadingsUpdate) onReadingsUpdate(parsedReadings);
          if (msg.dtcs && onDTCsUpdate) onDTCsUpdate(msg.dtcs);
        },
        () => {
          console.warn("⚠️ WebSocket failed. Retrying in 5s...");
          isWebSocketActive = false;
          if (retryRef.current < 3) {
            retryRef.current++;
            setTimeout(connectWebSocket, 5000);
          } else {
            console.warn("⚠️ Max retries reached. Falling back to polling.");
          }
        }
      );
    };

    connectWebSocket();

    // ✅ 3. Polling fallback
    pollRef.current = setInterval(async () => {
      if (!isWebSocketActive) {
        try {
          const rawReadings = await diagnosticService.getReadings();
          const dtcs = await diagnosticService.getDTCs();
          const parsedReadings = parseOBDReadings(rawReadings);

          setData((prev) => ({
            ...prev,
            readings: parsedReadings,
            dtcs,
          }));

          if (parsedReadings && onReadingsUpdate) onReadingsUpdate(parsedReadings);
          if (dtcs && onDTCsUpdate) onDTCsUpdate(dtcs);
        } catch (err) {
          console.error("❌ Polling failed:", err);
        }
      }
    }, pollInterval);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollInterval, onReadingsUpdate, onDTCsUpdate]);

  return { data, status };
}
