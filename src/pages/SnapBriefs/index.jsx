import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { BellRing, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapBriefs() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [briefs, setBriefs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("snap-briefs");
      const parsed = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(parsed)) {
        throw new Error("Briefs data is not an array.");
      }

      const sortedBriefs = parsed
        .filter((brief) => brief && brief.message)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setBriefs(sortedBriefs);
    } catch (err) {
      console.error("SnapBriefs Load Error:", err);
      setError("⚠️ Failed to load SnapBriefs. Please check local storage format.");
    }
  }, []);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">SnapBriefs are available to Pro, Garage, and Owner tiers only.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapBriefs</title>
        <meta name="description" content="Receive real-time AI system updates, change notices, and alerts." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <BellRing className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
            <h1 className="text-3xl font-bold">SnapBriefs</h1>
          </div>

          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : briefs.length === 0 ? (
            <p className="text-sm text-gray-500">No system briefs available.</p>
          ) : (
            <ul className="space-y-4">
              {briefs.map((brief, index) => (
                <li
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500 text-sm"
                >
                  <p className="font-semibold">
                    {brief.title ? `📣 ${brief.title}` : "📣 System Update"}
                  </p>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    {brief.message || "No message provided."}
                  </p>
                  {brief.timestamp && (
                    <p className="mt-2 text-xs text-gray-500">
                      🕒 {new Date(brief.timestamp).toLocaleString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </main>
    </>
  );
}
