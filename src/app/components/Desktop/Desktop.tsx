"use client";
import { useRef } from "react";
import "./Desktop.scss";
import useWallpaper from "@/hooks/useWallpaper";
import { DESKTOP_PATH, FOCUSABLE_ELEMENT } from "@/lib/constants";
import DesktopFileManager from "../Files/FileManager/DesktopFileManager";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const desktopRef = useRef<HTMLElement | null>(null);
  useWallpaper(desktopRef);

  return (
    <main ref={desktopRef} className="desktop" {...FOCUSABLE_ELEMENT}>
      <DesktopFileManager url={DESKTOP_PATH} />
      {children}
    </main>
  );
};

export default Desktop;
