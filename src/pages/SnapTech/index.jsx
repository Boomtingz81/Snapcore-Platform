// src/pages/SnapTech.jsx

import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Mic, BrainCircuit, Activity, Volume2, Wrench, Languages, Bluetooth, Waves } from "lucide-react";

// Feature icons and metadata
const features = [
  {
    icon: <Mic className="w-8 h-8 mx-auto text-blue-600" aria-hidden="true" />,
    title: "Voice Control",
    desc: "Speak directly to SnapTech to trigger scans, ask questions, or request fixes.",
  },
  {
    icon: <BrainCircuit className="w-8 h-8 mx-auto text-blue-600" aria-hidden="true" />,
    title: "AI-Powered Fault Detection",
    desc: "Advanced AI reads codes, learns from history, and guides you like a technician would.",
  },
  {
    icon: <Activity className="w-8 h-8 mx-auto text-blue-600" aria-hidden="true" />,
    title: "Live Response Mode",
    desc: "SnapTech adapts its advice instantly based on vehicle signals and fault conditions.",
  },
  {
    icon: <Volume2 className="w-8 h-8 mx-auto text-blue-600" aria-hidden="true" />,
    title: "Natural Language Understanding",
    desc: "Ask it like a human. SnapTech replies with repair logic, not robot gibberish.",
  },
];

// Future roadmap features
const futureFeatures = [
  { icon: <Bluetooth className="w-6 h-6 text-blue-600" />, title: "Bluetooth OBD2 Integration", desc: "Live diagnostics with ThinkDiag 2 and future smart tools." },
  { icon: <BrainCircuit className="w-6 h-6 text-purple-600" />, title: "SnapDNA™ Memory", desc: "SnapTech will remember vehicle patterns, history, and adapt." },
  { icon: <Waves className="w-6 h-6 text-green-600" />, title: "Fault Prediction Engine", desc: "Anticipate future faults before they happen using AI trends." },
  { icon: <Mic className="w-6 h-6 text-pink-600" />, title: "Real-Time Voice Commands", desc: "Control SnapTech hands-free with your voice in live mode." },
  { icon: <Wrench className="w-6 h-6 text-yellow-600" />, title: "AI Reset Procedures", desc: "One-tap resets and guided walkthroughs powered by AI." },
  { icon: <BrainCircuit className="w-6 h-6 text-indigo-600" />, title: "Garage Sync Mode", desc: "Allow multiple technicians to use SnapTech on shared jobs." },
  { icon: <Languages className="w-6 h-6 text-rose-600" />, title: "Multilingual Replies", desc: "SnapTech will speak your language. Literally." },
  { icon: <Waves className="w-6 h-6 text-blue-500" />, title: "SnapRelay Repair Prompts", desc: "SnapTech will auto-prompt repair guides via AI mesh." },
];

// Animation
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function SnapTech() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>SnapTech AI Assistant – SnapCore AI</title>
        <meta name="description" content="Meet SnapTech – your live AI assistant for diagnostics, fault scanning, resets, and technician-grade repair advice." />
        <link rel="canonical" href="https://snapcore.ai/snaptech" />
      </Helmet>

      <main id="snaptech-main" aria-labelledby="snaptech-heading">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[80vh] px-6 py-20 bg-white dark:bg-gray-900 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6" id="snaptech-heading">
            Meet SnapTech
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Your voice-powered AI technician. Ask questions, run scans, get real-time guidance — SnapTech is always ready.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
            {features.map((f, i) => (
              <FeatureCard key={i} index={i} {...f} />
            ))}
          </div>

          <motion.div
            className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-2xl mx-auto shadow-lg border border-gray-300 dark:border-gray-700"
            whileTap={{ scale: 0.98 }}
            aria-label="Voice Simulation Module"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Voice Module Simulation</p>
            <button
              disabled
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
              aria-label="Start voice control simulation (coming soon)"
            >
              🎙️ Start Talking to SnapTech (Coming Soon)
            </button>
          </motion.div>
        </motion.section>

        {/* Future Module Section */}
        <section className="px-6 py-16 bg-gray-50 dark:bg-gray-950 text-center border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            What’s Next for SnapTech?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            We’re just getting started. These advanced modules will unlock soon.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {futureFeatures.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow border border-gray-200 dark:border-gray-800"
                aria-label={f.title}
              >
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function FeatureCard({ icon, title, desc, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      variants={fadeUp}
      viewport={{ once: true }}
      className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 border border-transparent hover:border-blue-500"
      aria-label={title}
    >
      <div>{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </motion.div>
  );
}
