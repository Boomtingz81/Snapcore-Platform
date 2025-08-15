// src/pages/Privacy.jsx

import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* ✅ SEO Meta Tags */}
      <Helmet>
        <title>Privacy Policy – SnapCore AI</title>
        <meta
          name="description"
          content="Understand how SnapCore AI collects, stores, and uses your data across all tools and services."
        />
        <link rel="canonical" href="https://snapcore.ai/privacy" />
        <meta property="og:title" content="Privacy Policy – SnapCore AI" />
        <meta
          property="og:description"
          content="Read SnapCore AI's privacy practices and user data handling policies."
        />
        <meta property="og:url" content="https://snapcore.ai/privacy" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy – SnapCore AI",
            description: "SnapCore AI privacy and data protection statement.",
            url: "https://snapcore.ai/privacy",
          })}
        </script>
      </Helmet>

      {/* ✅ Page Content */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen px-6 py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto text-gray-800 dark:text-gray-100">
          {/* ✅ Header */}
          <div className="text-center mb-10">
            <ShieldCheck className="mx-auto mb-4 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your data. Your trust. Here's how we handle both.
            </p>
          </div>

          {/* ✅ Sections */}
          <div className="space-y-8">
            {[
              {
                title: "1. What Data We Collect",
                text: "We collect only the data required to run SnapCore and SnapTech efficiently — including diagnostic history, vehicle scan records, user preferences, and app usage logs.",
              },
              {
                title: "2. How We Use Data",
                text: "Data is used to personalize your experience, power SnapTech AI predictions, and improve service quality. We never sell your information to third parties.",
              },
              {
                title: "3. Data Storage & Security",
                text: "All user data is encrypted in transit and at rest. SnapCore is hosted on secure, GDPR-compliant infrastructure with regular audits and real-time monitoring.",
              },
              {
                title: "4. Your Rights",
                text: (
                  <>
                    You can request a copy of your data, ask us to delete your
                    account, or revoke access at any time by contacting{" "}
                    <a
                      href="mailto:support@snapcore.ai"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      support@snapcore.ai
                    </a>
                    .
                  </>
                ),
              },
              {
                title: "5. Third-Party Tools",
                text: "SnapCore may integrate with third-party APIs (e.g., for vehicle lookup, fault code mapping). These providers are vetted for strict privacy compliance and data minimization.",
              },
              {
                title: "6. Cookies & Tracking",
                text: "We use minimal cookies for session management and basic analytics. You may disable cookies in your browser, though some features may be limited.",
              },
              {
                title: "7. Policy Updates",
                text: "This policy may be updated from time to time. Major changes will be communicated via email or in-app notification. Check this page for the latest version.",
              },
            ].map((section, index) => (
              <div key={index}>
                <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">{section.text}</p>
              </div>
            ))}
          </div>

          {/* ✅ Footer Info */}
          <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
            Last updated: July 2025
          </p>

          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Still have questions?{" "}
            <a
              href="mailto:support@snapcore.ai"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Contact us
            </a>
          </div>
        </div>
      </motion.section>
    </>
  );
}
