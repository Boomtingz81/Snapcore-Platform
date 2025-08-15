import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import clsx from "clsx";
import Button from "./Button";

export default function ButtonGroup({
  buttons = [],
  direction = "row", // row | col
  gap = "md", // sm | md | lg
  align = "center", // start | center | end
  justify = "center", // start | center | end | between
  animation = true,
  stagger = 0.08, // NEW: controls staggered animation
}) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  // 🔹 Framer Motion Variants for Group & Children
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: stagger, duration: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={clsx(
        "flex flex-wrap", // ✅ Added flex-wrap for better responsiveness
        direction === "row" ? "flex-row" : "flex-col",
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify]
      )}
      variants={animation ? containerVariants : {}}
      initial={animation ? "hidden" : false}
      animate={animation ? "visible" : false}
    >
      {buttons.map((btn, i) => (
        <motion.div key={i} variants={animation ? itemVariants : {}}>
          <Button {...btn}>{btn.label}</Button>
        </motion.div>
      ))}
    </motion.div>
  );
}

ButtonGroup.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      variant: PropTypes.string,
      size: PropTypes.string,
      fullWidth: PropTypes.bool,
      icon: PropTypes.node,
      iconPosition: PropTypes.oneOf(["left", "right"]),
      loading: PropTypes.bool,
      disabled: PropTypes.bool,
      badge: PropTypes.string,
    })
  ),
  direction: PropTypes.oneOf(["row", "col"]),
  gap: PropTypes.oneOf(["sm", "md", "lg"]),
  align: PropTypes.oneOf(["start", "center", "end"]),
  justify: PropTypes.oneOf(["start", "center", "end", "between"]),
  animation: PropTypes.bool,
  stagger: PropTypes.number, // ✅ Controls stagger speed
};
