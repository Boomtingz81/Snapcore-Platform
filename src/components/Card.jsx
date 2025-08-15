import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeProvider";
import clsx from "clsx";

export default function Card({ children, header, footer, hover = true, className }) {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={hover ? { scale: 1.03 } : {}}
      className={clsx(theme.card.base, className)}
    >
      {header && <div className="mb-3 font-bold text-lg">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-3 text-sm text-gray-400">{footer}</div>}
    </motion.div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  hover: PropTypes.bool,
  className: PropTypes.string,
};
