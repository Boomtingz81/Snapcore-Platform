// ✅ src/pages/DiagnosticDashboard.jsx – Final Refactored Bulletproof Version
import { useState, useRef, useEffect } from "react";
import useOBDLiveData from "../hooks/useOBDLiveData";
import ReadingCard from "../components/ReadingCard";
import { Line } from "react-chartjs-2";
import html2canvas from "html2canvas";

// ✅ Import everything from one place
import {
  getUnit,
  groupedReadings,
  icons,
  getAllPidData, // future-proof if you need full PID info dynamically
} from "../utils/pidRegistry";

const MAX_POINTS = 50;
let saveTimer;

/** ✅ Debounced localStorage save */
function saveToLocalStorage(key, value) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => localStorage.setItem(key, JSON.stringify(value)), 300);
}

export default function DiagnosticDashboard() {
  const { data, status } = useOBDLiveData(3000);

  const [filter, setFilter] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [showLegend, setShowLegend] = useState(() => JSON.parse(localStorage.getItem("showLegend")) ?? true);
  const [showGraphs, setShowGraphs] = useState(() => JSON.parse(localStorage.getItem("showGraphs")) ?? true);
  const [openSections, setOpenSections] = useState(
    () =>
      JSON.parse(localStorage.getItem("openSections")) || {
        Engine: true,
        Transmission: false,
        EV: false,
        Chassis: false,
        Misfires: false,
        Other: false,
        Advanced: false,
      }
  );
  const [selectedParams, setSelectedParams] = useState(
    () => JSON.parse(localStorage.getItem("selectedParams")) || ["Speed", "RPM", "Engine Torque"]
  );

  const [showColorLegend, setShowColorLegend] = useState(false);
  const [history, setHistory] = useState({});
  const prevReadingsRef = useRef({});
  const timestampsRef = useRef([]);
  const [simulatorMode, setSimulatorMode] = useState(false);

  /** ✅ Update history for charts */
  useEffect(() => {
    prevReadingsRef.current = { ...data.readings };
    setHistory((prev) => {
      const updated = { ...prev };
      const now = new Date().toLocaleTimeString();
      timestampsRef.current = [...timestampsRef.current.slice(-MAX_POINTS + 1), now];

      Object.entries(data.readings || {}).forEach(([key, value]) => {
        if (!updated[key]) updated[key] = [];
        if (typeof value === "number") {
          updated[key] = [...updated[key].slice(-MAX_POINTS + 1), value];
        }
      });
      return updated;
    });
  }, [data.readings]);

  /** ✅ Save preferences to localStorage */
  useEffect(() => {
    saveToLocalStorage("theme", theme);
    document.body.className = theme === "dark" ? "bg-[#0d1117] text-white" : "bg-white text-black";
  }, [theme]);

  useEffect(() => {
    saveToLocalStorage("showLegend", showLegend);
    saveToLocalStorage("showGraphs", showGraphs);
    saveToLocalStorage("openSections", openSections);
    saveToLocalStorage("selectedParams", selectedParams);
  }, [showLegend, showGraphs, openSections, selectedParams]);

  /** ✅ Alert on misfires */
  useEffect(() => {
    if (data.readings?.["Total Misfires"] > 0) {
      navigator.vibrate?.(200);
      console.warn("⚠️ Misfire detected!");
    }
  }, [data.readings?.["Total Misfires"]]);

  /** ✅ Utility Functions */
  const toggleSection = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const calcStats = (label) => {
    const values = history[label] || [];
    if (!values.length) return { min: "--", max: "--", avg: "--" };
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
    };
  };

  const getStatColor = (label, value) => {
    if (value === "--") return "text-gray-400";
    if (label.includes("Misfire") && value > 0) return "text-red-400";
    if (label.includes("Battery") && value < 70) return "text-red-400";
    if (label.includes("Battery") && value < 85) return "text-yellow-400";
    if (typeof value === "number") {
      if (value <= 0) return "text-gray-400";
      if (value > 0 && value < 50) return "text-yellow-400";
      if (value >= 50) return "text-green-400";
    }
    return "text-white";
  };

  const handleExport = () => {
    html2canvas(document.body).then((canvas) => {
      const link = document.createElement("a");
      link.download = "dashboard.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  /** ✅ Show skeleton while loading */
  if (status.loading) {
    return (
      <div className="p-6">
        <h2 className="text-lg">Loading OBD Data...</h2>
        <div className="animate-pulse grid grid-cols-2 gap-4 mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        theme === "dark" ? "bg-gradient-to-b from-[#0d1117] to-[#1a1f2b] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* ✅ Top Controls */}
      <div className="flex justify-between mb-4">
        <button
          onClick={handleExport}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
        >
          📸 Export PNG
        </button>
        <button
          onClick={() => setSimulatorMode((p) => !p)}
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          {simulatorMode ? "Disable Simulator" : "Enable Simulator"}
        </button>
      </div>

      {/* ✅ Render All Sections */}
      {Object.entries(groupedReadings).map(([section, labels]) => (
        <div key={section} className="mb-6">
          <button
            aria-expanded={openSections[section]}
            aria-controls={`${section}-panel`}
            onKeyDown={(e) => e.key === "Enter" && toggleSection(section)}
            onClick={() => toggleSection(section)}
            className="w-full flex justify-between items-center p-3 bg-[#1e2635] rounded-lg border border-gray-600 hover:border-blue-400 transition"
          >
            <span className="font-bold text-lg">{section}</span>
            <span>{openSections[section] ? "▲" : "▼"}</span>
          </button>

          {openSections[section] && (
            <div id={`${section}-panel`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              {labels
                .filter((label) => label.toLowerCase().includes(filter.toLowerCase()))
                .map((label) => {
                  const stats = calcStats(label);
                  const value = simulatorMode
                    ? Math.floor(Math.random() * 100)
                    : data.readings[label] ?? "--";

                  return (
                    <div key={label} className="relative">
                      <ReadingCard
                        label={label}
                        value={value}
                        unit={getUnit(label)}
                        icon={icons[label] || "📟"}
                      >
                        {showGraphs && history[label] && history[label].length > 1 && (
                          <div className="mt-2 bg-[#121822] p-2 rounded-lg h-40">
                            <Line
                              data={{
                                labels: timestampsRef.current,
                                datasets: [
                                  {
                                    label,
                                    data: history[label],
                                    borderColor: "#3b82f6",
                                    backgroundColor: "rgba(59,130,246,0.2)",
                                    tension: 0.3,
                                  },
                                ],
                              }}
                              options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                  x: { ticks: { color: "#ccc" } },
                                  y: { ticks: { color: "#ccc" } },
                                },
                              }}
                            />
                            <div className="mt-2 text-xs bg-[#0f172a] p-2 rounded">
                              <p className={getStatColor(label, stats.min)}>Min: {stats.min}</p>
                              <p className={getStatColor(label, stats.max)}>Max: {stats.max}</p>
                              <p className={getStatColor(label, stats.avg)}>Avg: {stats.avg}</p>
                            </div>
                          </div>
                        )}
                      </ReadingCard>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ))}

      {/* ✅ Floating Color Legend */}
      {/* unchanged */}
    </div>
  );
}
