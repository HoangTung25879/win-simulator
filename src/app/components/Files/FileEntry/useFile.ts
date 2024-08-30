import { useFileSystem } from "@/contexts/fileSystem";
import { useProcesses } from "@/contexts/process";
import { useProcessesRef } from "@/contexts/process/useProcessesRef";
import { useSession } from "@/contexts/session";
import { useCallback } from "react";
import processDirectory from "@/contexts/process/directory";
import { FOLDER_BACK_ICON, PROCESS_DELIMITER } from "@/lib/constants";
import { basename, extname } from "path";
import { isYouTubeUrl } from "@/lib/utils";

type UseFile = (pid: string, icon?: string) => Promise<void>;

const useFile = (url: string, path: string): UseFile => {
  const { setForegroundId, updateRecentFiles } = useSession();
  const { createPath, updateFolder } = useFileSystem();
  const { minimize, open, url: setUrl } = useProcesses();
  const processesRef = useProcessesRef();

  return useCallback(
    async (pid: string, icon?: string) => {
      const {
        preferProcessIcon,
        singleton,
        icon: processIcon,
      } = processDirectory[pid] || {};
      const activePid = singleton
        ? Object.keys(processesRef.current).find(
            (id) => id === pid || id.startsWith(`${pid}${PROCESS_DELIMITER}`),
          )
        : "";
      let runUrl = url;
      if (activePid) {
        setUrl(activePid, runUrl);
        if (processesRef.current[activePid].minimized) minimize(activePid);
        setForegroundId(activePid);
      } else {
        open(
          pid || "OpenWith",
          { url: runUrl },
          singleton || icon === FOLDER_BACK_ICON || preferProcessIcon
            ? processIcon
            : icon,
        );
        if (runUrl && pid) {
          updateRecentFiles(
            runUrl,
            pid,
            isYouTubeUrl(runUrl) ? basename(path, extname(path)) : undefined,
          );
        }
      }
    },
    [
      createPath,
      minimize,
      open,
      path,
      processesRef,
      setForegroundId,
      setUrl,
      updateFolder,
      updateRecentFiles,
      url,
    ],
  );
};

export default useFile;
