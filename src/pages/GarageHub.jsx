// 📂 src/pages/GarageHub.jsx
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

export default function GarageHub() {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();

  const tabs = useMemo(
    () => [
      { to: "/garage", label: "Dashboard", end: true },
      { to: "/garage/jobs", label: "Jobs" },
      { to: "/garage/mot", label: "MOT Reminders" },
      { to: "/garage/admin", label: "Admin" },
      { to: "/garage/offline", label: "Offline Queue" },
    ],
    []
  );

  const q = params.get("q") || "";
  const setParam = useCallback(
    (k, v) => {
      const next = new URLSearchParams(params);
      if (!v) next.delete(k); else next.set(k, v);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const clear = useCallback(() => {
    const next = new URLSearchParams(params);
    ["q","state","tech"].forEach(k => next.delete(k));
    setParams(next, { replace: true });
  }, [params, setParams]);

  return (
    <div className="min-h-[70vh]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Garage</h1>
        <p className="opacity-70">Jobs, reminders, staff & offline work</p>
      </div>

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

      {/* Toolbar */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search jobs/customers/VRM/VIN…"
              className="w-[260px] px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
            />
            <select
              value={params.get("state") || "any"}
              onChange={(e) => setParam("state", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Job state"
            >
              <option value="any">Any state</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_parts">Awaiting Parts</option>
              <option value="ready">Ready</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={params.get("tech") || "all"}
              onChange={(e) => setParam("tech", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Technician"
            >
              <option value="all">All techs</option>
              <option value="me">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
            </select>
            <ToolbarButton onClick={clear} title="Clear filters">Clear</ToolbarButton>
          </div>

          <div className="flex items-center gap-2">
            <ToolbarButton onClick={() => setParam("export","csv")} title="Export list as CSV">
              Export CSV
            </ToolbarButton>
            <ToolbarButton onClick={() => setParam("create","job")} title="Create job">
              New Job
            </ToolbarButton>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="opacity-70">Loading garage…</div>}>
        <Outlet />
      </Suspense>

      <div className="mt-8 text-xs opacity-50">Route: {pathname}</div>
    </div>
  );
}
