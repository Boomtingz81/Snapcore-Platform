// src/pages/SnapPro.jsx
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

export default function SnapPro() {
  return (
    <>
      <Helmet>
        <title>SnapPro – SnapCore AI</title>
        <meta
          name="description"
          content="SnapPro is the advanced version of SnapCore AI for professional garages and technicians."
        />
        <link rel="canonical" href="https://snapcore.ai/snappro" />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen px-6 py-16 bg-white dark:bg-gray-900"
        aria-labelledby="snappro-heading"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1
            id="snappro-heading"
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            SnapPro
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            The ultimate SnapCore AI package for professional garages and advanced users.
          </p>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Features Coming Soon</h2>
            <ul className="list-disc list-inside text-left text-gray-700 dark:text-gray-300 space-y-1">
              <li>Advanced diagnostics with live ECU data streaming</li>
              <li>Garage dashboard with multi-user management</li>
              <li>Full access to premium SnapCore tools & modules</li>
            </ul>
          </div>
        </div>
      </motion.section>
    </>
  );
}