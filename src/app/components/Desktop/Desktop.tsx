"use client";
import "./Desktop.scss";
import { DESKTOP_PATH, FOCUSABLE_ELEMENT } from "@/lib/constants";
import FileManager from "../Files/FileManager/FileManager";
import { useWallpaper } from "@/contexts/wallpaper";
import { useEffect } from "react";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const { desktopRef, setTriggerAfterHotReload } = useWallpaper();
  useEffect(() => {
    setTriggerAfterHotReload((currrentValue) => currrentValue + 1);
  }, []);
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
