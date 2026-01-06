import { MotionProps } from "motion/react";

const useNotificationTransition = (): MotionProps => {
  return {
    layout: true,
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0.5 },
    transition: { duration: 0.2, type: "tween" },
  };
};

export default useNotificationTransition;
