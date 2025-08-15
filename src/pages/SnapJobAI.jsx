// src/pages/SnapJobAI.jsx

import { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ClipboardList, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapJobAI() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [customer, setCustomer] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [faults, setFaults] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔒 Restrict access to Pro, Garage, Owner tiers
  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center px-4">
          <Lock className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm">Only Pro, Garage, and Owner users can access SnapJob AI.</p>
        </div>
      </main>
    );
  }

  // 🧠 Generate job card using GPT
  const generateJobCard = async () => {
    setLoading(true);
    setJobCard(null);

    try {
      const payload = {
        customer,
        vehicle,
        faults,
        recommendation,
      };

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a professional vehicle technician assistant creating clean, formatted job cards for customer documentation.",
            },
            {
              role: "user",
              content: `Create a full job card for the following:\nCustomer: ${customer}\nVehicle: ${vehicle}\nReported Faults: ${faults}\nRecommended Action: ${recommendation}`,
            },
          ],
        }),
      });

      const data = await res.json();
      setJobCard(data.choices?.[0]?.message?.content || "No job card generated.");
    } catch (err) {
      console.error("❌ Job card generation error:", err);
      setJobCard("⚠️ Failed to generate job card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>SnapJob AI Generator</title>
        <meta name="description" content="Generate professional job cards powered by SnapTech AI." />
      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="w-7 h-7 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapJob AI Generator</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl space-y-4">
            <input
              type="text"
              placeholder="Customer Name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600"
            />
            <input
              type="text"
              placeholder="Vehicle Details (Make, Model, Reg)"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600"
            />
            <textarea
              rows={3}
              placeholder="Reported Faults"
              value={faults}
              onChange={(e) => setFaults(e.target.value)}
              className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600"
            ></textarea>
            <textarea
              rows={3}
              placeholder="Recommended Actions"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600"
            ></textarea>

            <button
              onClick={generateJobCard}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded"
            >
              {loading ? "Generating..." : "Generate Job Card"}
            </button>

            {jobCard && (
              <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-4 rounded mt-6 whitespace-pre-wrap text-sm">
                {jobCard}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
