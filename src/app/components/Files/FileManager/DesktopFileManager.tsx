"use client";

import { useFileSystem } from "@/contexts/fileSystem";
import useFolder from "@/hooks/useFolder";
import { useMemo, useRef, useState } from "react";
import "./FileManager.scss";
import FileFolder from "../FileFolder/FileFolder";
import { basename, join } from "path";
import { SHORTCUT_EXTENSION } from "@/lib/constants";

type DesktopFileManagerProps = {
  url: string;
};

const DesktopFileManager = ({ url }: DesktopFileManagerProps) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [renaming, setRenaming] = useState("");
  const [mounted, setMounted] = useState<boolean>(false);
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { lstat, rootFs } = useFileSystem();
  const { files, isLoading } = useFolder(url, setRenaming, {});
  const fileKeys = useMemo(() => Object.keys(files), [files]);
  console.log("zoday", files, fileKeys, isLoading);

  return (
    <ol ref={fileManagerRef} className="desktop-file-manager">
      {fileKeys.map((file) => {
        return (
          <li className="file">
            <FileFolder
              name={basename(file, SHORTCUT_EXTENSION)}
              path={join(url, file)}
              stats={files[file]}
            />
          </li>
        );
      })}
    </ol>
  );
};

export default DesktopFileManager;
