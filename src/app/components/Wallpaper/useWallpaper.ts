import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  WALLPAPER_CONFIG,
  WALLPAPER_PATHS,
} from "@/app/components/Wallpaper/constants";
import { WallpaperConfig } from "@/app/components/Wallpaper/types";
import { VantaObject } from "@/app/components/Wallpaper/vanta/types";
import { useFileSystem } from "@/contexts/fileSystem";
import { useSession } from "@/contexts/session";
import useResizeObserver from "../../../hooks/useResizeObserver";

declare global {
  interface Window {
    THREE: unknown;
    VANTA: VantaObject;
    DEBUG_DISABLE_WALLPAPER?: boolean;
    WallpaperDestroy?: () => void;
  }
}

export const BASE_CANVAS_SELECTOR = ":scope > canvas";
export const BASE_VIDEO_SELECTOR = ":scope > video";

const useWallpaper = (desktopRef: MutableRefObject<HTMLElement | null>) => {
  const { exists, lstat, readFile, readdir, updateFolder, writeFile } =
    useFileSystem();
  const { sessionLoaded, setWallpaper, wallpaperImage, wallpaperFit } =
    useSession();
  const wallpaperTimerRef = useRef<number>();

  const handleResize = useCallback(() => {
    if (!desktopRef.current || !WALLPAPER_PATHS[wallpaperImage]) return;
    const desktopRect = desktopRef.current.getBoundingClientRect();
    const canvasElement = desktopRef.current.querySelector(BASE_VIDEO_SELECTOR);
    if (canvasElement instanceof HTMLCanvasElement) {
      canvasElement.style.width = `${desktopRect.width}px`;
      canvasElement.style.height = `${desktopRect.height}px`;
    }
  }, [wallpaperImage]);

  useResizeObserver(desktopRef.current, handleResize);

  const resetWallpaper = useCallback(() => {
    desktopRef.current?.querySelector(BASE_CANVAS_SELECTOR)?.remove();
    desktopRef.current?.querySelector(BASE_VIDEO_SELECTOR)?.remove();
  }, []);

  const loadWallpaper = useCallback(
    (keepCanvas?: boolean) => {
      if (!desktopRef.current) return;
      resetWallpaper();
      let config: WallpaperConfig | undefined =
        WALLPAPER_CONFIG[wallpaperImage];
      document.documentElement.style.setProperty(
        "background",
        document.documentElement.style.background.replace(/".*"/, ""),
      );
      if (!keepCanvas) {
        desktopRef.current.querySelector(BASE_CANVAS_SELECTOR)?.remove();
      }
      if (WALLPAPER_PATHS[wallpaperImage]) {
        const fallbackWallpaper = (): void => setWallpaper("VANTA WAVES");
        WALLPAPER_PATHS[wallpaperImage]()
          .then(({ default: wallpaper }) =>
            wallpaper?.(desktopRef.current, config, fallbackWallpaper),
          )
          .catch(fallbackWallpaper);
      } else {
        setWallpaper("VANTA WAVES");
      }
    },
    [wallpaperImage, setWallpaper, resetWallpaper],
  );

  useEffect(() => {
    if (sessionLoaded && !window.DEBUG_DISABLE_WALLPAPER) {
      loadWallpaper();
    }
  }, [loadWallpaper, sessionLoaded]);
};

export default useWallpaper;
