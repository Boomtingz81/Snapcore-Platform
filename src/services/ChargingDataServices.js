// services/chargingDataService.js
// Production-ready service for processing charging station data (PWA + API)

export class ChargingDataService {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_API_URL || '/api';
    this.cache = new Map();
  }

  /**
   * Process an uploaded file (offline-first, with server sync).
   */
  async processFile(file) {
    if (!file) throw new Error('No file provided');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', Date.now().toString());

    try {
      // Offline-first processing
      const localResult = await this.processFileLocally(file);

      // Cache for offline access
      this.cacheAnalysis(file.name, localResult);

      // Sync with server if online
      if (this.isOnline()) {
        this.syncWithServer(formData).catch((err) =>
          console.warn('[ChargingDataService] Server sync failed:', err.message)
        );
      }

      return localResult;
    } catch (error) {
      throw new Error(`File processing failed: ${error.message}`);
    }
  }

  /**
   * Local PWA processing of file.
   */
  async processFileLocally(file) {
    const data = await this.parseFile(file);
    return this.analyzeData(data, file.name);
  }

  /**
   * Parse uploaded file (CSV only in client, Excel requires server).
   */
  async parseFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'csv') {
      const text = await this.readFileAsText(file);
      return this.parseCSV(text);
    }
    throw new Error('Excel files (.xlsx, .xls) require server processing');
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse CSV string into array of objects.
   */
  parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('Invalid CSV format: no data');

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const data = lines.slice(1).map((line) => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, i) => (row[header] = values[i]?.trim() || ''));
      return row;
    });

    return data.filter((row) => Object.values(row).some((v) => v !== ''));
  }

  /**
   * Clean + analyze raw charging data.
   */
  analyzeData(rawData, fileName = 'Unknown File') {
    const cleanData = this.cleanData(rawData);
    if (!cleanData.length) throw new Error('No valid charging sessions found');

    const stations = this.getUniqueStations(cleanData);
    const metrics = this.calculateMetrics(cleanData);
    const performance = this.analyzePerformance(cleanData, stations);
    const trends = this.analyzeTrends(cleanData);

    return {
      id: this.generateId(),
      fileName,
      timestamp: new Date().toISOString(),
      summary: {
        totalStations: stations.length,
        totalSessions: cleanData.length,
        dateRange: this.getDateRange(cleanData),
        ...metrics,
      },
      performance,
      trends,
      rawDataCount: rawData.length,
      cleanDataCount: cleanData.length,
    };
  }

  /**
   * Normalize/clean raw data.
   */
  cleanData(data) {
    return data
      .map((row) => {
        const stationId = this.findValue(row, ['station_id', 'id', 'station']);
        const timestamp = this.parseDate(this.findValue(row, ['timestamp', 'date', 'time']));
        const energy = this.toNumber(this.findValue(row, ['energy', 'kwh', 'energy_delivered']));
        const duration = this.toNumber(this.findValue(row, ['duration', 'session_duration', 'time_minutes']));
        const power = this.toNumber(this.findValue(row, ['power', 'power_rating', 'max_power'])) || 50;
        const status = this.findValue(row, ['status', 'state']) || 'completed';

        // Calculate efficiency
        let efficiency = 80;
        if (duration > 0 && power > 0) {
          const theoretical = power * (duration / 60);
          efficiency = Math.min(Math.max((energy / theoretical) * 100, 0), 100);
        }

        return { stationId, timestamp, energy, duration, power, status, efficiency };
      })
      .filter((row) => row.stationId && row.timestamp instanceof Date && !isNaN(row.timestamp));
  }

  findValue(row, keys) {
    for (const key of keys) {
      const found = Object.keys(row).find((k) => k.toLowerCase().includes(key.toLowerCase()));
      if (found && row[found]) return row[found];
    }
    return null;
  }

  parseDate(value) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  toNumber(value) {
    if (value == null || value === '') return 0;
    const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  getUniqueStations(data) {
    return [...new Set(data.map((r) => r.stationId))];
  }

  calculateMetrics(data) {
    const totalEnergy = data.reduce((s, r) => s + r.energy, 0);
    const avgEff = data.reduce((s, r) => s + r.efficiency, 0) / data.length;
    const avgDur = data.reduce((s, r) => s + r.duration, 0) / data.length;

    return {
      totalEnergy: Math.round(totalEnergy),
      averageEfficiency: Math.round(avgEff * 10) / 10,
      averageDuration: Math.round(avgDur),
      completionRate: this.getCompletionRate(data),
    };
  }

  getCompletionRate(data) {
    const completed = data.filter((r) =>
      ['complete', 'success'].some((kw) => r.status.toLowerCase().includes(kw))
    ).length;
    return Math.round((completed / data.length) * 100);
  }

  analyzePerformance(data, stations) {
    const stats = stations.map((id) => {
      const sData = data.filter((r) => r.stationId === id);
      const avgEff = sData.reduce((s, r) => s + r.efficiency, 0) / sData.length;
      const totalEnergy = sData.reduce((s, r) => s + r.energy, 0);
      const avgDuration = sData.reduce((s, r) => s + r.duration, 0) / sData.length;

      return {
        stationId: id,
        sessionCount: sData.length,
        efficiency: Math.round(avgEff * 10) / 10,
        totalEnergy: Math.round(totalEnergy),
        avgDuration: Math.round(avgDuration),
        status: avgEff > 85 ? 'excellent' : avgEff > 75 ? 'good' : 'needs_attention',
      };
    });

    stats.sort((a, b) => b.efficiency - a.efficiency);

    return {
      topPerformers: stats.slice(0, 5),
      underperformers: stats.filter((s) => s.efficiency < 75),
      averageEfficiency: Math.round(
        stats.reduce((s, r) => s + r.efficiency, 0) / stats.length
      ),
    };
  }

  analyzeTrends(data) {
    const hourly = this.groupByHour(data);
    const daily = this.groupByDay(data);

    return {
      hourly,
      daily,
      peakHours: this.findPeakHours(hourly),
      busyDays: this.findBusyDays(daily),
    };
  }

  groupByHour(data) {
    const groups = {};
    data.forEach((r) => {
      const h = r.timestamp.getHours();
      (groups[h] ||= []).push(r);
    });

    return Object.entries(groups)
      .map(([h, sessions]) => ({
        hour: +h,
        sessionCount: sessions.length,
        efficiency: sessions.reduce((s, r) => s + r.efficiency, 0) / sessions.length,
        totalEnergy: sessions.reduce((s, r) => s + r.energy, 0),
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  groupByDay(data) {
    const groups = {};
    data.forEach((r) => {
      const day = r.timestamp.toDateString();
      (groups[day] ||= []).push(r);
    });

    return Object.entries(groups)
      .map(([day, sessions]) => ({
        date: new Date(day),
        sessionCount: sessions.length,
        efficiency: sessions.reduce((s, r) => s + r.efficiency, 0) / sessions.length,
        totalEnergy: sessions.reduce((s, r) => s + r.energy, 0),
      }))
      .sort((a, b) => a.date - b.date);
  }

  findPeakHours(hourly) {
    return [...hourly]
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 3)
      .map((h) => `${h.hour.toString().padStart(2, '0')}:00`);
  }

  findBusyDays(daily) {
    return [...daily]
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 7)
      .map((d) => d.date.toLocaleDateString());
  }

  getDateRange(data) {
    const dates = data.map((r) => r.timestamp).sort((a, b) => a - b);
    if (!dates.length) return { start: null, end: null, days: 0 };
    return {
      start: dates[0],
      end: dates[dates.length - 1],
      days: Math.ceil((dates.at(-1) - dates[0]) / 86_400_000),
    };
  }

  cacheAnalysis(fileName, analysis) {
    const key = `analysis_${fileName}_${Date.now()}`;
    this.cache.set(key, analysis);

    try {
      const cached = JSON.parse(localStorage.getItem('charging_analyses') || '[]');
      cached.push({ key, analysis, timestamp: Date.now() });
      if (cached.length > 10) cached.shift();
      localStorage.setItem('charging_analyses', JSON.stringify(cached));
    } catch (e) {
      console.warn('[ChargingDataService] Failed to cache analysis:', e.message);
    }
  }

  getCachedAnalyses() {
    try {
      return JSON.parse(localStorage.getItem('charging_analyses') || '[]');
    } catch {
      return [];
    }
  }

  async syncWithServer(formData) {
    const resp = await fetch(`${this.apiEndpoint}/analyze`, { method: 'POST', body: formData });
    if (!resp.ok) throw new Error(`Server error ${resp.status}`);
    return resp.json();
  }

  generateId() {
    return `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  exportAnalysis(analysis) {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charging_analysis_${analysis.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : false;
  }

  registerNetworkListeners(onOnline, onOffline) {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }
}

export const chargingDataService = new ChargingDataService();
