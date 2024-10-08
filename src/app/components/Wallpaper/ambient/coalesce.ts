"use strict";

import { AnimationRenderer } from "../types";
import { angle, fadeInOut, HALF_PI, lerp, rand } from "./utils";

const particleCount = 700;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const baseTTL = 100;
const rangeTTL = 500;
const baseSpeed = 0.1;
const rangeSpeed = 1;
const baseSize = 2;
const rangeSize = 10;
const baseHue = 10;
const rangeHue = 100;
const backgroundColor = "hsla(60,50%,3%,1)";

const Coalesce: AnimationRenderer = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
): (() => void) => {
  let tick = 0;
  let life = 0;
  const particleProps = new Float32Array(particlePropsLength);
  const center: number[] = [0.5 * width, 0.5 * height];

  function initParticle(i: number) {
    const x = rand(width);
    const y = rand(height);
    const theta = angle(x, y, center[0], center[1]);
    const vx = Math.cos(theta) * 6;
    const vy = Math.sin(theta) * 6;
    life = 0;
    const ttl = baseTTL + rand(rangeTTL);
    const speed = baseSpeed + rand(rangeSpeed);
    const size = baseSize + rand(rangeSize);
    const hue = baseHue + rand(rangeHue);
    particleProps.set([x, y, vx, vy, life, ttl, speed, size, hue], i);
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
      theta = angle(x, y, center[0], center[1]) + 0.75 * HALF_PI,
      vx = lerp(particleProps[i3], 2 * Math.cos(theta), 0.05),
      vy = lerp(particleProps[i4], 2 * Math.sin(theta), 0.05),
      ttl = particleProps[i6],
      speed = particleProps[i7],
      x2 = x + vx * speed,
      y2 = y + vy * speed,
      size = particleProps[i8],
      hue = particleProps[i9];

    life = particleProps[i5];
    //drawParticle
    const xRel = x - 0.5 * size,
      yRel = y - 0.5 * size;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = 1;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
    ctx.beginPath();
    ctx.translate(xRel, yRel);
    ctx.rotate(theta);
    ctx.translate(-xRel, -yRel);
    ctx.strokeRect(xRel, yRel, size, size);
    ctx.closePath();
    ctx.restore();

    life++;

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;

    life > ttl && initParticle(i);
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

export default Coalesce;
