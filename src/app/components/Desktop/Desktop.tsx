"use client";
import { useEffect, useMemo, useRef } from "react";
import "./Desktop.scss";
import useWallpaper from "@/hooks/useWallpaper";
import { DESKTOP_PATH, FOCUSABLE_ELEMENT } from "@/lib/constants";
import { useFileSystem } from "@/contexts/fileSystem";
import DesktopFileManager from "../Files/FileManager/DesktopFileManager";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const desktopRef = useRef<HTMLElement | null>(null);
  useWallpaper(desktopRef);
  const {} = useFileSystem();

  return (
    <main ref={desktopRef} className="desktop" {...FOCUSABLE_ELEMENT}>
      <DesktopFileManager url={DESKTOP_PATH} />
      {children}
    </main>
  );
};

export default Desktop;
