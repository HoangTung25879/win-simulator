import { WallpaperFit, WallpaperImage } from "@/contexts/session/types";
import { WallpaperConfig, WallpaperFunc } from "./types";
import { vantaCloudsConfig, vantaWavesConfig } from "./vanta/config";

export const bgPositionSize: Record<WallpaperFit, string> = {
  center: "center center",
  fill: "center center / cover",
  fit: "center center / contain",
  stretch: "center center / 100% 100%",
  tile: "50% 50%",
};

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

export const WALLPAPER_PATHS_WORKERS: Record<
  Exclude<WallpaperImage, "SOLID COLOR">,
  (info?: string) => Worker
> = {
  "VANTA WAVES": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/vanta/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Vanta Waves)${info ? ` [${info}]` : ""}` },
    ),
  "VANTA CLOUDS": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/vanta/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Vanta Clouds)${info ? ` [${info}]` : ""}` },
    ),
  SYNTHWAVE: (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/synthwave/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Synthwave)${info ? ` [${info}]` : ""}` },
    ),
  "AMBIENT SWIRL": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/ambient/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Ambient Swirl)${info ? ` [${info}]` : ""}` },
    ),
  "AMBIENT SHIFT": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/ambient/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Ambient Shift)${info ? ` [${info}]` : ""}` },
    ),
  "AMBIENT COALESCE": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/ambient/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Ambient Coalesce)${info ? ` [${info}]` : ""}` },
    ),
  "FALLING FOOD FIESTA": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/animation/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Falling Food Fiesta)${info ? ` [${info}]` : ""}` },
    ),
  "MATRIX RAIN": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/animation/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Matrix Rain)${info ? ` [${info}]` : ""}` },
    ),
  "GALAXY SPIRAL": (info?: string): Worker =>
    new Worker(
      new URL(
        "src/app/components/Wallpaper/animation/wallpaper.worker.ts",
        import.meta.url,
      ),
      { name: `Wallpaper (Galaxy Spiral)${info ? ` [${info}]` : ""}` },
    ),
};
