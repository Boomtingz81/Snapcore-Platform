// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className="bg-black/80 backdrop-blur-lg text-gray-300 mt-12 border-t border-white/10 shadow-[0_-10px_30px_-20px_rgba(220,38,38,0.25)]"
      role="contentinfo"
      aria-label="Website Footer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* 🔹 Top Section */}
      <motion.div
        className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-white/10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {/* ✅ Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-red-500 mb-3 drop-shadow-[0_0_10px_rgba(220,38,38,0.35)]">
            SnapCore AI Systems Ltd
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Building the future of AI-powered vehicle diagnostics, empowering
            garages and technicians worldwide with next-generation tools.
          </p>
        </motion.div>

        {/* ✅ Quick Links */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
                aria-label="Home Page"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
                aria-label="About Page"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/features"
                className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
                aria-label="Features Page"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
                aria-label="Contact Page"
              >
                Contact
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* ✅ Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} aria-hidden="true" />{" "}
              <a
                href="mailto:support@snapcore.ai"
                className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
              >
                support@snapcore.ai
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} aria-hidden="true" />{" "}
              <a
                href="tel:+442012345678"
                className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
              >
                +44 20 1234 5678
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} aria-hidden="true" /> London, United Kingdom
            </li>
          </ul>
        </motion.div>

        {/* ✅ Social Media */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2 bg-white/5 rounded-full transition hover:bg-red-500/10 focus:bg-red-500/10 hover:shadow-[0_0_14px_rgba(220,38,38,0.45)] focus:shadow-[0_0_14px_rgba(220,38,38,0.45)] outline-none ring-0 focus-visible:ring-2 focus-visible:ring-red-500/60"
              aria-label="Facebook"
            >
              <Facebook
                size={18}
                className="transition-transform group-hover:scale-110 group-focus:scale-110"
              />
            </a>
            <a
              href="https://twitter.com/snapcoreai"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2 bg-white/5 rounded-full transition hover:bg-red-500/10 focus:bg-red-500/10 hover:shadow-[0_0_14px_rgba(220,38,38,0.45)] focus:shadow-[0_0_14px_rgba(220,38,38,0.45)] outline-none ring-0 focus-visible:ring-2 focus-visible:ring-red-500/60"
              aria-label="Twitter"
            >
              <Twitter
                size={18}
                className="transition-transform group-hover:scale-110 group-focus:scale-110"
              />
            </a>
            <a
              href="https://linkedin.com/company/snapcore"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-2 bg-white/5 rounded-full transition hover:bg-red-500/10 focus:bg-red-500/10 hover:shadow-[0_0_14px_rgba(220,38,38,0.45)] focus:shadow-[0_0_14px_rgba(220,38,38,0.45)] outline-none ring-0 focus-visible:ring-2 focus-visible:ring-red-500/60"
              aria-label="LinkedIn"
            >
              <Linkedin
                size={18}
                className="transition-transform group-hover:scale-110 group-focus:scale-110"
              />
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* 🔹 Bottom Section */}
      <motion.div
        className="text-center text-sm text-gray-400 py-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        © {year} SnapCore AI Systems Ltd. All rights reserved. |{" "}
        <Link
          to="/privacy-policy"
          className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
          aria-label="Privacy Policy"
        >
          Privacy Policy
        </Link>{" "}
        |{" "}
        <Link
          to="/terms"
          className="hover:text-red-400 focus:text-red-400 transition-colors underline-offset-4 hover:underline focus:underline"
          aria-label="Terms of Service"
        >
          Terms of Service
        </Link>
      </motion.div>
    </motion.footer>
  );
}
