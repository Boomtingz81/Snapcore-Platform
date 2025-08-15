import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Wrench, Lock } from "lucide-react";

// ✅ Allowed tiers
const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapReset() {
  const [tier] = useState("pro"); // ⬅️ Replace with real auth logic
  const [resets, setResets] = useState([]);
  const [filter, setFilter] = useState("");
  const [voiceMode] = useState(false); // ⬅️ Future: SnapTech voice guidance
  const [apiMode] = useState(false);   // ⬅️ Future: Use live API instead of localStorage

  // ✅ Load reset procedures (API or Local)
  useEffect(() => {
    if (apiMode) {
      // 🔗 Future: Fetch from secure backend (auth required)
      // fetch("/api/snapreset")
      //   .then(res => res.json())
      //   .then(data => setResets(data))
      //   .catch(err => console.error("API Fetch Error:", err));
      return;
    }

    try {
      const saved = localStorage.getItem("snap-reset-procedures");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setResets(parsed);
      }
    } catch (err) {
      console.error("❌ Error parsing reset procedures:", err);
    }
  }, [apiMode]);

  // 🔍 Search filter
  const filteredResets = useMemo(() => {
    const search = filter.toLowerCase();
    return resets.filter(
      (r) =>
        r?.vehicle?.toLowerCase().includes(search) ||
        r?.system?.toLowerCase().includes(search) ||
        r?.procedure?.toLowerCase().includes(search)
    );
  }, [resets, filter]);

  // 🔐 Tier gatekeeping
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">
            SnapReset is only available to Pro, Garage, and Owner users.
          </p>
        </div>
      </main>
    );
  }

  // 🗣️ Voice Playback Hook (SnapTech - Future)
  const playResetVoice = (entry) => {
    if (!voiceMode) return;
    const utterance = new SpeechSynthesisUtterance(
      `Reset procedure for ${entry.vehicle}, ${entry.system}. ${entry.procedure}`
    );
    speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Helmet>
        <title>SnapReset – Service Procedures</title>
        <meta
          name="description"
          content="Access reset instructions for vehicle service lights and systems."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <h1 className="text-3xl font-bold">SnapReset</h1>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by vehicle, system, or reset type..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-3 mb-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />

          {/* Result List */}
          {filteredResets.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No reset procedures found.
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredResets.map((entry, idx) => {
                const isAdvanced = entry.advanced === true;

                // 🔐 Optional: Garage-only reset protection
                if (isAdvanced && tier !== "garage" && tier !== "owner") return null;

                return (
                  <li
                    key={idx}
                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-lg shadow"
                    onClick={() => playResetVoice(entry)} // 🗣️ SnapTech voice trigger
                  >
                    <div className="mb-2">
                      <div className="text-sm font-semibold text-orange-600">
                        {entry.vehicle}
                      </div>
                      <div className="text-xs text-gray-500">
                        System: {entry.system}
                        {isAdvanced && (
                          <span className="ml-2 text-red-500 font-medium">(Advanced)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-line text-gray-800 dark:text-gray-200">
                      {entry.procedure}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </main>
    </>
  );
}
