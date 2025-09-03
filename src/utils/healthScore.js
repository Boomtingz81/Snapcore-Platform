// 📂 FILE: src/utils/healthScore.js
// Production-ready health scoring with caching, monitoring, deep-merge config, and robust analytics.

/** @typedef {"DTC"|"LIVE"} EntryKind */
/** @typedef {"crit"|"warn"|"ok"|"unknown"} Sev */
/**
 * @typedef {{ t:number, v:number, severity?: Sev }} SeriesPoint
 * @typedef {{
 * kind: EntryKind,
 * id?: string,
 * title?: string,
 * severity?: Sev,
 * key?: string,
 * value?: number,
 * unit?: string,
 * series?: SeriesPoint[],
 * timestamp?: number,
 * source?: string,
 * category?: string
 * }} Entry
 *
 * @typedef {{
 * cleanSessionStreak?: number,
 * dtcHistoryDepthDays?: number,
 * recentSessionCount?: number,
 * uptimeRatio?: number, // 0..1
 * sensorCoverage?: number, // 0..1
 * drivingPenalty?: number,
 * avgTripDuration?: number,
 * harshEventCount?: number,
 * fuelEfficiencyTrend?: number // -1 to 1
 * }} History
 *
 * @typedef {{
 * label?: string,
 * severity?: Sev,
 * overdueDays?: number,
 * category?: string,
 * estimatedCost?: number
 * }} MaintenanceItem
 *
 * @typedef {{
 * score: number,
 * confidence: number,
 * contributors: Array<{label: string, delta: number, type: string, severity: Sev}>,
 * band: string,
 * breakdown: object,
 * metadata: object,
 * recommendations?: Array<{priority: string, action: string, rationale: string}>
 * }} HealthScoreResult
 */

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const now = () => (globalThis.performance?.now ? performance.now() : Date.now());

// ---------- Performance & caching ----------
const PERF_TRACKER = {
  calls: 0,
  totalTime: 0,
  cacheHits: 0,
  reset() { this.calls = this.totalTime = this.cacheHits = 0; }
};

const VOLATILITY_CACHE = new Map();
const CACHE_TTL = 60_000; // 1 minute

// ---------- Config ----------
const DEFAULT_CONFIG = Object.freeze({
  logging: { enabled: true, level: "warn" }, // 'debug' | 'info' | 'warn' | 'error'
  performance: { enableCache: true, maxCacheSize: 1000, enableTiming: true },
  penalties: {
    dtc: {
      crit: 12, warn: 5, ok: 0, unknown: 1, maxTotal: 45,
      weights: { powertrain: 1.2, emissions: 1.1, safety: 1.3, comfort: 0.8 }
    },
    live: { crit: 6, warn: 2, ok: 0, volatilityBonus: 1, maxTotal: 35, sustainedMultiplier: 1.5 },
    maintenance: {
      crit: 6, warn: 3, ok: 0,
      overdueThresholds: [30, 90, 180], maxTotal: 15,
      costThresholds: { low: 100, medium: 500, high: 1500 }
    },
    driving: { maxTotal: 10, harshEventThreshold: 5, efficiencyThreshold: -0.1 }
  },
  bonuses: { recovery: { perStreak: 2, maxTotal: 10 }, maintenance: { recentServiceBonus: 3 }, driving: { efficientDrivingBonus: 5 } },
  confidence: {
    weights: { uptime: 0.25, sensors: 0.20, sessions: 0.20, history: 0.15, maintenance: 0.10, recency: 0.10 },
    sessionTarget: 5, historyTarget: 30, maxDataAge: 7 // days
  },
  volatility: { sampleSize: 20, threshold: 0.6, minSeriesLength: 10, outlierThreshold: 3.0 },
  bands: {
    excellent: { min: 90, color: "#22c55e", priority: "low" },
    good: { min: 75, color: "#eab308", priority: "low" },
    watch: { min: 60, color: "#f97316", priority: "medium" },
    action: { min: 0, color: "#ef4444", priority: "high" }
  },
  recommendations: { enabled: true, maxSuggestions: 3 }
});

// ---------- Logger ----------
const createLogger = (cfg) => {
  const level = cfg?.logging?.level || "warn";
  const enabled = !!cfg?.logging?.enabled;
  const order = { debug: 10, info: 20, warn: 30, error: 40 };
  const allow = (lvl) => enabled && order[lvl] >= order[level];

  return {
    debug: (...a) => allow("debug") && console.debug("[HealthScore]", ...a),
    info: (...a) => allow("info") && console.info("[HealthScore]", ...a),
    warn: (...a) => enabled && console.warn("[HealthScore]", ...a),
    error: (...a) => enabled && console.error("[HealthScore]", ...a),
  };
};

// ---------- Helpers ----------
const normalizeSeverity = (sev) => {
  if (sev == null) return "unknown";
  const s = String(sev).toLowerCase().trim();
  return ["crit", "warn", "ok"].includes(s) ? s : "unknown";
};

const deepMerge = (base, extra) => {
  if (!extra) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(extra)) {
    if (v && typeof v === "object" && !Array.isArray(v) && base?.[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], v);
    } else out[k] = v;
  }
  return out;
};

function validateHistory(history, logger) {
  if (!history || typeof history !== "object") {
    logger.warn("Invalid history object, using defaults");
    return {};
  }
  const safe = { ...history };
  if ("uptimeRatio" in safe) safe.uptimeRatio = clamp(Number(safe.uptimeRatio) || 0, 0, 1);
  if ("sensorCoverage" in safe) safe.sensorCoverage = clamp(Number(safe.sensorCoverage) || 0, 0, 1);
  if ("fuelEfficiencyTrend" in safe) safe.fuelEfficiencyTrend = Math.max(-1, Math.min(1, Number(safe.fuelEfficiencyTrend) || 0));
  ["cleanSessionStreak", "dtcHistoryDepthDays", "recentSessionCount", "harshEventCount"].forEach(k => {
    if (k in safe) safe[k] = Math.max(0, Math.floor(Number(safe[k]) || 0));
  });
  return safe;
}

function validateEntries(entries, logger) {
  if (!Array.isArray(entries)) {
    logger.warn("Entries should be an array, got:", typeof entries);
    return [];
  }
  const valid = [];
  const errors = [];
  entries.forEach((e, i) => {
    if (!e || typeof e !== "object") return errors.push(`Entry ${i}: Not an object`);
    if (!["DTC", "LIVE"].includes(e.kind)) return errors.push(`Entry ${i}: Invalid kind "${e.kind}"`);
    if (e.kind === "LIVE" && e.series && !Array.isArray(e.series)) return errors.push(`Entry ${i}: Series should be an array`);
    valid.push(e);
  });
  if (errors.length) logger.warn("Entry validation errors:", errors);
  logger.debug(`Validated ${valid.length}/${entries.length} entries`);
  return valid;
}

// ---------- Analytics ----------
function calculateVolatility(series, cfg, logger) {
  const vcfg = cfg.volatility;
  if (!Array.isArray(series) || series.length < vcfg.minSeriesLength) return 0;

  // Cache key: length + last 3 values + core config
  const cacheKey = JSON.stringify({
    L: series.length,
    S: series.slice(-3).map(p => (typeof p === "object" ? p.v : p)),
    C: [vcfg.sampleSize, vcfg.threshold]
  });

  if (cfg.performance.enableCache) {
    const hit = VOLATILITY_CACHE.get(cacheKey);
    if (hit && (Date.now() - hit.t) < CACHE_TTL) {
      PERF_TRACKER.cacheHits++;
      return hit.v;
    }
  }

  try {
    const sample = series.slice(-vcfg.sampleSize);
    if (sample.length < 2) return 0;

    const values = sample.map(p => (typeof p === "object" ? p.v : p)).map(v => (typeof v === "number" && !isNaN(v) ? v : 0));
    if (values.length < 2) return 0;

    // IQR outlier trim
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const filtered = values.filter(v => v >= (q1 - 1.5 * iqr) && v <= (q3 + 1.5 * iqr));
    if (filtered.length < 2) return 0;

    const mean = filtered.reduce((s, v) => s + v, 0) / filtered.length;
    const variance = filtered.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / filtered.length;
    const stdDev = Math.sqrt(variance);

    const cv = mean !== 0 ? stdDev / Math.abs(mean) : stdDev;
    const result = Math.min(10, Math.max(0, cv));

    if (cfg.performance.enableCache) {
      if (VOLATILITY_CACHE.size >= cfg.performance.maxCacheSize) {
        const oldest = VOLATILITY_CACHE.keys().next().value;
        VOLATILITY_CACHE.delete(oldest);
      }
      VOLATILITY_CACHE.set(cacheKey, { v: result, t: Date.now() });
    }
    return result;
  } catch (err) {
    logger.error("Volatility calculation error:", err);
    return 0;
  }
}

function calculateDtcPenalties(entries, cfg, logger) {
  const dtcCfg = cfg.penalties.dtc;
  const dtcs = entries.filter(e => e.kind === "DTC");
  let total = 0;
  const contributors = [];

  logger.debug(`Processing ${dtcs.length} DTC entries`);

  for (const d of dtcs) {
    const sev = normalizeSeverity(d.severity);
    let penalty = (sev in dtcCfg) ? dtcCfg[sev] : dtcCfg.unknown;

    const category = d.category?.toLowerCase();
    const weight = dtcCfg.weights?.[category] ?? 1.0;
    penalty = Math.round(penalty * weight);

    total += penalty;
    contributors.push({
      type: "dtc",
      label: d.title || d.id || "Unknown DTC",
      impact: penalty,
      severity: sev,
      category,
      originalCode: d.id
    });
  }

  const finalPenalty = Math.min(total, dtcCfg.maxTotal);
  logger.debug(`DTC penalties: ${finalPenalty} (raw ${total})`);
  return { penalty: finalPenalty, contributors };
}

function calculateLivePenalties(entries, cfg, logger) {
  const liveCfg = cfg.penalties.live;
  const lives = entries.filter(e => e.kind === "LIVE");
  let total = 0;
  const contributors = [];

  logger.debug(`Processing ${lives.length} live metrics`);

  for (const m of lives) {
    const sev = normalizeSeverity(m.severity);
    let metricPenalty = liveCfg[sev] ?? 0;

    if (metricPenalty > 0) {
      // Compute volatility ONCE and reuse
      const vol = m.series ? calculateVolatility(m.series, cfg, logger) : 0;
      const volatile = vol > cfg.volatility.threshold;

      // Sustained issue detection:
      // If recent window is *consistently* away from its own mean (low variance) AND severity != ok
      let sustained = false;
      if (Array.isArray(m.series) && m.series.length >= 6 && sev !== "ok") {
        const tail = m.series.slice(-8).map(p => (typeof p === "object" ? p.v : p)).filter(v => typeof v === "number");
        if (tail.length >= 6) {
          const avg = tail.reduce((s, v) => s + v, 0) / tail.length;
          const dev = tail.reduce((s, v) => s + Math.abs(v - avg), 0) / tail.length;
          const relDev = avg !== 0 ? dev / Math.abs(avg) : dev;
          sustained = relDev < 0.15; // low variability => sustained at out-of-range level
        }
      }

      if (sustained) {
        metricPenalty = Math.round(metricPenalty * liveCfg.sustainedMultiplier);
        logger.debug(`Sustained issue multiplier applied to ${m.key || m.title}`);
      }
      if (volatile) metricPenalty += liveCfg.volatilityBonus;

      total += metricPenalty;
      contributors.push({
        type: "live",
        label: m.title || m.key || "Unknown Metric",
        impact: metricPenalty,
        severity: sev,
        hasVolatility: volatile,
        sustained,
        currentValue: m.value,
        unit: m.unit
      });
    }
  }

  const finalPenalty = Math.min(total, liveCfg.maxTotal);
  logger.debug(`Live penalties: ${finalPenalty} (raw ${total})`);
  return { penalty: finalPenalty, contributors };
}

function calculateMaintenancePenalties(maintenance, cfg, logger) {
  if (!Array.isArray(maintenance)) return { penalty: 0, contributors: [] };

  const mCfg = cfg.penalties.maintenance;
  const [t1 = 30, t2 = 90, t3 = 180] = Array.isArray(mCfg.overdueThresholds) ? mCfg.overdueThresholds : [30, 90, 180];

  let total = 0;
  const contributors = [];

  logger.debug(`Processing ${maintenance.length} maintenance items`);

  for (const item of maintenance) {
    if (!item || typeof item !== "object") continue;

    const sev = normalizeSeverity(item.severity);
    const overdue = Math.max(0, Number(item.overdueDays) || 0);
    const cost = Number(item.estimatedCost) || 0;

    let itemPenalty = (sev in mCfg) ? mCfg[sev] : mCfg.warn;

    if (overdue > t3) itemPenalty += 3;
    else if (overdue > t2) itemPenalty += 2;
    else if (overdue > t1) itemPenalty += 1;

    if (cost > mCfg.costThresholds.high) itemPenalty = Math.round(itemPenalty * 1.3);
    else if (cost > mCfg.costThresholds.medium) itemPenalty = Math.round(itemPenalty * 1.1);

    total += itemPenalty;
    contributors.push({
      type: "maintenance",
      label: `${item.label || "Maintenance"} (${overdue}d overdue)`,
      impact: itemPenalty,
      severity: sev,
      overdueDays: overdue,
      category: item.category,
      estimatedCost: cost
    });
  }

  const finalPenalty = Math.min(total, mCfg.maxTotal);
  logger.debug(`Maintenance penalties: ${finalPenalty} (raw ${total})`);
  return { penalty: finalPenalty, contributors };
}

function calculateDrivingPenalties(history, cfg, logger) {
  const dCfg = cfg.penalties.driving;
  const harshEvents = Number(history.harshEventCount) || 0;
  const efficiencyTrend = Number(history.fuelEfficiencyTrend) || 0;

  let penalty = 0;
  const contributors = [];

  if (harshEvents > dCfg.harshEventThreshold) {
    const harshPenalty = Math.min(harshEvents - dCfg.harshEventThreshold, 5);
    penalty += harshPenalty;
    contributors.push({ type: "driving", label: `Harsh driving events (${harshEvents})`, impact: harshPenalty, severity: "warn" });
  }

  if (efficiencyTrend < dCfg.efficiencyThreshold) {
    const effPenalty = Math.min(Math.abs(efficiencyTrend) * 10, 3);
    penalty += effPenalty;
    contributors.push({ type: "driving", label: `Declining fuel efficiency (${Math.round(efficiencyTrend * 100)}%)`, impact: effPenalty, severity: "warn" });
  }

  const finalPenalty = Math.min(penalty, dCfg.maxTotal);
  logger.debug(`Driving penalties: ${finalPenalty}`);
  return { penalty: finalPenalty, contributors };
}

function calculateConfidence(history, maintenance, entries, cfg, logger) {
  const safeHistory = validateHistory(history, logger);
  const w = cfg.confidence.weights;

  const ts = entries.filter(e => e.timestamp).map(e => e.timestamp);
  let recencyFactor = 1;
  if (ts.length) {
    const avgAgeDays = (Date.now() - ts.reduce((s, t) => s + t, 0) / ts.length) / (1000 * 60 * 60 * 24);
    recencyFactor = Math.max(0, 1 - (avgAgeDays / cfg.confidence.maxDataAge));
  }

  const confidence =
    w.uptime * clamp(safeHistory.uptimeRatio ?? 0.75, 0, 1) +
    w.sensors * clamp(safeHistory.sensorCoverage ?? 0.7, 0, 1) +
    w.sessions * clamp((safeHistory.recentSessionCount ?? 3) / cfg.confidence.sessionTarget, 0, 1) +
    w.history * clamp((safeHistory.dtcHistoryDepthDays ?? 7) / cfg.confidence.historyTarget, 0, 1) +
    w.maintenance * (Array.isArray(maintenance) && maintenance.length > 0 ? 1 : 0) +
    w.recency * recencyFactor;

  const result = clamp(Math.round(confidence * 100));
  logger.debug(`Confidence: ${result}% (recency: ${recencyFactor.toFixed(2)})`);
  return result;
}

function generateRecommendations(contributors, score, band, cfg) {
  if (!cfg.recommendations.enabled) return [];
  const picks = contributors
    .filter(c => c.type !== "bonus")
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, cfg.recommendations.maxSuggestions);

  const recs = [];
  for (const issue of picks) {
    let priority = "medium";
    let action = "Investigate and address";
    let rationale = `Contributing ${Math.abs(issue.delta)}pt to score reduction`;

    if (issue.severity === "crit") { priority = "high"; action = "Immediate attention required"; }
    if (issue.type === "dtc") { action = `Diagnose and repair DTC: ${issue.label}`; rationale += ". DTC indicates malfunction."; }
    else if (issue.type === "live") { action = `Monitor and stabilize: ${issue.label}`; if (issue.hasVolatility) rationale += ". High volatility detected."; }
    else if (issue.type === "maintenance") { action = `Schedule maintenance: ${issue.label}`; rationale += ". Overdue maintenance escalates risk."; }
    else if (issue.type === "driving") { action = `Review driving patterns: ${issue.label}`; rationale += ". Driving behavior impacts health."; }

    recs.push({ priority, action, rationale });
  }
  return recs;
}

const mergeConfig = (userConfig) => deepMerge(DEFAULT_CONFIG, userConfig);

// ---------- Main ----------
export function computeHealthScore(entries = [], history = {}, maintenance = [], config = {}) {
  const t0 = now();
  PERF_TRACKER.calls++;

  const cfg = mergeConfig(config);
  const logger = createLogger(cfg);

  logger.debug("Starting health score calculation", { entries: entries.length, maintenance: maintenance.length });

  try {
    const validEntries = validateEntries(entries, logger);
    const safeHistory = validateHistory(history, logger);
    const safeMaintenance = Array.isArray(maintenance) ? maintenance : [];

    const dtcResult = calculateDtcPenalties(validEntries, cfg, logger);
    const liveResult = calculateLivePenalties(validEntries, cfg, logger);
    const maintResult = calculateMaintenancePenalties(safeMaintenance, cfg, logger);
    const driveResult = calculateDrivingPenalties(safeHistory, cfg, logger);

    const cleanStreak = Math.max(0, Number(safeHistory.cleanSessionStreak) || 0);
    const recoveryBonus = clamp(cleanStreak * cfg.bonuses.recovery.perStreak, 0, cfg.bonuses.recovery.maxTotal);

    const effTrend = Number(safeHistory.fuelEfficiencyTrend) || 0;
    const efficiencyBonus = effTrend > 0.05 ? (cfg.bonuses.driving?.efficientDrivingBonus ?? 0) : 0;

    const totalPenalties = dtcResult.penalty + liveResult.penalty + maintResult.penalty + driveResult.penalty;
    const totalBonuses = recoveryBonus + efficiencyBonus;
    const rawScore = 100 - totalPenalties + totalBonuses;
    const score = clamp(Math.round(rawScore));

    const confidence = calculateConfidence(safeHistory, safeMaintenance, validEntries, cfg, logger);

    const allContributors = [
      ...dtcResult.contributors,
      ...liveResult.contributors,
      ...maintResult.contributors,
      ...driveResult.contributors,
    ];

    if (recoveryBonus > 0) allContributors.push({ type: "bonus", label: `Clean session streak (${cleanStreak} sessions)`, impact: recoveryBonus, severity: "ok" });
    if (efficiencyBonus > 0) allContributors.push({ type: "bonus", label: `Improving fuel efficiency (+${Math.round(effTrend * 100)}%)`, impact: efficiencyBonus, severity: "ok" });

    const contributors = allContributors
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 4)
      .map(c => ({ label: c.label, delta: c.type === "bonus" ? c.impact : -c.impact, type: c.type, severity: c.severity }));

    const bandEntries = Object.entries(cfg.bands).sort((a, b) => b[1].min - a[1].min);
    const [bandName, bandInfo] = bandEntries.find(([, info]) => score >= info.min) || ["action", cfg.bands.action];

    const recommendations = generateRecommendations(contributors, score, bandName, cfg);

    const execMs = cfg.performance.enableTiming ? (now() - t0) : 0;
    PERF_TRACKER.totalTime += execMs;

    logger.info(`Health score: ${score} (${bandName}) in ${execMs.toFixed(2)}ms`);

    return {
      score,
      confidence,
      contributors,
      band: bandName,
      breakdown: {
        penalties: {
          dtcPenalty: dtcResult.penalty,
          livePenalty: liveResult.penalty,
          maintPenalty: maintResult.penalty,
          drivingPenalty: driveResult.penalty,
        },
        bonuses: { recoveryBonus, efficiencyBonus },
      },
      recommendations,
      metadata: {
        totalEntries: validEntries.length,
        dtcCount: validEntries.filter(e => e.kind === "DTC").length,
        liveMetricCount: validEntries.filter(e => e.kind === "LIVE").length,
        maintenanceItemCount: safeMaintenance.length,
        executionTime: execMs,
        cacheUtilization: PERF_TRACKER.cacheHits / Math.max(PERF_TRACKER.calls, 1),
        bandInfo: { name: bandName, color: bandInfo.color, priority: bandInfo.priority },
      },
    };
  } catch (error) {
    const execMs = cfg.performance.enableTiming ? (now() - t0) : 0;
    logger.error("Health score calculation failed:", error);
    return {
      score: 50,
      confidence: 0,
      contributors: [],
      band: "unknown",
      breakdown: { penalties: {}, bonuses: {} },
      recommendations: [{ priority: "high", action: "Review diagnostic data", rationale: "Computation error occurred" }],
      metadata: { error: String(error?.message || error), executionTime: execMs },
    };
  }
}

// ---------- Exports & utilities ----------
export {
  DEFAULT_CONFIG as HEALTH_SCORE_CONFIG,
  PERF_TRACKER as healthScorePerformance,
  validateEntries,
  calculateVolatility,
  normalizeSeverity
};

export function clearHealthScoreCaches() {
  VOLATILITY_CACHE.clear();
  PERF_TRACKER.reset();
}
