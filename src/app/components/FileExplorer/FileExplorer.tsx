"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../Apps/RenderComponent";
import { useFileSystem } from "@/contexts/fileSystem";
import { useState } from "react";

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

  return <div></div>;
};

export default FileExplorer;
