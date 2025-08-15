// src/pages/SnapAnalyticsDashboard.jsx

import { useEffect, useState } from "react"; import { Helmet } from "react-helmet"; import { motion } from "framer-motion"; import { BarChart3, Lock } from "lucide-react"; import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapAnalyticsDashboard() {   const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");   const [scanStats, setScanStats] = useState({     totalScans: 0,     topBrands: [],     topFaults: [],     lastScan: null,   });   const [aiSummary, setAiSummary] = useState("");

  useEffect(() => {     try {       const raw = localStorage.getItem("snapcore-scan-stats");       if (!raw) return;

      const parsed = JSON.parse(raw);       if (parsed && typeof parsed === "object") {         setScanStats({           totalScans: parsed.totalScans || 0,           topBrands: parsed.topBrands || [],           topFaults: parsed.topFaults || [],           lastScan: parsed.lastScan || null,         });

        // Auto-generate AI summary locally         const summary = generateSummary(parsed);         setAiSummary(summary);       }     } catch (err) {       console.error("❌ Failed to load scan stats:", err);     }   }, []);

  const generateSummary = (data) => {     const brand = data.topBrands?.[0];     const fault = data.topFaults?.[0];     if (!brand && !fault) return "No diagnostic insights available yet.";     return Top brand: ${brand || "-"}. Most frequent fault: ${fault || "-"}. Keep scanning for trends.;   };

  if (!ALLOWED_TIERS.includes(tier)) {     return (       <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">         <div className="text-center px-4">           <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />           <h1 className="text-2xl font-bold">Access Denied</h1>           <p className="mt-2 text-sm">Only Pro, Garage, and Owner users can access analytics.</p>         </div>       </main>     );   }

  const { totalScans, topBrands, topFaults, lastScan } = scanStats;

  return (     <>       <Helmet>         <title>SnapAnalytics Dashboard</title>         <meta name="description" content="Track diagnostic activity and usage trends on SnapCore." />       </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">         <motion.div           initial={{ opacity: 0, y: 25 }}           animate={{ opacity: 1, y: 0 }}           transition={{ duration: 0.4 }}           className="max-w-4xl mx-auto"         >           <header className="flex items-center gap-3 mb-6">             <BarChart3 className="w-7 h-7 text-sky-600 dark:text-sky-400" />             <h1 className="text-3xl font-bold">SnapAnalytics Dashboard</h1>           </header>

          <section className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-5">             <p className="text-sm">               📊 <strong>Total Scans:</strong>{" "}               <span className="font-semibold text-sky-700 dark:text-sky-300">{totalScans}</span>             </p>

            {lastScan && (               <p className="text-sm">                 🕒 <strong>Last Scan:</strong>{" "}                 <span className="font-mono">                   {new Date(lastScan).toLocaleString("en-GB", {                     dateStyle: "short",                     timeStyle: "short",                   })}                 </span>               </p>             )}

            {aiSummary && (               <p className="text-sm text-indigo-600 dark:text-indigo-300">                 🤖 <strong>AI Summary:</strong> {aiSummary}               </p>             )}

            {topFaults.length > 0 && (               <div>                 <h2 className="text-md font-semibold mt-4 mb-2">🔥 Top Faults</h2>                 <ResponsiveContainer width="100%" height={200}>                   <BarChart data={topFaults.map((fault) => ({ name: fault, value: 1 }))}>                     <XAxis dataKey="name" />                     <YAxis hide />                     <CartesianGrid strokeDasharray="3 3" />                     <Tooltip />                     <Bar dataKey="value" fill="#0284c7" />                   </BarChart>                 </ResponsiveContainer>               </div>             )}

            {topBrands.length > 0 && (               <div>                 <h2 className="text-md font-semibold mt-4 mb-2">🚗 Most Scanned Brands</h2>                 <ResponsiveContainer width="100%" height={200}>                   <BarChart data={topBrands.map((brand) => ({ name: brand, value: 1 }))}>                     <XAxis dataKey="name" />                     <YAxis hide />                     <CartesianGrid strokeDasharray="3 3" />                     <Tooltip />                     <Bar dataKey="value" fill="#16a34a" />                   </BarChart>                 </ResponsiveContainer>               </div>             )}           </section>         </motion.div>       </main>     </>   ); }


