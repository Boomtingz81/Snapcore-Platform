// src/pages/PlateScanner/index.jsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Camera, Keyboard, ScanSearch, Loader2, Trash2, BotMessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { isValidUKPlate } from "../../utils/validators"; // ✅ Correct path
import fetchVehicleData from "../../api/vehicleLookup"; // ✅ Correct path

export default function PlateScanner() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("plateInput")?.focus();
  }, []);

  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState("");

  async function handlePlateSubmit(e) {
    e.preventDefault();
    setError("");
    setVehicleData(null);

    if (!isValidUKPlate(plate)) {
      setError("Invalid UK plate format.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchVehicleData({ type: "plate", value: plate });
      setVehicleData(data);
    } catch (err) {
      setError("Failed to retrieve vehicle data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVinSubmit(e) {
    e.preventDefault();
    setError("");
    setVehicleData(null);

    if (vin.length !== 17) {
      setError("VIN must be 17 characters long.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchVehicleData({ type: "vin", value: vin });
      setVehicleData(data);
    } catch (err) {
      setError("Failed to decode VIN.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setPlate("");
    setVin("");
    setVehicleData(null);
    setError("");
  }

  return (
    <>
      <Helmet>
        <title>Number Plate & VIN Decoder – SnapCore AI</title>
        <meta
          name="description"
          content="Scan a number plate or enter a VIN to retrieve vehicle data instantly. Powered by SnapCore AI."
        />
        <link rel="canonical" href="https://snapcore.ai/plate" />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-[80vh] px-6 py-20 bg-white dark:bg-gray-900 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Number Plate & VIN Decoder
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
          Use your camera to scan a plate or manually enter a VIN to get detailed vehicle info.
        </p>

        {error && <p role="alert" className="text-red-500 mb-4">{error}</p>}
        {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500 mb-4" />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Plate Entry */}
          <motion.form
            onSubmit={handlePlateSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow"
          >
            <ScanSearch className="mx-auto h-8 w-8 text-blue-600 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Plate Entry</h2>
            <input
              id="plateInput"
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase())}
              placeholder="e.g. AB12 CDE"
              className="w-full px-4 py-2 rounded-md border text-center font-mono"
              maxLength={10}
            />
            <button
              type="submit"
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Decode Plate
            </button>
          </motion.form>

          {/* VIN Entry */}
          <motion.form
            onSubmit={handleVinSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow"
          >
            <Keyboard className="mx-auto h-8 w-8 text-blue-600 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">VIN Entry</h2>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase())}
              placeholder="e.g. VF1RFB00769740329"
              className="w-full px-4 py-2 rounded-md border text-center font-mono"
              maxLength={20}
            />
            <button
              type="submit"
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Decode VIN
            </button>
          </motion.form>
        </div>

        {vehicleData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-12 max-w-3xl mx-auto bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow"
          >
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Vehicle Info</h3>
            {Object.entries(vehicleData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
            <button
              onClick={handleClear}
              className="mt-6 inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium"
            >
              <Trash2 className="mr-1 w-4 h-4" /> Clear
            </button>
            <div className="mt-4 text-blue-600 flex items-center gap-2">
              <BotMessageSquare className="w-4 h-4" />
              <Link to="/snaptech" className="hover:underline">Ask SnapTech AI about this vehicle</Link>
            </div>
          </motion.div>
        )}
      </motion.section>
    </>
  );
}