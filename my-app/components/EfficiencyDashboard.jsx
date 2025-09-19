import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Clock,
  Battery,
  Activity,
  Download,
} from "lucide-react";

/** Tailwind-safe color maps (avoid dynamic class names) */
const colorMap = {
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-l-blue-500",
    line: "#3B82F6",
    bar: "#60A5FA",
  },
  green: {
    text: "text-green-600",
    bg: "bg-green-100",
    border: "border-l-green-500",
    line: "#10B981",
    bar: "#34D399",
  },
  purple: {
    text: "text-purple-600",
    bg: "bg-purple-100",
    border: "border-l-purple-500",
    line: "#8B5CF6",
    bar: "#A78BFA",
  },
  orange: {
    text: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-l-orange-500",
    line: "#FB923C",
    bar: "#FDBA74",
  },
  gray: {
    text: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-l-gray-400",
    line: "#64748B",
    bar: "#94A3B8",
  },
};

/** Small, pure stat card */
const StatCard = React.memo(function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend, // number (pos/neg => up/down arrow)
  color = "blue",
}) {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${c.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 ${c.bg} rounded-full`}>
          <Icon className={`w-6 h-6 ${c.text}`} aria-hidden />
        </div>
      </div>
      {typeof trend === "number" && (
        <div className="mt-2 flex items-center" aria-label="trend">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" aria-hidden />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600 mr-1" aria-hidden />
          )}
          <span className={`text-xs ${trend >= 0 ? "text-green-700" : "text-red-700"}`}>
            {Math.abs(Number(trend.toFixed?.(1) ?? trend))}% from last period
          </span>
        </div>
      )}
    </div>
  );
});

/**
 * analysisData MAY be:
 * - your mock object (fileName, totalStations, averageEfficiency, ...)
 * - full backend result (analysis.summary, analysis.charger_analysis, etc.)
 */
const EfficiencyDashboard = ({ analysisData }) => {
  const [activeTab, setActiveTab] = useState("overview"); // overview | performance | stations | trends
  const [filterType, setFilterType] = useState("all"); // all | level2 | dcfast

  // Guard: no data yet
  if (!analysisData) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center text-gray-500">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" aria-hidden />
          <p>Upload a charging CSV to see the analysis dashboard.</p>
        </div>
      </div>
    );
  }

  // Normalize possible inputs (backend or mock)
  const normalized = useMemo(() => {
    // If backend shape
    const summary = analysisData?.analysis?.summary ?? analysisData?.summary ?? null;
    const chargerAnalysis = analysisData?.analysis?.charger_analysis ?? analysisData?.charger_analysis ?? {};
    const byLocation = analysisData?.analysis?.by_location ?? analysisData?.by_location ?? {};
    const meta = analysisData?.metadata ?? {};

    // Fallbacks to support your earlier mock
    const mock = {
      fileName: analysisData.fileName ?? "Uploaded data",
      totalStations: analysisData.totalStations ?? Object.keys(byLocation).length || 0,
      sessionCount: analysisData.sessionCount ?? meta?.processed_rows ?? 0,
      averageEfficiency:
        analysisData.averageEfficiency ??
        (summary ? Number((summary.overall_kwh_per_dollar ?? 0) * 100).toFixed(1) : "—"),
      energyDelivered: analysisData.energyDelivered ?? meta?.total_energy_kwh ?? "—",
      peakHours: analysisData.peakHours ?? [],
      topPerformers: analysisData.topPerformers ?? [],
      underperformers: analysisData.underperformers ?? [],
    };

    return { summary, chargerAnalysis, byLocation, mock };
  }, [analysisData]);

  // Synthetic chart data (fallback)
  const baseHourly = useMemo(
    () => [
      { hour: "00:00", efficiency: 78.2, sessions: 12 },
      { hour: "03:00", efficiency: 82.1, sessions: 8 },
      { hour: "06:00", efficiency: 75.3, sessions: 23 },
      { hour: "09:00", efficiency: 68.9, sessions: 45 },
      { hour: "12:00", efficiency: 71.2, sessions: 38 },
      { hour: "15:00", efficiency: 73.8, sessions: 42 },
      { hour: "18:00", efficiency: 66.4, sessions: 52 },
      { hour: "21:00", efficiency: 79.6, sessions: 28 },
    ],
    []
  );

  // Filtered “hourly” data example – you can replace this with real filtered breakdowns later
  const hourlyData = useMemo(() => {
    if (filterType === "all") return baseHourly;
    // simple tweak to show filter behavior
    const factor = filterType === "level2" ? 1.05 : 0.95;
    return baseHourly.map((d) => ({ ...d, efficiency: Number((d.efficiency * factor).toFixed(1)) }));
  }, [baseHourly, filterType]);

  const stationTypeData = useMemo(
    () => [
      { name: "Level 2", value: 65, efficiency: 87.2, color: "#3B82F6" },
      { name: "DC Fast", value: 25, efficiency: 91.8, color: "#10B981" },
      { name: "Ultra Fast", value: 10, efficiency: 94.1, color: "#8B5CF6" },
    ],
    []
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "stations", label: "Station Details", icon: MapPin },
    { id: "trends", label: "Trends", icon: BarChart },
  ];

  // Export JSON (current normalized data)
  const exportReport = () => {
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "charging-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Charging Station Analysis</h1>
            <p className="text-gray-600 mt-1">
              {normalized.mock.fileName} • {normalized.mock.totalStations} stations •{" "}
              {normalized.mock.sessionCount} sessions
            </p>
          </div>
          <div className="flex gap-2">
            <select
              aria-label="Filter by station type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Stations</option>
              <option value="level2">Level 2 Only</option>
              <option value="dcfast">DC Fast Only</option>
            </select>
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-2 md:gap-6 px-4 md:px-6" aria-label="Sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" aria-hidden />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Average Efficiency"
                  value={
                    normalized.summary?.overall_kwh_per_dollar
                      ? `${(normalized.summary.overall_kwh_per_dollar * 100).toFixed(1)}%`
                      : `${normalized.mock.averageEfficiency}%`
                  }
                  subtitle="Overall system performance"
                  icon={Battery}
                  trend={2.3}
                  color="green"
                />
                <StatCard
                  title="Energy Delivered"
                  value={`${normalized.mock.energyDelivered} kWh`}
                  subtitle="Total energy output"
                  icon={Zap}
                  trend={5.1}
                  color="blue"
                />
                <StatCard
                  title="Active Stations"
                  value={normalized.mock.totalStations}
                  subtitle="Currently operational"
                  icon={MapPin}
                  trend={-1.2}
                  color="purple"
                />
                <StatCard
                  title="Peak Hours"
                  value={normalized.mock.peakHours?.length ?? 0}
                  subtitle="High demand periods"
                  icon={Clock}
                  color="orange"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Efficiency */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Efficiency Trends</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis domain={[Math.min(...hourlyData.map(d => d.efficiency)) - 5, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke={colorMap.blue.line}
                        strokeWidth={2}
                        dot={false}
                        name="Efficiency %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Station Types */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Station Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={stationTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {stationTypeData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              {/* Top / Underperformers – use mock fallbacks if backend didn't provide */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" aria-hidden />
                    Top Performing Stations
                  </h3>
                  <div className="space-y-3">
                    {(normalized.mock.topPerformers ?? []).map((s) => (
                      <div key={s.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">{s.id}</p>
                            <p className="text-sm text-gray-600">{s.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{s.efficiency}%</p>
                            <p className="text-xs text-gray-500">Efficiency</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!normalized.mock.topPerformers || !normalized.mock.topPerformers.length) && (
                      <p className="text-sm text-gray-600">No top performers identified.</p>
                    )}
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" aria-hidden />
                    Stations Needing Attention
                  </h3>
                  <div className="space-y-3">
                    {(normalized.mock.underperformers ?? []).map((s) => (
                      <div key={s.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{s.id}</p>
                            <p className="text-sm text-gray-600">{s.location}</p>
                            <p className="text-xs text-red-600 mt-1">{s.issue}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">{s.efficiency}%</p>
                            <p className="text-xs text-gray-500">Efficiency</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!normalized.mock.underperformers || !normalized.mock.underperformers.length) && (
                      <p className="text-sm text-gray-600">No critical issues detected.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sessions vs Efficiency */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Volume vs Efficiency</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="right" dataKey="sessions" fill={colorMap.gray.bar} name="Sessions" />
                    <Bar yAxisId="left" dataKey="efficiency" fill={colorMap.blue.bar} name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "stations" && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Station Details</h3>
              <p className="text-gray-600">
                Detailed station-by-station analysis will appear here (e.g., per-location cost/kWh using
                <code className="mx-1">analysis.by_location</code>).
              </p>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Historical Trends</h3>
              <p className="text-gray-600">
                Long-term efficiency trends & predictive analytics will be displayed here (wire this to
                <code className="mx-1">analysis.temporal_trends</code>).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EfficiencyDashboard;
