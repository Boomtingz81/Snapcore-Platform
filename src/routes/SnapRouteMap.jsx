// 📄 FILE: src/routes/SnapRouteMap.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/**
 * This route map organizes:
 * - Home hub and its nested tabs
 * - Diagnostics hub (SnapFaultCorePro) + MIC3X1X flows
 * - Reports / Garage / Vehicle / Data / Tools hubs
 * - DTCs dedicated page
 *
 * IMPORTANT: All MIC3X2X imports have been switched to MIC3X1X.
 * Make sure your file/folder names match these imports.
 */

// Hubs / pages
const HomeHub = lazy(() => import("../pages/HomeHub"));
const ReportsHub = lazy(() => import("../pages/ReportsHub"));
const GarageHub = lazy(() => import("../pages/GarageHub"));
const VehicleHub = lazy(() => import("../pages/VehicleHub"));
const DataHub = lazy(() => import("../pages/DataHub"));
const ToolsHub = lazy(() => import("../pages/ToolsHub"));

// Diagnostics wrapper (the tabbed parent shell)
const SnapFaultCorePro = lazy(() => import("../components/SnapFaultCorePro"));
// MIC3X1X Diagnostic Hub (your mini “app.jsx” for MIC3X1X)
const MIC3X1XDiagnosticHub = lazy(() => import("../pages/MIC3X1XDiagnosticHub"));
// DTCs dedicated page
const DTCsPage = lazy(() => import("../pages/DTCsPage"));

// MIC3X1X building blocks (live/console/tools direct routes)
const MIC3X1XMonitor = lazy(() => import("../components/mic3x1x/MIC3X1XMonitor"));
const MIC3X1XCommandConsole = lazy(() => import("../components/mic3x1x/MIC3X1XCommandConsole"));
const MIC3X1XDiagnosticTools = lazy(() => import("../components/mic3x1x/MIC3X1XDiagnosticTools"));
const MIC3X1XInterface = lazy(() => import("../components/MIC3X1XInterface"));
const MIC3X1XProtocolSelector = lazy(() => import("../components/MIC3X1XProtocolSelector"));
const MIC3X1XBluetoothManager = lazy(() => import("../components/Bluetooth/MIC3X1XBluetoothManager"));
const MIC3X1XPowerManager = lazy(() => import("../components/mic3x1x/MIC3X1XPowerManager"));
const MIC3X1XFilterManager = lazy(() => import("../components/mic3x1x/MIC3X1XFilterManager"));
const MIC3X1XWakeupManager = lazy(() => import("../components/mic3x1x/MIC3X1XWakeupManager"));
const MIC3X1XDashboard = lazy(() => import("../components/mic3x1x/MIC3X1XDashboard"));
const MIC3X1XUserStorage = lazy(() => import("../components/mic3x1x/MIC3X1XUserStorage"));
const MIC3X1XMultiFrameHandler = lazy(() => import("../components/mic3x1x/MIC3X1XMultiFrameHandler"));
const MIC3X1XHexFormatManager = lazy(() => import("../components/mic3x1x/MIC3X1XHexFormatManager"));
const MIC3X1XPeriodicMessageManager= lazy(() => import("../components/mic3x1x/MIC3X1XPeriodicMessageManager"));
const MIC3X1XProgrammingTools = lazy(() => import("../components/mic3x1x/MIC3X1XProgrammingTools"));

const Loader = ({ msg = "Loading…" }) => (
  <div className="p-4 text-sm opacity-70">{msg}</div>
);

export default function SnapRouteMap() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<HomeHub />}>
          {/* HomeHub handles its own tabs via <Outlet /> */}
          <Route index element={<div />} />
          <Route path="features" element={<div />} />
          <Route path="pricing" element={<div />} />
          <Route path="support" element={<div />} />
          <Route path="faq" element={<div />} />
          <Route path="updates" element={<div />} />
        </Route>

        {/* DIAGNOSTICS */}
        <Route path="/diagnostics" element={<SnapFaultCorePro />}>
          {/* Default to MIC3X1X Diagnostic Hub */}
          <Route index element={<Navigate to="mic3x1x" replace />} />

          {/* MIC3X1X Hub (connection + protocol + monitor + console + tools) */}
          <Route path="mic3x1x" element={<MIC3X1XDiagnosticHub />} />

          {/* Quick access subroutes inside diagnostics */}
          <Route path="live" element={<MIC3X1XMonitor />} />
          <Route path="console" element={<MIC3X1XCommandConsole />} />
          <Route path="tools" element={<MIC3X1XDiagnosticTools />} />

          {/* Extra MIC3X1X feature pages (direct) */}
          <Route path="mic3x1x/interface" element={<MIC3X1XInterface />} />
          <Route path="mic3x1x/protocols" element={<MIC3X1XProtocolSelector />} />
          <Route path="mic3x1x/bluetooth" element={<MIC3X1XBluetoothManager />} />
          <Route path="mic3x1x/power" element={<MIC3X1XPowerManager />} />
          <Route path="mic3x1x/filters" element={<MIC3X1XFilterManager />} />
          <Route path="mic3x1x/wakeup" element={<MIC3X1XWakeupManager />} />
          <Route path="mic3x1x/dashboard" element={<MIC3X1XDashboard />} />
          <Route path="mic3x1x/storage" element={<MIC3X1XUserStorage />} />
          <Route path="mic3x1x/multiframe" element={<MIC3X1XMultiFrameHandler />} />
          <Route path="mic3x1x/hex" element={<MIC3X1XHexFormatManager />} />
          <Route path="mic3x1x/periodic" element={<MIC3X1XPeriodicMessageManager />} />
          <Route path="mic3x1x/programming" element={<MIC3X1XProgrammingTools />} />
        </Route>

        {/* DTCs dedicated page (works with MIC3X1XService under the hood) */}
        <Route path="/dtcs" element={<DTCsPage />} />

        {/* REPORTS */}
        <Route path="/reports" element={<ReportsHub />}>
          {/* Your existing nested routes:
              /reports -> list
              /reports/last -> last report
              /reports/:id -> handled by Outlet in your App routes (if set)
           */}
          <Route index element={<div />} />
          <Route path="last" element={<div />} />
        </Route>

        {/* GARAGE / VEHICLE / DATA / TOOLS */}
        <Route path="/garage" element={<GarageHub />} />
        <Route path="/vehicle" element={<VehicleHub />} />
        <Route path="/data" element={<DataHub />} />
        <Route path="/tools" element={<ToolsHub />} />

        {/* LEGACY / SHORTCUTS */}
        <Route path="/scan" element={<Navigate to="/diagnostics/live" replace />} />
        <Route path="/history" element={<Navigate to="/reports" replace />} />

        {/* 404 fallback — leave to your existing NotFound in App.jsx */}
      </Routes>
    </Suspense>
  );
}
