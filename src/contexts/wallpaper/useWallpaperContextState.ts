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
  WALLPAPER_PATHS_WORKERS,
} from "@/app/components/Wallpaper/constants";
import { WallpaperConfig } from "@/app/components/Wallpaper/types";
import { VantaObject } from "@/app/components/Wallpaper/vanta/types";
import { useFileSystem } from "@/contexts/fileSystem";
import { useSession } from "@/contexts/session";
import { throttle } from "es-toolkit";
import useResizeObserver from "@/hooks/useResizeObserver";
import useWorker from "@/hooks/useWorker";
import { DEFAULT_WALLPAPER } from "../session/useSessionContextState";

declare global {
  interface Window {
    THREE: unknown;
    VANTA: VantaObject;
    SYNTHWAVE: {
      requestId?: number;
      render?: (t: number) => void;
    };
    ANIMATION: {
      requestId?: number;
      render?: () => void;
    };
    DEBUG_DISABLE_WALLPAPER?: boolean;
    WallpaperDestroy?: () => void;
  }
}

type WallpaperMessage = { message: string; type: string };

export const BASE_CANVAS_SELECTOR = ":scope > canvas";
export const BASE_VIDEO_SELECTOR = ":scope > video";

type WallpaperContextState = {
  desktopRef: MutableRefObject<HTMLElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  setTriggerAfterHotReload: React.Dispatch<React.SetStateAction<number>>;
};

const useWallpaperContextState = (): WallpaperContextState => {
  const [triggerAfterHotReload, setTriggerAfterHotReload] = useState(0);
  const desktopRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { exists, lstat, readFile, readdir, updateFolder, writeFile } =
    useFileSystem();
  const {
    sessionLoaded,
    setWallpaper,
    wallpaperImage,
    wallpaperFit,
    wallpaperColor,
  } = useSession();
  const wallpaperTimerRef = useRef<number>();
  const failedOffscreenContext = useRef(false);
  const wallpaperWorker = useWorker<void>(
    WALLPAPER_PATHS_WORKERS[wallpaperImage],
    undefined,
  );

  const handleResize = useCallback(() => {
    if (!desktopRef.current || !WALLPAPER_PATHS[wallpaperImage]) return;
    const desktopRect = desktopRef.current.getBoundingClientRect();
    desktopRef.current.style.backgroundColor = "transparent";
    if (canvasRef.current) {
      canvasRef.current.style.width = `${desktopRect.width}px`;
      canvasRef.current.style.height = `${desktopRect.height}px`;
    }
  }, [wallpaperImage]);

  useResizeObserver(desktopRef.current, handleResize);

  const resetWallpaper = useCallback(() => {
    // create new canvas
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
    canvasRef.current = document.createElement("canvas");
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    document.querySelector(".desktop")?.appendChild(canvasRef.current);

    const { VANTA, SYNTHWAVE, ANIMATION } = window;
    if (VANTA?.current) {
      VANTA.current.destroy();
      VANTA.current = undefined;
    }
    if (SYNTHWAVE?.requestId) {
      cancelAnimationFrame(SYNTHWAVE.requestId);
      SYNTHWAVE.requestId = undefined;
      SYNTHWAVE.render = undefined;
    }
    if (ANIMATION?.requestId) {
      cancelAnimationFrame(ANIMATION.requestId);
      ANIMATION.requestId = undefined;
      ANIMATION.render = undefined;
    }
    desktopRef.current?.querySelector(BASE_VIDEO_SELECTOR)?.remove();
  }, []);

  const loadWallpaper = useCallback(
    throttle((keepCanvas?: boolean) => {
      if (!desktopRef.current) return;
      resetWallpaper();
      let config: WallpaperConfig | undefined =
        WALLPAPER_CONFIG[wallpaperImage];

      if (
        !failedOffscreenContext.current &&
        typeof window.OffscreenCanvas === "function" &&
        wallpaperWorker.current
      ) {
        const workerConfig = { config, devicePixelRatio: 1 };
        if (keepCanvas) {
          wallpaperWorker.current.postMessage(workerConfig);
        } else {
          const offscreen =
            canvasRef.current?.transferControlToOffscreen() as OffscreenCanvas;
          wallpaperWorker.current.postMessage(
            { canvas: offscreen, ...workerConfig },
            [offscreen],
          );
          wallpaperWorker.current.addEventListener(
            "message",
            ({ data }: { data: WallpaperMessage }) => {
              if (data.type === "[error]") {
                if (data.message.includes("getContext")) {
                  failedOffscreenContext.current = true;
                  loadWallpaper();
                } else {
                  setWallpaper(DEFAULT_WALLPAPER);
                }
              }
            },
          );
        }
      } else if (WALLPAPER_PATHS[wallpaperImage]) {
        const fallbackWallpaper = (): void => setWallpaper(DEFAULT_WALLPAPER);
        WALLPAPER_PATHS[wallpaperImage]()
          .then(({ default: wallpaper }) =>
            wallpaper?.(
              canvasRef.current as HTMLCanvasElement,
              config,
              fallbackWallpaper,
            ),
          )
          .catch(fallbackWallpaper);
      } else if (wallpaperImage === "SOLID COLOR") {
        desktopRef.current.style.backgroundColor = wallpaperColor;
      } else {
        setWallpaper(DEFAULT_WALLPAPER);
      }
    }, 50),
    [wallpaperImage, wallpaperColor, wallpaperFit],
  );

  useEffect(() => {
    if (sessionLoaded && !window.DEBUG_DISABLE_WALLPAPER) {
      loadWallpaper();
    }
  }, [loadWallpaper, sessionLoaded, triggerAfterHotReload]);

  return { desktopRef, canvasRef, setTriggerAfterHotReload };
};

export default useWallpaperContextState;
