import { WallpaperConfig } from "@/app/components/Wallpaper/types";

export type OffscreenRenderProps = {
  canvas: OffscreenCanvas;
  config?: WallpaperConfig;
  devicePixelRatio: number;
};

export type SVGComponentProps = {
  width?: number;
  height?: number;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
