import React, { useState, forwardRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

const Button = forwardRef(
  (
    {
      as: Component = "button",
      children,
      onClick,
      type = "button",
      variant = "primary", // primary | secondary | outline | gradient | glass | neon | ghost | danger
      size = "md", // sm | md | lg | xl
      fullWidth = false,
      icon,
      iconPosition = "left",
      loading = false,
      disabled = false,
      badge,
      ariaLabel,
      href,
      to,
    },
    ref
  ) => {
    const [ripple, setRipple] = useState(false);

    const handleClick = (e) => {
      setRipple(true);
      setTimeout(() => setRipple(false), 600);
      if (onClick) onClick(e);
    };

    const baseStyles =
      "relative inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      xl: "px-8 py-4 text-xl",
    };

    const variantStyles = {
      primary: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      secondary: "bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500",
      outline:
        "border border-gray-400 text-gray-200 hover:bg-gray-800 focus:ring-gray-500",
      gradient:
        "bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white hover:opacity-90 focus:ring-red-400",
      glass:
        "backdrop-blur-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:ring-white/40",
      neon:
        "bg-black text-red-500 border border-red-500 shadow-[0_0_10px_#f00] hover:shadow-[0_0_20px_#f00] focus:ring-red-400",
      ghost:
        "bg-transparent text-red-500 border border-transparent hover:border-red-500 focus:ring-red-400",
      danger:
        "bg-red-700 text-white hover:bg-red-800 focus:ring-red-700 border border-red-800",
    };

    const Comp = Component;

    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Comp
          ref={ref}
          type={Component === "button" ? type : undefined}
          onClick={handleClick}
          disabled={disabled || loading}
          aria-label={ariaLabel || "Button"}
          href={href}
          to={to}
          className={clsx(
            baseStyles,
            sizeStyles[size],
            variantStyles[variant],
            fullWidth && "w-full",
            (disabled || loading) && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* ✅ Badge */}
          {badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}

          {/* ✅ Loading Spinner */}
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

          {/* ✅ Ripple Effect */}
          {ripple && (
            <span className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
              <span className="absolute inset-0 scale-0 bg-white/20 rounded-full animate-ripple" />
            </span>
          )}
        </Comp>
      </motion.div>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "gradient",
    "glass",
    "neon",
    "ghost",
    "danger",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  badge: PropTypes.string,
  ariaLabel: PropTypes.string,
  href: PropTypes.string,
  to: PropTypes.string,
};

export default Button;
