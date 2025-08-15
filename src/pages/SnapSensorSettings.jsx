// src/pages/SnapSensorSettings.jsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Settings, Lock } from "lucide-react";

const ALLOWED_TIERS = ["pro", "garage", "owner"];
const DEFAULT_SENSORS = ["RPM", "CoolantTemp", "Speed", "Throttle", "Load"];
const DEFAULT_INTERVAL = 2000;

export default function SnapSensorSettings() {
  const [tier, setTier] = useState(() => localStorage.getItem("user-tier") || "lite");
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [updateInterval, setUpdateInterval] = useState(DEFAULT_INTERVAL);

  // Load saved settings
  useEffect(() => {
    const savedSensors = JSON.parse(localStorage.getItem("snapcore-sensors")) || DEFAULT_SENSORS;
    const savedInterval = parseInt(localStorage.getItem("snapcore-interval")) || DEFAULT_INTERVAL;

    setSelectedSensors(savedSensors);
    setUpdateInterval(savedInterval);
  }, []);

  // Save when settings change
  useEffect(() => {
    localStorage.setItem("snapcore-sensors", JSON.stringify(selectedSensors));
    localStorage.setItem("snapcore-interval", updateInterval.toString());
  }, [selectedSensors, updateInterval]);

  const toggleSensor = (sensor) => {
    setSelectedSensors((prev) =>
      prev.includes(sensor)
        ? prev.filter((s) => s !== sensor)
        : [...prev, sensor]
    );
  };

  if (!ALLOWED_TIERS.includes(tier)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <div className="text-center">
          <Lock className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">Sensor settings are only available to Pro, Garage, and Owner tiers.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>SnapSensor Settings – Configure Sensors</title>
        <meta name="description" content="Manage which vehicle sensors are active in live diagnostics." />
      </Helmet>

      <main className="min-h-screen px-6 py-14 bg-white dark:bg-gray-950 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <header className="flex items-center gap-3 mb-6">
            <Settings className="h-7 w-7 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold">SnapSensor Settings</h1>
          </header>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Choose which sensor values to track and how often to update live readings.
          </p>

          {/* Sensor toggles */}
          <div className="mb-8">
            <h2 className="font-semibold mb-2">Select Sensors</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {DEFAULT_SENSORS.map((sensor) => (
                <label key={sensor} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSensors.includes(sensor)}
                    onChange={() => toggleSensor(sensor)}
                    className="accent-blue-600"
                  />
                  {sensor}
                </label>
              ))}
            </div>
          </div>

          {/* Update interval */}
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Update Interval</h2>
            <select
              value={updateInterval}
              onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
            >
              <option value={1000}>Every 1 second</option>
              <option value={2000}>Every 2 seconds</option>
              <option value={5000}>Every 5 seconds</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Settings are automatically saved and used across SnapLive modules.
          </div>
        </motion.div>
      </main>
    </>
  );
}
