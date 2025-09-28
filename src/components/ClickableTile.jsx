// 📂 FILE: src/components/ClickableTile.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * ClickableTile
 * -----------------------------------------------------------------------------
 * Reusable tile/card that can:
 * - Navigate to a route (via `to`)
 * - Run an action (via `onClick`)
 * - Show locked/disabled state
 * - Render icon, badge, title, subtitle, and description
 *
 * Props:
 * - to?: string // route path, uses <Link> if present
 * - onClick?: () => void // click handler (uses <button> if no `to`)
 * - title?: string
 * - subtitle?: string
 * - description?: string
 * - icon?: React.Component // e.g. from lucide-react
 * - badge?: string // small pill in top-right
 * - gradient?: string // tailwind gradient classes for subtitle text
 * - locked?: boolean // disables and shows overlay
 * - rightSlot?: React.ReactNode // anything you want in the top-right (replaces badge if both given)
 * - className?: string
 */
export default function ClickableTile({
  to,
  onClick,
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  gradient = "from-cyan-400 to-purple-500",
  locked = false,
  rightSlot,
  className = "",
}) {
  const isLink = Boolean(to) && !locked;
  const isButton = !to && typeof onClick === "function" && !locked;

  const baseClasses = [
    "block p-6 rounded-xl shadow-lg",
    "border border-white/10 bg-black/50 backdrop-blur-sm",
    "transition-all duration-300",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
    locked
      ? "opacity-60 cursor-not-allowed pointer-events-none"
      : "hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.35)]",
    className,
  ].join(" ");

  const content = (
    <>
      {/* Top row: icon + right slot / badge */}
      <div className="flex items-start justify-between mb-2">
        {Icon ? (
          <Icon
            className={`w-6 h-6 ${
              locked ? "text-gray-500" : "text-cyan-400 group-hover:text-white transition-colors"
            }`}
            aria-hidden="true"
          />
        ) : (
          <span aria-hidden="true" />
        )}

        {rightSlot ? (
          <div className="ml-3">{rightSlot}</div>
        ) : badge ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md">
            {badge}
          </span>
        ) : null}
      </div>

      {/* Text content */}
      {title ? (
        <p className="text-xs sm:text-sm text-gray-400 mb-1 tracking-wide">{title}</p>
      ) : null}

      {subtitle ? (
        <p className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {subtitle}
        </p>
      ) : null}

      {description ? <p className="text-xs text-gray-500 mt-2 leading-relaxed">{description}</p> : null}
    </>
  );

  return (
    <motion.div
      whileHover={!locked ? { scale: 1.03, y: -2 } : {}}
      whileTap={!locked ? { scale: 0.985 } : {}}
      className="relative group"
      aria-disabled={locked || undefined}
    >
      {isLink ? (
        <Link to={to} className={baseClasses} aria-label={subtitle || title || "Open"}>
          {content}
        </Link>
      ) : isButton ? (
        <button type="button" onClick={onClick} className={baseClasses} aria-label={subtitle || title || "Action"}>
          {content}
        </button>
      ) : (
        // Fallback: static tile (no to/onClick or locked)
        <div className={baseClasses} role="group" aria-label={subtitle || title || "Tile"}>
          {content}
        </div>
      )}

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 rounded-xl bg-black/70 flex items-center justify-center">
          <span className="text-gray-300 text-sm font-medium">🔒 Locked</span>
        </div>
      )}
    </motion.div>
  );
}
