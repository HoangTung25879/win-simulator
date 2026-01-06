import { OffscreenRenderProps } from "@/lib/types";
import { baseConfig, disableControls, libs } from "./config";
import { VantaConfig, VantaEffect, VantaObject } from "./types";

declare global {
  var VANTA: VantaObject;
}

let effect: VantaEffect;

globalThis.addEventListener(
  "message",
  ({ data }: { data: DOMRect | OffscreenRenderProps | string }) => {
    if (typeof WebGLRenderingContext === "undefined") return;
    if (data === "init") {
      globalThis.importScripts(...libs);
    } else if (data instanceof DOMRect) {
      // const { width, height } = data;
      // effect?.renderer.setSize(width, height);
      // effect?.resize();
    } else {
      const {
        canvas,
        config: offscreenConfig,
        devicePixelRatio,
      } = data as OffscreenRenderProps;
      const { VANTA } = globalThis;
      const EFFECT = VANTA?.[(offscreenConfig as VantaConfig).type];
      //reset
      if (VANTA?.current) {
        VANTA.current.destroy();
        VANTA.current = undefined;
      }

      if (!canvas || !EFFECT) return;
      try {
        effect = EFFECT({
          ...((offscreenConfig || baseConfig) as VantaConfig),
          ...disableControls,
          canvas,
          devicePixelRatio,
        });
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
