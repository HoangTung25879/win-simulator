"use strict";

import { createNoise3D } from "simplex-noise";
import { fadeInOut, rand, TAU } from "./utils";
import { AnimationRenderer } from "../types";

const circleCount = 150;
const circlePropCount = 8;
const circlePropsLength = circleCount * circlePropCount;
const baseSpeed = 0.1;
const rangeSpeed = 1;
const baseTTL = 150;
const rangeTTL = 200;
const baseRadius = 100;
const rangeRadius = 200;
const rangeHue = 60;
const xOff = 0.0015;
const yOff = 0.0015;
const zOff = 0.0015;
const backgroundColor = "hsla(0,0%,5%,1)";

const Shift: AnimationRenderer = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): (() => void) => {
  const noise3D = createNoise3D();
  const circleProps = new Float32Array(circlePropsLength);
  let baseHue = 220;
  let life = 0;

  function checkBounds(x: number, y: number, radius: number) {
    return (
      x < -radius || x > width + radius || y < -radius || y > height + radius
    );
  }

  function initCircle(i: number) {
    const x = rand(width),
      y = rand(height),
      n = noise3D(x * xOff, y * yOff, baseHue * zOff),
      t = rand(TAU),
      speed = baseSpeed + rand(rangeSpeed),
      vx = speed * Math.cos(t),
      vy = speed * Math.sin(t),
      ttl = baseTTL + rand(rangeTTL),
      radius = baseRadius + rand(rangeRadius),
      hue = baseHue + n * rangeHue;

    life = 0;

    circleProps.set([x, y, vx, vy, life, ttl, radius, hue], i);
  }

  function updateCircle(i: number) {
    const i2 = 1 + i,
      i3 = 2 + i,
      i4 = 3 + i,
      i5 = 4 + i,
      i6 = 5 + i,
      i7 = 6 + i,
      i8 = 7 + i;
    const x = circleProps[i],
      y = circleProps[i2],
      vx = circleProps[i3],
      vy = circleProps[i4],
      ttl = circleProps[i6],
      radius = circleProps[i7],
      hue = circleProps[i8];

    life = circleProps[i5];

    ctx.save();
    ctx.fillStyle = `hsla(${hue},60%,30%,${fadeInOut(life, ttl)})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    life++;

    circleProps[i] = x + vx;
    circleProps[i2] = y + vy;
    circleProps[i5] = life;

    (checkBounds(x, y, radius) || life > ttl) && initCircle(i);
  }

  for (let i = 0; i < circlePropsLength; i += circlePropCount) {
    initCircle(i);
  }
  return function render() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    baseHue++;
    for (let i = 0; i < circlePropsLength; i += circlePropCount) {
      updateCircle(i);
    }
    ctx.filter = "blur(30px)";
  };
};

export default Shift;
