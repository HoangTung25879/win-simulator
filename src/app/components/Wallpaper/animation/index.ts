import { AnimationRenderer, WallpaperConfig, WallpaperFunc } from "../types";
import FallingFoodFiesta from "./fallingFoodFiesta";
import GalaxySpiral from "./galaxySpiral";
import MatrixRain from "./matrixRain";
import { AnimationConfig, AnimationType } from "./types";

if (typeof window == "object" && !window.ANIMATION) window.ANIMATION = {};
const map: Record<AnimationType, AnimationRenderer> = {
  fallingFoodFiesta: FallingFoodFiesta,
  galaxySpiral: GalaxySpiral,
  matrixRain: MatrixRain,
};
const Animation: WallpaperFunc = (
  elementCanvas?: HTMLCanvasElement,
  config?: WallpaperConfig,
  fallback?: () => void,
): void => {
  if (!elementCanvas || !config) return;
  try {
    const { ANIMATION } = window;
    const ctx = elementCanvas.getContext("2d", {
      alpha: false,
    }) as CanvasRenderingContext2D;
    const animationRenderer: AnimationRenderer = map[
      (config as AnimationConfig).type
    ] as AnimationRenderer;
    ANIMATION.render = animationRenderer(
      ctx,
      elementCanvas.width,
      elementCanvas.height,
    );
    const tick = () => {
      if (!ANIMATION?.render) return;
      ANIMATION.render();
      ANIMATION.requestId = requestAnimationFrame(tick);
    };
    ANIMATION.requestId = requestAnimationFrame(tick);
  } catch (error) {
    console.error(error);
    fallback?.();
  }
};

export default Animation;
