import { useEffect, useRef } from "react";
import { useProcesses } from ".";
import { Processes } from "./types";

export const useProcessesRef = (): React.MutableRefObject<Processes> => {
  const { processes } = useProcesses();
  const processesRef = useRef<Processes>({} as Processes);

  useEffect(() => {
    processesRef.current = processes;
  }, [processes]);

  return processesRef;
};
