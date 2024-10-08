import { createNoise3D } from "simplex-noise";
import { fadeInOut, lerp, rand, randRange, TAU } from "./utils";
import { AnimationRenderer } from "../types";

const particleCount = 700;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 100;
const baseTTL = 50;
const rangeTTL = 150;
const baseSpeed = 0.1;
const rangeSpeed = 2;
const baseRadius = 2;
const rangeRadius = 4;
const baseHue = 220;
const rangeHue = 100;
const noiseSteps = 8;
const xOff = 0.00125;
const yOff = 0.00125;
const zOff = 0.0005;
const backgroundColor = "hsla(260,40%,5%,1)";

const Swirl: AnimationRenderer = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
): (() => void) => {
  let tick = 0;
  let life = 0;
  const noise3D = createNoise3D();
  const particleProps = new Float32Array(particlePropsLength);
  const center: number[] = [0.5 * width, 0.5 * height];

  function checkBounds(x: number, y: number) {
    return x > width || x < 0 || y > height || y < 0;
  }
  function initParticle(i: number) {
    const x = width * Math.random();
    const y = center[1] + randRange(rangeY);
    const vx = 0;
    const vy = 0;
    life = 0;
    const ttl = baseTTL + rand(rangeTTL);
    const speed = baseSpeed + rand(rangeSpeed);
    const radius = baseRadius + rand(rangeRadius);
    const hue = baseHue + rand(rangeHue);
    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  }

  function updateParticle(i: number) {
    const i2 = 1 + i,
      i3 = 2 + i,
      i4 = 3 + i,
      i5 = 4 + i,
      i6 = 5 + i,
      i7 = 6 + i,
      i8 = 7 + i,
      i9 = 8 + i;
    const x = particleProps[i],
      y = particleProps[i2],
      n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU,
      vx = lerp(particleProps[i3], Math.cos(n), 0.5),
      vy = lerp(particleProps[i4], Math.sin(n), 0.5),
      ttl = particleProps[i6],
      speed = particleProps[i7],
      x2 = x + vx * speed,
      y2 = y + vy * speed,
      radius = particleProps[i8],
      hue = particleProps[i9];

    life = particleProps[i5];
    //drawParticle
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = radius;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    life++;

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;

    (checkBounds(x, y) || life > ttl) && initParticle(i);
  }

  for (let i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }
  return function render() {
    tick++;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i);
    }
    ctx.save();
    ctx.filter = "blur(8px) brightness(200%)";
    ctx.globalCompositeOperation = "lighter";
    ctx.restore();

    ctx.save();
    ctx.filter = "blur(4px) brightness(200%)";
    ctx.globalCompositeOperation = "lighter";
    ctx.restore();
  };
};

export default Swirl;
