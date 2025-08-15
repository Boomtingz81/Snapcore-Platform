// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import {
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  ActivitySquare,
  Rocket,
  Sun,
  Moon,
  ArrowUp,
} from "lucide-react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [apiStatus, setApiStatus] = useState("🟢 Online");

  useEffect(() => {
    window.scrollTo(0, 0);
    const listener = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", listener);
    return () => window.removeEventListener("scroll", listener);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setDarkMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Uncomment below if you have a real status endpoint
    // fetch("/api/status")
    //   .then(res => res.json())
    //   .then(data => setApiStatus(data.status))
    //   .catch(() => setApiStatus("🔴 Offline"));
  }, []);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <>
      <Helmet>
        <title>SnapCore AI – Welcome</title>
        <meta
          name="description"
          content="SnapCore is redefining garage intelligence with real-time AI-powered diagnostics for modern technicians."
        />
        <meta property="og:title" content="SnapCore AI Platform" />
        <meta
          property="og:description"
          content="Revolutionising how technicians work — with precision, speed, and unmatched insight."
        />
        <meta property="og:image" content="/snapcore-preview.png" />
        <meta property="og:url" content="https://snapcore.ai/" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          particles: {
            number: { value: 60 },
            color: { value: "#60a5fa" },
            size: { value: 2 },
            move: { enable: true, speed: 0.6 },
            links: { enable: true, color: "#3b82f6", distance: 100 },
          },
        }}
        className="absolute inset-0 z-0"
      />

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-full shadow-lg transition"
        title="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        >
          <ArrowUp size={18} />
        </button>
      )}

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`min-h-[80vh] flex flex-col justify-center items-center text-center px-6 relative overflow-hidden ${darkMode ? "dark" : ""}`}
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            SnapCore AI Platform
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-balance">
            Welcome to the future of AI-powered diagnostics and garage intelligence.
            We’re revolutionising how technicians work — with precision, speed, and
            unmatched insight.
          </p>

          <div className="mt-4 text-sm text-green-600 dark:text-green-400">
            {apiStatus && `SnapPulse: ${apiStatus}`}
          </div>

          <div className="mt-8">
            <Link
              to="/features"
              onClick={() => {
                window.gtag?.("event", "click_explore_features", {
                  category: "Homepage",
                  label: "Explore Features Button"
                });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Explore Features <ArrowRight size={18} />
            </Link>
          </div>

          <a
            href="#features"
            className="absolute bottom-6 animate-bounce opacity-60 hover:opacity-100 transition duration-300"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Scroll for more ↓
            </span>
          </a>
        </div>
      </motion.section>

      <section
        id="features"
        className="bg-gray-50 dark:bg-gray-900 py-20 px-6 text-center border-t border-gray-200 dark:border-gray-800"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-12">
          Core Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <ShieldCheck className="text-blue-600 w-10 h-10 mx-auto mb-4" />,
              title: "Secure AI Engine",
              desc: "Military-grade encryption and privacy-first design for technician-level security.",
            },
            {
              icon: <BrainCircuit className="text-blue-600 w-10 h-10 mx-auto mb-4" />,
              title: "Live Diagnostics",
              desc: "Real-time fault detection and vehicle analysis using advanced AI models.",
            },
            {
              icon: <ActivitySquare className="text-blue-600 w-10 h-10 mx-auto mb-4" />,
              title: "Garage Dashboards",
              desc: "Manage multiple bays, techs, and repair data effortlessly from one secure place.",
            },
            {
              icon: <Rocket className="text-blue-600 w-10 h-10 mx-auto mb-4" />,
              title: "Rapid Deployment",
              desc: "Cloud-native architecture ensures blazing fast speed and zero-hassle scaling.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              {f.icon}
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-600 text-white py-12 text-center">
        <h3 className="text-2xl font-semibold mb-2">Need help getting started?</h3>
        <p className="mb-4">Let SnapTech guide you through live fault scanning, repairs & setup.</p>
        <Link
          to="/snaptech"
          onClick={() => {
            window.gtag?.("event", "click_snaptech_cta", {
              category: "Engagement",
              label: "SnapTech CTA"
            });
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-xl font-medium hover:bg-gray-100 transition"
        >
          Launch SnapTech <ArrowRight size={18} />
        </Link>
      </section>

      <section className="bg-white dark:bg-gray-900 py-12 text-center border-t dark:border-gray-700">
        <h4 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
          Trusted by forward-thinking garages:
        </h4>
        <div className="flex justify-center gap-6 flex-wrap">
          <img src="/logos/garage1.svg" className="h-10" alt="Garage 1" />
          <img src="/logos/garage2.svg" className="h-10" alt="Garage 2" />
          <img src="/logos/garage3.svg" className="h-10" alt="Garage 3" />
        </div>
      </section>

      <div className="fixed bottom-1 right-2 text-xs text-gray-400">
        v1.0.0 · SnapCore AI
      </div>
    </>
  );
}
