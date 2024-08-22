import { useState, useCallback } from "react";
import { Processes } from "./types";

type ProcessContextState = {
  // argument: (
  //   id: string,
  //   name: keyof ProcessArguments,
  //   value: ProcessArguments[keyof ProcessArguments],
  // ) => void;
  // close: (id: string, closing?: boolean) => void;
  // closeProcessesByUrl: (closeUrl: string) => void;
  // closeWithTransition: (id: string) => void;
  // icon: (id: string, newIcon: string) => void;
  // linkElement: (
  //   id: string,
  //   name: keyof ProcessElements,
  //   element: HTMLElement,
  // ) => void;
  // maximize: (id: string) => void;
  // minimize: (id: string) => void;
  // open: (
  //   id: string,
  //   processArguments?: ProcessArguments,
  //   icon?: string,
  // ) => void;
  // processes: Processes;
  // title: (id: string, newTitle: string) => void;
  // url: (id: string, newUrl: string) => void;
};

const useProcessContextState = (): ProcessContextState => {
  const [processes, setProcesses] = useState<Processes>(
    Object.create(null) as Processes,
  );

  return {
    // argument,
    // close,
    // closeProcessesByUrl,
    // closeWithTransition,
    // icon,
    // linkElement,
    // maximize,
    // minimize,
    // open,
    processes,
    // title,
    // url,
  };
};

export default useProcessContextState;
