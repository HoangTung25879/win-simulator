import { useProcesses } from "@/contexts/process";
import { useSession } from "@/contexts/session";
import { Size } from "@/contexts/session/types";
import { DEFAULT_WINDOW_SIZE } from "@/lib/constants";
import sizes from "@/lib/sizes";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { minMaxSize } from "./function";

type Resizable = [Size, React.Dispatch<React.SetStateAction<Size>>];

const useResizable = (id: string, autoSizing = false): Resizable => {
  const {
    processes: {
      [id]: {
        lockAspectRatio = false,
        defaultSize = undefined,
        maximized = false,
        minimized = false,
      } = {},
    },
  } = useProcesses();
  const initialSize = useMemo(() => {
    return defaultSize
      ? {
          height: Number(defaultSize.height) + sizes.titleBar.height,
          width: defaultSize.width,
        }
      : DEFAULT_WINDOW_SIZE;
  }, [defaultSize]);
  const {
    windowStates: { [id]: { size: stateSize = initialSize } = {} } = {},
  } = useSession();
  const [size, setSize] = useState<Size>(() =>
    minMaxSize(stateSize, lockAspectRatio),
  );
  const blockAutoSizeRef = useRef(false);

  useEffect(() => {
    blockAutoSizeRef.current = Boolean(maximized || minimized);
  }, [maximized, minimized]);

  useLayoutEffect(() => {
    if (autoSizing && !blockAutoSizeRef.current) {
      setSize(minMaxSize(stateSize, lockAspectRatio));
    }
  }, [autoSizing, blockAutoSizeRef, lockAspectRatio, stateSize]);

  return [size, setSize];
};

export default useResizable;
