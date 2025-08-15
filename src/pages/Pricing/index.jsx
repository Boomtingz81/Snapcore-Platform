// src/pages/Pricing/index.jsx

import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { CheckCircle, ShieldCheck, Wrench, Zap } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_YourPublicKeyHere"); // Replace with your live key later

const tiers = [
  {
    name: "Lite",
    price: "Free",
    highlight: false,
    icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
    features: [
      "Manual fault lookup",
      "Number plate + VIN decoding",
      "SnapTech Preview Mode",
      "Offline access (basic)",
    ],
    stripePriceId: null,
  },
  {
    name: "Pro",
    price: "£14.99/mo",
    highlight: true,
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    features: [
      "Live SnapTech diagnostics",
      "Voice scanning + commands",
      "AI repair logic + resets",
      "Offline vehicle packs",
      "PDF scan exports",
      "Multilingual support",
    ],
    stripePriceId: "price_123_PRO_MONTHLY", // Replace with live ID
  },
  {
    name: "Garage",
    price: "£39.99/mo",
    highlight: false,
    icon: <Wrench className="w-6 h-6 text-green-600" />,
    features: [
      "Team access & dashboard",
      "Customer MOT reminders",
      "Garage-only repair manuals",
      "Job card AI + SnapSign",
      "VIN decoding + quote tool",
    ],
    stripePriceId: "price_456_GARAGE_MONTHLY", // Replace with live ID
  },
  {
    name: "Owner",
    price: "Custom / £99+",
    highlight: false,
    icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
    features: [
      "All features unlocked",
      "SnapCore debug panel",
      "SnapPulse monitoring",
      "Full app licensing",
      "Priority AI support",
    ],
    stripePriceId: null,
  },
];

export default function Pricing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = async (priceId) => {
    if (!priceId) return;
    const stripe = await stripePromise;
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    const session = await response.json();
    if (session.id) {
      await stripe.redirectToCheckout({ sessionId: session.id });
    }
  };

  return (
    <>
      <Helmet>
        <title>Pricing – SnapCore AI</title>
        <meta name="description" content="Choose your SnapCore AI plan – from Lite to Pro, Garage, and Owner tiers." />
        <meta property="og:title" content="Pricing – SnapCore AI" />
        <meta property="og:description" content="Unlock AI vehicle diagnostics, garage tools, and real-time repair logic." />
        <meta property="og:image" content="/pricing-preview.png" />
        <meta property="og:url" content="https://snapcore.ai/pricing" />
        <link rel="canonical" href="https://snapcore.ai/pricing" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-[80vh] px-6 py-20 bg-white dark:bg-gray-900 text-center"
        aria-labelledby="pricing-heading"
      >
        <h1
          id="pricing-heading"
          className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
        >
          Choose Your Access Tier
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
          SnapCore adapts to your needs — from exploring Lite tools to managing a garage with AI.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 border ${
                tier.highlight ? "border-blue-600" : "border-transparent"
              }`}
              aria-label={`Plan: ${tier.name}`}
            >
              {tier.highlight && (
                <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Best Value
                </span>
              )}
              <div className="mb-3">{tier.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{tier.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{tier.price}</p>
              <ul className="text-left text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                {tier.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={!tier.stripePriceId}
                onClick={() => handleCheckout(tier.stripePriceId)}
                className={`w-full py-2 rounded-md font-semibold transition ${
                  !tier.stripePriceId
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {tier.stripePriceId ? `Start with ${tier.name}` : "Contact Us"}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </>
  );
}
