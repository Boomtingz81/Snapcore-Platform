// 📂 FILE: src/pages/SnapLiveHub.jsx
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Zap,
  LineChart,
  FileDown,
  Bot,
  Lock,
} from "lucide-react";

// 🔌 Existing modules (you already have these)
import SnapLive from "./SnapLive";
import SnapSensorGraph from "./SnapSensorGraph";
import SnapLiveExport from "./SnapLiveExport";
import SnapTechCommentaryOverlay from "../components/SnapTechCommentaryOverlay"; // if your file lives elsewhere, adjust path

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapLiveHub() {
  const tier = useMemo(() => localStorage.getItem("user-tier") || "lite", []);
  const [tab, setTab] = useState("overview"); // "overview" | "live" | "graph" | "export" | "commentary"
  const [faultCode, setFaultCode] = useState("");
  const [context, setContext] = useState("");

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">
            SnapLive Hub is only available to Pro, Garage, and Owner tiers.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapLive Hub – Real-Time Diagnostics</title>
        <meta
          name="description"
          content="One place for live OBD streaming, sensor graphs, exports, and SnapTech commentary."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <header className="mb-6 flex items-center gap-3">
            <LayoutGrid className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            <h1 className="text-3xl font-bold">SnapLive Hub</h1>
          </header>

          {/* Tabs */}
          <nav className="mb-6 overflow-x-auto">
            <div className="inline-flex gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-2">
              <TabButton
                icon={<LayoutGrid className="w-4 h-4" />}
                label="Overview"
                active={tab === "overview"}
                onClick={() => setTab("overview")}
              />
              <TabButton
                icon={<Zap className="w-4 h-4" />}
                label="Live"
                active={tab === "live"}
                onClick={() => setTab("live")}
              />
              <TabButton
                icon={<LineChart className="w-4 h-4" />}
                label="Graph"
                active={tab === "graph"}
                onClick={() => setTab("graph")}
              />
              <TabButton
                icon={<FileDown className="w-4 h-4" />}
                label="Export"
                active={tab === "export"}
                onClick={() => setTab("export")}
              />
              <TabButton
                icon={<Bot className="w-4 h-4" />}
                label="Commentary"
                active={tab === "commentary"}
                onClick={() => setTab("commentary")}
              />
            </div>
          </nav>

          {/* Panels */}
          <section className="relative">
            <AnimatePresence mode="wait">
              {tab === "overview" && (
                <Panel key="overview">
                  <OverviewPanel />
                </Panel>
              )}

              {tab === "live" && (
                <Panel key="live">
                  {/* Your existing page component */}
                  <SnapLive />
                </Panel>
              )}

              {tab === "graph" && (
                <Panel key="graph">
                  {/* Your existing page component */}
                  <SnapSensorGraph />
                </Panel>
              )}

              {tab === "export" && (
                <Panel key="export">
                  {/* Your existing page component */}
                  <SnapLiveExport />
                </Panel>
              )}

              {tab === "commentary" && (
                <Panel key="commentary">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-purple-500" />
                      SnapTech Commentary
                    </h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={faultCode}
                        onChange={(e) => setFaultCode(e.target.value)}
                        placeholder="Fault code (e.g., P0299)"
                        className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                        aria-label="Fault code"
                      />
                      <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Context (e.g., low boost, limp mode)"
                        className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                        aria-label="Context"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Tip: Enable local LLM via <code>VITE_OLLAMA_URL</code> or set{" "}
                      <code>VITE_MOCK=true</code> for mock responses.
                    </p>
                  </div>

                  {/* Overlay renders in-page; requires faultCode */}
                  {faultCode ? (
                    <SnapTechCommentaryOverlay faultCode={faultCode} context={context} />
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Enter a fault code above to get commentary.
                    </div>
                  )}
                </Panel>
              )}
            </AnimatePresence>
          </section>
        </motion.div>
      </main>
    </>
  );
}

/* ------------------------ */
/* Small reusable components */
/* ------------------------ */
function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
        active
          ? "bg-sky-600 text-white shadow"
          : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
      ].join(" ")}
      aria-pressed={active}
      aria-label={`Open ${label} tab`}
    >
      {icon}
      {label}
    </button>
  );
}

function Panel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="min-h-[200px]"
    >
      {children}
    </motion.div>
  );
}

function OverviewPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-2">What’s in the Hub</h3>
        <ul className="list-disc ml-5 text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Live:</strong> Manual or OBD streaming with connection status.
          </li>
          <li>
            <strong>Graph:</strong> Real-time PID charts (WebSocket-powered).
          </li>
          <li>
            <strong>Export:</strong> Save snapshots (CSV/TXT/PDF).
          </li>
          <li>
            <strong>Commentary:</strong> SnapTech fault explanations (local LLM).
          </li>
        </ul>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold mb-2">Quick Tips</h3>
        <ul className="list-disc ml-5 text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <li>
            Set <code>WS_URL</code> in your live modules for production.
          </li>
          <li>
            For commentary, configure <code>VITE_OLLAMA_URL</code> or{" "}
            <code>VITE_MOCK=true</code>.
          </li>
          <li>
            Use Hub tabs on mobile—everything scales down cleanly.
          </li>
        </ul>
      </div>
    </div>
  );
}
