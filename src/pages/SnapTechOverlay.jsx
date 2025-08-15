// src/pages/SnapTechOverlay.jsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Bot, Lock, Sparkles } from "lucide-react";

// 🧠 SnapTech Overlay – Live AI Commentary System
const ALLOWED_TIERS = ["pro", "garage", "owner"];
const API_ENDPOINT = "http://localhost:5001/snaptech/commentary"; // ⬅️ Replace with live AI API

export default function SnapTechOverlay() {
  const [tier, setTier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [commentary, setCommentary] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔁 Fetch new AI commentary every 6 seconds (real API-ready)
  useEffect(() => {
    if (!ALLOWED_TIERS.includes(tier)) return;

    const interval = setInterval(async () => {
      setLoading(true);
      try {
        const res = await fetch(API_ENDPOINT);
        const data = await res.json();

        if (data && data.comment) {
          setCommentary((prev) => [data.comment, ...prev.slice(0, 19)]);
        }
      } catch (err) {
        console.error("❌ SnapTech AI Error:", err);
      }
      setLoading(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [tier]);

  // 🔒 Tier Access Lock
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapTech Overlay is only available to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  // 🧠 Live Commentary Output
  return (
    <>
      <Helmet>
        <title>SnapTech Overlay – Live AI Commentary</title>
        <meta name="description" content="AI-powered real-time insight from SnapTech during diagnostics." />
      </Helmet>

      <main className="min-h-screen px-6 py-14 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <header className="flex items-center gap-3 mb-6">
            <Bot className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold">SnapTech Overlay</h1>
          </header>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Live AI-powered commentary while your vehicle is being scanned. SnapTech interprets and explains what’s happening in real-time.
          </p>

          <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-md p-6 space-y-4">
            {loading && <p className="text-sm text-blue-500">Analyzing live vehicle data...</p>}
            {commentary.length === 0 && !loading && (
              <p className="text-sm text-gray-400">Awaiting AI commentary...</p>
            )}
            {commentary.map((msg, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Sparkles className="text-purple-500 mt-1" />
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </>
  );
}
