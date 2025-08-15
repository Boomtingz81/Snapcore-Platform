// ✅ File Path: src/components/Button.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import ThemeConfig from "../config/ThemeConfig"; // ✅ Import

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  badge,
  ariaLabel,
}) {
  const [ripple, setRipple] = useState(false);

  const handleClick = (e) => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    if (onClick) onClick(e);
  };

  const { base, sizes, variants, animation } = ThemeConfig.button;

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || "Button"}
      whileHover={animation.hover}
      whileTap={animation.tap}
      className={clsx(
        base,
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50 cursor-not-allowed"
      )}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="mr-2 flex items-center">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="ml-2 flex items-center">{icon}</span>
          )}
        </>
      )}

      {ripple && (
        <span className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <span className="absolute inset-0 scale-0 bg-white/20 rounded-full animate-ripple" />
        </span>
      )}
    </motion.button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(ThemeConfig.button.variants)),
  size: PropTypes.oneOf(Object.keys(ThemeConfig.button.sizes)),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  badge: PropTypes.string,
  ariaLabel: PropTypes.string,
};
