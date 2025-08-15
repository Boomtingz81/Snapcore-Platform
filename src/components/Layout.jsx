// ✅ src/pages/Home/index.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import RegistrationSearch from "../../components/RegistrationSearch";
import Layout from "../../components/Layout";
import themeConfig from "../../themeConfig"; // ✅ NEW – centralised theme colors

export default function Home() {
  const handleSearch = (reg) => {
    window.location.href = `/vehicle-lookup?reg=${reg}`;
  };

  return (
    <Layout
      title="SnapCore AI – AI Vehicle Diagnostic Assistant"
      description="SnapCore AI Systems Ltd – The future of AI-powered vehicle diagnostics and garage automation."
    >
      <div
        className="relative min-h-screen flex flex-col items-center justify-center px-6"
        style={{
          backgroundColor: themeConfig.background || "#0d1117", // ✅ fallback to dark if no image
          backgroundImage: "url('/backgrounds/snapcore-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: themeConfig.text || "#fff",
        }}
      >
        {/* ✅ HERO SECTION */}
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
          style={{ color: themeConfig.heading || "#fff" }}
        >
          AI VEHICLE <br /> DIAGNOSTIC ASSISTANT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg text-center max-w-xl mb-6"
          style={{ color: themeConfig.subtext || "#ccc" }}
        >
          Identify vehicle issues instantly with our powerful AI-driven diagnostics platform.
        </motion.p>

        {/* ✅ CTA */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/snaptech-chat"
            className="px-8 py-3 font-semibold rounded-lg shadow-lg transition mb-10 inline-block"
            style={{
              backgroundColor: themeConfig.primary || "#e11d48",
              color: "#fff",
            }}
          >
            GET STARTED
          </Link>
        </motion.div>

        {/* ✅ Registration Search */}
        <RegistrationSearch onSearch={handleSearch} />
      </div>
    </Layout>
  );
}
