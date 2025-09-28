// 📄 src/pages/HomeHub.jsx
import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Suspense, useMemo } from "react";
import ClickableTile from "../Components/ClickableTile";

export default function HomeHub() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Use relative paths for nested tabs inside "/"
  const tabs = useMemo(
    () => [
      { to: "", label: "Overview", end: true }, // index route
      { to: "features", label: "Features" },
      { to: "pricing", label: "Pricing" },
      { to: "support", label: "Support" },
      { to: "faq", label: "FAQ" },
      { to: "updates", label: "Updates" }, // SnapBulletin
    ],
    []
  );

  const quickTiles = [
    { to: "/diagnostics", title: "Diagnostics", subtitle: "SnapFault Core Pro" },
    { to: "/vehicle-lookup", title: "Vehicle Lookup", subtitle: "VIN / Plate" },
    { to: "/reports", title: "Reports", subtitle: "History & PDFs" },
    { to: "/garage-dashboard", title: "Garage", subtitle: "Work Management" },
  ];

  return (
    <div className="min-h-[80vh] py-6">
      {/* Hero / header */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              SnapCore — Home
            </h1>
            <p className="opacity-70">
              Your launchpad for diagnostics, reports, and live ops.
            </p>
          </div>

          {/* Quick search (routes to vehicle lookup with a query) */}
          <div className="w-full md:w-[420px]">
            <label htmlFor="quickSearch" className="sr-only">
              Quick search (VIN or plate)
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q")?.toString().trim();
                if (q) navigate(`/vehicle-lookup?q=${encodeURIComponent(q)}`);
              }}
              className="flex gap-2"
            >
              <input
                id="quickSearch"
                name="q"
                type="text"
                autoComplete="off"
                placeholder="Search VIN or plate…"
                className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
              <button
                type="submit"
                className="rounded-lg px-4 py-2 font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:from-purple-500 hover:to-cyan-400 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <NavLink
            key={t.to || "index"}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      {/* Quick shortcuts */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickTiles.map((t) => (
          <ClickableTile
            key={t.to}
            to={t.to}
            title={t.title}
            subtitle={t.subtitle}
            gradient="from-cyan-400 to-purple-500"
            className="min-w-[220px]"
          />
        ))}
      </section>

      {/* Overview-only panels (hide when not on overview) */}
      {pathname === "/" && (
        <section className="space-y-6 mb-8">
          {/* Status + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* System status */}
            <div className="rounded-xl border border-white/10 p-4 bg-black/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">System Status</h2>
                <span className="text-xs opacity-60">Realtime snapshot</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Diagnostic Services</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Online</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>AI Services</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Online</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Data Sync</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Online</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Cloud Storage</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Online</span>
                </li>
              </ul>
              <div className="mt-3 text-xs opacity-60">
                Tip: View detailed metrics in{" "}
                <Link className="underline" to="/analytics">
                  Analytics
                </Link>
                .
              </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-white/10 p-4 bg-black/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <Link to="/reports" className="text-xs underline opacity-80 hover:opacity-100">
                  View all
                </Link>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Report generated</span>
                  <Link className="text-cyan-300 underline" to="/reports/last">Open</Link>
                </li>
                <li className="flex items-center justify-between">
                  <span>Live stream session</span>
                  <Link className="text-cyan-300 underline" to="/snap-live-dashboard">Open</Link>
                </li>
                <li className="flex items-center justify-between">
                  <span>VIN decoded</span>
                  <Link className="text-cyan-300 underline" to="/vin-decoder">Open</Link>
                </li>
              </ul>
            </div>

            {/* Shortcuts */}
            <div className="rounded-xl border border-white/10 p-4 bg-black/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <span className="text-xs opacity-60">Power user</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/scan" className="action-btn">Quick Scan</Link>
                <Link to="/diagnostics" className="action-btn">Diagnostics</Link>
                <Link to="/python-diagnostic" className="action-btn">Python OBD</Link>
                <Link to="/snap-terminal" className="action-btn">Terminal</Link>
                <Link to="/snap-live-dashboard" className="action-btn">Live Data</Link>
                <Link to="/garage-dashboard" className="action-btn">Garage</Link>
              </div>
              <style>{`
                .action-btn {
                  display:flex; align-items:center; justify-content:center;
                  padding:0.6rem 0.75rem; border-radius:0.7rem;
                  background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
                  font-weight:600; font-size:0.875rem;
                }
                .action-btn:hover { background:rgba(255,255,255,0.08); }
              `}</style>
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-xl border border-white/10 p-4 bg-black/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Announcements</h2>
              <Link to="/updates" className="text-xs underline opacity-80 hover:opacity-100">
                Open Updates
              </Link>
            </div>
            <ul className="list-disc pl-5 text-sm space-y-1 opacity-90">
              <li>New MIC3X2X Diagnostic Hub integrated in <code>/diagnostics/mic3x2x</code>.</li>
              <li>Routing cleanup: Home, Diagnostics, and Reports hubs standardized.</li>
              <li>Performance: lazy loading + suspense for heavy modules.</li>
            </ul>
          </div>
        </section>
      )}

      {/* Nested tab content renders here */}
      <Suspense fallback={<div className="opacity-70">Loading…</div>}>
        <Outlet />
      </Suspense>

      {/* Tiny route indicator for quick debugging */}
      <div className="mt-8 text-xs opacity-50">Route: {pathname}</div>
    </div>
  );
}
