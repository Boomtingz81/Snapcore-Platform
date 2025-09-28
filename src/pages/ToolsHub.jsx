// 📂 src/pages/ToolsHub.jsx
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

export default function ToolsHub() {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();

  const tabs = useMemo(
    () => [
      { to: "/tools/console", label: "Console" }, // SnapTerminal / Command console
      { to: "/tools/dtc", label: "DTCs" }, // Trouble codes reader
      { to: "/tools/lab", label: "Lab Toolkit" }, // SnapLab / Toolkit
      { to: "/tools/relay", label: "Relay Debug" }, // SnapRelayDebugHub
      { to: "/tools/python", label: "Python Diag" }, // PythonDiagnostic
      { to: "/tools/update", label: "Update Engine" },// SnapUpdateEngine
      { to: "/tools/secure", label: "Secure" }, // SnapSecure (coding, security)
    ],
    []
  );

  // Shared query params for tool context
  const ecu = params.get("ecu") || "auto"; // e.g., 7E0, 7E1, or "auto"
  const bus = params.get("bus") || "auto"; // obd, can1, can2, auto
  const proto = params.get("proto") || "auto"; // iso9141, kwp, can, j1850, auto
  const session = params.get("session") || "default"; // default, extended, programming
  const filter = params.get("filter") || ""; // free text
  const view = params.get("view") || "cards"; // cards/table/raw

  const setParam = useCallback(
    (k, v) => {
      const next = new URLSearchParams(params);
      if (!v || v === "auto" || v === "default" || v === "cards") next.delete(k);
      else next.set(k, v);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const clearContext = useCallback(() => {
    const next = new URLSearchParams(params);
    ["ecu", "bus", "proto", "session", "filter", "view"].forEach(k => next.delete(k));
    setParams(next, { replace: true });
  }, [params, setParams]);

  return (
    <div className="min-h-[70vh]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tools Hub</h1>
        <p className="opacity-70">Consoles, DTCs, lab utilities, relay debugging, and Python diagnostics</p>
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

      {/* Tool Context Toolbar */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] md:items-center">
          {/* Left cluster: addressing + protocol */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={ecu}
              onChange={(e) => setParam("ecu", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="ECU / Target Address"
            >
              <option value="auto">ECU: Auto</option>
              <option value="7E0">ECU: 7E0 (Engine)</option>
              <option value="7E1">ECU: 7E1 (Transmission)</option>
              <option value="7E2">ECU: 7E2 (ABS)</option>
              <option value="7E3">ECU: 7E3 (SRS)</option>
            </select>

            <select
              value={bus}
              onChange={(e) => setParam("bus", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Bus"
            >
              <option value="auto">Bus: Auto</option>
              <option value="obd">Bus: OBD-II</option>
              <option value="can1">Bus: CAN1</option>
              <option value="can2">Bus: CAN2</option>
            </select>

            <select
              value={proto}
              onChange={(e) => setParam("proto", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Protocol"
            >
              <option value="auto">Protocol: Auto</option>
              <option value="iso9141">ISO 9141</option>
              <option value="kwp">KWP</option>
              <option value="can">CAN</option>
              <option value="j1850">J1850</option>
            </select>

            <select
              value={session}
              onChange={(e) => setParam("session", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="Diagnostic Session"
            >
              <option value="default">Session: Default</option>
              <option value="extended">Session: Extended</option>
              <option value="programming">Session: Programming</option>
            </select>
          </div>

          {/* Middle: filter & view */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={filter}
              onChange={(e) => setParam("filter", e.target.value)}
              placeholder="Filter commands, DTCs, responses…"
              className="w-[260px] px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
            />
            <select
              value={view}
              onChange={(e) => setParam("view", e.target.value)}
              className="px-3 py-2 rounded-md bg-black/30 border border-white/10 text-sm"
              title="View mode"
            >
              <option value="cards">Cards</option>
              <option value="table">Table</option>
              <option value="raw">Raw</option>
            </select>
          </div>

          {/* Right: quick actions */}
          <div className="flex items-center gap-2 justify-start lg:justify-end">
            <ToolbarButton onClick={() => setParam("open","session")} title="Open session manager">Session</ToolbarButton>
            <ToolbarButton onClick={() => setParam("open","macros")} title="Open command macros">Macros</ToolbarButton>
            <ToolbarButton onClick={clearContext} title="Clear tool context">Clear</ToolbarButton>
          </div>
        </div>
      </div>

      {/* Nested child routes render here */}
      <Suspense fallback={<div className="opacity-70">Loading tool…</div>}>
        <Outlet />
      </Suspense>

      <div className="mt-8 text-xs opacity-50">Route: {pathname}</div>
    </div>
  );
}
