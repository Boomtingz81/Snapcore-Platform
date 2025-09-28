// 📂 src/pages/ReportsHub.jsx
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Suspense, useCallback, useMemo } from "react";

// If you want quick tiles on top, uncomment this and add your tiles below
// import ClickableTile from "../Components/ClickableTile";

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

export default function ReportsHub() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const tabs = useMemo(
    () => [
      { to: "/reports", label: "All Reports", end: true },
      { to: "/reports/last", label: "Last Report" },
      // You already have dynamic: /reports/:id (handled by Outlet)
    ],
    []
  );

  // --- Query helpers (syncs with URL) ---
  const q = params.get("q") || "";
  const status = params.get("status") || "any";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      if (value === "" || value == null) next.delete(key);
      else next.set(key, value);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const clearFilters = useCallback(() => {
    const keys = ["q", "status", "from", "to", "export"];
    const next = new URLSearchParams(params);
    keys.forEach(k => next.delete(k));
    setParams(next, { replace: true });
  }, [params, setParams]);

  const exportCsv = useCallback(() => {
    const next = new URLSearchParams(params);
    next.set("export", "csv");
    setParams(next, { replace: true });
    // Your ReportList component can watch export=csv and trigger a download.
  }, [params, setParams]);

  const openCreate = useCallback(() => {
    // If you have a create page later, change this navigate target
    navigate("/reports"); // or navigate("/reports/new")
  }, [navigate]);

  return (
    <div className="min-h-[70vh]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="opacity-70">History, PDFs, and diagnostic summaries</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
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

      {/* Quick Tiles (optional) */}
      {/* 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <ClickableTile to="/reports" title="All Reports" subtitle="Browse & search" gradient="from-cyan-400 to-purple-500" />
        <ClickableTile to="/reports/last" title="Last Report" subtitle="Jump to latest" gradient="from-emerald-400 to-teal-500" />
        <ClickableTile to="/diagnostics" title="Diagnostics" subtitle="Create new report" gradient="from-sky-400 to-indigo-500" />
        <ClickableTile to="/garage-dashboard" title="Garage" subtitle="Jobs & exports" gradient="from-amber-400 to-rose-500" />
      </div>
      */}

      {/* Toolbar */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Left: filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search by VIN, reg, customer, title…"
              className="w-[260px] px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
            />

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setParam("status", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Filter by status"
            >
              <option value="any">Any status</option>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
              <option value="exported">Exported</option>
            </select>

            {/* Date range */}
            <input
              type="date"
              value={from}
              onChange={(e) => setParam("from", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="From date"
            />
            <span className="opacity-50 text-sm">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setParam("to", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="To date"
            />

            <ToolbarButton onClick={clearFilters} title="Clear filters">Clear</ToolbarButton>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <ToolbarButton onClick={exportCsv} title="Export filtered list as CSV">
              Export CSV
            </ToolbarButton>
            <ToolbarButton onClick={openCreate} title="Create / generate report">
              New Report
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Nested content (index, last, :id) */}
      <Suspense fallback={<div className="opacity-70">Loading reports…</div>}>
        <Outlet />
      </Suspense>

      {/* Tiny route indicator for debugging */}
      <div className="mt-8 text-xs opacity-50">Route: {pathname}</div>
    </div>
  );
}
