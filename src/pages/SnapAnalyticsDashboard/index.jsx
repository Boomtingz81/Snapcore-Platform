// src/pages/SnapAnalyticsDashboard.jsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { BarChart3, Lock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

/** ------------------------------------------------------------------ */
/** Config & helpers                                                    */
/** ------------------------------------------------------------------ */

const ALLOWED_TIERS = ["pro", "garage", "owner"];
const STORAGE_KEY = "snapcore-scan-stats";

function readStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      totalScans: Number(parsed.totalScans) || 0,
      topBrands: Array.isArray(parsed.topBrands) ? parsed.topBrands.filter(Boolean) : [],
      topFaults: Array.isArray(parsed.topFaults) ? parsed.topFaults.filter(Boolean) : [],
      lastScan: parsed.lastScan ?? null,
    };
  } catch (e) {
    console.warn("[Analytics] Failed to parse local stats:", e);
    return null;
  }
}

function writeStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("[Analytics] Failed to write stats:", e);
  }
}

function formatDateTime(dt) {
  try {
    return new Date(dt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(dt || "");
  }
}

function generateSummary(data) {
  const brand = data.topBrands?.[0];
  const fault = data.topFaults?.[0];
  if (!brand && !fault) return "No diagnostic insights available yet.";
  return `Top brand: ${brand || "—"} • Most frequent fault: ${fault || "—"} • Keep scanning for trends.`;
}

/** Convert a list of strings into simple {name, value} data for Recharts. */
function toBarData(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  // Aggregate (in case duplicates are stored)
  const counts = list.reduce((acc, k) => {
    const key = String(k);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

/** ------------------------------------------------------------------ */
/** Component                                                           */
/** ------------------------------------------------------------------ */

export default function SnapAnalyticsDashboard() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [stats, setStats] = useState(() => readStats() ?? {
    totalScans: 0,
    topBrands: [],
    topFaults: [],
    lastScan: null,
  });
  const [summary, setSummary] = useState("");

  // load once on mount, in case something else wrote after SSR/preload
  useEffect(() => {
    const s = readStats();
    if (s) {
      setStats(s);
      setSummary(generateSummary(s));
    } else {
      setSummary("No diagnostic insights available yet.");
    }
  }, []);

  // actions
  const seedDemo = useCallback(() => {
    const demo = {
      totalScans: 27,
      topBrands: ["Ford", "VW", "BMW", "BMW", "VW", "Toyota", "Ford", "Audi", "BMW"],
      topFaults: ["P0301", "P0420", "P0420", "P0442", "P0171", "P0420", "U0100"],
      lastScan: Date.now(),
    };
    writeStats(demo);
    setStats(demo);
    setSummary(generateSummary(demo));
  }, []);

  const clearAll = useCallback(() => {
    writeStats({ totalScans: 0, topBrands: [], topFaults: [], lastScan: null });
    setStats({ totalScans: 0, topBrands: [], topFaults: [], lastScan: null });
    setSummary("No diagnostic insights available yet.");
  }, []);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">
            Only <strong>Pro</strong>, <strong>Garage</strong>, and <strong>Owner</strong> users can access analytics.
          </p>
        </div>
      </main>
    );
  }

  const faultsData = useMemo(() => toBarData(stats.topFaults), [stats.topFaults]);
  const brandsData = useMemo(() => toBarData(stats.topBrands), [stats.topBrands]);

  return (
    <>
      <Helmet>
        <title>SnapAnalytics Dashboard</title>
        <meta name="description" content="Track diagnostic activity and usage trends on SnapCore." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-5xl mx-auto"
        >
          <header className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-sky-600 dark:text-sky-400" />
              <h1 className="text-3xl font-bold">SnapAnalytics Dashboard</h1>
            </div>

            {/* Quick actions to help verify UI without backend */}
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-800 hover:opacity-90"
                onClick={seedDemo}
                type="button"
                title="Seed demo data into localStorage"
              >
                Seed demo data
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-200/70 dark:bg-gray-800/60 hover:opacity-90"
                onClick={clearAll}
                type="button"
                title="Clear stored analytics"
              >
                Clear
              </button>
            </div>
          </header>

          <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatTile label="Total Scans" value={stats.totalScans} accent="text-sky-700 dark:text-sky-300" />
              <StatTile label="Unique Brands" value={new Set(stats.topBrands).size} />
              <StatTile label="Unique Faults" value={new Set(stats.topFaults).size} />
            </div>

            {stats.lastScan && (
              <p className="text-sm">
                🕒 <strong>Last Scan:</strong>{" "}
                <span className="font-mono">{formatDateTime(stats.lastScan)}</span>
              </p>
            )}

            {summary && (
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                🤖 <strong>AI Summary:</strong> {summary}
              </p>
            )}

            {faultsData.length > 0 ? (
              <ChartBlock title="🔥 Top Faults" ariaTitle="Top fault codes bar chart">
                <BarChart data={faultsData}>
                  <XAxis dataKey="name" />
                  <YAxis hide />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0284c7" name="Count" />
                </BarChart>
              </ChartBlock>
            ) : (
              <EmptyBlock label="No fault data yet. Run a few scans to see trends here." />
            )}

            {brandsData.length > 0 ? (
              <ChartBlock title="🚗 Most Scanned Brands" ariaTitle="Most scanned brands bar chart">
                <BarChart data={brandsData}>
                  <XAxis dataKey="name" />
                  <YAxis hide />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#16a34a" name="Count" />
                </BarChart>
              </ChartBlock>
            ) : (
              <EmptyBlock label="No brand data yet. Scans will populate this chart." />
            )}
          </section>
        </motion.div>
      </main>
    </>
  );
}

/** ------------------------------------------------------------------ */
/** Small presentational bits                                           */
/** ------------------------------------------------------------------ */

function StatTile({ label, value, accent = "" }) {
  return (
    <div className="rounded-xl px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`text-2xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}

function ChartBlock({ title, ariaTitle, children }) {
  return (
    <div className="mt-2">
      <h2 className="text-md font-semibold mb-2">{title}</h2>
      <div className="w-full h-[220px]" role="img" aria-label={ariaTitle}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyBlock({ label }) {
  return (
    <div className="rounded-xl px-4 py-6 bg-white/40 dark:bg-gray-900/30 border border-dashed border-gray-300 dark:border-gray-700 text-sm">
      {label}
    </div>
  );
}
