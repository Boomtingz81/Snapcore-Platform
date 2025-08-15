// src/components/RegistrationSearch.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import PropTypes from "prop-types";

export default function RegistrationSearch({ onSearch, initialValue = "", autoFocus = false }) {
  const [reg, setReg] = useState(initialValue);

  // ✅ Sync initialValue if it changes (useful for VehicleLookup auto-fill)
  useEffect(() => {
    setReg(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    const formattedReg = reg.trim().toUpperCase();
    if (formattedReg) {
      onSearch(formattedReg);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-black/60 backdrop-blur-lg p-5 rounded-xl shadow-lg border border-gray-700 flex flex-col md:flex-row items-center gap-3 mb-10"
    >
      <label htmlFor="registration-input" className="sr-only">
        Vehicle Registration
      </label>

      <input
        id="registration-input"
        type="text"
        placeholder="Enter Reg (e.g. AB12 CDE)"
        value={reg}
        onChange={(e) => setReg(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        className="px-4 py-3 w-64 text-black font-bold rounded-lg border-4 border-black bg-yellow-400 uppercase tracking-wider text-center focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <button
        type="button"
        onClick={handleSearch}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Search size={18} /> Search
      </button>
    </motion.div>
  );
}

// ✅ Prop validation for better DX
RegistrationSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  initialValue: PropTypes.string,
  autoFocus: PropTypes.bool,
};
