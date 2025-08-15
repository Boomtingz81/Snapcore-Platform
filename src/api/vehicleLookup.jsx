// src/pages/VehicleLookup.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import RegistrationSearch from "../components/RegistrationSearch";

export default function VehicleLookup() {
  const [searchParams] = useSearchParams();
  const [reg, setReg] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState("");

  // ✅ Fetch vehicle details from API
  const fetchVehicleData = async (registration) => {
    if (!registration.trim()) return;
    setLoading(true);
    setError("");
    setVehicleData(null);

    try {
      const response = await fetch(
        `https://api.carapi.com/v1/lookup?registration=${registration}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_CARAPI_TOKEN}`,
          },
        }
      );

      if (!response.ok) throw new Error("Vehicle not found");
      const data = await response.json();
      setVehicleData(data);
    } catch (err) {
      setError(err.message || "Error fetching vehicle data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-fill & auto-search if ?reg= exists
  useEffect(() => {
    const regParam = searchParams.get("reg");
    if (regParam) {
      const formatted = regParam.toUpperCase();
      setReg(formatted);
      fetchVehicleData(formatted);
    }
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Vehicle Lookup – SnapCore AI</title>
        <meta
          name="description"
          content="Instantly look up vehicle details using registration number."
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col items-center p-6 text-white">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-6 text-center"
        >
          Vehicle Lookup
        </motion.h1>

        {/* ✅ Shared RegistrationSearch */}
        <RegistrationSearch
          initialValue={reg}
          autoFocus
          onSearch={(value) => {
            setReg(value);
            fetchVehicleData(value);
          }}
        />

        {/* Error Message */}
        {error && (
          <p className="text-red-400 mb-4 font-semibold">{error}</p>
        )}

        {/* Vehicle Data Display */}
        {vehicleData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg text-gray-900 dark:text-white"
          >
            <h2 className="text-xl font-bold mb-3">Vehicle Details</h2>
            <p><strong>Make:</strong> {vehicleData.make}</p>
            <p><strong>Model:</strong> {vehicleData.model}</p>
            <p><strong>Year:</strong> {vehicleData.year}</p>
            <p><strong>Fuel:</strong> {vehicleData.fuelType}</p>
          </motion.div>
        )}
      </main>
    </>
  );
}
