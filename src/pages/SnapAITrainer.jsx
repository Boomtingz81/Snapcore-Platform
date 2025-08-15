// src/pages/SnapAITrainer.jsx

import { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { UploadCloud, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];

export default function SnapAITrainer() {
  const [tier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [fileName, setFileName] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [message, setMessage] = useState("");

  // Handle file selection
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["text/plain", "application/json", "text/csv"].includes(file.type)) {
      setMessage("❌ Unsupported file type.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      setFileContent(reader.result);
      setMessage("✅ File loaded and ready.");
    };
    reader.readAsText(file);
  };

  // Simulate upload to AI
  const handleUpload = () => {
    if (!fileContent) return;

    // Simulate local training (can be replaced with API call)
    const logs = JSON.parse(localStorage.getItem("snaptech-training") || "[]");
    logs.push({ name: fileName, data: fileContent, time: new Date().toISOString() });
    localStorage.setItem("snaptech-training", JSON.stringify(logs));
    setMessage("✅ File submitted for AI training.");
    setFileName(null);
    setFileContent(null);
  };

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">SnapAI Trainer is only available for Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapAI Trainer – Upload Scan Logs</title>
        <meta name="description" content="Train SnapTech AI using past fault logs or scan sessions." />
      </Helmet>

      <main className="min-h-screen px-6 py-14 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <header className="flex items-center gap-3 mb-6">
            <UploadCloud className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold">SnapAI Trainer</h1>
          </header>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Upload historical fault logs to improve SnapTech’s prediction and diagnostic accuracy.
          </p>

          <input
            type="file"
            accept=".txt,.csv,.json"
            onChange={handleFile}
            className="mb-4"
          />

          {fileName && (
            <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
              Previewing: <strong>{fileName}</strong>
              <pre className="text-xs mt-2 max-h-40 overflow-y-auto">{fileContent?.slice(0, 300)}...</pre>
            </div>
          )}

          <button
            disabled={!fileContent}
            onClick={handleUpload}
            className={`px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition ${!fileContent && "opacity-50 cursor-not-allowed"}`}
          >
            Submit to SnapTech AI
          </button>

          {message && (
            <p className="mt-4 text-sm font-medium text-green-500 dark:text-green-400">{message}</p>
          )}
        </motion.div>
      </main>
    </>
  );
}
