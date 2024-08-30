import { VantaConfig } from "@/app/components/Wallpaper/vanta/types";

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  config?: Partial<VantaConfig>;
  devicePixelRatio: number;
};

export type SVGComponentProps = {
  width?: number;
  height?: number;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
