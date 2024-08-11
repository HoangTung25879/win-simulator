import { VantaConfig } from "../ui/Wallpaper/vanta/types";

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  config?: Partial<VantaConfig>;
  devicePixelRatio: number;
};

export type SVGComponentProps = {
  width?: number;
  height?: number;
};
