import React, { useMemo, useState, useCallback } from 'react';
import { Download, FileText, BarChart, Zap } from 'lucide-react';

const rand = (min, max) => Math.random() * (max - min) + min;
const randi = (min, max) => Math.floor(rand(min, max));

export default function SampleDataGenerator() {
  const [generating, setGenerating] = useState(false);
  const [dataFormat, setDataFormat] = useState('csv'); // 'csv' | 'excel'
  const [recordCount, setRecordCount] = useState(100);

  const generateOne = useCallback(() => {
    const stations = ['CS001','CS002','CS003','CS004','CS005','CS006','CS007','CS008'];
    const statuses = ['completed','error','timeout','cancelled'];
    const powerRatings = [7, 11, 22, 50, 150, 250]; // kW
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000); // 30 days ago

    const station_id = stations[randi(0, stations.length)];
    const power_rating = powerRatings[randi(0, powerRatings.length)];

    // Weighted business hours (70%) vs any time (30%)
    const d = new Date(startDate.getTime() + randi(0, 30) * 24 * 3600 * 1000);
    const h = Math.random() < 0.7 ? randi(7, 19) : randi(0, 24);
    d.setHours(h, randi(0, 60), 0, 0);
    const timestamp = d.toISOString().replace('T', ' ').slice(0, 19);

    // Duration (mins): 60% short 15–75, else 60–240
    const session_duration = Math.random() < 0.6 ? randi(15, 76) : randi(60, 241);

    const status = Math.random() < 0.85 ? 'completed' : statuses[randi(0, statuses.length)];

    // Efficiency 75–95% plus some variance
    const efficiency = rand(0.75, 0.95);
    const theoreticalMax = power_rating * (session_duration / 60);
    let energy_delivered = theoreticalMax * efficiency * rand(0.8, 1.2);
    if (status !== 'completed') energy_delivered *= rand(0.1, 0.6);
    energy_delivered = Math.round(energy_delivered * 10) / 10;

    const user_id = `USER${String(randi(0, 1000)).padStart(3, '0')}`;
    const cost = Math.round(energy_delivered * rand(0.15, 0.25) * 100) / 100;

    return {
      station_id,
      timestamp,
      energy_delivered,
      session_duration,
      status,
      power_rating,
      user_id,
      cost
    };
  }, []);

  const generateSampleData = useCallback((n) => {
    const rows = Array.from({ length: n }, generateOne).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    return rows;
  }, [generateOne]);

  const previewData = useMemo(() => generateSampleData(5), [generateSampleData]);

  // CSV helpers
  const csvEscape = (val) => {
    const s = String(val ?? '');
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };
  const toCSV = (rows) => {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const head = headers.map(csvEscape).join(',');
    const body = rows.map(r => headers.map(h => csvEscape(r[h])).join(',')).join('\n');
    return `${head}\n${body}`;
  };

  const downloadBlob = (content, mime, filename) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadSampleData = async () => {
    try {
      setGenerating(true);
      await new Promise(r => setTimeout(r, 600)); // tiny UX delay

      const n = Math.min(Math.max(recordCount | 0, 1), 10000); // clamp 1..10000
      const data = generateSampleData(n);

      if (dataFormat === 'csv') {
        const csv = toCSV(data);
        downloadBlob(csv, 'text/csv;charset=utf-8', 'charging_station_sample_data.csv');
      } else {
        // build real XLSX without adding weight to bundles unless needed
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ChargingData');
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        downloadBlob(wbout, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'charging_station_sample_data.xlsx');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-600" />
          Sample Data Generator
        </h2>
        <p className="text-gray-600">
          Generate realistic charging station data for testing the analyzer.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Format
          </label>
          <select
            value={dataFormat}
            onChange={(e) => setDataFormat(e.target.value)}
            disabled={generating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="csv">CSV (.csv)</option>
            <option value="excel">Excel (.xlsx)</option>
          </select>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Records
          </label>
          <select
            value={recordCount}
            onChange={(e) => setRecordCount(parseInt(e.target.value, 10))}
            disabled={generating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
            <option value={1000}>1,000</option>
          </select>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-end">
          <button
            onClick={downloadSampleData}
            disabled={generating}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Sample
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <BarChart className="w-5 h-5 mr-2" />
          Data Preview
        </h3>
        <div className="overflow-x-auto bg-gray-50 rounded-lg p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                {['Station ID','Timestamp','Energy (kWh)','Duration (min)','Power (kW)','Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-2 px-3 font-mono text-gray-800">{row.station_id}</td>
                  <td className="py-2 px-3 text-gray-600">{row.timestamp}</td>
                  <td className="py-2 px-3 text-right text-gray-800">{row.energy_delivered}</td>
                  <td className="py-2 px-3 text-right text-gray-800">{row.session_duration}</td>
                  <td className="py-2 px-3 text-right text-gray-800">{row.power_rating}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        row.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : row.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">Showing first 5 preview rows</p>
        </div>
      </div>

      {/* Schema */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Data Schema
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <strong>station_id:</strong> Unique identifier<br/>
            <strong>timestamp:</strong> YYYY-MM-DD HH:MM:SS<br/>
            <strong>energy_delivered:</strong> kWh<br/>
            <strong>session_duration:</strong> minutes
          </div>
          <div>
            <strong>power_rating:</strong> kW (max output)<br/>
            <strong>status:</strong> completed/error/timeout/cancelled<br/>
            <strong>user_id:</strong> anonymized<br/>
            <strong>cost:</strong> currency units
          </div>
        </div>
      </div>
    </div>
  );
}
