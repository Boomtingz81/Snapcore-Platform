import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  ScanLine,
  Loader2,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

// ✅ Validations
const isValidPlate = (plate) => /^[A-Z0-9]{2,10}$/i.test(plate);
const isValidVIN = (vin) => /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);

// 🔐 Simulated user tier
const userTier = "Pro"; // Lite / Pro / Garage / Owner

export default function Scan() {
  const [plateInput, setPlateInput] = useState("");
  const [vinInput, setVinInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🎥 Simulated Scan (camera OCR future-ready)
  async function handleScan() {
    setError("");
    setScanning(true);

    if (!["Pro", "Garage", "Owner"].includes(userTier)) {
      setError("Camera scanning is only available in SnapCore Pro or higher.");
      setScanning(false);
      return;
    }

    try {
      // 🧠 Future: Real OCR camera logic
      // navigator.mediaDevices.getUserMedia({ video: true }) ...
      await new Promise((res) => setTimeout(res, 1500));
      const simulatedPlate = "LS12XYZ";
      setPlateInput(simulatedPlate);
      saveToHistory("Plate", simulatedPlate, "Success");
    } catch {
      setError("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  }

  // 💾 Save to local scan history
  function saveToHistory(type, value, status) {
    const entry = {
      type,
      value,
      status,
      date: new Date().toISOString(),
    };
    const prev = JSON.parse(localStorage.getItem("snapcore_history") || "[]");
    localStorage.setItem("snapcore_history", JSON.stringify([entry, ...prev].slice(0, 100)));
  }

  // 🔁 Relay to SnapTech AI (future use)
  function handleRelaySubmit() {
    if (!plateInput && !vinInput) return;
    saveToHistory(plateInput ? "Plate" : "VIN", plateInput || vinInput, "Manual");
  }

  return (
    <>
      <Helmet>
        <title>AI Plate & VIN Scanner – SnapCore AI</title>
        <meta name="description" content="Scan plates or VINs with SnapCore AI's intelligent vehicle recognition system." />
        <link rel="canonical" href="https://snapcore.ai/scan" />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[80vh] px-6 py-20 bg-white dark:bg-gray-900 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Smart Scan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-10">
          Scan number plates or enter VINs manually. SnapCore AI connects everything instantly.
        </p>

        {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
        {scanning && <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500 mb-4" />}

        <div
          className="max-w-xl mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700"
          aria-label="Scan input form"
        >
          {/* 📍 Plate Field */}
          <div className="mb-6">
            <label htmlFor="plateInput" className="block mb-2 font-medium text-gray-800 dark:text-white">
              Number Plate
            </label>
            <div className="flex items-center gap-2">
              <input
                id="plateInput"
                type="text"
                value={plateInput}
                onChange={(e) =>
                  setPlateInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, ""))
                }
                className="flex-1 px-4 py-2 rounded border dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-center font-mono tracking-widest"
                placeholder="e.g. LS12XYZ"
                maxLength={10}
                aria-label="Enter plate"
              />
              <button
                onClick={handleScan}
                disabled={scanning}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                aria-label="Start number plate scan"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 🧬 VIN Field */}
          <div className="mb-6">
            <label htmlFor="vinInput" className="block mb-2 font-medium text-gray-800 dark:text-white">
              VIN (optional)
            </label>
            <input
              id="vinInput"
              type="text"
              value={vinInput}
              onChange={(e) =>
                setVinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, ""))
              }
              className="w-full px-4 py-2 rounded border dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-center font-mono tracking-widest"
              placeholder="e.g. VF1RFB00769740329"
              maxLength={17}
              aria-label="Enter VIN"
            />
          </div>

          {/* 🔍 Submit */}
          <Link
            to={`/snaptech?plate=${plateInput}&vin=${vinInput}`}
            onClick={handleRelaySubmit}
            className={`mt-4 w-full inline-block px-4 py-2 text-white text-center rounded-lg font-semibold transition ${
              plateInput || vinInput
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed pointer-events-none"
            }`}
            aria-disabled={!(plateInput || vinInput)}
          >
            <ScanLine className="inline-block w-5 h-5 mr-2" />
            Scan with SnapTech
          </Link>
        </div>

        <div className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          Want deeper diagnostics or service resets? Ask{" "}
          <Link to="/snaptech" className="text-blue-600 hover:underline">
            SnapTech AI
          </Link>{" "}
          for recalls, repair paths, and history.
        </div>

        <div className="mt-4 flex justify-center items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <ShieldCheck className="w-4 h-4" />
          OCR camera scan module will be activated soon
        </div>
      </motion.section>
    </>
  );
}