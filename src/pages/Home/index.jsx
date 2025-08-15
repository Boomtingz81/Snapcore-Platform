// src/pages/Home/index.jsx
import React from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import RegistrationSearch from "../../components/RegistrationSearch";
import Header from "../../components/Header"; // ✅ IMPORT HEADER

export default function Home() {
  const handleSearch = (reg) => {
    window.location.href = `/vehicle-lookup?reg=${reg}`;
  };

  return (
    <>
      <Helmet>
        <title>SnapCore AI – AI Vehicle Diagnostic Assistant</title>
        <meta
          name="description"
          content="SnapCore AI Systems Ltd – The future of AI-powered vehicle diagnostics and garage automation."
        />
      </Helmet>

      <main
        className="relative min-h-screen text-white flex flex-col items-center justify-center px-6"
        style={{
          backgroundImage: "url('/backgrounds/snapcore-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* ✅ Reusable Floating Header */}
        <Header />

        {/* ✅ Hero Section */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          src="/logos/snapcore-icon.png"
          alt="SnapCore Logo"
          className="w-24 h-24 mb-6 mt-16"
        />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold text-center mb-4"
        >
          AI VEHICLE <br /> DIAGNOSTIC ASSISTANT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg text-gray-300 text-center max-w-xl mb-6"
        >
          Identify vehicle issues instantly with our powerful AI-driven diagnostics platform.
        </motion.p>

        {/* ✅ CTA */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/snaptech-chat"
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition mb-10 inline-block"
          >
            GET STARTED
          </Link>
        </motion.div>

        {/* ✅ Registration Search */}
        <RegistrationSearch onSearch={handleSearch} />

        {/* ✅ Floating Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
        >
          <div className="bg-black/50 p-6 rounded-xl shadow-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">AI DIAGNOSTICS</p>
            <p className="text-xl font-bold">FAULT CODE DETECTED</p>
          </div>

          <div className="bg-black/50 p-6 rounded-xl shadow-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">REAL-TIME ANALYSIS</p>
            <p className="text-xl font-bold">LIVE FAULT ANALYSIS</p>
          </div>
        </motion.div>

        {/* ✅ About Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-4xl mt-16 bg-black/60 backdrop-blur-md p-8 rounded-xl shadow-lg border border-gray-700 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">About SnapCore AI Systems Ltd</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            SnapCore AI Systems Ltd is a pioneering automotive technology company focused on
            revolutionizing vehicle diagnostics, garage operations, and AI-driven repair guidance.
            Our mission is to deliver tools that make technicians faster, smarter, and more efficient
            by combining advanced artificial intelligence with real-world automotive expertise.
          </p>

          <p className="text-gray-300 leading-relaxed mb-4">
            We are building a full ecosystem of AI-powered solutions including AutoFaultSnap,
            AutoPartSnap, and integrated garage dashboards – all controlled by SnapTech, our
            technician-style AI assistant. SnapCore is designed for scalability, reliability, and
            professional-grade accuracy.
          </p>

          <p className="text-gray-300 leading-relaxed">
            Moving forward, SnapCore will lead the industry with predictive diagnostics, 
            multilingual support, AI-guided repair modes, and seamless OBD integration.
            Our vision is clear: create the world’s smartest AI-driven vehicle diagnostic platform
            that empowers every garage and technician to work at the highest level.
          </p>
        </motion.section>

        {/* ✅ Footer Info */}
        <div className="absolute bottom-4 text-gray-400 text-sm text-center px-4">
          * Real-time analysis • Comprehensive reports • Predictive maintenance
        </div>
      </main>
    </>
  );
}
