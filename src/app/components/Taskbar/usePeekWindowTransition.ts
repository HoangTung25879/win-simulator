import { MotionProps } from "framer-motion";

const usePeekWindowTransition = (showControls = false): MotionProps => {
  return {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
    transition: {
      duration: 0.1,
    },
  };
};

export default usePeekWindowTransition;
