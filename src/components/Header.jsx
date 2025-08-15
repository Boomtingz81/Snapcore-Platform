// 📂 File: src/components/Header.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ✅ Shrink on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(
        // glass + neon glow + zero-white background
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b",
        "border-white/10 supports-[backdrop-filter]:bg-transparent",
        isScrolled
          ? // Scrolled: tighter padding + subtle glow
            "glass bg-black/30 py-2 shadow-[0_0_24px_rgba(0,240,255,0.18)]"
          : // Top: slightly larger padding and lighter veil
            "glass bg-black/20 py-4"
      )}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* ✅ Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-md"
          aria-label="SnapCore home"
        >
          <img
            src="/logos/snapcore-header-logo.png"
            alt="SnapCore Logo"
            className="h-10 w-auto object-contain"
            draggable={false}
          />
        </Link>

        {/* ✅ Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  "relative font-medium transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded",
                  "hover:text-cyan-300",
                  isActive ? "text-cyan-300" : "text-gray-200"
                )
              }
            >
              {/* underline accent on hover/active */}
              {({ isActive }) => (
                <span className="inline-block">
                  {link.name}
                  <span
                    className={clsx(
                      "block h-px mt-1 transition-all duration-300",
                      isActive ? "w-full bg-cyan-300/80 shadow-[0_0_12px_rgba(0,240,255,0.45)]" : "w-0 bg-cyan-300/60 group-hover:w-full"
                    )}
                  />
                </span>
              )}
            </NavLink>
          ))}

          {/* ✅ CTA Button */}
          <Link
            to="/get-started"
            className={clsx(
              "ml-4 px-4 py-2 rounded-lg text-white font-semibold transition",
              // neon cyan button with subtle glow; keeps your route/CTA intact
              "bg-cyan-600 hover:bg-cyan-500",
              "shadow-[0_0_14px_rgba(0,240,255,0.35)] hover:shadow-[0_0_18px_rgba(0,240,255,0.55)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            )}
          >
            Get Started
          </Link>
        </nav>

        {/* ✅ Mobile Menu Button */}
        <button
          className="md:hidden text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ✅ Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={clsx(
              "md:hidden border-t border-white/10",
              // glass panel w/ zero-white + neon shadow
              "glass bg-black/50 shadow-[0_0_24px_rgba(0,240,255,0.18)]"
            )}
          >
            <div className="flex flex-col p-4 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "py-2 px-3 rounded-lg transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
                      "hover:bg-cyan-600/20 hover:text-cyan-200",
                      isActive
                        ? "bg-cyan-600/20 text-cyan-200"
                        : "text-gray-200"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              {/* ✅ CTA Button for Mobile */}
              <Link
                to="/get-started"
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  "mt-3 px-4 py-2 rounded-lg text-white font-semibold text-center transition",
                  "bg-cyan-600 hover:bg-cyan-500",
                  "shadow-[0_0_14px_rgba(0,240,255,0.35)] hover:shadow-[0_0_18px_rgba(0,240,255,0.55)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                )}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
