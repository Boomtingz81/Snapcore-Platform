// 📂 src/pages/VehicleHub.jsx
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

export default function VehicleHub() {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();

  const tabs = useMemo(
    () => [
      { to: "/vehicle", label: "Lookup", end: true }, // index route → vehicle-lookup
      { to: "/vehicle/vin", label: "VIN Decoder" },
      { to: "/vehicle/plate", label: "Plate Scanner" },
      { to: "/vehicle/showroom", label: "Showroom" },
      { to: "/vehicle/history", label: "History" }, // optional, maps to SnapHistory
      { to: "/vehicle/reports", label: "Reports" }, // optional, links to list
    ],
    []
  );

  const q = params.get("q") || "";
  const filter = params.get("type") || "all";

  const setParam = useCallback(
    (k, v) => {
      const next = new URLSearchParams(params);
      if (!v || v === "all") next.delete(k);
      else next.set(k, v);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const clear = useCallback(() => {
    const next = new URLSearchParams(params);
    ["q", "type"].forEach(k => next.delete(k));
    setParams(next, { replace: true });
  }, [params, setParams]);

  return (
    <div className="min-h-[70vh]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <p className="opacity-70">Search by VIN/Plate, browse showroom, and view history & reports</p>
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

      {/* Toolbar (global filters / quick actions) */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search VIN, Plate, Model, Notes…"
              className="w-[280px] px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
            />
            <select
              value={filter}
              onChange={(e) => setParam("type", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Filter type"
            >
              <option value="all">All</option>
              <option value="vin">VIN</option>
              <option value="plate">Plate</option>
              <option value="customer">Customer</option>
              <option value="make">Make/Model</option>
            </select>
            <ToolbarButton onClick={clear} title="Clear filters">Clear</ToolbarButton>
          </div>

          <div className="flex items-center gap-2">
            <ToolbarButton onClick={() => setParam("open","vin")} title="Open VIN decoder">VIN</ToolbarButton>
            <ToolbarButton onClick={() => setParam("open","plate")} title="Open plate scanner">Plate</ToolbarButton>
            <ToolbarButton onClick={() => setParam("open","new")} title="Create vehicle record">New Vehicle</ToolbarButton>
          </div>
        </div>
      </div>

      {/* Nested pages render here */}
      <Suspense fallback={<div className="opacity-70">Loading vehicle module…</div>}>
        <Outlet />
      </Suspense>

      <div className="mt-8 text-xs opacity-50">Route: {pathname}</div>
    </div>
  );
}
