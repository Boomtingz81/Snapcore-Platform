// src/pages/SnapTrack.jsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Lock, Download } from "lucide-react";

export default function SnapTrack() {
  const [tier] = useState("pro"); // Simulated tier access
  const [scanData, setScanData] = useState([]);
  const [brandStats, setBrandStats] = useState([]);
  const [timeStats, setTimeStats] = useState([]);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  useEffect(() => {
    const saved = localStorage.getItem("snapcore-scan-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScanData(parsed);
        calculateStats(parsed);
      } catch {
        console.warn("Failed to parse scan history");
      }
    }
  }, []);

  const calculateStats = (data) => {
    const brandCount = {};
    const timeCount = {};

    data.forEach((entry) => {
      const brand = entry.brand || "Unknown";
      const date = new Date(entry.timestamp);
      const hour = date.getHours();

      brandCount[brand] = (brandCount[brand] || 0) + 1;
      timeCount[hour] = (timeCount[hour] || 0) + 1;
    });

    const brandArray = Object.entries(brandCount).map(([brand, count]) => ({
      name: brand,
      value: count,
    }));

    const timeArray = Object.entries(timeCount)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);

    setBrandStats(brandArray);
    setTimeStats(timeArray);
  };

  const exportCSV = () => {
    const header = "Brand,Timestamp\n";
    const rows = scanData
      .map((d) => `${d.brand || "Unknown"},${d.timestamp}`)
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "snaptrack-scans.csv";
    link.click();
  };

  if (!["pro", "garage", "owner"].includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapTrack is available for Pro, Garage, and Owner users only.</p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => window.location.href = "/pricing"}
          >
            Upgrade Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapTrack – Usage Analytics</title>
        <meta
          name="description"
          content="View scan history, vehicle trends, and diagnostic usage patterns."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold">SnapTrack Analytics</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Scan Volume by Hour</h2>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={timeStats}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <XAxis
                  dataKey="hour"
                  label={{ value: "Hour", position: "insideBottom", offset: -10 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>

            <h2 className="text-xl font-semibold">Top Scanned Brands</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brandStats}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {brandStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </main>
    </>
  );
}
