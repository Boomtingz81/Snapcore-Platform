// 📄 src/pages/SnapChargeData.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Battery,
  Zap,
  Clock,
  Navigation,
  TrendingUp,
  AlertCircle,
  Play,
  Pause,
  Download,
  Settings,
  Info,
  RotateCcw,
} from "lucide-react";

/**
 * Optional hardware service wire-up
 * - If you have MIC3X2XService, uncomment the import and set `USE_MIC3X2X = true`
 * - The code auto-falls back to Manual Mode if service is unavailable or errors.
 */
// import MIC3X2XService from "../services/MIC3X2XService";
const USE_MIC3X2X = false;

// ---------- Small utilities ----------
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const kmToMiles = (km) => km * 0.621371;
const milesToKm = (mi) => mi / 0.621371;

// CSV helper
const toCSV = (rows) => {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (s) =>
    String(s ?? "")
      .replace(/"/g, '""')
      .replace(/\n/g, " ");
  const head = headers.join(",");
  const body = rows.map((r) => headers.map((h) => `"${esc(r[h])}"`).join(","));
  return [head, ...body].join("\n");
};

// Exponential moving average for smoothing SOC slope
function useEMA(alpha = 0.4) {
  const ref = useRef(null);
  return useCallback(
    (sample) => {
      if (ref.current == null) {
        ref.current = sample;
      } else {
        ref.current = alpha * sample + (1 - alpha) * ref.current;
      }
      return ref.current;
    },
    [alpha]
  );
}

// Enhanced: Charge curve taper model
const estimateTaperFactor = (currentSoc, targetSoc) => {
  if (targetSoc <= 80) return 1.0;
  const avgSoc = (currentSoc + targetSoc) / 2;
  if (avgSoc < 80) return 1.0;
  if (avgSoc < 85) return 0.85;
  if (avgSoc < 90) return 0.7;
  if (avgSoc < 95) return 0.5;
  return 0.35;
};

// Enhanced: Format duration
const formatDuration = (hours) => {
  if (hours == null || !isFinite(hours) || hours < 0) return "—";
  if (hours < 0.017) return "< 1 min";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Enhanced: Calculate charging efficiency (rough heuristic)
const chargingEfficiency = (powerKW) => {
  if (powerKW >= 50) return 0.93;
  if (powerKW >= 22) return 0.91;
  if (powerKW >= 11) return 0.89;
  return 0.87;
};

// ---------- Main Component ----------
export default function SnapChargeData() {
  // Live / manual inputs
  const [hasHardware, setHasHardware] = useState(false);
  const [socPct, setSocPct] = useState(50);
  const [targetSoc, setTargetSoc] = useState(90);
  const [usableCapacityKWh, setUsableCapacityKWh] = useState(60);
  const [chargePowerKW, setChargePowerKW] = useState(""); // manual override
  const [consumptionWhPerKm, setConsumptionWhPerKm] = useState(170);
  const [units, setUnits] = useState("km"); // 'km' | 'mi'

  // Enhanced: Additional settings
  const [applyTaperModel, setApplyTaperModel] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sampleInterval, setSampleInterval] = useState(5000);
  const [historyRetentionMinutes, setHistoryRetentionMinutes] = useState(30);
  const [batteryTemperature, setBatteryTemperature] = useState(null);
  const [currentVoltage, setCurrentVoltage] = useState(null);

  // Live sampling & derived values
  const [sampling, setSampling] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastFetchAt, setLastFetchAt] = useState(null);

  // Session tracking
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionStartSoc, setSessionStartSoc] = useState(null);
  const [totalEnergyAdded, setTotalEnergyAdded] = useState(0);

  // Internal slope estimation state (pct/hour)
  const ema = useEMA(0.35);
  const prevSampleRef = useRef(null);
  const [socSlopePctPerHr, setSocSlopePctPerHr] = useState(null);

  // Historical data (for CSV export / charts if you add later)
  const [socHistory, setSocHistory] = useState([]); // {t, soc, kW, V?, T?}

  // Service reference
  const serviceRef = useRef(null);

  // --- Hardware / service bootstrap ---
  useEffect(() => {
    let cancelled = false;

    async function initHardware() {
      if (!USE_MIC3X2X) {
        setHasHardware(false);
        return;
      }
      try {
        // serviceRef.current = new MIC3X2XService({ proto: "AUTO", bus: "CAN", session: "default" });
        // await serviceRef.current.open();
        setHasHardware(true);
        setStatusMsg("Hardware ready (MIC3X2X).");
      } catch (err) {
        if (!cancelled) {
          setHasHardware(false);
          setErrorMsg(err?.message || "Failed to init MIC3X2X hardware");
        }
      }
    }

    initHardware();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Enhanced: Read multiple PIDs from OBD ---
  const readDataFromOBD = useCallback(async () => {
    /**
     * Example wiring (if your service supports requestPID):
     * const socResp = await serviceRef.current.requestPID({ mode: 0x01, pid: 0x5B });
     * const voltResp = await serviceRef.current.requestPID({ mode: 0x01, pid: 0x5C }); // EXAMPLE ONLY
     * const tempResp = await serviceRef.current.requestPID({ mode: 0x01, pid: 0x5D }); // EXAMPLE ONLY
     *
     * return {
     * soc: socResp?.data?.A ?? null, // 0–100 %
     * voltage: voltResp ? (voltResp.data.A * 256 + voltResp.data.B) * 0.01 : null,
     * temperature: tempResp?.data?.A != null ? (tempResp.data.A - 40) : null
     * };
     */

    // Fallback (manual mode): no data from OBD
    return {
      soc: null,
      voltage: null,
      temperature: null,
    };
  }, []);

  // --- Read SOC via Mode 01 PID 5B (or throw) ---
  const readSocFromOBD = useCallback(async () => {
    const data = await readDataFromOBD();

    if (data.voltage !== null) setCurrentVoltage(data.voltage);
    if (data.temperature !== null) setBatteryTemperature(data.temperature);

    const newSoc = data.soc;
    if (newSoc == null || Number.isNaN(newSoc)) {
      throw new Error("SOC (01 5B) not available");
    }
    return newSoc;
  }, [readDataFromOBD]);

  // --- Derived metrics (calculate before using in effects) ---
  const effectiveChargeRateKW = useMemo(() => {
    const manual = parseFloat(String(chargePowerKW).replace(",", "."));
    if (!Number.isNaN(manual) && manual > 0) return manual;

    // Derive from SOC slope if available
    if (socSlopePctPerHr != null && usableCapacityKWh > 0) {
      const kW = (socSlopePctPerHr / 100) * usableCapacityKWh;
      if (kW > 0) return kW;
    }
    return null;
  }, [chargePowerKW, socSlopePctPerHr, usableCapacityKWh]);

  const eff = useMemo(
    () => chargingEfficiency(effectiveChargeRateKW ?? 0),
    [effectiveChargeRateKW]
  );

  // Estimate hours to reach a given target SOC from current SOC at kW, capacity kWh
  const estimateHoursTo = useCallback(
    (fromSoc, toSoc) => {
      const kW = effectiveChargeRateKW;
      if (kW == null || kW <= 0 || usableCapacityKWh <= 0) return null;

      const deltaPct = clamp(toSoc - fromSoc, 0, 100);
      if (deltaPct === 0) return 0;

      // base time ignoring taper & losses
      const energyNeededKWh = (deltaPct / 100) * usableCapacityKWh;
      let hours = energyNeededKWh / kW;

      // apply taper and efficiency (losses)
      const taper = applyTaperModel ? estimateTaperFactor(fromSoc, toSoc) : 1;
      const effLoss = eff > 0 ? 1 / eff : 1; // charging overhead
      return hours * (1 / taper) * effLoss;
    },
    [effectiveChargeRateKW, usableCapacityKWh, applyTaperModel, eff]
  );

  const hoursToTarget = useMemo(
    () => estimateHoursTo(socPct, targetSoc),
    [estimateHoursTo, socPct, targetSoc]
  );
  const hoursToFull = useMemo(
    () => estimateHoursTo(socPct, 100),
    [estimateHoursTo, socPct]
  );

  // Range estimate from SOC and consumption
  const estimatedRangeKm = useMemo(() => {
    if (usableCapacityKWh <= 0 || consumptionWhPerKm <= 0) return null;
    const energyLeftKWh = (socPct / 100) * usableCapacityKWh;
    const km = (energyLeftKWh * 1000) / consumptionWhPerKm; // Wh / (Wh/km) = km
    return km;
  }, [usableCapacityKWh, consumptionWhPerKm, socPct]);

  const estimatedRangeDisplay = useMemo(() => {
    if (estimatedRangeKm == null) return "—";
    const km = estimatedRangeKm;
    return units === "mi" ? `${round(kmToMiles(km), 1)} mi` : `${round(km, 1)} km`;
  }, [estimatedRangeKm, units]);

  // --- Enhanced: Sampling timer with history tracking ---
  useEffect(() => {
    if (!sampling) return;

    let active = true;
    setStatusMsg("Sampling SOC…");

    const tick = async () => {
      if (!active) return;

      try {
        let newSoc = null;
        if (hasHardware) {
          newSoc = await readSocFromOBD();
        } else {
          // Manual mode “auto-advance” if user filled power + capacity
          const kW = effectiveChargeRateKW;
          if (kW && usableCapacityKWh > 0) {
            const pctPerHour = (kW / usableCapacityKWh) * 100; // %/hr
            const pctPerMs = pctPerHour / 3600000;
            const now = Date.now();
            const prev = prevSampleRef.current?.t ?? now;
            const dt = now - prev;
            newSoc = clamp(
              (prevSampleRef.current?.soc ?? socPct) + dt * pctPerMs,
              0,
              100
            );
          } else {
            newSoc = socPct; // flat if we don't have enough info
          }
        }

        // slope calc
        const now = Date.now();
        const prev = prevSampleRef.current;
        if (prev) {
          const dPct = newSoc - prev.soc;
          const dHr = (now - prev.t) / 3600000;
          if (dHr > 0 && Math.abs(dPct) >= 0) {
            const inst = dPct / dHr; // % / hr
            const smoothed = ema(inst);
            setSocSlopePctPerHr(smoothed);
            // energy added (if positive SOC and charging)
            if (smoothed > 0 && usableCapacityKWh > 0) {
              const kWinst = (smoothed / 100) * usableCapacityKWh;
              setTotalEnergyAdded((e) => e + kWinst * dHr); // kWh
            }
          }
        }
        prevSampleRef.current = { t: now, soc: newSoc };
        setSocPct(round(newSoc, 2));
        setLastFetchAt(new Date(now));

        // push to history & prune
        setSocHistory((arr) => {
          const next = [
            ...arr,
            {
              t: now,
              soc: round(newSoc, 2),
              kW: effectiveChargeRateKW ?? null,
              voltage: currentVoltage,
              tempC: batteryTemperature,
            },
          ];
          const cutoff = now - historyRetentionMinutes * 60000;
          return next.filter((r) => r.t >= cutoff);
        });

        setErrorMsg("");
      } catch (e) {
        setErrorMsg(e?.message || "Sampling error");
      } finally {
        if (active) setTimeout(tick, Math.max(750, sampleInterval));
      }
    };

    // start session clock if first time
    if (!sessionStartTime) setSessionStartTime(new Date());
    if (sessionStartSoc == null) setSessionStartSoc(socPct);

    tick();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sampling,
    hasHardware,
    sampleInterval,
    effectiveChargeRateKW,
    usableCapacityKWh,
    historyRetentionMinutes,
  ]);

  // --- Controls ---
  const toggleSampling = useCallback(() => {
    setSampling((s) => !s);
    setStatusMsg((s) => (s ? "" : "Sampling SOC…"));
  }, []);

  const resetSession = useCallback(() => {
    setSampling(false);
    setStatusMsg("");
    setErrorMsg("");
    setSocHistory([]);
    setSessionStartSoc(null);
    setSessionStartTime(null);
    prevSampleRef.current = null;
    setTotalEnergyAdded(0);
    setSocSlopePctPerHr(null);
  }, []);

  // --- Exports ---
  const exportJSON = useCallback(() => {
    const payload = {
      meta: {
        at: new Date().toISOString(),
        hardware: hasHardware,
        sampleIntervalMs: sampleInterval,
        capacityKWh: usableCapacityKWh,
        manualPowerKW: chargePowerKW || null,
        efficiency: eff,
        slopePctPerHr: socSlopePctPerHr,
        sessionStart: sessionStartTime?.toISOString() || null,
      },
      samples: socHistory,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapcharge_session_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    hasHardware,
    sampleInterval,
    usableCapacityKWh,
    chargePowerKW,
    eff,
    socSlopePctPerHr,
    sessionStartTime,
    socHistory,
  ]);

  const exportCSV = useCallback(() => {
    const rows = socHistory.map((r) => ({
      time_iso: new Date(r.t).toISOString(),
      soc_pct: r.soc,
      power_kW: r.kW ?? "",
      voltage_V: r.voltage ?? "",
      temp_C: r.tempC ?? "",
    }));
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snapcharge_session_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [socHistory]);

  // --- UI helpers ---
  const badge = (txt, tone = "default") => {
    const tones = {
      default: "bg-white/10 text-white",
      ok: "bg-emerald-500/20 text-emerald-300",
      warn: "bg-amber-500/20 text-amber-300",
      err: "bg-rose-500/20 text-rose-300",
      info: "bg-sky-500/20 text-sky-300",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${tones[tone] || tones.default}`}>
        {txt}
      </span>
    );
  };

  const sessionDurationHrs = useMemo(() => {
    if (!sessionStartTime) return 0;
    const now = lastFetchAt || new Date();
    return (now - sessionStartTime) / 3600000;
  }, [lastFetchAt, sessionStartTime]);

  const avgPowerKW = useMemo(() => {
    if (sessionDurationHrs <= 0 || totalEnergyAdded <= 0) return 0;
    return totalEnergyAdded / sessionDurationHrs;
  }, [totalEnergyAdded, sessionDurationHrs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Battery size={18} /> SnapChargeData
          </h2>
          <p className="text-sm opacity-70">
            Live SOC analysis via{" "}
            <code className="px-1 rounded bg-white/10">01 5B</code>, time-to-charge, and range estimate.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleSampling}
            className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm flex items-center gap-1"
            title={sampling ? "Pause" : "Start sampling"}
          >
            {sampling ? <Pause size={16} /> : <Play size={16} />}
            {sampling ? "Pause" : "Start"}
          </button>
          <button
            onClick={resetSession}
            className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm flex items-center gap-1"
            title="Reset session"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm flex items-center gap-1"
            title="Export CSV"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm flex items-center gap-1"
            title="Export JSON"
          >
            <Download size={16} />
            JSON
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-wrap items-center gap-2">
        {badge(hasHardware ? "Hardware: MIC3X2X" : "Manual mode", hasHardware ? "ok" : "info")}
        {badge(`SOC: ${round(socPct, 1)}%`, "info")}
        {badge(
          `Rate: ${
            effectiveChargeRateKW ? `${round(effectiveChargeRateKW, 2)} kW` : "—"
          }`,
          effectiveChargeRateKW ? "ok" : "warn"
        )}
        {badge(
          `Slope ~ ${socSlopePctPerHr != null ? round(socSlopePctPerHr, 2) : "—"} %/h`,
          socSlopePctPerHr > 0 ? "ok" : "info"
        )}
        {badge(`Last: ${lastFetchAt ? lastFetchAt.toLocaleTimeString() : "—"}`, "default")}
      </div>

      {statusMsg && (
        <div className="text-sm text-sky-300 bg-sky-500/10 border border-sky-500/30 p-3 rounded flex items-center gap-2">
          <Info size={16} /> {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 p-3 rounded flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg p-4 bg-black/20 border border-white/10 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings size={16} /> Vehicle / Charging
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm opacity-80">
              Usable capacity (kWh)
              <input
                type="number"
                min={1}
                step="0.1"
                className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                value={usableCapacityKWh}
                onChange={(e) =>
                  setUsableCapacityKWh(clamp(parseFloat(e.target.value) || 0, 0, 200))
                }
              />
            </label>

            <label className="text-sm opacity-80">
              SOC (%)
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                value={socPct}
                onChange={(e) => setSocPct(clamp(parseFloat(e.target.value) || 0, 0, 100))}
              />
            </label>

            <label className="text-sm opacity-80">
              Target SOC (%)
              <input
                type="number"
                min={0}
                max={100}
                step="1"
                className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                value={targetSoc}
                onChange={(e) => setTargetSoc(clamp(parseFloat(e.target.value) || 0, 0, 100))}
              />
            </label>

            <label className="text-sm opacity-80">
              Charge power (kW)
              <input
                type="number"
                min={0}
                step="0.1"
                placeholder="auto from slope"
                className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                value={chargePowerKW}
                onChange={(e) => setChargePowerKW(e.target.value)}
              />
            </label>

            <label className="text-sm opacity-80">
              Consumption (Wh/km)
              <input
                type="number"
                min={50}
                step="1"

className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                value={consumptionWhPerKm}
                onChange={(e) =>
                  setConsumptionWhPerKm(clamp(parseFloat(e.target.value) || 0, 50, 1000))
                }
              />
            </label>

            <label className="text-sm opacity-80">
              Units
              <select
                className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              >
                <option value="km">Kilometres</option>
                <option value="mi">Miles</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={applyTaperModel}
                onChange={(e) => setApplyTaperModel(e.target.checked)}
              />
              Apply taper model (80–100%)
            </label>

            <button
              className="text-sm opacity-80 underline"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? "Hide" : "Show"} advanced
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <label className="text-sm opacity-80">
                Sample interval (ms)
                <input
                  type="number"
                  min={500}
                  step="100"
                  value={sampleInterval}
                  onChange={(e) =>
                    setSampleInterval(clamp(parseInt(e.target.value) || 0, 200, 60000))
                  }
                  className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                />
              </label>

              <label className="text-sm opacity-80">
                History retention (min)
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={historyRetentionMinutes}
                  onChange={(e) =>
                    setHistoryRetentionMinutes(clamp(parseInt(e.target.value) || 0, 1, 240))
                  }
                  className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                />
              </label>

              <label className="text-sm opacity-80">
                Battery temperature (°C)
                <input
                  type="number"
                  step="0.1"
                  value={batteryTemperature ?? ""}
                  onChange={(e) =>
                    setBatteryTemperature(
                      e.target.value === "" ? null : parseFloat(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                />
              </label>

              <label className="text-sm opacity-80">
                Pack voltage (V)
                <input
                  type="number"
                  step="0.1"
                  value={currentVoltage ?? ""}
                  onChange={(e) =>
                    setCurrentVoltage(
                      e.target.value === "" ? null : parseFloat(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded bg-black/30 border border-white/10 px-2 py-1"
                />
              </label>
            </div>
          )}
        </div>

        {/* Outputs */}
        <div className="rounded-lg p-4 bg-black/20 border border-white/10 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp size={16} /> Estimates
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-black/30 border border-white/10 p-3">
              <div className="opacity-70 flex items-center gap-2">
                <Zap size={14} /> Live charge rate
              </div>
              <div className="text-lg font-semibold mt-1">
                {effectiveChargeRateKW ? `${round(effectiveChargeRateKW, 2)} kW` : "—"}
              </div>
              <div className="opacity-60 mt-1 text-xs">
                Efficiency est: {round(eff * 100, 0)}%
              </div>
            </div>

           <div className="rounded bg-black/30 border border-white/10 p-3">
              <div className="opacity-70 flex items-center gap-2">
                <Clock size={14} /> Time to target ({targetSoc}%)
              </div>
              <div className="text-lg font-semibold mt-1">
                {formatDuration(hoursToTarget)}
              </div>
              <div className="opacity-60 mt-1 text-xs">
                to full: {formatDuration(hoursToFull)}
              </div>
            </div>

            <div className="rounded bg-black/30 border border-white/10 p-3">
              <div className="opacity-70 flex items-center gap-2">
                <Navigation size={14} /> Estimated range
              </div>
              <div className="text-lg font-semibold mt-1">
                {estimatedRangeDisplay}
              </div>
              <div className="opacity-60 mt-1 text-xs">
                Based on {consumptionWhPerKm} Wh/km
              </div>
            </div>

            <div className="rounded bg-black/30 border border-white/10 p-3">
              <div className="opacity-70 flex items-center gap-2">
                <Info size={14} /> Session stats
              </div>
              <div className="text-lg font-semibold mt-1">
                {round(totalEnergyAdded, 2)} kWh added
              </div>
              <div className="opacity-60 mt-1 text-xs">
                Avg power: {round(avgPowerKW, 2)} kW · Duration:{" "}
                {formatDuration(sessionDurationHrs)}
              </div>
            </div>
          </div>

          {batteryTemperature != null || currentVoltage != null ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {batteryTemperature != null && (
                <div className="rounded bg-black/30 border border-white/10 p-3">
                  <div className="opacity-70">Battery temp</div>
                  <div className="text-lg font-semibold mt-1">
                    {round(batteryTemperature, 1)} °C
                  </div>
                </div>
              )}
              {currentVoltage != null && (
                <div className="rounded bg-black/30 border border-white/10 p-3">
                  <div className="opacity-70">Pack voltage</div>
                  <div className="text-lg font-semibold mt-1">
                    {round(currentVoltage, 1)} V
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Tiny history table (you can replace with a chart later) */}
      <div className="rounded-lg p-4 bg-black/20 border border-white/10">
        <h3 className="font-semibold mb-2">Recent samples</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left opacity-70">
              <tr>
                <th className="py-1 pr-3">Time</th>
                <th className="py-1 pr-3">SOC %</th>
                <th className="py-1 pr-3">kW</th>
                <th className="py-1 pr-3">V</th>
                <th className="py-1 pr-3">Temp °C</th>
              </tr>
            </thead>
            <tbody className="opacity-90">
              {socHistory.slice(-10).map((r) => (
                <tr key={r.t}>
                  <td className="py-1 pr-3">{new Date(r.t).toLocaleTimeString()}</td>
                  <td className="py-1 pr-3 font-mono">{r.soc}</td>
                  <td className="py-1 pr-3 font-mono">{r.kW ?? "—"}</td>
                  <td className="py-1 pr-3 font-mono">{r.voltage ?? "—"}</td>
                  <td className="py-1 pr-3 font-mono">{r.tempC ?? "—"}</td>
                </tr>
              ))}
              {socHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-2 opacity-60">
                    No samples yet. Click <em>Start</em> to begin sampling or enter values
                    manually.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs opacity-60">
        Notes: SOC from OBD-II Mode 01 PID 5B when available. Time-to-charge uses a heuristic
        taper model and an efficiency estimate based on charge power — real vehicles may differ.
      </p>
    </div>
  );
}
