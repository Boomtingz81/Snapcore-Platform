// src/pages/Features.jsx

import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Cpu,
  Database,
  LockKeyhole,
  Globe,
  Mic,
  BadgeCheck,
  Activity,
} from "lucide-react";

export default function Features() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: "AI Diagnostics Engine",
      icon: Cpu,
      desc: "Real-time fault scanning with adaptive learning models and vehicle-specific logic.",
    },
    {
      title: "Garage Dashboard",
      icon: Database,
      desc: "Manage staff, jobs, and reports across bays with advanced insights and analytics.",
    },
    {
      title: "Secure SnapCore Cloud",
      icon: LockKeyhole,
      desc: "Military-grade encryption protects all diagnostics, history, and customer data.",
    },
    {
      title: "Global Language Support",
      icon: Globe,
      desc: "Auto-detects device language and supports multilingual AI technician guidance.",
    },
    {
      title: "Voice-Controlled SnapTech",
      icon: Mic,
      desc: "Chat with SnapTech using voice commands — scan, repair, and reset hands-free.",
    },
    {
      title: "Verified Repair Procedures",
      icon: BadgeCheck,
      desc: "Access manufacturer-approved reset steps, TSBs, recall data, and torque specs.",
    },
    {
      title: "SnapCore Predict",
      icon: Activity,
      desc: "Predictive fault detection engine trained on historic faults + SnapDNA learning.",
    },
    {
      title: "SnapTech Sentience Mode",
      icon: CheckCircle,
      desc: "Next-gen AI interaction with adaptive tone, role memory, and live diagnostics flow.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>SnapCore – Features</title>
        <meta
          name="description"
          content="Explore SnapCore’s powerful AI diagnostic features, including SnapTech assistant, SnapDNA, multilingual support, and secure technician dashboards."
        />
        <meta property="og:title" content="SnapCore – Features" />
        <meta
          property="og:description"
          content="AI-powered vehicle diagnostics and repair tools for technicians."
        />
        <meta property="og:image" content="/snapcore-preview.png" />
        <meta property="og:url" content="https://snapcore.ai/features" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main>
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="min-h-[70vh] px-6 py-20 bg-gray-50 dark:bg-gray-900 text-center"
          aria-labelledby="features-heading"
          aria-describedby="features-sub"
        >
          <header>
            <h1
              id="features-heading"
              className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
            >
              SnapCore AI Features
            </h1>
            <p
              id="features-sub"
              className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Built for technicians. Powered by AI. Designed to simplify
              diagnostics and deliver speed, accuracy, and control from one
              unified platform.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 gap-y-12 mt-16 max-w-6xl mx-auto">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent hover:border-blue-500"
                  title={f.desc}
                  aria-label={f.title}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="text-blue-600 w-10 h-10 mb-4 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-20"
          >
            <Link
              to="/snaptech"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Try SnapTech Live"
            >
              Try SnapTech Live <Cpu size={18} />
            </Link>
          </motion.div>
        </motion.section>
      </main>
    </>
  );
}
