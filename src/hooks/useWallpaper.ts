import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { WALLPAPER_PATHS } from "@/app/components/Wallpaper/constants";
import { WallpaperConfig } from "@/app/components/Wallpaper/types";
import {
  vantaCloudsConfig,
  vantaWavesConfig,
} from "@/app/components/Wallpaper/vanta/config";

export const BASE_CANVAS_SELECTOR = ":scope > canvas";
export const BASE_VIDEO_SELECTOR = ":scope > video";

const useWallpaper = (desktopRef: MutableRefObject<HTMLElement | null>) => {
  const [wallpaperName, setWallpaperName] = useState<
    "VANTA WAVES" | "VANTA CLOUDS"
  >("VANTA CLOUDS");
  const wallpaperTimerRef = useRef<number>();

  const resetWallpaper = useCallback(() => {
    desktopRef.current?.querySelector(BASE_CANVAS_SELECTOR)?.remove();
    desktopRef.current?.querySelector(BASE_VIDEO_SELECTOR)?.remove();
  }, []);

  const loadWallpaper = useCallback(
    (keepCanvas?: boolean) => {
      if (!desktopRef.current) return;
      resetWallpaper();
      let config: WallpaperConfig | undefined;
      if (wallpaperName === "VANTA WAVES") {
        config = vantaWavesConfig;
      } else if (wallpaperName === "VANTA CLOUDS") {
        config = vantaCloudsConfig;
      }
      document.documentElement.style.setProperty(
        "background",
        document.documentElement.style.background.replace(/".*"/, ""),
      );
      if (!keepCanvas) {
        desktopRef.current.querySelector(BASE_CANVAS_SELECTOR)?.remove();
      }
      if (WALLPAPER_PATHS[wallpaperName]) {
        const fallbackWallpaper = (): void => setWallpaperName("VANTA WAVES");
        WALLPAPER_PATHS[wallpaperName]()
          .then(({ default: wallpaper }) =>
            wallpaper?.(desktopRef.current, config, fallbackWallpaper),
          )
          .catch(fallbackWallpaper);
      }
    },
    [wallpaperName],
  );

  useEffect(() => {
    if (!window.DEBUG_DISABLE_WALLPAPER) {
      loadWallpaper();
    }
  }, [loadWallpaper]);

  useEffect(() => {
    const resizeListener = (): void => {
      if (!desktopRef.current || !WALLPAPER_PATHS[wallpaperName]) return;
      const desktopRect = desktopRef.current.getBoundingClientRect();
      const canvasElement =
        desktopRef.current.querySelector(BASE_VIDEO_SELECTOR);
      if (canvasElement instanceof HTMLCanvasElement) {
        canvasElement.style.width = `${desktopRect.width}px`;
        canvasElement.style.height = `${desktopRect.height}px`;
      }
    };

    window.addEventListener("resize", resizeListener, { passive: true });

    return () => window.removeEventListener("resize", resizeListener);
  }, [desktopRef, wallpaperName]);
};

export default useWallpaper;
