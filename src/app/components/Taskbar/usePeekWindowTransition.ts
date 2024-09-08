import { TRANSITIONS_IN_SECONDS } from "@/lib/constants";
import sizes from "@/lib/sizes";
import { MotionProps } from "framer-motion";

const usePeekWindowTransition = (showControls = false): MotionProps => {
  return {
    animate: "active",
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.WINDOW,
      ease: "easeInOut",
    },
    variants: {
      active: {
        transform: "translateY(0%)",
        bottom: sizes.taskbar.height,
        transitionEnd: {
          pointerEvents: "auto",
        },
      },
      initial: {
        pointerEvents: "none",
        transform: "translateY(100%)",
      },
    },
  };
};

export default usePeekWindowTransition;
