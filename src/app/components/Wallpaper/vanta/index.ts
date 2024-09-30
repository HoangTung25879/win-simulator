import { loadFiles } from "@/lib/utils";
import { disableControls, libs } from "./config";
import { WallpaperConfig, WallpaperFunc } from "../types";
import { VantaConfig } from "./types";

const Vanta: WallpaperFunc = (
  elementCanvas?: HTMLCanvasElement,
  config?: WallpaperConfig,
  fallback?: () => void,
): void => {
  if (!elementCanvas || typeof WebGLRenderingContext === "undefined") return;
  loadFiles(libs, true).then(() => {
    const { VANTA } = window;
    const EFFECT = VANTA?.[config?.type!];
    if (EFFECT) {
      try {
        EFFECT({
          canvas: elementCanvas,
          ...disableControls,
          ...(config as VantaConfig),
        });
      } catch (error) {
        console.error(error);
        fallback?.();
      }
    }
  });
};

export default Vanta;
