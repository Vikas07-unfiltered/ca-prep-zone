import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

const directionVariants = {
  up: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  down: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  left: { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  right: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
};

export function AnimatedContainer({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.5,
}: AnimatedContainerProps) {
  const variants = directionVariants[direction];

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.1,
  direction = "up",
  duration = 0.5,
}: AnimatedContainerProps & { staggerDelay?: number }) {
  const variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = directionVariants[direction];

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            transition={{
              duration,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
          >
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div
          variants={itemVariants}
          transition={{
            duration,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
} 