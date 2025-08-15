import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeProvider";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  variant = "filled", // filled | outline | glass
  size = "md", // sm | md | lg
  icon,
  disabled = false,
}) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };

  const variantClasses = {
    filled: "bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-none",
    outline: "border border-gray-400 bg-transparent text-black dark:text-white",
    glass: "bg-white/10 backdrop-blur-lg border border-white/20 text-white",
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative w-full">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          theme.input.base,
          sizeClasses[size],
          variantClasses[variant],
          icon && "pl-10"
        )}
      />
    </motion.div>
  );
}

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(["filled", "outline", "glass"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  icon: PropTypes.node,
  disabled: PropTypes.bool,
};
