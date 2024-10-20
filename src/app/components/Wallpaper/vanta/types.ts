import { OffscreenRenderProps, Prettify } from "@/lib/types";

type VantaCycleColor = {
  colorCycleSpeed?: number;
  hue?: number;
  lightness?: number;
  saturation?: number;
};

export type VantaConfig = Prettify<
  VantaCycleColor & {
    type: "WAVES" | "CLOUDS";
    //* WAVES
    camera: {
      far: number;
      fov: number;
      near: number;
    };
    color: string;
    forceAnimate?: boolean;
    gyroControls?: boolean;
    hh: number;
    material: {
      options: {
        fog?: boolean;
        wireframe: boolean;
      };
    };
    mouseControls?: boolean;
    mouseEase?: boolean;
    shininess: number;
    touchControls?: boolean;
    waveHeight: number;
    waveSpeed: number;
    ww: number;
    zoom?: number;
    //* CLOUDS
    speed?: number;
  }
>;

type MainThreadRenderProps = {
  el?: HTMLElement;
  canvas?: HTMLCanvasElement;
};

type RenderProps = MainThreadRenderProps | OffscreenRenderProps;

type VantaSettings = Prettify<
  RenderProps &
    VantaConfig & {
      THREE?: unknown;
    }
>;

export type VantaEffect = {
  destroy: () => void;
  renderer: {
    setSize: (width: number, height: number) => void;
  };
  resize: () => void;
};

export type VantaObject = {
  CLOUDS: (settings: VantaSettings) => VantaEffect;
  WAVES: (settings: VantaSettings) => VantaEffect;
  current: VantaEffect | undefined;
};
