import { loadFiles } from "@/app/lib/utils";
import { WallpaperConfig } from "../types";
import { disableControls, libs } from "./config";
import { VantaConfig } from "./types";

const vanta = (
  el: HTMLElement | null,
  config?: WallpaperConfig,
  fallback?: () => void,
): void => {
  const { VANTA: { current: currentEffect } = {} } = window;

  try {
    currentEffect?.destroy();
  } catch {
    // Failed to cleanup effect
  }

  if (!el || typeof WebGLRenderingContext === "undefined") return;

  loadFiles(libs, true).then(() => {
    const { VANTA } = window;
    const EFFECT = VANTA?.[config?.type!];
    if (EFFECT) {
      try {
        EFFECT({
          el,
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

export default vanta;
