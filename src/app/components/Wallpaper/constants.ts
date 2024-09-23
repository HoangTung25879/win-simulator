import { WallpaperImage } from "@/contexts/session/types";
import { WallpaperConfig, WallpaperFunc } from "./types";
import { vantaCloudsConfig, vantaWavesConfig } from "./vanta/config";

export const WALLPAPER_CONFIG: Record<WallpaperImage, WallpaperConfig> = {
  "VANTA WAVES": vantaWavesConfig,
  "VANTA CLOUDS": vantaCloudsConfig,
};

export const WALLPAPER_PATHS: Record<
  string,
  () => Promise<{ default: WallpaperFunc }>
> = {
  "VANTA WAVES": () => import("@/app/components/Wallpaper/vanta/index"),
  "VANTA CLOUDS": () => import("@/app/components/Wallpaper/vanta/index"),
};
