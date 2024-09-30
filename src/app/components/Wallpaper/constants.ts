import { WallpaperImage } from "@/contexts/session/types";
import { WallpaperConfig, WallpaperFunc } from "./types";
import { vantaCloudsConfig, vantaWavesConfig } from "./vanta/config";

export const WALLPAPER_CONFIG: Record<
  Exclude<WallpaperImage, "SYNTHWAVE" | "SOLID COLOR">,
  WallpaperConfig
> = {
  "VANTA WAVES": vantaWavesConfig,
  "VANTA CLOUDS": vantaCloudsConfig,
  "AMBIENT SWIRL": { type: "swirl" },
  "AMBIENT SHIFT": { type: "shift" },
  "AMBIENT COALESCE": { type: "coalesce" },
  "FALLING FOOD FIESTA": { type: "fallingFoodFiesta" },
  "MATRIX RAIN": { type: "matrixRain" },
  "GALAXY SPIRAL": { type: "galaxySpiral" },
};

export const WALLPAPER_PATHS: Record<
  Exclude<WallpaperImage, "SOLID COLOR">,
  () => Promise<{ default: WallpaperFunc }>
> = {
  "VANTA WAVES": () => import("@/app/components/Wallpaper/vanta"),
  "VANTA CLOUDS": () => import("@/app/components/Wallpaper/vanta"),
  SYNTHWAVE: () => import("@/app/components/Wallpaper/synthwave"),
  "AMBIENT SWIRL": () => import("@/app/components/Wallpaper/ambient"),
  "AMBIENT SHIFT": () => import("@/app/components/Wallpaper/ambient"),
  "AMBIENT COALESCE": () => import("@/app/components/Wallpaper/ambient"),
  "FALLING FOOD FIESTA": () => import("@/app/components/Wallpaper/animation"),
  "MATRIX RAIN": () => import("@/app/components/Wallpaper/animation"),
  "GALAXY SPIRAL": () => import("@/app/components/Wallpaper/animation"),
};
