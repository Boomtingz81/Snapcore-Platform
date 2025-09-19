// Real data processing utilities for charging station analysis
// Dependencies: papaparse, xlsx
import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * @typedef {Object} CleanRow
 * @property {string} station_id
 * @property {Date} timestamp
 * @property {number} energy_delivered // kWh
 * @property {number} session_duration // minutes
 * @property {string} status
 * @property {number} power_rating // kW
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {string} fileName
 * @property {number} totalStations
 * @property {number} sessionCount
 * @property {number} energyDelivered
 * @property {string|number} averageEfficiency
 * @property {string[]} peakHours
 * @property {{id:string, efficiency:number, location:string}[]} topPerformers
 * @property {{id:string, efficiency:number, location:string, issue:string}[]} underperformers
 * @property {{hour:string, efficiency:number, sessions:number}[]} hourlyData
 * @property {{name:string, value:number, efficiency:number, color:string}[]} stationTypeData
 * @property {CleanRow[]} rawData
 */

export class ChargingDataProcessor {
  constructor() {
    /** Canonical columns expected downstream */
    this.requiredColumns = [
      "station_id",
      "timestamp",
      "energy_delivered",
      "session_duration",
      "status",
      "power_rating",
    ];

    /** Flexible header aliases to improve mapping across exports */
    this.aliases = {
      station_id: ["station_id", "stationid", "id", "station", "site_id"],
      timestamp: ["timestamp", "date_time", "datetime", "date", "time"],
      energy_delivered: [
        "energy_delivered",
        "energy",
        "kwh",
        "energy_kwh",
        "delivered_kwh",
      ],
      session_duration: [
        "session_duration",
        "duration",
        "duration_minutes",
        "time_minutes",
        "charging_time",
      ],
      status: ["status", "state", "condition", "result"],
      power_rating: ["power_rating", "max_power", "rating", "kw", "power_kw"],
    };

    this.colors = {
      L2: "#3B82F6",
      DC: "#10B981",
      ULTRA: "#8B5CF6",
    };
  }

  /**
   * Main entry point – parse then analyze.
   * @param {File} file
   * @returns {Promise<AnalysisResult>}
   */
  async processFile(file) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    try {
      let rawRows;
      if (ext === "csv") {
        rawRows = await this.parseCSV(file);
      } else if (ext === "xlsx" || ext === "xls") {
        rawRows = await this.parseExcel(file);
      } else {
        throw new Error("Unsupported file format. Use .csv, .xlsx, or .xls");
      }
      return this.analyzeChargingData(file.name, rawRows);
    } catch (err) {
      throw new Error(`Data processing failed: ${err.message}`);
    }
  }

  /** ---------- Parsing ---------- */

  /**
   * Parse CSV via Papa
   * @param {File} file
   * @returns {Promise<Object[]>}
   */
  async parseCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // we normalize ourselves
        delimitersToGuess: [",", "\t", "|", ";"],
        complete: (res) => {
          if (res.errors?.length) {
            const msgs = res.errors
              .slice(0, 3)
              .map((e) => `${e.message}${e.row != null ? ` (row ${e.row})` : ""}`)
              .join("; ");
            reject(new Error(`CSV parse errors: ${msgs}`));
          } else {
            resolve(res.data || []);
          }
        },
        error: (e) => reject(e),
      });
    });
  }

  /**
   * Parse Excel via SheetJS
   * @param {File} file
   * @returns {Promise<Object[]>}
   */
  async parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: "array" });
          if (!wb.SheetNames?.length) throw new Error("No worksheets found");

          const ws = wb.Sheets[wb.SheetNames[0]];
          const raw = XLSX.utils.sheet_to_json(ws, {
            header: 1,
            defval: null,
            blankrows: false,
          });

          if (!raw.length) throw new Error("Excel sheet is empty");

          const headers = (raw[0] || []).map((h) =>
            String(h || "")
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^\w]/g, "_")
          );

          const rows = raw.slice(1).map((row) => {
            /** @type {Record<string, any>} */
            const obj = {};
            headers.forEach((h, i) => {
              obj[h] = row[i];
            });
            return obj;
          });

          resolve(rows);
        } catch (err) {
          reject(new Error(`Excel parsing failed: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });
  }

  /** ---------- Cleaning & Normalization ---------- */

  /**
   * Try to get a value by alias list
   * @param {Record<string, any>} row
   * @param {string[]} names
   * @returns {any}
   */
  _getByAliases(row, names) {
    const keys = Object.keys(row);
    for (const name of names) {
      const k = keys.find(
        (key) =>
          key &&
          key.toString().toLowerCase().replace(/\s+/g, "_").includes(name)
      );
      if (k != null && row[k] != null && row[k] !== "") return row[k];
    }
    return null;
  }

  /**
   * Robust numeric parsing (handles commas, currency, units)
   * @param {any} value
   * @param {number} fallback
   */
  parseNumber(value, fallback = 0) {
    if (value == null) return fallback;
    const str = String(value).trim();
    if (!str) return fallback;
    // Normalize decimal comma and strip non-numeric except . - ,
    const normalized = str
      .replace(/[^\d,.\-]/g, "")
      .replace(/,/g, ".") // treat comma as decimal
      .replace(/(\..*)\./g, "$1"); // keep only the first dot
    const num = parseFloat(normalized);
    return Number.isFinite(num) ? num : fallback;
  }

  /**
   * Robust date parsing: ISO, locale strings, epoch ms/s.
   * @param {any} value
   * @returns {Date|null}
   */
  parseTimestamp(value) {
    if (value == null || value === "") return null;

    // Epoch numeric?
    const numeric = this.parseNumber(value, NaN);
    if (Number.isFinite(numeric)) {
      // Heuristic: treat 13+ digits as ms, 10 digits as seconds
      if (numeric > 1e12) return new Date(numeric); // ms
      if (numeric > 1e9 && numeric < 1e12) return new Date(numeric * 1000); // s -> ms
    }

    // Try Date parse
    const d = new Date(String(value).trim());
    return isNaN(d.getTime()) ? null : d;
  }

  /**
   * Validate & normalize raw rows into canonical rows
   * @param {Record<string, any>[]} data
   * @returns {CleanRow[]}
   */
  validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No data rows found");
    }

    const sampleCols = Object.keys(data[0] || {}).map((k) => k.toLowerCase());
    const missing = [];
    for (const col of this.requiredColumns) {
      const aliases = this.aliases[col] || [col];
      const hit = sampleCols.some((c) =>
        aliases.some((a) => c.includes(a.toLowerCase()))
      );
      if (!hit) missing.push(col);
    }
    if (missing.length) {
      // Warn but don’t fail hard; downstream can still compute partial analysis
      console.warn(
        `Missing columns detected: ${missing.join(
          ", "
        )}. Continuing with available data.`
      );
    }

    /** @type {CleanRow[]} */
    const cleaned = data
      .map((row) => {
        const station_id = this._getByAliases(row, this.aliases.station_id);
        const timestamp = this.parseTimestamp(
          this._getByAliases(row, this.aliases.timestamp)
        );
        const energy_delivered = this.parseNumber(
          this._getByAliases(row, this.aliases.energy_delivered)
        );
        const session_duration = this.parseNumber(
          this._getByAliases(row, this.aliases.session_duration)
        );
        const status =
          this._getByAliases(row, this.aliases.status)?.toString() ||
          "unknown";
        const power_rating = this.parseNumber(
          this._getByAliases(row, this.aliases.power_rating)
        );

        return {
          station_id: station_id ? String(station_id) : "",
          timestamp,
          energy_delivered,
          session_duration,
          status,
          power_rating,
        };
      })
      // Require at least station_id and timestamp
      .filter((r) => !!r.station_id && r.timestamp instanceof Date);

    return cleaned;
  }

  /** ---------- Analysis ---------- */

  /**
   * @param {string} fileName
   * @param {Record<string,any>[]} rawData
   * @returns {AnalysisResult}
   */
  analyzeChargingData(fileName, rawData) {
    const cleanData = this.validateData(rawData);
    if (cleanData.length === 0) {
      throw new Error("No valid rows after cleaning");
    }

    // Totals
    const totalStations = new Set(cleanData.map((r) => r.station_id)).size;
    const sessionCount = cleanData.length;
    const energyDelivered = Math.round(
      cleanData.reduce((acc, r) => acc + (r.energy_delivered || 0), 0)
    );

    const efficiencyStats = this.calculateEfficiency(cleanData);
    const stationPerf = this.analyzeStationPerformance(cleanData);
    const timeAnalysis = this.analyzeTimePatterns(cleanData);
    const stationTypeData = this.analyzeStationTypes(cleanData);

    return {
      fileName: fileName || "Processed Data",
      totalStations,
      sessionCount,
      energyDelivered,
      averageEfficiency: efficiencyStats.average.toFixed(1),
      peakHours: timeAnalysis.peakHours,
      topPerformers: stationPerf.topPerformers,
      underperformers: stationPerf.underperformers,
      hourlyData: timeAnalysis.hourlyData,
      stationTypeData,
      rawData: cleanData,
    };
  }

  /**
   * Compute per-row efficiency and aggregate
   * @param {CleanRow[]} data
   */
  calculateEfficiency(data) {
    const clamp = (n) => Math.max(0, Math.min(100, n));
    const effs = data.map((r) => {
      // Default to 80% if we can’t compute
      if (!r.power_rating || !r.session_duration) return 80;
      const theoretical = r.power_rating * (r.session_duration / 60); // kWh
      if (theoretical <= 0) return 80;
      const e = (r.energy_delivered / theoretical) * 100;
      return clamp(e);
    });

    const sum = effs.reduce((a, b) => a + b, 0);
    return {
      average: effs.length ? sum / effs.length : 0,
      min: effs.length ? Math.min(...effs) : 0,
      max: effs.length ? Math.max(...effs) : 0,
      data: effs,
    };
  }

  /**
   * Station-level rollups and ranking
   * @param {CleanRow[]} data
   */
  analyzeStationPerformance(data) {
    /** @type {Record<string, CleanRow[]>} */
    const groups = data.reduce((acc, r) => {
      (acc[r.station_id] ||= []).push(r);
      return acc;
    }, {});

    const stats = Object.entries(groups).map(([station_id, sessions]) => {
      const totalEnergy = sessions.reduce(
        (s, r) => s + (r.energy_delivered || 0),
        0
      );
      const avgDuration =
        sessions.reduce((s, r) => s + (r.session_duration || 0), 0) /
        sessions.length;
      const avgPower =
        sessions.reduce((s, r) => s + (r.power_rating || 0), 0) /
        sessions.length;

      let efficiency = 80;
      if (avgPower > 0 && avgDuration > 0) {
        const theoretical = avgPower * (avgDuration / 60) * sessions.length;
        efficiency =
          theoretical > 0 ? Math.min((totalEnergy / theoretical) * 100, 100) : 80;
      }

      const issue = efficiency < 75 ? this.identifyIssues(sessions) : null;

      return {
        id: station_id,
        efficiency: Math.round(efficiency * 10) / 10,
        sessionCount: sessions.length,
        totalEnergy: Math.round(totalEnergy),
        avgDuration: Math.round(avgDuration),
        location: `Location ${station_id}`, // placeholder
        issues: issue,
      };
    });

    // Sort by efficiency (desc)
    stats.sort((a, b) => b.efficiency - a.efficiency);

    const topPerformers = stats.slice(0, 3).map((s) => ({
      id: s.id,
      efficiency: s.efficiency,
      location: s.location,
    }));

    // Worst performers from the *end*
    const under = stats
      .slice()
      .reverse()
      .filter((s) => s.efficiency < 80)
      .slice(0, 3)
      .map((s) => ({
        id: s.id,
        efficiency: s.efficiency,
        location: s.location,
        issue: s.issues || "Low efficiency detected",
      }));

    return { topPerformers, underperformers: under };
  }

  /**
   * Heuristics for likely issues
   * @param {CleanRow[]} sessions
   */
  identifyIssues(sessions) {
    const n = sessions.length || 1;
    const errorRate =
      sessions.filter(
        (s) => (s.status || "").toString().toLowerCase().includes("error")
      ).length / n;

    const avgDuration =
      sessions.reduce((s, r) => s + (r.session_duration || 0), 0) / n;

    if (errorRate > 0.1) return "Frequent errors detected";
    if (avgDuration < 10) return "Sessions ending prematurely";
    if (avgDuration > 480) return "Unusually long sessions";

    return "Performance degradation";
  }

  /**
   * Temporal patterns
   * @param {CleanRow[]} data
   */
  analyzeTimePatterns(data) {
    /** @type {Record<number, CleanRow[]>} */
    const hourly = {};

    data.forEach((r) => {
      if (!(r.timestamp instanceof Date)) return;
      const hour = r.timestamp.getHours();
      (hourly[hour] ||= []).push(r);
    });

    const hourlyData = Object.entries(hourly)
      .map(([hr, sessions]) => {
        const sessionCount = sessions.length;
        const avgEff =
          sessions.reduce((sum, s) => {
            const power = s.power_rating || 50;
            const theoretical = power * (s.session_duration / 60);
            const e = theoretical > 0 ? (s.energy_delivered / theoretical) * 100 : 80;
            return sum + Math.min(Math.max(e, 0), 100);
          }, 0) / sessionCount;

        return {
          hour: `${String(hr).padStart(2, "0")}:00`,
          efficiency: Math.round(avgEff * 10) / 10,
          sessions: sessionCount,
        };
      })
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    // Peak hours: top 20% by session count (robust for small N)
    let peakHours = [];
    if (hourlyData.length) {
      const sortedCounts = hourlyData.map((h) => h.sessions).sort((a, b) => b - a);
      const idx = Math.max(0, Math.floor(sortedCounts.length * 0.2) - 1);
      const thresh = sortedCounts[idx] || sortedCounts[0] || 0;
      peakHours = hourlyData.filter((h) => h.sessions >= thresh).map((h) => h.hour).slice(0, 3);
    }

    return { hourlyData, peakHours };
  }

  /**
   * Station type distribution and efficiency by power
   * @param {CleanRow[]} data
   */
  analyzeStationTypes(data) {
    const groups = {
      "Level 2": { count: 0, eff: 0, color: this.colors.L2 },
      "DC Fast": { count: 0, eff: 0, color: this.colors.DC },
      "Ultra Fast": { count: 0, eff: 0, color: this.colors.ULTRA },
    };

    data.forEach((r) => {
      const power = r.power_rating || 7; // default to Level 2
      let bucket = "Level 2";
      if (power > 22 && power <= 150) bucket = "DC Fast";
      if (power > 150) bucket = "Ultra Fast";

      const theoretical = power * (r.session_duration / 60);
      const e = theoretical > 0 ? (r.energy_delivered / theoretical) * 100 : 80;
      const eff = Math.max(0, Math.min(100, e));

      groups[bucket].count += 1;
      groups[bucket].eff += eff;
    });

    const total = Object.values(groups).reduce((s, g) => s + g.count, 0);

    return Object.entries(groups).map(([name, g]) => ({
      name,
      value: total ? Math.round((g.count / total) * 100) : 0,
      efficiency: g.count ? Math.round((g.eff / g.count) * 10) / 10 : 0,
      color: g.color,
    }));
  }
}

// Export a singleton (handy for components)
export const dataProcessor = new ChargingDataProcessor();
