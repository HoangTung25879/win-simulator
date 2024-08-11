"use client";
import { useRef } from "react";
import "./Desktop.scss";
import useWallpaper from "@/app/hooks/useWallpaper";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  useWallpaper(desktopRef);
  return (
    <div ref={desktopRef} className="desktop">
      {children}
    </div>
  );
};

export default Desktop;
