// 📂 FILE: src/pages/MIC3X2XDiagnosticHub.jsx
import React, { Suspense, lazy } from "react";
import { MIC3X2XProvider } from "../context/MIC3X2XContext";

// Lazy-load the heavy UI blocks (must exist and export default)
const MIC3X2XInterface = lazy(() => import("../components/MIC3X2XInterface"));
const MIC3X2XProtocolSelector = lazy(() => import("../components/MIC3X2XProtocolSelector"));
const MIC3X2XMonitor = lazy(() => import("../components/mic3x2x/MIC3X2XMonitor"));
const MIC3X2XCommandConsole = lazy(() => import("../components/mic3x2x/MIC3X2XCommandConsole"));
const MIC3X2XDiagnosticTools = lazy(() => import("../components/mic3x2x/MIC3X2XDiagnosticTools"));
// Optional: only keep this import if the file exists
const MIC3X2XBluetoothManager = lazy(() => import("../components/Bluetooth/MIC3X2XBluetoothManager"));

const Loader = ({ msg = "Loading…" }) => (
  <div className="text-sm opacity-70 p-2">{msg}</div>
);

const FeatureGuard = ({ children }) => {
  const hasSerial = !!navigator.serial; // Web Serial API (USB/TTL)
  const hasBluetooth = !!navigator.bluetooth; // Web Bluetooth API
  if (!hasSerial && !hasBluetooth) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Hardware APIs unavailable</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm opacity-80">
          <li>Use a Chromium-based browser (Edge/Chrome).</li>
          <li>Serve over HTTPS (localhost with cert / Codespaces is fine).</li>
          <li>Desktop or Android (iOS Safari blocks Serial/Bluetooth).</li>
        </ul>
      </div>
    );
  }
  return children;
};

const Panel = ({ title, right, children }) => (
  <section className="rounded-xl border border-[color:var(--border,#2c2c2c)] p-4 bg-[color:var(--panel,#0a0a0a)]">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

export default function MIC3X2XDiagnosticHub() {
  return (
    <MIC3X2XProvider>
      <FeatureGuard>
        <div className="mic3x2x-page container mx-auto p-4 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold">MIC3X2X — Diagnostic Hub</h1>
            <p className="opacity-80">Multiprotocol OBD-II Diagnostic Interface</p>
          </header>

          {/* Top controls */}
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Connection">
              <Suspense fallback={<Loader msg="Loading connection…" />}>
                <MIC3X2XInterface />
              </Suspense>
            </Panel>

            <Panel title="Protocol">
              <Suspense fallback={<Loader msg="Loading protocols…" />}>
                <MIC3X2XProtocolSelector />
              </Suspense>
            </Panel>
          </div>

          {/* Optional Bluetooth manager — hide/remove if not using */}
          <div className="hidden">
            <Panel title="Bluetooth Manager">
              <Suspense fallback={<Loader msg="Loading Bluetooth manager…" />}>
                <MIC3X2XBluetoothManager />
              </Suspense>
            </Panel>
          </div>

          {/* Live monitoring + console */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Live Monitoring">
              <Suspense fallback={<Loader msg="Starting live monitor…" />}>
                <MIC3X2XMonitor />
              </Suspense>
            </Panel>

            <Panel title="Command Console" right={<span className="text-xs opacity-60">AT / ST / VT</span>}>
              <Suspense fallback={<Loader msg="Loading console…" />}>
                <MIC3X2XCommandConsole />
              </Suspense>
            </Panel>
          </div>

          {/* Tools: DTCs, snapshots, sessions, etc. */}
          <Panel title="Diagnostic Tools">
            <Suspense fallback={<Loader msg="Loading tools…" />}>
              <MIC3X2XDiagnosticTools />
            </Suspense>
          </Panel>
        </div>
      </FeatureGuard>
    </MIC3X2XProvider>
  );
}
