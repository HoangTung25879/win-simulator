"use client";
import { useMemo, useRef } from "react";
import "./Desktop.scss";
import useWallpaper from "@/hooks/useWallpaper";
import { useMenu } from "@/contexts/menu";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  useWallpaper(desktopRef);
  return (
    <div ref={desktopRef} className="desktop" {...FOCUSABLE_ELEMENT}>
      {children}
    </div>
  );
};

export default Desktop;
