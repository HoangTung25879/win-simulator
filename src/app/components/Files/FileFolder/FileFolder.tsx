"use client";

import { useRef } from "react";
import "./FileFolder.scss";
import { FileStat } from "../FileManager/functions";
import Icon from "../../Icon/Icon";
import useFileInfo from "@/hooks/useFileInfo";

type FileFolderProps = {
  name: string;
  path: string;
  stats: FileStat;
};

const FileFolder = ({ name, path, stats }: FileFolderProps) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [{ comment, getIcon, icon, pid, subIcons, url }, setInfo] = useFileInfo(
    path,
    stats.isDirectory(),
    false,
    true,
  );
  console.log("FileFolder", {
    comment,
    getIcon,
    icon,
    pid,
    subIcons,
    url,
    name,
    path,
    stats,
  });
  return (
    <div ref={buttonRef} role="button" className="file-folder">
      <figure>
        <Icon imgSize={48} src="" />
      </figure>
    </div>
  );
};

export default FileFolder;
