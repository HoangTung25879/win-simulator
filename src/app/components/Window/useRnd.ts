import { useProcesses } from "@/contexts/process";
import { useSession } from "@/contexts/session";
import {
  Props as RndProps,
  RndDragCallback,
  RndResizeCallback,
} from "react-rnd";
import useResizable from "./useResizable";
import useDraggable from "./useDraggable";
import { useCallback, useMemo } from "react";
import { isWindowOutsideBounds } from "./function";
import { getWindowViewport, pxToNum } from "@/lib/utils";
import rndDefaults, {
  RESIZING_DISABLED,
  RESIZING_ENABLED,
} from "./rndDefaults";

const enableIframeCapture = (enable = true): void =>
  document.querySelectorAll("iframe").forEach((iframe) => {
    // eslint-disable-next-line no-param-reassign
    iframe.style.pointerEvents = enable ? "initial" : "none";
  });

const useRnd = (id: string): RndProps => {
  const {
    processes: {
      [id]: {
        allowResizing = true,
        autoSizing = false,
        lockAspectRatio = false,
        maximized = false,
      } = {},
    },
  } = useProcesses();
  const { setWindowStates } = useSession();
  const [size, setSize] = useResizable(id, autoSizing);
  const [position, setPosition] = useDraggable(id, size);

  const onDragStop: RndDragCallback = useCallback(
    (_event, { x, y }) => {
      // Don't block drag over iframes
      enableIframeCapture();
      const newPosition = { x, y };
      if (
        !isWindowOutsideBounds(
          { position: newPosition, size },
          getWindowViewport(),
          true,
        )
      ) {
        setPosition(newPosition);
        setWindowStates((currentWindowStates) => ({
          ...currentWindowStates,
          [id]: {
            ...currentWindowStates[id],
            position: newPosition,
          },
        }));
      }
    },
    [id, setPosition, setWindowStates, size],
  );

  const onResizeStop: RndResizeCallback = useCallback(
    (
      _event,
      _direction,
      { style: { height, width, transform } },
      _delta,
      resizePosition,
    ) => {
      const [, x, y] =
        /translate\((-?\d+)px, (-?\d+)px\)/.exec(transform) || [];
      const newPositon =
        typeof x === "string" && typeof y === "string"
          ? { x: pxToNum(x), y: pxToNum(y) }
          : resizePosition;

      enableIframeCapture();

      const newSize = { height: pxToNum(height), width: pxToNum(width) };

      if (newPositon.y < 0) {
        newSize.height += newPositon.y;
        newPositon.y = 0;
      }

      setSize(newSize);
      setPosition(newPositon);
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          ...currentWindowStates[id],
          position: newPositon,
          size: newSize,
        },
      }));
    },
    [id, setPosition, setSize, setWindowStates],
  );

  const disableIframeCapture = useCallback(
    () => enableIframeCapture(false),
    [],
  );

  const enableResizing = useMemo(
    () => (allowResizing && !maximized ? RESIZING_ENABLED : RESIZING_DISABLED),
    [allowResizing, maximized],
  );

  return {
    disableDragging: maximized,
    enableResizing,
    lockAspectRatio,
    onDragStart: disableIframeCapture,
    onDragStop,
    onResizeStart: disableIframeCapture,
    onResizeStop,
    position,
    size,
    ...rndDefaults,
  };
};

export default useRnd;
