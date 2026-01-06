import { useProcesses } from "@/contexts/process";
import { useSession } from "@/contexts/session";
import { Size } from "@/contexts/session/types";
import { getWindowViewport } from "@/lib/utils";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Position } from "react-rnd";
import {
  calcInitialPosition,
  cascadePosition,
  centerPosition,
  isWindowOutsideBounds,
  WINDOW_OFFSCREEN_BUFFER_PX,
} from "./function";
import sizes from "@/lib/sizes";

type Draggable = [Position, React.Dispatch<React.SetStateAction<Position>>];

const useDraggable = (id: string, size: Size): Draggable => {
  const { processes } = useProcesses();
  const {
    autoSizing,
    closing,
    componentWindow,
    initialRelativePosition,
    maximized = false,
    minimized = false,
  } = processes[id] || {};
  const { stackOrder, windowStates: { [id]: windowState } = {} } = useSession();
  const { position: sessionPosition, size: sessionSize } = windowState || {};
  const isOffscreen = useMemo(
    () => isWindowOutsideBounds(windowState, getWindowViewport()),
    [windowState],
  );
  const [position, setPosition] = useState<Position>(
    () =>
      (!isOffscreen && sessionPosition) ||
      cascadePosition(id, processes, stackOrder, sizes.window.cascadeOffset) ||
      centerPosition(size),
  );
  const blockAutoPositionRef = useRef(false);

  useEffect(() => {
    blockAutoPositionRef.current = Boolean(maximized || minimized);
  }, [maximized, minimized]);

  useEffect(() => {
    // Keep windows within bounds during resize
    const monitorViewportResize = (): void => {
      const vwSize = getWindowViewport();
      if (isWindowOutsideBounds({ position, size }, vwSize, true)) {
        setPosition(({ x, y }) => {
          const xOffset = vwSize.x - WINDOW_OFFSCREEN_BUFFER_PX.RIGHT;
          const yOffset = vwSize.y - WINDOW_OFFSCREEN_BUFFER_PX.BOTTOM;
          return {
            x: x > xOffset ? xOffset : x,
            y: y > yOffset ? yOffset : y,
          };
        });
      }
    };
    window.addEventListener("resize", monitorViewportResize, { passive: true });
    return () => window.removeEventListener("resize", monitorViewportResize);
  }, [position, size]);

  useLayoutEffect(() => {
    if (
      autoSizing &&
      !closing &&
      sessionSize &&
      !sessionPosition &&
      !blockAutoPositionRef.current
    ) {
      setPosition(centerPosition(sessionSize));
    }
  }, [autoSizing, blockAutoPositionRef, closing, sessionPosition, sessionSize]);

  useLayoutEffect(() => {
    if (initialRelativePosition && componentWindow && size) {
      setPosition(
        calcInitialPosition(componentWindow, initialRelativePosition, size),
      );
    }
  }, [componentWindow, initialRelativePosition, size]);

  return [position, setPosition];
};

export default useDraggable;
