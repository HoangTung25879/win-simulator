import { OffscreenRenderProps } from "@/lib/types";
import { AmbientConfig, AmbientType } from "./types";
import { AnimationRenderer } from "../types";
import Shift from "./shift";
import Swirl from "./swirl";
import Coalesce from "./coalesce";

declare global {
  var ANIMATION: {
    requestId?: number;
    render?: () => void;
  };
}

const map: Record<AmbientType, AnimationRenderer> = {
  shift: Shift,
  swirl: Swirl,
  coalesce: Coalesce,
};

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;
    if (data === "init") {
      if (!globalThis.ANIMATION) {
        globalThis.ANIMATION = {};
      }
    } else if (data instanceof DOMRect) {
    } else {
      const {
        canvas,
        config: offscreenConfig,
        devicePixelRatio,
      } = data as OffscreenRenderProps;
      const { ANIMATION } = globalThis;
      // reset
      if (ANIMATION?.requestId) {
        globalThis.cancelAnimationFrame(ANIMATION.requestId);
        ANIMATION.requestId = undefined;
        ANIMATION.render = undefined;
      }

      if (!canvas) return;
      try {
        const ctx = canvas.getContext("2d", {
          alpha: false,
        }) as OffscreenCanvasRenderingContext2D;
        const ambientRenderer: AnimationRenderer = map[
          (offscreenConfig as AmbientConfig).type
        ] as AnimationRenderer;
        ANIMATION.render = ambientRenderer(ctx, canvas.width, canvas.height);
        const tick = () => {
          if (!ANIMATION?.render) return;
          ANIMATION.render();
          ANIMATION.requestId = globalThis.requestAnimationFrame(tick);
        };
        ANIMATION.requestId = globalThis.requestAnimationFrame(tick);
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
