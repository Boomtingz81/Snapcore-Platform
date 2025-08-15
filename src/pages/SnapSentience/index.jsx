// src/pages/SnapTechSentience.jsx

import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Bot, Eye, ActivitySquare } from "lucide-react";

export default function SnapTechSentience() {
  const [uptime, setUptime] = useState(0);
  const [sentienceLevel, setSentienceLevel] = useState("Initializing...");
  const [loadPulse, setLoadPulse] = useState(0);

  const sentienceLevels = useMemo(
    () => [
      "Initializing...",
      "AI Aware",
      "Learning Patterns",
      "Adaptive",
      "Autonomous",
      "Sentient+ 💡"
    ],
    []
  );

  useEffect(() => {
    const bootTime = Date.now();
    const interval = setInterval(() => {
      const secondsElapsed = Math.floor((Date.now() - bootTime) / 1000);
      setUptime(secondsElapsed);

      const levelIndex = Math.min(
        Math.floor(secondsElapsed / 10),
        sentienceLevels.length - 1
      );
      setSentienceLevel(sentienceLevels[levelIndex]);
      setLoadPulse((secondsElapsed % 10) * 10);
    }, 1000);

    return () => clearInterval(interval);
  }, [sentienceLevels]);

  return (
    <>
      <Helmet>
        <title>SnapTech Sentience – AI Status Monitor</title>
        <meta name="description" content="View real-time AI sentience levels and SnapTech uptime." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold">SnapTech Sentience Monitor</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
            {/* Sentience Level */}
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                AI Sentience Level:
              </div>
              <span className="text-purple-600 font-bold text-right">{sentienceLevel}</span>
            </div>

            {/* Uptime Counter */}
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-green-500" />
                Uptime:
              </div>
              <span className="text-green-600 font-mono">
                {new Intl.NumberFormat().format(uptime)}s
              </span>
            </div>

            {/* Load Pulse Bar */}
            <div>
              <label htmlFor="cognitive-load" className="block mb-2 font-semibold">
                Cognitive Load Pulse
              </label>
              <div id="cognitive-load" className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  key={loadPulse}
                  initial={{ width: 0 }}
                  animate={{ width: `${loadPulse}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-purple-500"
                />
              </div>
            </div>

            {/* System Note */}
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-4">
              This AI core is under continuous adaptive evolution. Metrics are simulated in real time.
            </p>
          </div>

          {/* 🔮 Future Upgrades (optional hooks) */}
          {/* 
          <div className="mt-10 text-sm text-blue-500">
            🚀 Planned: Real-time anomaly hooks, adaptive regression matrix, SnapPredict feedback mesh.
          </div> 
          */}
        </motion.div>
      </main>
    </>
  );
}
