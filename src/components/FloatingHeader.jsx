// 📂 File: src/components/FloatingHeader.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

export default function FloatingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ✅ Hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about-us" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact-us" },
    { name: "Login", path: "/login" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={clsx(
        // Safe-area + width clamp so it never “overgrows”
        "fixed top-[max(0px,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50",
        "w-[min(92%,_1100px)] px-4 md:px-6 py-2.5 md:py-3",
        "flex items-center justify-between rounded-full backdrop-blur-xl",
        "bg-gradient-to-r from-black/60 via-black/50 to-black/60",
        "border border-pink-500/30",
        "shadow-[0_0_18px_rgba(255,0,100,0.28)]"
      )}
      role="banner"
      aria-label="Floating navigation"
    >
      {/* ✅ Logo */}
      <Link to="/" className="flex items-center gap-2" aria-label="Go to homepage">
        <motion.img
          src="/logos/snapcore-header-logo.png"
          alt="SnapCore Logo"
          className="h-9 w-auto max-w-full object-contain"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ duration: 0.3 }}
        />
      </Link>

      {/* ✅ Desktop Navigation */}
      <nav className="hidden md:flex gap-8" aria-label="Primary">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              clsx(
                "group relative text-sm font-semibold tracking-wide transition duration-300",
                "hover:text-pink-400",
                isActive ? "text-pink-400" : "text-white"
              )
            }
          >
            {link.name}
            {/* Animated underline (now works via .group) */}
            <span className="pointer-events-none absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300 group-hover:w-full" />
          </NavLink>
        ))}

        {/* ✅ CTA Button */}
        <Link
          to="/get-started"
          className="ml-2 md:ml-4 px-4 md:px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-600 text-white text-sm font-semibold shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all duration-300"
        >
          🚀 Get Started
        </Link>
      </nav>

      {/* ✅ Mobile Menu Button */}
      <button
        className="md:hidden text-white hover:text-pink-400 transition"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="floating-mobile-menu"
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* ✅ Mobile Dropdown */}
      {menuOpen && (
        <motion.div
          id="floating-mobile-menu"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-3 w-[min(92vw,_320px)] bg-black/90 border border-pink-500/30 rounded-xl shadow-lg p-4 md:hidden max-h-[70vh] overflow-y-auto"
          role="menu"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "block py-2 px-3 rounded-md transition text-sm font-medium",
                  isActive
                    ? "bg-pink-500 text-white"
                    : "text-gray-200 hover:bg-pink-500 hover:text-white"
                )
              }
              role="menuitem"
            >
              {link.name}
            </NavLink>
          ))}

          <Link
            to="/get-started"
            onClick={() => setMenuOpen(false)}
            className="block mt-3 px-4 py-2 text-center rounded-lg bg-gradient-to-r from-pink-500 to-red-600 text-white font-semibold transition hover:scale-105"
            role="menuitem"
          >
            🚀 Get Started
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
