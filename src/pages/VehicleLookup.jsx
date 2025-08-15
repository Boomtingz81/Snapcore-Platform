// 📄 src/pages/VehicleLookup.jsx

import React, { useState } from "react";
import fetchVehicleData from "../api/vehicleLookup";

export default function VehicleLookup() {
  const [input, setInput] = useState("");
  const [type, setType] = useState("plate");
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    if (!input.trim()) {
      alert("⚠️ Please enter a valid plate or VIN");
      return;
    }

    setLoading(true);
    setError("");
    setVehicle(null);

    try {
      const data = await fetchVehicleData({ type, value: input.trim() });
      setVehicle(data);
    } catch (err) {
      console.error("Vehicle Lookup Error:", err);
      setError("Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔍 Vehicle Lookup</h1>

      {/* Input Section */}
      <div className="flex gap-2 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="plate">Number Plate</option>
          <option value="vin">VIN</option>
        </select>

        <input
          type="text"
          placeholder={type === "plate" ? "Enter Plate (e.g. AB12CDE)" : "Enter VIN"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 flex-1 rounded"
        />

        <button
          onClick={handleLookup}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {/* Vehicle Details */}
      {vehicle && (
        <div className="mt-4 p-4 border rounded bg-gray-50 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Vehicle Details</h2>
          <ul className="space-y-1 text-gray-700">
            <li>📛 <strong>Registration:</strong> {vehicle.registration}</li>
            <li>🔑 <strong>VIN:</strong> {vehicle.vin}</li>
            <li>🚗 <strong>Make:</strong> {vehicle.make}</li>
            <li>🚙 <strong>Model:</strong> {vehicle.model}</li>
            <li>📅 <strong>Year:</strong> {vehicle.year}</li>
            <li>⚙️ <strong>Engine:</strong> {vehicle.engine}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
