import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Brain, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapPredict() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const storedData = localStorage.getItem("snap-predict");
        let data = [];

        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed)) {
            data = parsed;
          }
        }

        // If no local data, use fallback mock (or eventually fetch from SnapDNA API)
        if (data.length === 0) {
          data = [
            {
              vehicle: "Ford Focus 1.0 EcoBoost",
              riskArea: "Turbocharger",
              confidence: 87,
              suggestion: "Check for early signs of oil starvation or boost lag.",
            },
            {
              vehicle: "Nissan Leaf ZE1",
              riskArea: "HV Battery Cooling",
              confidence: 78,
              suggestion: "Service cooling fan and check coolant loop.",
            },
          ];
        }

        setPredictions(data);
      } catch (error) {
        console.error("❌ Failed to load SnapPredict data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapPredict is exclusive to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapPredict – AI Fault Forecast</title>
        <meta
          name="description"
          content="AI-powered module that forecasts potential vehicle issues using SnapDNA pattern analysis."
        />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-bold">SnapPredict</h1>
          </div>

          {/* Status or Predictions */}
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Loading AI fault predictions...
            </p>
          ) : predictions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No risk forecasts available for this vehicle.
            </p>
          ) : (
            <ul className="space-y-4">
              {predictions.map((item, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-5 rounded-lg shadow"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-indigo-600">
                      {item.vehicle || "Unknown Vehicle"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Confidence:{" "}
                      <strong className="text-indigo-500">
                        {item.confidence ?? "--"}%
                      </strong>
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    <strong>Risk Area:</strong> {item.riskArea || "Unspecified"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {item.suggestion || "No AI suggestion available."}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Future Upgrade Info */}
          <div className="mt-10 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="mb-2 font-semibold text-indigo-600">
              🔮 Coming Soon in SnapPredict Pro:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Real-time SnapDNA AI vehicle profile syncing</li>
              <li>SnapSentience early anomaly detection</li>
              <li>Predictive repair timelines and AI urgency score</li>
              <li>Live technician feedback loop for learning upgrades</li>
              <li>Graph-based risk trend analysis by vehicle model</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </>
  );
}
