import { MotionProps } from "framer-motion";
import { TRANSITIONS_IN_SECONDS } from "@/lib/constants";

const useCalendarGridTransition = (): MotionProps => {
  //* transition from initial -> active
  return {
    initial: {
      opacity: 1,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
    transition: {
      duration: 1,
    },
  };
};

export default useCalendarGridTransition;
