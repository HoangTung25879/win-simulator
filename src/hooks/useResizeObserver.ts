import { TRANSITIONS_IN_SECONDS } from "@/lib/constants";
import { debounce } from "es-toolkit";
import { useEffect, useState } from "react";

const useResizeObserver = (
  element?: HTMLElement | null,
  callback?: ResizeObserverCallback,
  debouncing = true,
): void => {
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver>();

  useEffect(() => {
    if (callback) {
      setResizeObserver(
        new ResizeObserver(
          debouncing
            ? debounce(callback, TRANSITIONS_IN_SECONDS.WINDOW * 1000)
            : callback,
        ),
      );
    }
  }, [callback]);

  useEffect(() => {
    if (element instanceof HTMLElement && resizeObserver) {
      resizeObserver.observe(element);
    }

    return () => {
      if (element instanceof HTMLElement && resizeObserver) {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect();
      }
    };
  }, [element, resizeObserver]);
};

export default useResizeObserver;
