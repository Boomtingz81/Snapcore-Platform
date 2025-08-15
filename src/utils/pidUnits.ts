// src/utils/pidUnits.ts
// Centralised units for all PIDs

export const pidUnits = new Map([
  ['Speed', ' km/h'],
  ['RPM', ' rpm'],
  ['Engine Load', ' %'],
  ['Throttle Position', ' %'],
  ['Relative Throttle Position', ' %'],
  ['Coolant Temp', ' °C'],
  ['Intake Air Temperature', ' °C'],
  ['MAF Air Flow', ' g/s'],
  ['Timing Advance', ' °'],
  ['Fuel Pressure', ' kPa'],
  ['Fuel Rail Pressure (vac)', ' kPa'],
  ['Fuel Rail Pressure (direct)', ' kPa'],
  ['Fuel Level', ' %'],
  ['Engine run-time since start', ' s'],
  ['Distance with MIL on', ' km'],
  ['Distance since DTC cleared', ' km'],
  ['Barometric Pressure', ' kPa'],
  ['Control Module Voltage', ' V'],
  ['Absolute Load', ' %'],
  ['Hybrid Battery Life', ' %'],
  ['Engine Oil Temperature', ' °C'],
  ['Fuel Injection Timing', ' °'],
  ['Engine Fuel Rate', ' L/h'],
  ['Odometer', ' km'],
  ['Odometer (Mode 01)', ' km'],

  // EV / Hybrid
  ['Hybrid Battery Charge', ' %'],
  ['HV Battery Current', ' A'],
  ['HV Battery Voltage', ' V'],
  ['EV Range Remaining', ' km'],

  // Catalyst / Emissions
  ['Catalyst Temp Bank1 Sensor1', ' °C'],
  ['Catalyst Temp Bank1 Sensor2', ' °C'],
  ['Catalyst Temp Bank2 Sensor1', ' °C'],
  ['Catalyst Temp Bank2 Sensor2', ' °C'],
  ['NOx Sensor Corrected', ' ppm'],

  // Advanced
  ['Cylinder Fuel Rate', ' mg/stroke'],
  ['Transmission Actual Gear', ''],
  ['In-use Perf Tracking', ' %'],
  ['Diesel Perf Tracking', ' %'],

  // Newly added future-proof PIDs
  ['Commanded Secondary Air Status', ''],
  ['Auxiliary Input Status', ''],
  ['Wide-band O2 Lambda', ' λ'],
  ['Wide-band O2 Current', ' mA'],
  ['Monitor Status', ''],
  ['Freeze Frame DTC', ''],
  ['Fuel System Status', ''],
  ['OBD Compliance Standard', ''],
  ['Emission Requirements', ''],
]);

// ✅ Get only the unit
export const getUnit = (label: string): string => pidUnits.get(label) ?? '';

// ✅ Get "Label (Unit)"
export const getUnitLabel = (label: string): string =>
  pidUnits.has(label) ? `${label} (${pidUnits.get(label)})` : label;

// ✅ Get all labels for dropdowns or debugging
export const getAllPidLabels = (): string[] => Array.from(pidUnits.keys());

// ✅ Check if label has a unit (useful for conditionally adding units)
export const hasUnit = (label: string): boolean => pidUnits.has(label);

// ✅ Debug log (only in dev mode)
if (import.meta.env?.DEV) {
  console.table([...pidUnits.entries()]);
}
