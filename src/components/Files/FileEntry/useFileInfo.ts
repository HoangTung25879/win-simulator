import {
  getInfoWithExtension,
  getInfoWithoutExtension,
} from "@/components/Files/FileManager/functions";
import { useFileSystem } from "@/contexts/fileSystem";
import { isMountedFolder } from "@/contexts/fileSystem/utils";
import { MOUNTABLE_EXTENSIONS } from "@/lib/constants";
import { getExtension } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export type FileInfo = {
  comment?: string;
  getIcon?: true | ((signal: AbortSignal) => void | Promise<void>);
  icon: string;
  pid: string; //processId
  subIcons?: string[];
  type?: string;
  url: string;
};

const INITIAL_FILE_INFO: FileInfo = {
  icon: "",
  pid: "",
  url: "",
};

const useFileInfo = ({
  path,
  isDirectory = false,
  hasNewFolderIcon = false,
  isVisible = true,
}: {
  path: string;
  isDirectory?: boolean;
  hasNewFolderIcon?: boolean;
  isVisible?: boolean;
}): [FileInfo, React.Dispatch<React.SetStateAction<FileInfo>>] => {
  const [info, setInfo] = useState<FileInfo>(INITIAL_FILE_INFO);
  const updatingInfo = useRef(false);
  const updateInfo = (newInfo: FileInfo): void => {
    setInfo(newInfo);
    updatingInfo.current = false;
  };
  const { fs, rootFs } = useFileSystem();

  useEffect(() => {
    if (
      fs &&
      rootFs &&
      !updatingInfo.current &&
      isVisible &&
      info === INITIAL_FILE_INFO
    ) {
      updatingInfo.current = true;
      const extension = getExtension(path);
      if (
        !extension ||
        (isDirectory &&
          !MOUNTABLE_EXTENSIONS.has(extension) &&
          !isMountedFolder(rootFs.mntMap[path]))
      ) {
        getInfoWithoutExtension(
          fs,
          rootFs,
          path,
          isDirectory,
          hasNewFolderIcon,
          updateInfo,
        );
      } else {
        getInfoWithExtension(fs, path, extension, updateInfo);
      }
    }
  }, [fs, hasNewFolderIcon, info, isDirectory, isVisible, path, rootFs]);

  return [info, setInfo];
};

export default useFileInfo;
