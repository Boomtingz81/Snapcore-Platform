// 📂 src/pages/DataHub.jsx
import { NavLink, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Suspense, useMemo, useCallback } from "react";

const ToolbarButton = ({ children, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
  >
    {children}
  </button>
);

export default function DataHub() {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();

  const tabs = useMemo(
    () => [
      { to: "/data/live", label: "Live" }, // SnapLive
      { to: "/data/analytics",label: "Analytics" }, // SnapAnalyticsDashboard
      { to: "/data/track", label: "Track" }, // SnapTrack / GPS / Trips
      { to: "/data/replay", label: "Replay" }, // SnapReplay
      { to: "/data/metric", label: "Metrics" }, // SnapMetric (optional)
    ],
    []
  );

  // Query params shared by data views (persist across refresh/deep-links)
  const q = params.get("q") || "";
  const range = params.get("range") || "24h"; // 15m, 1h, 24h, 7d, custom
  const source = params.get("source") || "all"; // obd, can, gps, cloud, all
  const view = params.get("view") || "cards"; // cards/table/graph
  const vehicle = params.get("vehicle") || ""; // selected vehicle ID

  const setParam = useCallback(
    (k, v) => {
      const next = new URLSearchParams(params);
      if (!v || v === "all" || v === "cards" || v === "24h") next.delete(k);
      else next.set(k, v);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams(params);
    ["q", "range", "source", "view"].forEach(k => next.delete(k));
    setParams(next, { replace: true });
  }, [params, setParams]);

  return (
    <div className="min-h-[70vh]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Data Hub</h1>
        <p className="opacity-70">Live telemetry, analytics, tracking, and session replay</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-white/10 border border-white/10" : "hover:bg-white/5"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {/* Global toolbar */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_auto] md:items-center">
          {/* Left cluster: search + vehicle */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search signals, DTCs, tags…"
              className="w-[260px] px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
            />
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setParam("vehicle", e.target.value)}
              placeholder="Vehicle ID / Reg"
              className="w-[200px] px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
            />
          </div>

          {/* Middle cluster: filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={range}
              onChange={(e) => setParam("range", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Time range"
            >
              <option value="15m">Last 15 min</option>
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="custom">Custom…</option>
            </select>

            <select
              value={source}
              onChange={(e) => setParam("source", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Data source"
            >
              <option value="all">All sources</option>
              <option value="obd">OBD-II</option>
              <option value="can">CAN</option>
              <option value="gps">GPS</option>
              <option value="cloud">Cloud</option>
            </select>

            <select
              value={view}
              onChange={(e) => setParam("view", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="View mode"
            >
              <option value="cards">Cards</option>
              <option value="table">Table</option>
              <option value="graph">Graph</option>
            </select>
          </div>

          {/* Right cluster: actions */}
          <div className="flex items-center gap-2 justify-start md:justify-end">
            <ToolbarButton onClick={() => setParam("open","connect")} title="Connect device">Connect</ToolbarButton>
            <ToolbarButton onClick={() => setParam("open","record")} title="Start recording">Record</ToolbarButton>
            <ToolbarButton onClick={clearFilters} title="Clear filters">Clear</ToolbarButton>
          </div>
        </div>
      </div>

      {/* Nested child routes render here */}
      <Suspense fallback={<div className="opacity-70">Loading data module…</div>}>
        <Outlet />
      </Suspense>

      <div className="mt-8 text-xs opacity-50">Route: {pathname}</div>
    </div>
  );
}
