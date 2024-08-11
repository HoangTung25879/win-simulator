import { VantaConfig } from "./vanta/types";

export type WallpaperConfig = VantaConfig;

export type WallpaperFunc = (
  el: HTMLElement | null,
  config?: WallpaperConfig,
  fallback?: () => void,
) => Promise<void> | void;
