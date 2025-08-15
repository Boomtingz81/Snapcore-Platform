// src/pages/SnapHistory/index.jsx
import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Clock, Download, Trash2 } from "lucide-react"; // ✅ Fixed ClockHistory -> Clock

export default function SnapHistory() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const historyItems = [
    {
      id: 1,
      title: "Diagnostic Scan – BMW 320d",
      date: "2025-07-27",
      details: "OBD scan completed with SnapTech. 2 Fault codes found.",
    },
    {
      id: 2,
      title: "Service Reset – Audi A4",
      date: "2025-07-26",
      details: "Service light reset completed successfully.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>SnapCore – SnapHistory</title>
        <meta
          name="description"
          content="View your diagnostic and repair history powered by SnapCore AI."
        />
      </Helmet>

      <main className="min-h-[80vh] px-6 py-12 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white text-center">
            📜 SnapHistory
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-10">
            Review your past diagnostic scans, resets, and SnapTech interactions.
          </p>

          <div className="space-y-6">
            {historyItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg flex items-start justify-between"
              >
                <div className="flex items-start gap-4">
                  <Clock className="text-blue-600 w-8 h-8 mt-1" /> {/* ✅ FIXED ICON */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-500">{item.date}</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {item.details}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200">
                    <Download size={18} />
                  </button>
                  <button className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </>
  );
}