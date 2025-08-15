// src/pages/VINDecoder.jsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Keyboard, Loader2, Trash2, BotMessageSquare, Download, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import fetchVehicleData from "../../api/vehicleLookup";
import jsPDF from "jspdf";

// VIN format validator
const isValidVIN = (vin) => /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);

export default function VINDecoder() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("vin_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("vinInput")?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setVehicleData(null);

    if (!isValidVIN(vin)) {
      setError("Invalid VIN format. VIN must be 17 alphanumeric characters (no I, O, Q).");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchVehicleData({ type: "vin", value: vin });
      if (!data || typeof data !== "object") throw new Error("Invalid data received.");
      setVehicleData(data);

      const newEntry = { vin, timestamp: new Date().toISOString() };
      const newHistory = [newEntry, ...history.slice(0, 9)];
      setHistory(newHistory);
      localStorage.setItem("vin_history", JSON.stringify(newHistory));
    } catch (err) {
      setError("Failed to decode VIN. Please check your connection or try a different VIN.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setVin("");
    setVehicleData(null);
    setError("");
  }

  function exportToPDF() {
    if (!vehicleData) return;
    const doc = new jsPDF();
    doc.text(`SnapCore AI - VIN Report`, 20, 20);
    doc.text(`VIN: ${vin}`, 20, 30);
    let y = 40;
    Object.entries(vehicleData).forEach(([key, value]) => {
      doc.text(`${key.replace(/_/g, " ")}: ${String(value)}`, 20, y);
      y += 7;
    });
    doc.save(`SnapCore_VIN_${vin}.pdf`);
  }

  return (
    <>
      <Helmet>
        <title>VIN Decoder – SnapCore AI</title>
        <meta name="description" content="Enter a 17-character VIN to decode detailed vehicle information using SnapCore AI." />
        <link rel="canonical" href="https://snapcore.ai/vin" />
        <meta property="og:title" content="VIN Decoder – SnapCore AI" />
        <meta property="og:description" content="Use SnapCore AI to decode any VIN into detailed specs and history." />
        <meta property="og:url" content="https://snapcore.ai/vin" />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-[80vh] px-6 py-20 bg-white dark:bg-gray-900 text-center"
        aria-labelledby="vin-heading"
      >
        <h1 id="vin-heading" className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          VIN Decoder
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
          Enter your 17-character VIN to reveal manufacturer data, model specs, and build information.
        </p>

        {error && <p role="alert" className="text-red-500 mb-4">{error}</p>}
        {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500 mb-4" />}

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700"
          aria-label="VIN decoder form"
        >
          <Keyboard className="mx-auto h-8 w-8 text-blue-600 mb-4" />
          <input
            id="vinInput"
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase())}
            placeholder="e.g. VF1RFB00769740329"
            className="w-full px-4 py-2 rounded-md border dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-center font-mono tracking-widest"
            maxLength={17}
            aria-label="Enter VIN code"
            autoComplete="off"
            required
          />
          <button
            type="submit"
            disabled={loading || vin.length !== 17}
            className={`mt-4 w-full px-4 py-2 rounded-lg font-semibold transition text-white ${
              loading || vin.length !== 17 ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Decode VIN
          </button>
        </form>

        {vehicleData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-12 max-w-3xl mx-auto bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow"
          >
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Vehicle Info</h3>
            <div className="text-left text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {Object.entries(vehicleData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={handleClear}
                className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
              >
                <Trash2 className="mr-1 w-4 h-4" /> Clear
              </button>

              <button
                onClick={exportToPDF}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <Download className="mr-1 w-4 h-4" /> Export PDF
              </button>
            </div>

            <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <BotMessageSquare className="w-4 h-4" />
              <Link to={`/snaptech?vin=${vin}`} className="hover:underline">
                Ask SnapTech AI about this VIN
              </Link>
            </div>
          </motion.div>
        )}

        {history.length > 0 && (
          <div className="mt-16 max-w-2xl mx-auto text-left">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Clock className="mr-2 w-5 h-5" /> Previous VIN Lookups
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {history.map((entry, idx) => (
                <li key={idx} className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-1">
                  <span>{entry.vin}</span>
                  <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          Looking for deeper diagnostics? Use{" "}
          <Link to="/snaptech" className="text-blue-600 hover:underline">
            SnapTech AI
          </Link>{" "}
          for technical queries and fault detection.
        </p>
      </motion.section>
    </>
  );
}
