import { AnimationRenderer, WallpaperConfig, WallpaperFunc } from "../types";
import Coalesce from "./coalesce";
import Shift from "./shift";
import Swirl from "./swirl";
import { AmbientConfig, AmbientType } from "./types";

if (typeof window == "object" && !window.ANIMATION) window.ANIMATION = {};
const Ambient: WallpaperFunc = (
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
    elementCanvas.width = window.innerWidth;
    elementCanvas.height = window.innerHeight;
    const map: Record<AmbientType, AnimationRenderer> = {
      shift: Shift,
      swirl: Swirl,
      coalesce: Coalesce,
    };
    const ambientRenderer: AnimationRenderer = map[
      (config as AmbientConfig).type
    ] as AnimationRenderer;
    ANIMATION.render = ambientRenderer(
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

export default Ambient;
