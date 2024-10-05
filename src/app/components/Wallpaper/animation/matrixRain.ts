import { AnimationRenderer } from "../types";

export const MatrixRain: AnimationRenderer = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const fpsInterval = 1000 / 30;
  let then = performance.now();
  const fontSize = 20;
  const columns = Math.floor(width / fontSize);
  const drops: number[] = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = 0;
  }
  const katakana =
    "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
  const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const characters = katakana + latin + nums;

  return function render() {
    const now = performance.now();
    const elapsed = now - then;
    if (elapsed > fpsInterval) {
      then = now - (elapsed % fpsInterval);
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        drops[i]++;
        if (drops[i] * fontSize > height && Math.random() > 0.95) {
          drops[i] = 0;
        }
      }
    }
  };
};

export default MatrixRain;
