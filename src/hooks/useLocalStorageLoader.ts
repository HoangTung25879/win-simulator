import { getProcessByFileExtension } from "@/app/components/Files/FileManager/functions";
import { useFileSystem } from "@/contexts/fileSystem";
import { useProcesses } from "@/contexts/process";
import { getExtension, isBrowserUrl } from "@/lib/utils";
import { useEffect, useRef } from "react";

const resumePath = "/Users/Public/Desktop/Resume-PhamKhacHoangTung-FE.pdf";

const useLocalStorageLoader = (): void => {
  const { exists, fs } = useFileSystem();
  const { open } = useProcesses();
  const loadedInitialAppRef = useRef(false);

  useEffect(() => {
    if (loadedInitialAppRef.current || !fs || !exists || !open) return;
    loadedInitialAppRef.current = true;
    const loadUrl = async (url: string): Promise<void> => {
      if (!url) return;
      let urlExists = false;
      try {
        urlExists = await exists(url);
      } catch {
        // Ignore error checking if url exists
      }
      const extension = getExtension(url);
      open(
        isBrowserUrl(url)
          ? "Browser"
          : extension
            ? getProcessByFileExtension(extension)
            : "FileExplorer",
        urlExists ? { url } : undefined,
      );
    };
    const hasShowResume = localStorage.getItem("hasShowResume");
    if (!hasShowResume) {
      loadUrl(resumePath);
      localStorage.setItem("hasShowResume", "true");
    }
  }, [exists, fs, open]);
};

export default useLocalStorageLoader;
