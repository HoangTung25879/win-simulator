"use client";
import { useEffect, useMemo, useRef } from "react";
import "./Desktop.scss";
import useWallpaper from "@/hooks/useWallpaper";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";
import { useFileSystem } from "@/contexts/fileSystem";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  useWallpaper(desktopRef);
  const {} = useFileSystem();

  return (
    <div ref={desktopRef} className="desktop" {...FOCUSABLE_ELEMENT}>
      {children}
    </div>
  );
};

export default Desktop;
