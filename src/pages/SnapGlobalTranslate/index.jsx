// src/pages/SnapGlobalTranslate.jsx

import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Languages, Bot, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "ur", name: "Urdu" }
];

export default function SnapGlobalTranslate() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("es");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedLanguage = useMemo(() => {
    return LANGUAGES.find(l => l.code === language)?.name || "Selected";
  }, [language]);

  const handleTranslate = async () => {
    const input = text.trim();
    if (!input) {
      setError("Please enter text to translate.");
      return;
    }

    setLoading(true);
    setTranslated("");
    setError("");

    try {
      // Replace with live API call later
      await new Promise(res => setTimeout(res, 1000));

      setTranslated(
        `🌍 [${selectedLanguage} Translation of]:\n\n${input}`
      );
    } catch (err) {
      console.error("❌ Translation error:", err);
      setError("Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-sm">SnapGlobal Translate is only available to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapGlobal Translate – Multilingual Toolkit</title>
        <meta name="description" content="Translate SnapTech replies and diagnostics into multiple languages." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Languages className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapGlobal Translate</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-5">
            <textarea
              rows={4}
              className="w-full p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              placeholder="Enter SnapTech message or fault explanation..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <select
                className="p-2 text-sm border rounded dark:border-gray-600 dark:bg-gray-900"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleTranslate}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Translating..." : "Translate"}
              </button>
            </div>

            {error && <div className="text-sm text-red-500">{error}</div>}

            {translated && (
              <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 p-4 rounded-lg text-sm whitespace-pre-line">
                <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                  <Bot className="w-4 h-4" />
                  SnapTech Translation:
                </div>
                {translated}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
