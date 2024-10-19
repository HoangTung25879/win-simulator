"use client";
import "./Desktop.scss";
import { DESKTOP_PATH, FOCUSABLE_ELEMENT } from "@/lib/constants";
import FileManager from "../Files/FileManager/FileManager";
import { useWallpaper } from "@/contexts/wallpaper";
import { useEffect } from "react";
import useUrlLoader from "@/hooks/useUrlLoader";
import useLocalStorageLoader from "@/hooks/useLocalStorageLoader";
import packageData from "package.json";

type DesktopProps = {
  children: React.ReactNode;
};

if (typeof window !== "undefined") {
  const localVersion = localStorage?.getItem("version");
  if (localVersion !== packageData.version) {
    localStorage.clear();
    localStorage.setItem("version", packageData.version);
  }
}

const Desktop = ({ children }: DesktopProps) => {
  const { desktopRef, setTriggerAfterHotReload } = useWallpaper();
  useUrlLoader();
  useLocalStorageLoader();

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
