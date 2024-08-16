import { useFileSystem } from "@/contexts/fileSystem";
import { useRef, useState } from "react";

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

const useFileInfo = (
  path: string,
  isDirectory = false,
  hasNewFolderIcon = false,
  isVisible = true,
): [FileInfo, React.Dispatch<React.SetStateAction<FileInfo>>] => {
  const [info, setInfo] = useState<FileInfo>(INITIAL_FILE_INFO);
  const updatingInfo = useRef(false);
  const updateInfo = (newInfo: FileInfo): void => {
    setInfo(newInfo);
    updatingInfo.current = false;
  };
  const {} = useFileSystem();
  return [info, setInfo];
};
