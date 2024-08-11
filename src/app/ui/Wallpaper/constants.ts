import { WallpaperFunc } from "./types";

export const WALLPAPER_PATHS: Record<
  string,
  () => Promise<{ default: WallpaperFunc }>
> = {
  "VANTA WAVES": () => import("@/app/ui/Wallpaper/vanta/index"),
  "VANTA CLOUDS": () => import("@/app/ui/Wallpaper/vanta/index"),
};
