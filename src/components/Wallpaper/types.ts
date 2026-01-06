import { AmbientConfig } from "./ambient/types";
import { AnimationConfig } from "./animation/types";
import { VantaConfig } from "./vanta/types";

export type WallpaperConfig = VantaConfig | AmbientConfig | AnimationConfig;

export type WallpaperFunc = (
  elementCanvas: HTMLCanvasElement,
  config?: WallpaperConfig,
  fallback?: () => void,
) => Promise<void> | void;

export type AnimationRenderer = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
) => () => void;
