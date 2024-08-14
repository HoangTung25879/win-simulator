import { VantaConfig } from "./types";

export const baseConfig: VantaConfig = {
  camera: {
    far: 400,
    fov: 30,
    near: 0.1,
  },
  colorCycleSpeed: 10,
  forceAnimate: true,
  hh: 50,
  ww: 50,
  material: {
    options: {
      fog: false,
      wireframe: false,
    },
  },
  shininess: 35,
  waveHeight: 20,
  waveSpeed: 0.25,
  //
  color: "hsl(141, 40%, 20%)",
  hue: 141,
  saturation: 40,
  lightness: 20,
  //
  type: "WAVES",
};

export const vantaWavesConfig: VantaConfig = baseConfig;

export const vantaCloudsConfig: VantaConfig = {
  ...baseConfig,
  type: "CLOUDS",
  speed: 0.8,
};

export const disableControls = {
  gyroControls: false,
  mouseControls: false,
  mouseEase: false,
  touchControls: false,
};

export const libs = [
  "/lib/VantaJS/three.min.js",
  "/lib/VantaJS/vanta.clouds.min.js",
  "/lib/VantaJS/vanta.waves.min.js",
];
