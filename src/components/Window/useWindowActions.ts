import { useProcesses } from "@/contexts/process";
import { useProcessesRef } from "@/contexts/process/useProcessesRef";
import { useSession } from "@/contexts/session";
import { useCallback, useMemo } from "react";
import useNextFocusable from "./useNextFocusable";
import { PREVENT_SCROLL } from "@/lib/constants";

type WindowActions = {
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: (keepForegroundId?: boolean) => void;
};

const useWindowActions = (id: string): WindowActions => {
  const { setForegroundId, removeFromStack, stackOrder } = useSession();
  const { closeWithTransition, maximize, minimize } = useProcesses();
  const processesRef = useProcessesRef();
  const nextFocusableId = useNextFocusable(id);
  const onMinimize = useCallback(
    (keepForegroundId?: boolean): void => {
      minimize(id);
      if (!keepForegroundId) setForegroundId(nextFocusableId);
    },
    [id, minimize, nextFocusableId, setForegroundId],
  );

  const onMaximize = useCallback((): void => {
    const triggerMaximize = (): void => {
      maximize(id);
      setForegroundId(id);
      processesRef.current[id]?.componentWindow?.focus(PREVENT_SCROLL);
    };
    const [currentAnimation] =
      processesRef.current[id]?.componentWindow?.getAnimations() || [];

    if (currentAnimation?.finished) {
      currentAnimation.finished.then(triggerMaximize);
    } else {
      triggerMaximize();
    }
  }, [id, maximize, processesRef, setForegroundId]);

  const onClose = useCallback((): void => {
    removeFromStack(id);
    closeWithTransition(id);
    setForegroundId(nextFocusableId);
  }, [
    closeWithTransition,
    id,
    nextFocusableId,
    removeFromStack,
    setForegroundId,
  ]);

  return { onClose, onMaximize, onMinimize };
};

export default useWindowActions;
