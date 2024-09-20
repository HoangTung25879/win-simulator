import { TRANSITIONS_IN_SECONDS } from "@/lib/constants";
import { useEffect, useState } from "react";
import { debounce } from "throttle-debounce";

const useResizeObserver = (
  element?: HTMLElement | null,
  callback?: ResizeObserverCallback,
): void => {
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver>();

  useEffect(() => {
    if (callback) {
      setResizeObserver(
        new ResizeObserver(
          debounce(TRANSITIONS_IN_SECONDS.WINDOW * 1000, callback),
        ),
      );
    }
  }, [callback]);

  useEffect(() => {
    if (element instanceof HTMLElement) {
      resizeObserver?.observe(element);
    }

    return () => {
      if (element instanceof HTMLElement) {
        resizeObserver?.unobserve(element);
      }
    };
  }, [element, resizeObserver]);
};

export default useResizeObserver;
