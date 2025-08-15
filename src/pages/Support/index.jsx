// src/pages/Support.jsx

import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { LifeBuoy, Bot, BookText, MessageCircleQuestion } from "lucide-react";
import { Link } from "react-router-dom";

const supportOptions = [
  {
    icon: <Bot className="w-6 h-6 mb-3 text-blue-600 dark:text-blue-400" />,
    title: "Ask SnapTech",
    description: "Our AI technician is online 24/7 to guide you with diagnostics and repair advice.",
    to: "/snaptech",
    label: "Open SnapTech",
  },
  {
    icon: <BookText className="w-6 h-6 mb-3 text-blue-600 dark:text-blue-400" />,
    title: "FAQs",
    description: "Browse common questions and answers about SnapCore, diagnostics, and plans.",
    to: "/faqs",
    label: "Browse FAQs",
  },
  {
    icon: <MessageCircleQuestion className="w-6 h-6 mb-3 text-blue-600 dark:text-blue-400" />,
    title: "Open Support Ticket",
    description: "Can't find what you need? Send our support team a message directly.",
    to: "/contact",
    label: "Contact Support",
  },
];

export default function Support() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Support – SnapCore AI</title>
        <meta
          name="description"
          content="Access SnapCore AI support, including SnapTech help, FAQs, and user resources."
        />
        <link rel="canonical" href="https://snapcore.ai/support" />
        <meta property="og:title" content="Support – SnapCore AI" />
        <meta
          property="og:description"
          content="Need help? Get instant support from SnapTech or browse troubleshooting resources."
        />
        <meta property="og:url" content="https://snapcore.ai/support" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen px-6 py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto text-gray-800 dark:text-gray-100">
          <header className="text-center mb-12">
            <LifeBuoy
              className="mx-auto mb-4 h-8 w-8 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            <h1 className="text-4xl font-extrabold leading-tight">
              Need Help?
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              We're here to assist you. Choose a support option below.
            </p>
          </header>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
            {supportOptions.map((item, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition"
                aria-label={item.title}
              >
                {item.icon}
                <h2 className="text-xl font-semibold mb-1">{item.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {item.description}
                </p>
                <Link
                  to={item.to}
                  className="inline-block text-blue-600 dark:text-blue-400 underline font-medium"
                  aria-label={item.label}
                >
                  {item.label} →
                </Link>
              </motion.article>
            ))}
          </div>

          <p className="mt-10 text-sm text-center text-gray-500 dark:text-gray-400">
            We typically respond to inquiries within 24 hours.
          </p>
        </div>
      </motion.section>
    </>
  );
}