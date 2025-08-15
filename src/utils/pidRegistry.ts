// ✅ src/utils/pidRegistry.ts
import { pidUnits } from "./pidUnits";
import { pidMap } from "./pidMap";
import { groupedReadings, icons } from "./pidConfig";

export { groupedReadings, icons }; // ✅ Re-export for convenience

/** ✅ Get Unit for a label */
export const getUnit = (label: string): string => pidUnits.get(label) ?? "";

/** ✅ Get Label with Unit (e.g. "RPM (rpm)") */
export const getUnitLabel = (label: string): string =>
  pidUnits.has(label) ? `${label} (${pidUnits.get(label)})` : label;

/** ✅ Get formula + name info for a PID hex */
export const getPidInfo = (pidHex: number) => pidMap[pidHex] ?? null;

/**
 * ✅ Get all supported PIDs with full metadata
 * - Includes hex, name, formula, unit, icon, and section
 * - Automatically assigns "Other" if not part of groupedReadings
 */
export const getAllPidData = () =>
  Object.entries(pidMap).map(([hex, { name, formula }]) => {
    const section =
      Object.entries(groupedReadings).find(([, labels]) => labels.includes(name))?.[0] ??
      "Other";

    return {
      hex,
      name,
      formula,
      unit: getUnit(name),
      icon: icons[name] || "📟",
      section,
    };
  });

/**
 * ✅ Build grouped sections dynamically
 * - Ensures any new PID automatically appears in the right section
 */
export const buildDynamicSections = () => {
  return getAllPidData().reduce<Record<string, string[]>>((acc, { section, name }) => {
    if (!acc[section]) acc[section] = [];
    if (!acc[section].includes(name)) acc[section].push(name);
    return acc;
  }, {});
};
