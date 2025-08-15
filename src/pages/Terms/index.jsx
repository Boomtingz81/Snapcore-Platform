// src/pages/Terms.jsx

import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Terms of Service – SnapCore AI</title>
        <meta
          name="description"
          content="Read the Terms of Service for using SnapCore AI, including licensing, responsibilities, and user agreement."
        />
        <link rel="canonical" href="https://snapcore.ai/terms" />
        <meta property="og:title" content="Terms of Service – SnapCore AI" />
        <meta property="og:description" content="Understand the terms and conditions of using SnapCore's platform and services." />
        <meta property="og:url" content="https://snapcore.ai/terms" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service – SnapCore AI",
            "description": "Read the legal terms and conditions for using SnapCore AI tools and SnapTech diagnostics.",
            "url": "https://snapcore.ai/terms"
          }
          `}
        </script>
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen px-6 py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto text-gray-800 dark:text-gray-100">
          {/* Header */}
          <div className="text-center mb-10">
            <FileText className="mx-auto mb-4 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using the SnapCore AI platform.
            </p>
          </div>

          {/* TOC */}
          <ul className="list-disc ml-6 text-blue-600 dark:text-blue-400 text-sm mb-10 space-y-1">
            <li><a href="#section1" className="hover:underline">1. Acceptance of Terms</a></li>
            <li><a href="#section2" className="hover:underline">2. Use of Platform</a></li>
            <li><a href="#section3" className="hover:underline">3. Licensing & Access</a></li>
            <li><a href="#section4" className="hover:underline">4. AI Usage Disclaimer</a></li>
            <li><a href="#section5" className="hover:underline">5. Privacy & Data</a></li>
            <li><a href="#section6" className="hover:underline">6. Termination</a></li>
            <li><a href="#section7" className="hover:underline">7. Modifications</a></li>
            <li><a href="#section8" className="hover:underline">8. Contact</a></li>
          </ul>

          {/* Sections */}
          <h2 id="section1" className="text-2xl font-semibold mt-8 mb-2">1. Acceptance of Terms</h2>
          <p className="mb-4">
            These Terms of Service govern your access and use of the SnapCore AI platform, tools, and services. By accessing our platform, you acknowledge and agree to these terms.
          </p>

          <h2 id="section2" className="text-2xl font-semibold mt-8 mb-2">2. Use of Platform</h2>
          <p className="mb-4">
            SnapCore AI is intended for use by garages, technicians, and vehicle owners. You must not use the platform for any illegal or unauthorized purpose. You are responsible for your actions on the platform.
          </p>

          <h2 id="section3" className="text-2xl font-semibold mt-8 mb-2">3. Licensing & Access</h2>
          <p className="mb-4">
            SnapCore AI grants you a non-exclusive, limited, and revocable license to use the platform based on your selected plan (Lite, Pro, Garage, or Owner). You may not copy, resell, reverse-engineer, or exploit any part of the system.
          </p>

          <h2 id="section4" className="text-2xl font-semibold mt-8 mb-2">4. AI Usage Disclaimer</h2>
          <p className="mb-4">
            SnapTech AI provides guidance based on trained models, fault data, and repair logic. It is not a replacement for professional judgment. Always verify with a certified technician before performing repairs.
          </p>

          <h2 id="section5" className="text-2xl font-semibold mt-8 mb-2">5. Privacy & Data</h2>
          <p className="mb-4">
            We respect your privacy. Your diagnostic data, vehicle history, and user settings are securely stored. Refer to our{" "}
            <a
              href="/privacy"
              className="text-blue-600 dark:text-blue-400 underline"
              aria-label="Read our Privacy Policy"
            >
              Privacy Policy
            </a>{" "}
            for full details.
          </p>

          <h2 id="section6" className="text-2xl font-semibold mt-8 mb-2">6. Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or terminate your access if you violate these terms, misuse the platform, or interfere with other users' experience.
          </p>

          <h2 id="section7" className="text-2xl font-semibold mt-8 mb-2">7. Modifications</h2>
          <p className="mb-4">
            These terms may be updated occasionally. Continued use after changes implies acceptance of the updated terms. The latest version is always available at <code>/terms</code>.
          </p>

          <h2 id="section8" className="text-2xl font-semibold mt-8 mb-2">8. Contact</h2>
          <p className="mb-4">
            For questions about these terms, contact us at{" "}
            <a
              href="mailto:support@snapcore.ai"
              className="text-blue-600 dark:text-blue-400 underline"
              aria-label="Email support"
            >
              support@snapcore.ai
            </a>.
          </p>

          <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
            Last updated: July 2025
          </p>

          {/* CTA */}
          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            By continuing to use SnapCore, you agree to these terms.{" "}
            <a
              href="/signup"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
            >
              Create an account
            </a>{" "}
            or{" "}
            <a
              href="/features"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
            >
              explore features
            </a>.
          </div>
        </div>
      </motion.section>
    </>
  );
}