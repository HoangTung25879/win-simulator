"use client";
import { useRef } from "react";
import "./Desktop.scss";
import useWallpaper from "../Wallpaper/useWallpaper";
import { DESKTOP_PATH, FOCUSABLE_ELEMENT } from "@/lib/constants";
import FileManager from "../Files/FileManager/FileManager";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const desktopRef = useRef<HTMLElement | null>(null);
  useWallpaper(desktopRef);

  return (
    <main ref={desktopRef} className="desktop" {...FOCUSABLE_ELEMENT}>
      <FileManager
        url={DESKTOP_PATH}
        view="icon"
        allowMovingDraggableEntries
        hideLoading
        hideScrolling
        isDesktop
        loadIconsImmediately
      />
      {children}
    </main>
  );
};

export default Desktop;
