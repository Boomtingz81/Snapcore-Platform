// src/pages/SnapLab.jsx

import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { FlaskConical, Terminal, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage"]; // Update when auth context added

export default function SnapLab() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tier] = useState("pro"); // Simulated tier

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("snaplab-history");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn("Failed to parse SnapLab history:", err);
      return [];
    }
  });

  const sanitize = (text) => {
    if (!text) return "";
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  };

  const runExperiment = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("⏳ Processing...");

    try {
      // Simulated AI output
      const response = `Simulated AI output for: "${input}"`;

      const newEntry = {
        id: Date.now(),
        input,
        output: response,
        timestamp: new Date().toISOString(),
      };

      const newHistory = [newEntry, ...history];
      setOutput(response);
      setHistory(newHistory);

      setTimeout(() => {
        try {
          localStorage.setItem("snaplab-history", JSON.stringify(newHistory));
        } catch (err) {
          console.warn("Failed to save SnapLab history:", err);
        }
      }, 100); // Prevent immediate re-writes

      setInput("");
    } catch (err) {
      console.error("Experiment error:", err);
      setOutput("⚠️ Error running experiment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `snaplab-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem("snaplab-history");
    } catch (err) {
      console.warn("Failed to clear SnapLab history:", err);
    }
  }, []);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapLab is available for Pro and Garage users only.</p>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Upgrade Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapLab – Experimental AI Zone</title>
        <meta name="description" content="Test AI features and run experiments in SnapLab." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <FlaskConical className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold">SnapLab AI Sandbox</h1>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 p-4 rounded-xl mb-6">
            <strong>Warning:</strong> SnapLab runs experimental and unverified logic. Use with caution.
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
            <label htmlFor="experiment-input" className="block mb-2 font-semibold">
              Enter Experiment Prompt:
            </label>
            <textarea
              id="experiment-input"
              className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 resize-none"
              rows={4}
              placeholder="Describe your AI experiment..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            ></textarea>

            <div className="flex flex-wrap gap-4 mt-4">
              <button
                onClick={runExperiment}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Running..." : "Run Experiment"}
              </button>
              <button
                onClick={exportHistory}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Export History
              </button>
              <button
                onClick={clearHistory}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Clear History
              </button>
            </div>
          </div>

          {output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 rounded-xl mb-8"
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-purple-500" /> AI Output:
              </h2>
              <pre
                className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: sanitize(output) }}
              />
            </motion.div>
          )}

          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 rounded-xl"
            >
              <h3 className="font-semibold mb-4">Experiment History</h3>
              <ul className="space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <strong className="text-purple-600">Prompt:</strong> {sanitize(h.input)}<br />
                    <strong className="text-purple-600">Output:</strong> {sanitize(h.output)}<br />
                    <small className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(h.timestamp).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  );
}
