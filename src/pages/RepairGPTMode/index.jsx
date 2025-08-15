import { useState } from "react";

import { Helmet } from "react-helmet";

import { motion } from "framer-motion";

import { Wrench, Bot, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function RepairGPT() {

  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");

  const [input, setInput] = useState("");

  const [response, setResponse] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleRepairQuery = async () => {

    const trimmedInput = input.trim();

    if (!trimmedInput) return;

    setLoading(true);

    setResponse("");

    setError("");

    try {

      // Replace this with real OpenAI or backend API call

      await new Promise((res) => setTimeout(res, 800));

      setResponse(

        `🔧 Suggested Fix for "${trimmedInput}":\n\n1. Inspect all associated sensors.\n2. Perform wiring continuity check.\n3. Clear DTCs and monitor system post-reset.\n\n⚠️ This is a simulated response. Live RepairGPT Mode will analyze your vehicle + fault data in real time.`

      );

    } catch (err) {

      console.error("❌ RepairGPT Error:", err);

      setError("Failed to fetch suggestion. Please try again later.");

    } finally {

      setLoading(false);

    }

  };

  if (!ALLOWED_TIERS.includes(tier)) {

    return (

      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">

        <div className="text-center">

          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />

          <h1 className="text-2xl font-bold">Access Denied</h1>

          <p className="mt-2 text-sm">RepairGPT is only available to Pro, Garage, and Owner tiers.</p>

        </div>

      </main>

    );

  }

  return (

    <>

      <Helmet>

        <title>RepairGPT – Smart Repair Assistant</title>

        <meta name="description" content="AI repair suggestions via SnapTech RepairGPT Mode." />

      </Helmet>

      <main className="min-h-screen px-6 py-16 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">

        <motion.div

          initial={{ opacity: 0, y: 25 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.5 }}

          className="max-w-3xl mx-auto"

        >

          <div className="flex items-center gap-3 mb-6">

            <Wrench className="h-8 w-8 text-orange-600 dark:text-orange-400" />

            <h1 className="text-3xl font-bold">RepairGPT Mode</h1>

          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-5">

            <div>

              <label className="block font-medium mb-1">Enter Fault Code or Symptom:</label>

              <textarea

                className="w-full p-3 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"

                rows={4}

                placeholder="e.g., P0171 – System Too Lean, rough idle on cold start..."

                value={input}

                onChange={(e) => setInput(e.target.value)}

              />

            </div>

            <button

              onClick={handleRepairQuery}

              disabled={loading || !input.trim()}

              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-5 py-2 rounded disabled:opacity-50"

            >

              {loading ? "Processing..." : "Get Repair Suggestion"}

            </button>

            {error && (

              <div className="text-sm text-red-600 mt-2">{error}</div>

            )}

            {response && (

              <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 p-4 rounded-lg text-sm whitespace-pre-line">

                <div className="flex items-center gap-2 text-orange-500 font-semibold mb-2">

                  <Bot className="w-4 h-4" />

                  SnapTech Suggests:

                </div>

                {response}

              </div>

            )}

          </div>

        </motion.div>

      </main>

    </>

  );

}

