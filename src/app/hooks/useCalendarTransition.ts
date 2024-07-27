import { MotionProps } from "framer-motion";
import { TRANSITIONS_IN_SECONDS } from "../lib/constants";

const useCalendarTransition = (): MotionProps => {
  //* transition from initial -> active
  return {
    initial: "initial",
    animate: "active",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM,
      ease: "circOut",
    },
    variants: {
      active: {
        transform: "translateY(0%)",
        transitionEnd: {
          pointerEvents: "auto",
        },
      },
      initial: {
        pointerEvents: "none",
        transform: "translateY(50%)",
      },
    },
  };
};

export default useCalendarTransition;
