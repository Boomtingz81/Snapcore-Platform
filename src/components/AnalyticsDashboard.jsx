import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Activity,
  Calendar,
  Download,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/**
 * Expected analysisData shape (from your ChargingDataService.analyzeData()):
 * {
 * fileName: string,
 * timestamp: ISO string,
 * summary: {
 * totalStations: number,
 * totalSessions: number,
 * dateRange: { start: Date, end: Date, days: number },
 * totalEnergy: number,
 * averageEfficiency: number,
 * averageDuration: number,
 * completionRate: number
 * },
 * performance: {
 * topPerformers: [{ stationId, sessionCount, efficiency, totalEnergy, avgDuration, status }],
 * underperformers: [...],
 * averageEfficiency: number
 * },
 * trends: {
 * hourly: [{ hour, sessionCount, efficiency, totalEnergy }],
 * daily: [{ date: Date, sessionCount, efficiency, totalEnergy }],
 * peakHours: [ "HH:00"... ],
 * busyDays: [ "MM/DD/YYYY"... ]
 * }
 * }
 */

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  gray: "#6B7280",
  slate: "#94A3B8",
  indigo: "#6366F1",
};

const fmtPct = (n) => (typeof n === "number" ? `${n.toFixed(1)}%` : "–");
const fmtKWh = (n) => (typeof n === "number" ? `${Math.round(n).toLocaleString()} kWh` : "–");
const fmtMin = (n) => (typeof n === "number" ? `${Math.round(n)} min` : "–");
const fmtInt = (n) => (typeof n === "number" ? n.toLocaleString() : "–");
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const MetricCard = ({ title, value, change, icon: Icon, tint = COLORS.primary }) => (
  <div className="bg-white rounded-lg shadow p-5 border-l-4" style={{ borderLeftColor: tint }}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {typeof change === "number" && (
          <div className="flex items-center mt-1">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" color={COLORS.success} />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" color={COLORS.danger} />
            )}
            <span className={`text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-full" style={{ backgroundColor: `${tint}20` }}>
        {Icon ? <Icon className="w-6 h-6" color={tint} /> : null}
      </div>
    </div>
  </div>
);

const Card = ({ title, children, right = null }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {right}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm" style={{ color: p.color || COLORS.gray }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

const dateCutoff = (range, end) => {
  if (range === "all") return null;
  const d = new Date(end);
  if (range === "7d") d.setDate(d.getDate() - 7);
  else if (range === "30d") d.setDate(d.getDate() - 30);
  else if (range === "90d") d.setDate(d.getDate() - 90);
  return d;
};

const AnalyticsDashboard = ({ analysisData, onExport, onFilterChange, className = "" }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");

  // Derived lists
  const stationsList = useMemo(() => {
    if (!analysisData?.performance?.topPerformers) return [];
    // Combine top + underperformers for the selector, unique by id
    const under = analysisData.performance.underperformers || [];
    const top = analysisData.performance.topPerformers || [];
    const all = [...top, ...under];
    const map = new Map();
    all.forEach((s) => map.set(s.stationId, s));
    return Array.from(map.values()).map((s) => s.stationId).sort();
  }, [analysisData]);

  // Apply date & station filters to trends
  const filteredTrends = useMemo(() => {
    if (!analysisData?.trends) return null;

    const dr = analysisData.summary?.dateRange;
    const end = dr?.end ? new Date(dr.end) : new Date();
    const cutoff = dateCutoff(dateRange, end);

    // Daily data filter
    let daily = analysisData.trends.daily || [];
    daily = daily
      .map((d) => ({
        ...d,
        // ensure date is Date object even if serialized
        date: d.date instanceof Date ? d.date : new Date(d.date),
      }))
      .filter((d) => !cutoff || d.date >= cutoff);

    // Hourly doesn't need date filter (typically aggregated)
    const hourly = analysisData.trends.hourly || [];

    return { daily, hourly };
  }, [analysisData, dateRange]);

  // Build a station → metrics table for the "Stations" tab
  const stationTable = useMemo(() => {
    if (!analysisData?.performance) return [];
    const top = analysisData.performance.topPerformers || [];
    const under = analysisData.performance.underperformers || [];
    const all = [...top, ...under];
    const uniq = new Map();
    all.forEach((s) => uniq.set(s.stationId, s));
    let rows = Array.from(uniq.values());
    if (stationFilter !== "all") {
      rows = rows.filter((r) => r.stationId === stationFilter);
    }
    // Sort by efficiency desc
    rows.sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));
    return rows;
  }, [analysisData, stationFilter]);

  // Pie data for station health
  const stationHealthPie = useMemo(() => {
    const rows = stationTable.length ? stationTable : [];
    const buckets = { excellent: 0, good: 0, needs_attention: 0 };
    rows.forEach((r) => {
      buckets[r.status] = (buckets[r.status] || 0) + 1;
    });
    return [
      { name: "Excellent", value: buckets.excellent, color: COLORS.success },
      { name: "Good", value: buckets.good, color: COLORS.primary },
      { name: "Needs Attention", value: buckets.needs_attention, color: COLORS.warning },
    ];
  }, [stationTable]);

  // Handle filter change callback (if provided)
  const emitFilters = (newDateRange, newStation) => {
    if (onFilterChange) {
      onFilterChange({
        dateRange: newDateRange ?? dateRange,
        stationId: newStation ?? stationFilter,
      });
    }
  };

  if (!analysisData) {
    return (
      <div className={`w-full p-8 text-center ${className}`}>
        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Data Yet</h3>
        <p className="text-gray-500">Upload a charging dataset to view analytics.</p>
      </div>
    );
  }

  const summary = analysisData.summary || {};
  const headerRight = (
    <div className="flex items-center gap-3">
      <select
        value={dateRange}
        onChange={(e) => {
          setDateRange(e.target.value);
          emitFilters(e.target.value, undefined);
        }}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Date range"
      >
        <option value="all">All Time</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 90 Days</option>
      </select>

      <select
        value={stationFilter}
        onChange={(e) => {
          setStationFilter(e.target.value);
          emitFilters(undefined, e.target.value);
        }}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Station filter"
      >
        <option value="all">All Stations</option>
        {stationsList.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>

      <button
        onClick={() => onExport?.(analysisData)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
        aria-label="Export analysis"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </button>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "stations", label: "Stations", icon: MapPin },
    { id: "trends", label: "Trends", icon: Calendar },
  ];

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Charging Analytics</h1>
            <p className="text-gray-600">
              {analysisData.fileName || "Dataset"} • {fmtInt(summary.totalSessions)} sessions •{" "}
              {fmtInt(summary.totalStations)} stations
            </p>
          </div>
          {headerRight}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === t.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <t.icon className="w-5 h-5 mr-2" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Energy" value={fmtKWh(summary.totalEnergy)} tint={COLORS.primary} />
                <MetricCard
                  title="Avg Efficiency"
                  value={fmtPct(summary.averageEfficiency)}
                  change={0} // plug your “change vs last period” if/when available
                  tint={COLORS.success}
                />
                <MetricCard
                  title="Avg Duration"
                  value={fmtMin(summary.averageDuration)}
                  tint={COLORS.indigo}
                />
                <MetricCard
                  title="Completion Rate"
                  value={fmtPct(summary.completionRate)}
                  tint={COLORS.warning}
                />
              </div>

              <Card title="Daily Energy & Sessions">
                <div className="h-72">
                  <ResponsiveContainer>
                    <AreaChart
                      data={(filteredTrends?.daily || []).map((d) => ({
                        ...d,
                        label: d.date.toLocaleDateString(),
                      }))}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.5} />
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalEnergy"
                        name="Energy (kWh)"
                        stroke={COLORS.primary}
                        fill="url(#colorEnergy)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="sessionCount"
                        name="Sessions"
                        stroke={COLORS.slate}
                        strokeWidth={2}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* PERFORMANCE */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Session Volume vs Efficiency (Hourly)">
                  <div className="h-72">
                    <ResponsiveContainer>
                      <BarChart data={filteredTrends?.hourly || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          yAxisId="right"
                          dataKey="sessionCount"
                          name="Sessions"
                          fill={COLORS.slate}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="efficiency"
                          name="Efficiency %"
                          stroke={COLORS.primary}
                          strokeWidth={2}
                          dot={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Station Health Breakdown">
                  <div className="h-72">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={stationHealthPie}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          label={(e) => `${e.name}: ${e.value}`}
                        >
                          {stationHealthPie.map((s, i) => (
                            <Cell key={i} fill={s.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* STATIONS */}
          {activeTab === "stations" && (
            <Card
              title="Station Details"
              right={
                <div className="text-sm text-gray-500">
                  Showing {fmtInt(stationTable.length)} station
                  {stationTable.length === 1 ? "" : "s"}
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="py-2 pr-4">Station</th>
                      <th className="py-2 pr-4">Sessions</th>
                      <th className="py-2 pr-4">Efficiency</th>
                      <th className="py-2 pr-4">Total Energy</th>
                      <th className="py-2 pr-4">Avg Duration</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stationTable.map((s) => (
                      <tr key={s.stationId} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-medium text-gray-900">{s.stationId}</td>
                        <td className="py-2 pr-4">{fmtInt(s.sessionCount)}</td>
                        <td className="py-2 pr-4">{fmtPct(clamp(s.efficiency, 0, 100))}</td>
                        <td className="py-2 pr-4">{fmtKWh(s.totalEnergy)}</td>
                        <td className="py-2 pr-4">{fmtMin(s.avgDuration)}</td>
                        <td className="py-2 pr-4 capitalize">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              s.status === "excellent"
                                ? "bg-green-100 text-green-800"
                                : s.status === "good"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {s.status?.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TRENDS */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              <Card title="Efficiency Over Time (Daily)">
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart
                      data={(filteredTrends?.daily || []).map((d) => ({
                        ...d,
                        label: d.date.toLocaleDateString(),
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        name="Efficiency %"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Energy by Hour">
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={filteredTrends?.hourly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                       <Legend />
                      <Bar dataKey="totalEnergy" name="Energy (kWh)" fill={COLORS.indigo} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
              
