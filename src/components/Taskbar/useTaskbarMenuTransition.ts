import { TRANSITIONS_IN_SECONDS } from "@/lib/constants";
import sizes from "@/lib/sizes";
import { MotionProps } from "motion/react";

const useTaskbarMenuTransition = (
  maxHeight: number,
  dynamicPadding = true,
  paddingOffset = 0.5,
  heightOffset = 0.75,
): MotionProps => {
  const height = Math.min(maxHeight, window.innerHeight - sizes.taskbar.height);

  return {
    animate: "active",
    exit: {
      height: `${height * heightOffset}px`,
      transition: {
        duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM / 10,
        ease: "circIn",
      },
    },
    initial: "initial",
    transition: {
      duration: TRANSITIONS_IN_SECONDS.TASKBAR_ITEM,
      ease: "circOut",
    },
    variants: {
      active: { height: `${height}px`, paddingTop: 0 },
      initial: {
        height: `${height * heightOffset}px`,
        paddingTop: dynamicPadding ? `${height * paddingOffset}px` : 0,
      },
    },
  };
};

export default useTaskbarMenuTransition;
