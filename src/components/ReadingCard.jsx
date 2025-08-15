// ✅ src/components/ReadingCard.jsx – Reusable Live Reading Card
import React from "react";

export default function ReadingCard({
  label,
  value,
  unit = "",
  highlight = false,
  icon = null, // ✅ Optional icon
  className = "", // ✅ Allow extra custom styling
  tooltip = "", // ✅ NEW tooltip support
  subLabel = "", // ✅ NEW optional sub-label
  trend = null, // ✅ NEW trend indicator (e.g., ↑ or ↓)
}) {
  // ✅ Format numbers dynamically
  const formatValue = (val) => {
    if (val === undefined || val === null || val === "") return "--";

    if (typeof val === "number") {
      if (Math.abs(val) < 0.01 && val !== 0) {
        return val.toExponential(2); // 🔹 Scientific notation for very small numbers
      }
      if (Math.abs(val) >= 1000) {
        return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
      }
      if (Math.abs(val) >= 100) {
        return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
      }
      return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    return val;
  };

  const displayValue =
    value !== undefined && value !== null && value !== ""
      ? `${formatValue(value)}${unit}`
      : "--";

  return (
    <article
      className={`flex flex-col items-start bg-[#1e2635]/80 backdrop-blur-md p-5 rounded-xl shadow-lg border ${
        highlight ? "border-blue-400" : "border-gray-700"
      } hover:border-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fadeIn ${className}`}
      role="group"
      aria-label={`${label}: ${displayValue}`}
      aria-live="polite"
      title={tooltip || `${label}: ${displayValue}`}
    >
      <div className="flex items-center gap-2 w-full">
        {icon && <span className="text-blue-400 text-xl">{icon}</span>}
        <div className="flex flex-col">
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
        </div>
        {trend && (
          <span
            className={`ml-auto text-sm font-bold ${
              trend === "up"
                ? "text-green-400"
                : trend === "down"
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "–"}
          </span>
        )}
      </div>

      <p
        className={`text-2xl font-bold mt-2 ${
          highlight ? "text-blue-300" : "text-blue-400"
        }`}
      >
        {displayValue}
      </p>
    </article>
  );
}
