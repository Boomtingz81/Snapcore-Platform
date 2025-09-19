import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Zap, Wifi, WifiOff, Download, Upload, AlertCircle } from "lucide-react";

import FileUpload from "./FileUpload";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { chargingDataService } from "./chargingDataService";

const ChargingAnalyticsApp = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cachedAnalyses, setCachedAnalyses] = useState([]);

  // ---- helpers ----
  const loadCache = useCallback(() => {
    try {
      setCachedAnalyses(chargingDataService.getCachedAnalyses());
    } catch (e) {
      console.warn("Failed to load cache", e);
      setCachedAnalyses([]);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const showError = useCallback((msg) => setError(String(msg || "Unknown error")), []);

  // ---- SW + network listeners + cache bootstrap ----
  useEffect(() => {
    // Register service worker (don’t break SSR / old browsers)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Use your actual SW path; for Vite PWAs it's usually /sw.js or /service-worker.js from public/
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.log("SW registration failed:", err));
    }

    // prime cache list
    loadCache();

    // network status listeners
    const cleanupNetwork = chargingDataService.registerNetworkListeners(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );

    // update cached list if another tab modifies it
    const onStorage = (e) => {
      if (e.key === "charging_analyses") loadCache();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      cleanupNetwork?.();
      window.removeEventListener("storage", onStorage);
    };
  }, [loadCache]);

  // ---- handlers ----
  const handleFileSelect = useCallback((file) => {
    clearError();
    if (!file) return;
    console.log("File selected:", file.name);
  }, [clearError]);

  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;
      setIsProcessing(true);
      clearError();
      try {
        const result = await chargingDataService.processFile(file);
        setAnalysisData(result);
        loadCache(); // refresh recent list
      } catch (err) {
        console.error("File processing error:", err);
        showError(err?.message || "File processing failed");
      } finally {
        setIsProcessing(false);
      }
    },
    [clearError, showError, loadCache]
  );

  const handleExport = useCallback(
    (analysis) => {
      try {
        chargingDataService.exportAnalysis(analysis);
      } catch (err) {
        showError("Export failed: " + (err?.message || "Unknown error"));
      }
    },
    [showError]
  );

  const startNewAnalysis = useCallback(() => {
    setAnalysisData(null);
    clearError();
  }, [clearError]);

  const loadCachedAnalysis = useCallback((cached) => {
    if (!cached?.analysis) return;
    setAnalysisData(cached.analysis);
    clearError();
  }, [clearError]);

  const recentAnalyses = useMemo(() => cachedAnalyses.slice(0, 6), [cachedAnalyses]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">EV Analytics</h1>
                <p className="text-xs text-gray-500">Charging Station Intelligence</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center" aria-live="polite">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-gray-600 ml-1">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {analysisData && (
                <button
                  onClick={startNewAnalysis}
                  className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Toast */}
      {error && (
        <div
          role="alert"
          className="fixed top-20 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50"
        >
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={clearError}
                className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-900 font-medium">Processing your data...</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              This may take a few moments depending on file size.
            </p>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisData ? (
          <div className="space-y-8">
            {/* Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analyze Charging Station Data
                </h2>
                <p className="text-gray-600">
                  Upload CSV or Excel files containing charging session data to get insights and analytics
                </p>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                onUploadComplete={handleFileUpload}
                onError={showError}
                accept=".csv,.xlsx,.xls"
                maxSize={10 * 1024 * 1024}
              />
            </div>

            {/* Recent Analyses */}
            {recentAnalyses.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analyses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAnalyses.map((cached) => (
                    <button
                      key={cached.key}
                      onClick={() => loadCachedAnalysis(cached)}
                      className="text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {cached?.analysis?.fileName || "Analysis"}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {new Date(cached.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{cached?.analysis?.summary?.totalStations ?? 0} stations</p>
                        <p>{cached?.analysis?.summary?.totalSessions ?? 0} sessions</p>
                        <p>
                          {(cached?.analysis?.summary?.averageEfficiency ?? 0).toFixed(1)}%
                          {" "}avg efficiency
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">File Processing</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload CSV or Excel* files with charging session data
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    *Excel parsing may require server API
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Real-time Analytics</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Get instant insights on station performance and efficiency
                  </p>
                </div>
                <div className="text-center">
                  <Download className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Export & Share</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Export analysis results and share insights with your team
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AnalyticsDashboard
            analysisData={analysisData}
            onExport={handleExport}
            onFilterChange={(filters) => console.log("Filters changed:", filters)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              EV Charging Analytics PWA • Built for charging infrastructure optimization
            </p>
            <div className="flex items-center mt-2 sm:mt-0">
              <span className="text-xs text-gray-400">{isOnline ? "Connected" : "Offline Mode"}</span>
              <span className={`w-2 h-2 rounded-full ml-2 ${isOnline ? "bg-green-400" : "bg-red-400"}`} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChargingAnalyticsApp;
