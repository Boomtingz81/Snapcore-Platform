// 📂 FILE: src/context/VehicleContext.jsx
import { createContext, useContext, useMemo, useState, useEffect, useRef } from "react";

/**
 * Vehicle shape (informal JSDoc):
 * {
 * id: string,
 * make: string,
 * model: string,
 * year?: number,
 * vin?: string,
 * plate?: string,
 * fuel?: string, // "Petrol" | "Diesel" | "EV" | ...
 * drivetrain?: string, // "AWD" | "FWD" | "RWD" | ...
 * isFavorite?: boolean
 * }
 */

const VehicleContext = createContext(null);

export function useVehicle() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error("useVehicle must be used within a VehicleProvider");
  return ctx;
}

/* --------------------------- constants & defaults --------------------------- */
const STORAGE_CURRENT_KEY = "snapcore.currentVehicle";
const STORAGE_GARAGE_KEY = "snapcore.garage"; // optional persistence (enabled below)

const DEFAULT_GARAGE = [
  {
    id: "rsq3-001",
    make: "Audi",
    model: "RS Q3",
    year: 2021,
    fuel: "Petrol",
    drivetrain: "AWD",
    isFavorite: true,
    vin: "WAUZZZ8U0Mxxxxxxx",
    plate: "RSQ3 🔥",
  },
];

/* ------------------------------- tiny helpers ------------------------------- */
const safeJSON = {
  parse: (raw, fallback = null) => {
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  stringify: (obj) => {
    try { return JSON.stringify(obj); } catch { return null; }
  },
};

const genId = () => {
  if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
  // Quick fallback: time + random
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

// Minimal validator/normalizer to keep state clean
const normalizeVehicle = (v) => {
  if (!v || typeof v !== "object") return null;
  const make = typeof v.make === "string" ? v.make.trim() : "";
  const model = typeof v.model === "string" ? v.model.trim() : "";
  if (!make || !model) return null;

  return {
    id: v.id || genId(),
    make,
    model,
    year: typeof v.year === "number" ? v.year : undefined,
    vin: v.vin || undefined,
    plate: v.plate || undefined,
    fuel: v.fuel || undefined,
    drivetrain: v.drivetrain || undefined,
    isFavorite: !!v.isFavorite,
  };
};

/* --------------------------------- Provider -------------------------------- */
export function VehicleProvider({ children, persistGarage = true }) {
  // Rehydrate garage (optional) + current vehicle
  const initialGarage = useMemo(() => {
    if (!persistGarage) return DEFAULT_GARAGE;
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_GARAGE_KEY) : null;
    const parsed = stored ? safeJSON.parse(stored, null) : null;
    const cleaned =
      Array.isArray(parsed) && parsed.length
        ? parsed.map(normalizeVehicle).filter(Boolean)
        : DEFAULT_GARAGE.map(normalizeVehicle);
    return cleaned;
  }, [persistGarage]);

  const [garage, setGarage] = useState(initialGarage);

  const initialCurrent = useMemo(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_CURRENT_KEY) : null;
    const parsed = raw ? safeJSON.parse(raw, null) : null;
    const normalized = normalizeVehicle(parsed) || garage[0] || null;
    return normalized;
  }, [garage]);

  const [current, setCurrent] = useState(initialCurrent);

  // Avoid double-write on first mount
  const hydratedRef = useRef(false);

  /* ----------------------------- persistence layer ----------------------------- */
  useEffect(() => {
    if (!hydratedRef.current) { hydratedRef.current = true; return; }
    const s = safeJSON.stringify(current);
    if (s) localStorage.setItem(STORAGE_CURRENT_KEY, s);
  }, [current]);

  useEffect(() => {
    if (!persistGarage) return;
    if (!hydratedRef.current) return;
    const s = safeJSON.stringify(garage);
    if (s) localStorage.setItem(STORAGE_GARAGE_KEY, s);
  }, [garage, persistGarage]);

  // Cross-tab sync (keep selection and garage in sync if user has multiple tabs)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_CURRENT_KEY && e.newValue) {
        const next = normalizeVehicle(safeJSON.parse(e.newValue, null));
        if (next) setCurrent(next);
      }
      if (persistGarage && e.key === STORAGE_GARAGE_KEY && e.newValue) {
        const next = safeJSON.parse(e.newValue, null);
        if (Array.isArray(next)) {
          const cleaned = next.map(normalizeVehicle).filter(Boolean);
          if (cleaned.length) setGarage(cleaned);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [persistGarage]);

  /* ---------------------------------- actions --------------------------------- */
  const addVehicle = (v) => {
    const nv = normalizeVehicle(v);
    if (!nv) return null;
    setGarage((g) => [...g, nv]);
    return nv.id;
  };

  const upsertVehicle = (v) => {
    const nv = normalizeVehicle(v);
    if (!nv) return null;
    setGarage((g) => {
      const idx = g.findIndex((x) => x.id === nv.id);
      if (idx === -1) return [...g, nv];
      const copy = g.slice();
      copy[idx] = { ...copy[idx], ...nv };
      return copy;
    });
    // if upserting current, reflect changes
    if (current?.id === nv.id) setCurrent((c) => ({ ...c, ...nv }));
    return nv.id;
  };

  const updateVehicle = (id, patch) => {
    setGarage((g) => {
      const idx = g.findIndex((x) => x.id === id);
      if (idx === -1) return g;
      const merged = normalizeVehicle({ ...g[idx], ...patch, id });
      const copy = g.slice();
      copy[idx] = merged;
      return copy;
    });
    if (current?.id === id) setCurrent((c) => normalizeVehicle({ ...c, ...patch, id }));
  };

  const removeVehicle = (id) => {
    setGarage((g) => g.filter((v) => v.id !== id));
    if (current?.id === id) {
      // pick first available or null
      setCurrent((_) => {
        const remaining = garage.filter((v) => v.id !== id);
        return remaining[0] ?? null;
      });
    }
  };

  const selectVehicle = (id) => {
    const v = garage.find((x) => x.id === id);
    if (v) setCurrent(v);
  };

  const setFavorite = (id, fav = true) =>
    setGarage((g) => g.map((v) => (v.id === id ? { ...v, isFavorite: !!fav } : v)));

  const resetToDefault = () => {
    setGarage(DEFAULT_GARAGE);
    setCurrent(DEFAULT_GARAGE[0]);
  };

  const clearCurrent = () => setCurrent(null);

  /* ------------------------------ derived helpers ------------------------------ */
  const isAudiRSQ3 = useMemo(() => {
    const make = (current?.make || "").toLowerCase();
    const model = (current?.model || "").toLowerCase();
    return make === "audi" && /rs\s*q3/.test(model);
  }, [current]);

  const isEV = useMemo(() => {
    const fuel = (current?.fuel || "").toLowerCase();
    return fuel.includes("ev") || fuel.includes("electric");
  }, [current]);

  const supportsAdvancedDiag = useMemo(() => {
    return isAudiRSQ3 || current?.drivetrain === "AWD";
  }, [isAudiRSQ3, current?.drivetrain]);

  const value = useMemo(
    () => ({
      // state
      garage,
      current,

      // core actions (your original API)
      addVehicle,
      removeVehicle,
      selectVehicle,
      setFavorite,

      // enhanced helpers (non-breaking additions)
      setCurrent, // direct setter if you need it
      updateVehicle,
      upsertVehicle,
      resetToDefault,
      clearCurrent,

      // flags for logic-driven routing / feature gating
      isAudiRSQ3,
      isEV,
      supportsAdvancedDiag,
    }),
    [
      garage,
      current,
      isAudiRSQ3,
      isEV,
      supportsAdvancedDiag,
      /* actions */
      addVehicle,
      removeVehicle,
      selectVehicle,
      setFavorite,
    ]
  );

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}
