import { WallpaperConfig, WallpaperFunc } from "../types";
import { renderer } from "./renderer";

if (typeof window == "object" && !window.SYNTHWAVE) window.SYNTHWAVE = {};
const Synthwave: WallpaperFunc = (
  elementCanvas?: HTMLCanvasElement,
  config?: WallpaperConfig,
  fallback?: () => void,
): void => {
  if (!elementCanvas) return;
  try {
    const { SYNTHWAVE } = window;
    const ctx = elementCanvas.getContext("2d", {
      alpha: false,
    }) as CanvasRenderingContext2D;
    SYNTHWAVE.render = renderer(ctx, elementCanvas.width, elementCanvas.height);
    const start = performance.now();
    const tick = () => {
      if (!SYNTHWAVE?.render) return;
      const t = performance.now() - start;
      SYNTHWAVE.render(t);
      SYNTHWAVE.requestId = requestAnimationFrame(tick);
    };
    SYNTHWAVE.requestId = requestAnimationFrame(tick);
  } catch (error) {
    console.error(error);
    fallback?.();
  }
};

export default Synthwave;
