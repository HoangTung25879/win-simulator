import { useState, useCallback, useEffect } from "react";
import { ProcessArguments, ProcessElements, Processes } from "./types";
import {
  closeProcess,
  maximizeProcess,
  minimizeProcess,
  openProcess,
  setIcon,
  setProcessArgument,
  setProcessElement,
  setTitle,
  setUrl,
} from "./functions";
import { TRANSITIONS_IN_MS } from "@/lib/constants";
import { AllProcess } from "./directory";
import { useNotification } from "../notification";

type ProcessContextState = {
  argument: (
    id: string,
    name: keyof ProcessArguments,
    value: ProcessArguments[keyof ProcessArguments],
  ) => void;
  close: (id: string, closing?: boolean) => void;
  closeProcessesByUrl: (closeUrl: string) => void;
  closeWithTransition: (id: string) => void;
  icon: (id: string, newIcon: string) => void;
  linkElement: (
    id: string,
    name: keyof ProcessElements,
    element: HTMLElement,
  ) => void;
  maximize: (id: string) => void;
  minimize: (id: string) => void;
  open: (
    id: string,
    processArguments?: ProcessArguments,
    icon?: string,
  ) => void;
  processes: Processes;
  title: (id: string, newTitle: string) => void;
  url: (id: string, newUrl: string) => void;
};

const useProcessContextState = (): ProcessContextState => {
  const { showNotification } = useNotification();
  const [processes, setProcesses] = useState<Processes>(
    Object.create(null) as Processes,
  );

  useEffect(() => {
    // console.log("useProcessContextState", processes);
  }, [processes]);

  const argument = useCallback(
    (
      id: string,
      name: keyof ProcessArguments,
      value: ProcessArguments[keyof ProcessArguments],
    ) => setProcesses(setProcessArgument(id, name, value)),
    [],
  );

  const close = useCallback(
    (id: string, closing?: boolean) => setProcesses(closeProcess(id, closing)),
    [],
  );

  const icon = useCallback(
    (id: string, newIcon: string) => setProcesses(setIcon(id, newIcon)),
    [],
  );

  const maximize = useCallback(
    (id: string) => setProcesses(maximizeProcess(id)),
    [],
  );

  const minimize = useCallback(
    (id: string) => setProcesses(minimizeProcess(id)),
    [],
  );

  const open = useCallback(
    (id: string, processArguments?: ProcessArguments, initialIcon?: string) => {
      if (!id || id === AllProcess.OpenWith) {
        showNotification({
          processTitle: "System",
          title: "Cannot open file",
          content: "The file format is not supported yet.",
        });
        return;
      }
      if (id === "ExternalURL") {
        const { url: externalUrl = "" } = processArguments || {};

        if (
          externalUrl.startsWith("http:") ||
          externalUrl.startsWith("https:")
        ) {
          window.open(
            decodeURIComponent(externalUrl),
            "_blank",
            "noopener,noreferrer",
          );
        }
      } else {
        setProcesses(openProcess(id, processArguments || {}, initialIcon));
      }
    },
    [showNotification],
  );

  const linkElement = useCallback(
    (id: string, name: keyof ProcessElements, element: HTMLElement) =>
      setProcesses(setProcessElement(id, name, element)),
    [],
  );

  const title = useCallback(
    (id: string, newTitle: string) => setProcesses(setTitle(id, newTitle)),
    [],
  );

  const url = useCallback(
    (id: string, newUrl: string) => setProcesses(setUrl(id, newUrl)),
    [],
  );

  const closeWithTransition = useCallback(
    (id: string): void => {
      close(id, true);
      window.setTimeout(() => close(id), TRANSITIONS_IN_MS.WINDOW);
    },
    [close],
  );

  const closeProcessesByUrl = useCallback(
    (closeUrl: string): void =>
      setProcesses((currentProcesses) => {
        Object.entries(currentProcesses).forEach(
          ([id, { url: processUrl }]) => {
            if (processUrl === closeUrl) closeWithTransition(id);
          },
        );

        return currentProcesses;
      }),
    [closeWithTransition],
  );

  return {
    argument,
    close,
    closeProcessesByUrl,
    closeWithTransition,
    icon,
    linkElement,
    maximize,
    minimize,
    open,
    processes,
    title,
    url,
  };
};

export default useProcessContextState;
