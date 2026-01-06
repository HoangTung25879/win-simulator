import { OffscreenRenderProps } from "@/lib/types";
import { renderer } from "./renderer";

declare global {
  var SYNTHWAVE: {
    requestId?: number;
    render?: (t: number) => void;
  };
}

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;
    if (data === "init") {
      if (!globalThis.SYNTHWAVE) {
        globalThis.SYNTHWAVE = {};
      }
    } else if (data instanceof DOMRect) {
    } else {
      const {
        canvas,
        config: offscreenConfig,
        devicePixelRatio,
      } = data as OffscreenRenderProps;
      const { SYNTHWAVE } = globalThis;
      // reset
      if (SYNTHWAVE?.requestId) {
        globalThis.cancelAnimationFrame(SYNTHWAVE.requestId);
        SYNTHWAVE.requestId = undefined;
        SYNTHWAVE.render = undefined;
      }

      if (!canvas) return;
      try {
        const ctx = canvas.getContext("2d", {
          alpha: false,
        }) as OffscreenCanvasRenderingContext2D;
        SYNTHWAVE.render = renderer(ctx, canvas.width, canvas.height);
        const start = performance.now();
        const tick = () => {
          if (!SYNTHWAVE?.render) return;
          const t = performance.now() - start;
          SYNTHWAVE.render(t);
          SYNTHWAVE.requestId = globalThis.requestAnimationFrame(tick);
        };
        SYNTHWAVE.requestId = globalThis.requestAnimationFrame(tick);
      } catch (error) {
        console.log("ERROR", error);
        globalThis.postMessage({
          message: (error as Error)?.message,
          type: "[error]",
        });
      }
    }
  },
  { passive: true },
);
