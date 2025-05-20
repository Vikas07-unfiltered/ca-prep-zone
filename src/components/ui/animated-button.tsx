import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

interface AnimatedButtonProps extends ButtonProps {
  scale?: number;
  tapScale?: number;
  hoverScale?: number;
  transitionDuration?: number;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    scale = 1.05, 
    tapScale = 0.95, 
    hoverScale = 1.05,
    transitionDuration = 0.2,
    className = "",
    ...props 
  }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
          duration: transitionDuration,
        }}
        className="inline-block"
      >
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton }; 