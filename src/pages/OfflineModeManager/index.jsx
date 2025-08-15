// src/pages/OfflineModeManager.jsx

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { WifiOff, CloudOff, RefreshCw } from "lucide-react";

export default function OfflineModeManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState(() => {
    return localStorage.getItem("last-sync-time") || "Never synced";
  });

  useEffect(() => {
    const syncTime = () => {
      const now = new Date().toLocaleString();
      setLastSynced(now);
      localStorage.setItem("last-sync-time", now);
    };

    const handleOnline = () => {
      setIsOnline(true);
      syncTime();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleManualSync = () => {
    const now = new Date().toLocaleString();
    setLastSynced(now);
    localStorage.setItem("last-sync-time", now);
  };

  return (
    <>
      <Helmet>
        <title>Offline Mode – SnapCore Sync Manager</title>
        <meta name="description" content="Monitor offline state and manually trigger local syncs." />
      </Helmet>

      <main className="min-h-screen bg-white dark:bg-gray-950 px-6 py-16 text-gray-800 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            {isOnline ? (
              <CloudOff className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="h-8 w-8 text-red-500 dark:text-red-400" />
            )}
            <h1 className="text-3xl font-bold">Offline Mode Manager</h1>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Connection Status:</p>
              <span className={`font-medium ${isOnline ? "text-green-600" : "text-red-500"}`}>
                {isOnline ? "Online ✅" : "Offline ❌"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">Last Local Sync:</p>
              <span className="font-mono">{lastSynced}</span>
            </div>

            <button
              onClick={handleManualSync}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Force Sync
            </button>

            {!isOnline && (
              <p className="text-yellow-500 text-sm">
                ⚠️ You're offline. All changes will be stored locally and synced once you're back online.
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
