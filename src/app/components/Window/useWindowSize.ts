import { useProcesses } from "@/contexts/process";
import { useSession } from "@/contexts/session";
import { useCallback } from "react";
import { minMaxSize } from "./function";
import sizes from "@/lib/sizes";

type WindowSize = {
  updateWindowSize: (height: number, width: number) => void;
};

const useWindowSize = (id: string): WindowSize => {
  const { setWindowStates } = useSession();
  const {
    processes: {
      [id]: { lockAspectRatio = false, maximized = false } = {},
    } = {},
  } = useProcesses();

  const updateWindowSize = useCallback(
    (height: number, width: number) =>
      setWindowStates((currentWindowStates) => ({
        ...currentWindowStates,
        [id]: {
          ...currentWindowStates?.[id],
          maximized,
          size: minMaxSize(
            {
              height: height + sizes.titleBar.height,
              width,
            },
            lockAspectRatio,
          ),
        },
      })),
    [id, lockAspectRatio, maximized, setWindowStates],
  );

  return {
    updateWindowSize,
  };
};

export default useWindowSize;
