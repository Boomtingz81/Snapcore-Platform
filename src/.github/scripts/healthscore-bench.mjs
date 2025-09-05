// .github/scripts/healthscore-bench.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate locations for computeHealthScore
const CANDIDATES = [
  "src/utils/healthScore.js",
  "src/utils/healthScore.ts",
  "frontend/src/utils/healthScore.js",
  "frontend/src/utils/healthScore.ts",
  "utils/healthScore.js",
  "lib/healthScore.js"
].map(p => path.resolve(process.cwd(), p));

let mod = null, usedPath = null;
for (const p of CANDIDATES) {
  if (fs.existsSync(p)) {
    try { 
      mod = await import(pathToFileURL(p)); 
      usedPath = p; 
      break; 
    } catch (error) {
      console.log(`[perf] Failed to import ${p}: ${error.message}`);
    }
  }
}

if (!mod || !mod.computeHealthScore) {
  console.log("[perf] computeHealthScore not found — skipping perf check.");
  console.log("[perf] Searched paths:");
  CANDIDATES.forEach(p => console.log(`[perf] - ${p} ${fs.existsSync(p) ? '(exists)' : '(not found)'}`));
  process.exit(0);
}

const { computeHealthScore } = mod;

// ---- Enhanced synthetic data generation ----
function rand(min, max) { 
  return Math.random() * (max - min) + min; 
}

function randi(min, max) { 
  return Math.floor(rand(min, max)); 
}

function pick(arr) { 
  return arr[randi(0, arr.length)]; 
}

function makeEntries(
  nDtc = 40,
  nLive = 40,
  seriesMin = 80,
  seriesMax = 240
) {
  const now = Date.now();
  const entries = [];

  // Enhanced DTC generation with realistic patterns
  const dtcCategories = ["powertrain", "emissions", "safety", "comfort", "network"];
  const dtcPrefixes = ["P0", "P1", "P2", "B0", "C0", "U0"];
  const severityWeights = ["ok", "ok", "ok", "warn", "warn", "warn", "crit"]; // Weighted towards ok/warn

  for (let i = 0; i < nDtc; i++) {
    const prefix = pick(dtcPrefixes);
    const code = randi(100, 999);
    const severity = pick(severityWeights);
    
    entries.push({
      kind: "DTC",
      id: `${prefix}${code}`,
      title: `Synthetic DTC ${i} - ${pick(dtcCategories)} issue`,
      severity,
      category: pick(dtcCategories),
      timestamp: now - randi(1, 72) * 3600_000, // Within last 3 days
      intermittent: Math.random() < 0.3, // 30% chance of intermittent fault
      freezeFrame: Math.random() < 0.7 ? {
        rpm: randi(800, 6000),
        speed: randi(0, 120),
        throttle: randi(0, 100)
      } : null
    });
  }

  // Enhanced LIVE metrics with realistic automotive data patterns
  const metricTypes = [
    { key: "coolantTempC", base: 95, variance: 3, unit: "°C", label: "Coolant Temperature" },
    { key: "engineRPM", base: 2500, variance: 500, unit: "rpm", label: "Engine RPM" },
    { key: "throttlePos", base: 45, variance: 20, unit: "%", label: "Throttle Position" },
    { key: "mafRate", base: 25, variance: 8, unit: "g/s", label: "MAF Air Flow" },
    { key: "boostPressure", base: 1.3, variance: 0.3, unit: "bar", label: "Boost Pressure" },
    { key: "battVoltage", base: 12.4, variance: 0.2, unit: "V", label: "Battery Voltage" },
    { key: "fuelPressure", base: 55, variance: 5, unit: "psi", label: "Fuel Pressure" },
    { key: "oxygenSensor", base: 0.45, variance: 0.1, unit: "V", label: "O2 Sensor" }
  ];

  for (let j = 0; j < nLive; j++) {
    const metricIndex = j % metricTypes.length;
    const metric = metricTypes[metricIndex];
    const len = randi(seriesMin, seriesMax);
    const baseValue = metric.base + (Math.random() - 0.5) * metric.variance * 0.5;
    const volatility = rand(0.5, 2.5); // Some metrics more volatile than others
    
    let t = now - len * 3000; // Base 3-second intervals
    const series = [];
    
    for (let k = 0; k < len; k++) {
      // Simulate realistic data patterns:
      // - 5% chance of missing sample (sensor dropout)
      // - Variable timing jitter
      // - Trend changes and noise
      
      if (Math.random() < 0.05) { 
        t += randi(6000, 15000); // Gap in data
        continue; 
      }

      // Jitter timestamps ±1.5s to mimic irregular sampling
      t += 3000 + randi(-1500, 1500);

      // Generate realistic signal with multiple components:
      // - Base value with slow drift
      // - Periodic oscillation (engine cycles, thermal cycles)
      // - Random noise
      // - Occasional spikes/dips
      
      const drift = Math.sin(k / 50) * 0.1; // Slow drift
      const cycle = Math.sin(k / rand(4, 12)) * rand(0.5, 2) * volatility; // Periodic
      const noise = (Math.random() - 0.5) * 2; // White noise
      const spike = Math.random() < 0.02 ? rand(-5, 5) : 0; // 2% chance of spike
      
      const value = baseValue + drift + cycle + noise + spike;
      
      series.push({ 
        t, 
        v: Number(value.toFixed(metric.key === "battVoltage" ? 2 : 1))
      });
    }

    // Determine severity based on current value and historical patterns
    const currentValue = series.length ? series[series.length - 1].v : baseValue;
    const severity = determineSeverity(metric.key, currentValue, series);
    
    entries.push({
      kind: "LIVE",
      key: `${metric.key}_${j}`,
      title: `${metric.label} ${Math.floor(j / metricTypes.length) + 1}`,
      severity,
      value: currentValue,
      unit: metric.unit,
      series,
      timestamp: now - randi(0, 6) * 3600_000, // Recent timestamp
      sensorId: `sensor_${j}`,
      quality: Math.random() < 0.1 ? "degraded" : "good" // 10% degraded quality
    });
  }
  
  return entries;
}

function determineSeverity(metricKey, value, series) {
  // Simplified severity determination based on value ranges
  const thresholds = {
    coolantTempC: { warn: 98, crit: 106 },
    engineRPM: { warn: 5000, crit: 6500 },
    throttlePos: { warn: 85, crit: 95 },
    boostPressure: { warn: 1.6, crit: 2.0 },
    battVoltage: { warn: 11.8, crit: 11.5 },
    fuelPressure: { warn: 65, crit: 70 },
    oxygenSensor: { warn: 0.8, crit: 0.9 }
  };
  
  const threshold = thresholds[metricKey.replace(/_\d+$/, '')];
  if (!threshold) return pick(["ok", "ok", "ok", "warn", "crit"]);
  
  if (value >= threshold.crit) return "crit";
  if (value >= threshold.warn) return "warn";
  
  // Check for trend-based warnings (rapid changes)
  if (series && series.length > 5) {
    const recent = series.slice(-5);
    const trend = (recent[4].v - recent[0].v) / 4;
    if (Math.abs(trend) > value * 0.1) return "warn"; // 10% change per sample
  }
  
  return "ok";
}

// Enhanced history and maintenance data
const history = {
  cleanSessionStreak: randi(0, 8),
  recentSessionCount: randi(1, 15),
  uptimeRatio: Math.min(1, Math.max(0.7, 0.9 + rand(-0.15, 0.08))),
  sensorCoverage: Math.min(1, Math.max(0.6, 0.8 + rand(-0.2, 0.15))),
  harshEventCount: randi(0, 20),
  fuelEfficiencyTrend: rand(-0.25, 0.20),
  diagnosticComplexity: rand(0.3, 0.9),
  averageSessionDuration: randi(60, 300), // seconds
  errorCodeDiversity: rand(0.1, 0.8)
};

const maintenance = Array.from({ length: randi(4, 12) }, (_, i) => ({
  id: `maint_${i}`,
  label: `Service ${i}`,
  severity: pick(["ok", "ok", "warn", "warn", "warn", "crit"]),
  overdueDays: randi(0, 365),
  category: pick(["oil", "filters", "brakes", "tires", "fluids", "electrical", "engine"]),
  estimatedCost: randi(50, 2500),
  urgency: pick(["low", "medium", "high"]),
  mileageInterval: randi(3000, 15000),
  timeInterval: randi(90, 730), // days
  lastPerformed: now - randi(30, 400) * 24 * 3600_1000 // 30-400 days ago
}));

// Configuration from environment variables
const BUDGET_MS = Number(process.env.PERF_BUDGET_MS || 250);
const RUNS = Number(process.env.PERF_RUNS || 20);
const WARMUP = Number(process.env.PERF_WARMUP || 5);

// Generate comprehensive test dataset
const entries = makeEntries(40, 40, 80, 240);

function benchOnce() {
  const t0 = performance.now();
  const result = computeHealthScore(entries, history, maintenance);
  const t1 = performance.now();
  
  // Validate result structure
  if (!result || typeof result.score !== "number" || typeof result.confidence !== "number") {
    console.log("[perf] Warning: unexpected result shape:", result);
  }
  
  // Additional validation for diagnostic app
  if (result.score < 0 || result.score > 100) {
    console.log(`[perf] Warning: score out of range: ${result.score}`);
  }
  
  if (result.confidence < 0 || result.confidence > 1) {
    console.log(`[perf] Warning: confidence out of range: ${result.confidence}`);
  }
  
  return t1 - t0;
}

// Warmup runs to stabilize performance
console.log(`[perf] Running ${WARMUP} warmup iterations...`);
for (let i = 0; i < WARMUP; i++) {
  benchOnce();
}

// Timed benchmark runs
console.log(`[perf] Running ${RUNS} timed iterations...`);
const times = [];
for (let i = 0; i < RUNS; i++) {
  times.push(benchOnce());
}

// Statistical analysis
const avg = times.reduce((a, b) => a + b, 0) / times.length;
const min = Math.min(...times);
const max = Math.max(...times);
const sorted = [...times].sort((a, b) => a - b);

// Percentile calculations
const percentile = (p) => {
  const index = Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)));
  return sorted[index];
};

const p50 = percentile(0.50); // Median
const p90 = percentile(0.90);
const p95 = percentile(0.95);
const p99 = percentile(0.99);

// Standard deviation
const variance = times.reduce((acc, time) => acc + Math.pow(time - avg, 2), 0) / times.length;
const stdDev = Math.sqrt(variance);

// Performance analysis
const relativePath = path.relative(process.cwd(), usedPath);

console.log(`\n[perf] computeHealthScore benchmark results`);
console.log(`[perf] File: ${relativePath}`);
console.log(`[perf] Dataset: ${entries.length} entries (${entries.filter(e => e.kind === 'DTC').length} DTCs, ${entries.filter(e => e.kind === 'LIVE').length} live metrics)`);
console.log(`[perf] Runs: ${RUNS}, Warmup: ${WARMUP}`);
console.log(`[perf] ────────────────────────────────────────`);
console.log(`[perf] Average: ${avg.toFixed(2)}ms`);
console.log(`[perf] Median: ${p50.toFixed(2)}ms`);
console.log(`[perf] Min: ${min.toFixed(2)}ms`);
console.log(`[perf] Max: ${max.toFixed(2)}ms`);
console.log(`[perf] P90: ${p90.toFixed(2)}ms`);
console.log(`[perf] P95: ${p95.toFixed(2)}ms`);
console.log(`[perf] P99: ${p99.toFixed(2)}ms`);
console.log(`[perf] Std Dev: ${stdDev.toFixed(2)}ms`);
console.log(`[perf] Budget: ${BUDGET_MS}ms`);
console.log(`[perf] ────────────────────────────────────────`);

// Performance verdict
if (avg > BUDGET_MS) {
  console.error(`[perf] ❌ PERFORMANCE BUDGET EXCEEDED`);
  console.error(`[perf] Average ${avg.toFixed(2)}ms > Budget ${BUDGET_MS}ms`);
  console.error(`[perf] Consider optimizing health score calculation`);
  process.exit(1);
} else {
  const margin = ((BUDGET_MS - avg) / BUDGET_MS * 100).toFixed(1);
  console.log(`[perf] ✅ Performance within budget (${margin}% margin)`);
}

// Performance insights
if (p95 > BUDGET_MS) {
  console.log(`[perf] ⚠️ Warning: P95 (${p95.toFixed(2)}ms) exceeds budget`);
  console.log(`[perf] 5% of calculations may cause UI lag in real-time scenarios`);
}

if (stdDev > avg * 0.3) {
  console.log(`[perf] ⚠️ Warning: High performance variability (σ=${stdDev.toFixed(2)}ms)`);
  console.log(`[perf] Consider investigating performance inconsistencies`);
}

console.log(`[perf] Benchmark completed successfully\n`);
process.exit(0);
