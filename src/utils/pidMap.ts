// src/utils/pidMap.ts
// Master map for all OBD-II PIDs (hex → name, bytes, formula, unit key)

export interface PidDefinition {
  name: string;
  bytes: number;
  formula: (...args: number[]) => number;
}

export const pidMap: Record<string, PidDefinition> = {
  "0x04": { name: "Engine Load", bytes: 1, formula: (A) => (A * 100) / 255 },
  "0x05": { name: "Coolant Temp", bytes: 1, formula: (A) => A - 40 },
  "0x0A": { name: "Fuel Pressure", bytes: 1, formula: (A) => A * 3 },
  "0x0B": { name: "Intake Manifold Pressure", bytes: 1, formula: (A) => A },
  "0x0C": { name: "RPM", bytes: 2, formula: (A, B) => ((A * 256) + B) / 4 },
  "0x0D": { name: "Speed", bytes: 1, formula: (A) => A },
  "0x0E": { name: "Timing Advance", bytes: 1, formula: (A) => (A / 2) - 64 },
  "0x0F": { name: "Intake Air Temperature", bytes: 1, formula: (A) => A - 40 },
  "0x10": { name: "MAF Air Flow", bytes: 2, formula: (A, B) => ((A * 256) + B) * 0.01 },
  "0x11": { name: "Throttle Position", bytes: 1, formula: (A) => (A * 100) / 255 },
  "0x1F": { name: "Engine run-time since start", bytes: 2, formula: (A, B) => (A * 256) + B },
  "0x21": { name: "Distance with MIL on", bytes: 2, formula: (A, B) => (A * 256) + B },
  "0x22": { name: "Fuel Rail Pressure (vac)", bytes: 2, formula: (A, B) => ((A * 256) + B) * 0.079 },
  "0x23": { name: "Fuel Rail Pressure (direct)", bytes: 2, formula: (A, B) => ((A * 256) + B) * 10 },
  "0x2F": { name: "Fuel Level", bytes: 1, formula: (A) => (A * 100) / 255 },
  "0x31": { name: "Distance since DTC cleared", bytes: 2, formula: (A, B) => (A * 256) + B },
  "0x33": { name: "Barometric Pressure", bytes: 1, formula: (A) => A },
  "0x42": { name: "Control Module Voltage", bytes: 2, formula: (A, B) => ((A * 256) + B) / 1000 },
  "0x43": { name: "Absolute Load", bytes: 2, formula: (A, B) => ((A * 256) + B) * 100 / 255 },
  "0x45": { name: "Relative Throttle Position", bytes: 1, formula: (A) => (A * 100) / 255 },
  "0x46": { name: "Ambient Air Temperature", bytes: 1, formula: (A) => A - 40 },
  "0x5B": { name: "Hybrid Battery Life", bytes: 1, formula: (A) => (A * 100) / 255 },
  "0x5C": { name: "Engine Oil Temperature", bytes: 1, formula: (A) => A - 40 },
  "0x5D": { name: "Fuel Injection Timing", bytes: 2, formula: (A, B) => (((A * 256) + B) / 128) - 210 },
  "0x5E": { name: "Engine Fuel Rate", bytes: 2, formula: (A, B) => ((A * 256) + B) * 0.05 },
  "0xA6": { name: "Odometer", bytes: 4, formula: (A, B) => (A * 256) + B },

  // ✅ Advanced / future-proof PIDs
  "0x12": { name: "Commanded Secondary Air Status", bytes: 1, formula: (A) => A },
  "0x1C": { name: "OBD Compliance Standard", bytes: 1, formula: (A) => A },
  "0x1E": { name: "Auxiliary Input Status", bytes: 1, formula: (A) => A },
  "0x24": { name: "Wide-band O2 Lambda", bytes: 4, formula: (A, B) => ((A * 256) + B) / 32768 },
  "0x25": { name: "Wide-band O2 Current", bytes: 4, formula: (C, D) => ((C * 256) + D) / 8192 },
  "0x3C": { name: "Catalyst Temp Bank1 Sensor1", bytes: 2, formula: (A, B) => ((A * 256) + B) / 10 - 40 },
  "0x3D": { name: "Catalyst Temp Bank1 Sensor2", bytes: 2, formula: (A, B) => ((A * 256) + B) / 10 - 40 },
  "0x3E": { name: "Catalyst Temp Bank2 Sensor1", bytes: 2, formula: (A, B) => ((A * 256) + B) / 10 - 40 },
  "0x3F": { name: "Catalyst Temp Bank2 Sensor2", bytes: 2, formula: (A, B) => ((A * 256) + B) / 10 - 40 },
  "0x9A": { name: "Hybrid/EV System Data", bytes: 6, formula: (A) => A }, // OEM specific
  "0xA1": { name: "NOx Sensor Corrected", bytes: 2, formula: (A, B) => ((A * 256) + B) * 0.05 },
  "0xA2": { name: "Cylinder Fuel Rate", bytes: 2, formula: (A, B) => ((A * 256) + B) * 0.03125 },
  "0xA4": { name: "Transmission Actual Gear", bytes: 2, formula: (A, B) => ((A * 256) + B) * 0.001 },
};

export const getPidInfo = (pid: string) => pidMap[pid];
export const getPidName = (pid: string) => pidMap[pid]?.name ?? "Unknown PID";
export const getPidFormula = (pid: string) => pidMap[pid]?.formula ?? (() => NaN);
export const getAllPids = () => Object.keys(pidMap);
