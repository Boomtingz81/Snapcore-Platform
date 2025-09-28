// 📂 FILE: src/components/VehicleSwitcher.jsx
import { useMemo, useId, useCallback } from "react";
import { useVehicle } from "../context/VehicleContext";

/**
 * VehicleSwitcher
 * - Accessible label & keyboard-friendly
 * - Graceful empty state (no vehicles yet)
 * - Shows favorite ⭐ inline
 * - Compact by default; accepts `className` and `label` overrides
 *
 * Extra (non-breaking) props:
 * - size: "sm" | "md" (visual density, default "md")
 * - showStatusChip?: boolean (drivetrain chip; default false)
 */
export default function VehicleSwitcher({
  className = "",
  label = "Vehicle",
  size = "md",
  showStatusChip = false,
}) {
  const { garage, current, selectVehicle } = useVehicle();
  const selectId = useId();

  const hasVehicles = Array.isArray(garage) && garage.length > 0;

  const options = useMemo(() => {
    if (!hasVehicles) return [];
    return garage.map((v) => ({
      id: v.id,
      // Favorite star inline
      label: `${v.make ?? "?"} ${v.model ?? ""}${v.year ? ` • ${v.year}` : ""}${
        v.isFavorite ? " ⭐" : ""
      }`.trim(),
    }));
  }, [garage, hasVehicles]);

  const currentId = current?.id ?? "";
  const currentLabel = current
    ? `${current.make ?? "?"} ${current.model ?? ""}${current.year ? ` • ${current.year}` : ""}`.trim()
    : "No vehicle selected";

  const onChange = useCallback(
    (e) => {
      const id = e.target.value;
      if (!id || id === currentId) return;
      try {
        // If selectVehicle becomes async later, this still works fine.
        const maybePromise = selectVehicle(id);
        if (maybePromise?.then) maybePromise.catch(() => {});
      } catch {
        // keep UI resilient; context can surface errors elsewhere if needed
      }
    },
    [currentId, selectVehicle]
  );

  // Visual sizing
  const pad = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";
  const text = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={[
        "relative flex items-center gap-2 rounded-xl bg-black/30 border border-white/10",
        "shadow-sm transition-colors",
        "focus-within:ring-1 focus-within:ring-cyan-400/60 focus-within:border-cyan-400/40",
        pad,
        className,
      ].join(" ")}
      title={currentLabel}
      aria-label={`${label} switcher`}
    >
      {/* Visible label */}
      <label
        htmlFor={selectId}
        className={`${text} text-gray-300 whitespace-nowrap select-none`}
      >
        {label}
      </label>

      {/* Select wrapper with custom chevron */}
      <div className="relative">
        <select
          id={selectId}
          value={currentId}
          onChange={onChange}
          disabled={!hasVehicles}
          className={[
            "appearance-none bg-transparent pr-7",
            text,
            "text-white/90 outline-none",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          ].join(" ")}
          aria-describedby="vehicle-switcher-status"
        >
          {!hasVehicles ? (
            <option value="" className="bg-[#0b0f17]">
              No vehicles
            </option>
          ) : (
            options.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#0b0f17]">
                {opt.label}
              </option>
            ))
          )}
        </select>

        {/* Chevron */}
        <svg
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111 .14l-4.2 3.33a.75.75 0 01-.94 0l-4.2-3.33a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Optional right-side status chip */}
      {showStatusChip && current && (
        <span
          className={[
            "hidden md:inline-flex items-center rounded-full border border-white/10 bg-white/5 text-white/80",
            size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
          ].join(" ")}
        >
          {current.drivetrain || "—"}
        </span>
      )}

      {/* Screen-reader live status */}
      <span
        id="vehicle-switcher-status"
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        {currentLabel}
      </span>
    </div>
  );
}
