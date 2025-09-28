// 📂 FILE: src/components/SnapCoreDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClickableTile from "./ClickableTile"; // ✅ keep if this exists

import {
  Home,
  Activity,
  Settings,
  Search,
  BarChart3,
  Zap,
  UserSquare2 as UserPro,
  History,
  ScanLine,
  FlaskConical,
  Gauge,
  Monitor,
  Terminal,
  Cpu,
} from "lucide-react";

export default function SnapCoreDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Clock for display
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const month = useMemo(() => now.toLocaleString("default", { month: "long" }), [now]);
  const year = now.getFullYear();

  // Bottom nav highlight
  const tabs = [
    { id: "home", label: "Home", icon: Home, to: "/" },
    { id: "live", label: "Live", icon: Activity, to: "/live" },
    { id: "analytics", label: "Analytics", icon: BarChart3, to: "/analytics" },
    { id: "search", label: "Search", icon: Search, to: "/vehicle-lookup" },
    { id: "pro", label: "Pro", icon: Settings, to: "/pro" },
  ];

  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p === "/") return "home";
    if (p.startsWith("/live")) return "live";
    if (p.startsWith("/analytics")) return "analytics";
    if (p.startsWith("/vehicle-lookup") || p.startsWith("/vin") || p.startsWith("/plate")) return "search";
    if (p.startsWith("/pro")) return "pro";
    return "home";
  }, [location.pathname]);

  // Tiles
  const diagnosticTools = [
    { to: "/diagnostics", title: "Diagnostic Hub", subtitle: "SnapFaultCore Pro", icon: Cpu, badge: "OBD" },
    { to: "/vin", title: "VIN Decoder", subtitle: "Diagnostic Tool", icon: Search },
    { to: "/plate", title: "Plate Scanner", subtitle: "Diagnostic Tool", icon: ScanLine, badge: "Beta" },
    { to: "/snapdna", title: "SnapDNA", subtitle: "Diagnostic Tool", icon: Activity, badge: "Live" },
    { to: "/lab", title: "Lab Tools", subtitle: "Diagnostics", icon: FlaskConical },
  ];

  const liveOps = [
    { to: "/scan", title: "Quick Scan", subtitle: "Live Scan", icon: Gauge },
    { to: "/live", title: "Telemetry", subtitle: "Streams", icon: Activity },
    { to: "/analytics", title: "Dashboards", subtitle: "Analytics", icon: Monitor },
    { to: "/terminal", title: "Developer Console", subtitle: "Terminal", icon: Terminal },
  ];

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-6">
      {/* Hero Panels (adapted from Home/index.jsx) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-10">
        <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black flex flex-col items-center">
          <span className="font-bold text-xl mb-4">SnapCore</span>
          <button
            type="button"
            onClick={() => navigate("/connect")}
            className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-all"
          >
            Connect OBD
          </button>
        </div>

        <div
          className="p-6 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black cursor-pointer"
          onClick={() => navigate("/pro")}
        >
          <span className="font-bold text-xl">Comfort (Pro)</span>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Climate Control</li>
            <li>Seat Heating</li>
            <li>Ambient Light</li>
          </ul>
        </div>

        <div
          className="p-6 rounded-xl bg-gradient-to-r from-purple-400 to-pink-500 text-black cursor-pointer"
          onClick={() => navigate("/analytics")}
        >
          <span className="font-bold text-xl mb-2 block">O₂ Panel</span>
          <span className="text-2xl font-bold">{month} {year}</span>
        </div>
      </div>

      {/* Diagnostic Tools */}
      <section className="w-full max-w-6xl mb-10">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-400">Diagnostic Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {diagnosticTools.map((t) => (
            <ClickableTile key={t.to} {...t} />
          ))}
        </div>
      </section>

      {/* Live Operations */}
      <section className="w-full max-w-6xl">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">Live & Operations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {liveOps.map((t) => (
            <ClickableTile key={t.to} {...t} />
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center space-x-2 px-6 py-4 bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.to)}
                aria-label={tab.label}
                className={`flex flex-col items-center space-y-1 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-cyan-400 text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
