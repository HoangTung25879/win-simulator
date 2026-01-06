import { TRANSITIONS_IN_SECONDS } from "@/lib/constants";
import sizes from "@/lib/sizes";
import { MotionProps } from "motion/react";

const useTaskbarTabTransition = (): MotionProps => {
  return {
    animate: "active",
    exit: "initial",
    initial: "initial",
    transition: { duration: TRANSITIONS_IN_SECONDS.WINDOW },
    variants: {
      active: { width: sizes.taskbar.entry.maxWidth },
      initial: { width: 0 },
    },
  };
};

export default useTaskbarTabTransition;
