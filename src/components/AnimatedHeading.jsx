import React from "react";
import { motion } from "framer-motion";

// Utility component that provides staggered children animation for framer-motion
const StaggeredText = ({ children, className = "" }) => {
  // Parent container variants with staggered children
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 1,
      },
    },
  };

  // Child variants with simple fade and slide up
  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: "easeOut", duration: 0.3 },
    },
  };

  return (
    <motion.div
      className={className + " inline-flex flex-wrap"}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, i) => (
        <motion.span
          key={i}
          variants={childVariants}
          className="inline-block"
          aria-hidden="true"
        >
          {child}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Animated heading component using the StaggeredText utility and mostly Tailwind styling
export const AnimatedHeading = ({ text, className = "" }) => {
  const characters = text.split("");

  return (
    <h1 className={className + " select-none"}>
      <StaggeredText>
        {characters.map((char, i) => (
          <React.Fragment key={i}>
            {char === " " ? "\u00A0" : char}
          </React.Fragment>
        ))}
      </StaggeredText>
    </h1>
  );
};

// Example usage:
// <AnimatedHeading text="Hello, World!" className="text-5xl font-extrabold text-gray-900" />
