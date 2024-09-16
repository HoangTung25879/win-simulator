"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../Apps/RenderComponent";
import { useFileSystem } from "@/contexts/fileSystem";
import { useEffect, useRef, useState } from "react";
import { basename } from "path";
import { getMountUrl, isMountedFolder } from "@/contexts/fileSystem/utils";
import {
  COMPRESSED_FOLDER_ICON,
  FOLDER_ICON,
  MOUNTED_FOLDER_ICON,
  ROOT_NAME,
} from "@/lib/constants";
import { getIconFromIni } from "../Files/FileManager/functions";
import Navigation from "./Navigation/Navigation";
import FileManager from "../Files/FileManager/FileManager";

type FileExplorerProps = ComponentProcessProps;

const FileExplorer = ({ id }: FileExplorerProps) => {
  const {
    icon: setProcessIcon,
    title,
    processes: { [id]: process },
    url: setProcessUrl,
  } = useProcesses();
  const { componentWindow, closing, icon = "", url = "" } = process || {};
  const { fs, rootFs } = useFileSystem();
  const [currentUrl, setCurrentUrl] = useState(url);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const directoryName = basename(url);
  const mountUrl = getMountUrl(url, rootFs?.mntMap || {});

  useEffect(() => {
    if (url) {
      title(id, directoryName || ROOT_NAME);
      if (
        !icon ||
        url !== currentUrl ||
        (mountUrl && icon !== MOUNTED_FOLDER_ICON) ||
        icon === FOLDER_ICON
      ) {
        if (mountUrl && url === mountUrl) {
          setProcessIcon(
            id,
            isMountedFolder(rootFs?.mntMap[url])
              ? MOUNTED_FOLDER_ICON
              : COMPRESSED_FOLDER_ICON,
          );
        } else if (fs) {
          setProcessIcon(
            id,
            `/System/Icons/${directoryName ? "folder" : "pc"}.png`,
          );
          getIconFromIni(fs, url).then((iconFile) => {
            if (iconFile) setProcessIcon(id, iconFile);
          });
        }
        setCurrentUrl(url);
      }
    }
  }, [
    currentUrl,
    directoryName,
    fs,
    icon,
    id,
    mountUrl,
    rootFs?.mntMap,
    setProcessIcon,
    title,
    url,
  ]);

  useEffect(() => {
    if (componentWindow && !closing && !url) {
      setProcessUrl(id, "/");
      setProcessIcon(id, "/System/Icons/pc.png");
    }
  }, [closing, id, componentWindow, setProcessIcon, setProcessUrl, url]);

  return (
    url && (
      <div>
        <Navigation ref={inputRef} id={id} hideSearch={Boolean(mountUrl)} />
        <FileManager id={id} url={url} view="icon" isFileExplorer />
      </div>
    )
  );
};

export default FileExplorer;
