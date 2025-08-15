// src/pages/NotFound.jsx

import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>404 – Page Not Found | SnapCore AI</title>
        <meta name="description" content="This page doesn't exist. Navigate back to SnapCore AI home or support." />
        <link rel="canonical" href="https://snapcore.ai/404" />
        <meta property="og:title" content="404 – Page Not Found" />
        <meta property="og:description" content="The page you're looking for was not found." />
        <meta property="og:url" content="https://snapcore.ai/404" />
        <meta name="robots" content="noindex, follow" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "404 – Page Not Found | SnapCore AI",
              "description": "SnapCore AI 404 page – the resource you're trying to access isn't available.",
              "url": "https://snapcore.ai/404"
            }
          `}
        </script>
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="text-center text-gray-800 dark:text-gray-100 max-w-xl w-full space-y-6">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 dark:text-yellow-400" />
          <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold">Oops! Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We looked everywhere but couldn’t find what you were looking for.
            It might have been moved, renamed, or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              ← Return to Home
            </Link>
            <Link
              to="/support"
              className="bg-white dark:bg-gray-900 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 font-medium px-6 py-3 rounded-lg transition"
            >
              Contact Support →
            </Link>
          </div>

          {/* Optional search bar for extra UX */}
          <div className="mt-8">
            <input
              type="text"
              placeholder="Search SnapCore.ai..."
              className="w-full sm:w-3/4 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring focus:ring-blue-200"
            />
          </div>

          <p className="text-sm mt-6 text-gray-500 dark:text-gray-400">
            If this issue persists, please{" "}
            <a href="mailto:support@snapcore.ai" className="underline hover:text-blue-600">
              contact our team
            </a>
            .
          </p>
        </div>
      </motion.section>
    </>
  );
}