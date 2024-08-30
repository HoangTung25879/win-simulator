import { TRANSITIONS_IN_MS } from "@/lib/constants";
import { useCallback, useRef } from "react";

export const useDoubleClick = (
  doubleClick: React.MouseEventHandler,
  click?: React.MouseEventHandler,
  timeout = TRANSITIONS_IN_MS.DOUBLE_CLICK,
): React.MouseEventHandler => {
  // we're using useRef here for the useCallback to rememeber the timeout
  const clickTimeout = useRef<number | undefined>();

  const clearClickTimeout = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = undefined;
    }
  };

  // return a memoized version of the callback that only changes if one of the dependencies has changed
  return useCallback<React.MouseEventHandler>(
    (event) => {
      clearClickTimeout();
      if (click && event.detail === 1) {
        clickTimeout.current = window.setTimeout(() => {
          click(event);
        }, timeout);
      }
      if (event.detail % 2 === 0) {
        doubleClick(event);
      }
    },
    [click, doubleClick, timeout],
  );
};

export default useDoubleClick;
