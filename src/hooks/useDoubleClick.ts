import { TRANSITIONS_IN_MS } from "@/lib/constants";
import { useCallback, useRef } from "react";

export const useDoubleClick = (
  doubleClick?: React.MouseEventHandler,
  click?: React.MouseEventHandler,
  timeout = TRANSITIONS_IN_MS.DOUBLE_CLICK,
): React.MouseEventHandler => {
  const clickTimeout = useRef<number | undefined>(undefined);

  const clearClickTimeout = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = undefined;
    }
  };

  return useCallback<React.MouseEventHandler>(
    (event) => {
      clearClickTimeout();
      if (click && event.detail === 1) {
        clickTimeout.current = window.setTimeout(() => {
          click(event);
        }, timeout);
      }
      if (doubleClick && event.detail % 2 === 0) {
        doubleClick(event);
      }
    },
    [click, doubleClick, timeout],
  );
};

export default useDoubleClick;
