import { AnimationRenderer } from "../types";

const GalaxySpiral: AnimationRenderer = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const speed = 0.0001;
  const stars = initializeStars(2000);
  let rotation = 0;

  function initializeStars(starCount: number) {
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      const distance = Math.random() * width;
      const angle = Math.random() * Math.PI * 2;
      stars.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        radius: Math.random() * 1.5 + 0.5,
        color: `hsl(${Math.random() * 60 + 200}, 80%, 70%)`,
        angle: angle,
        distance: distance,
      });
    }
    return stars;
  }

  function drawStars(stars: any[], rotation: number) {
    stars.forEach((star) => {
      const x = Math.cos(star.angle) * star.distance;
      const y = Math.sin(star.angle) * star.distance;

      ctx.beginPath();
      ctx.arc(x, y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();

      // Adjust the angle increment here to control the speed of star rotation
      star.angle += speed / (star.distance * 0.00008);
    });
  }

  return function render() {
    ctx.fillStyle = "rgba(10, 10, 30, 0.1)";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rotation);

    drawStars(stars, rotation);

    ctx.restore();
    // Adjust the rotation increment here to control the speed of galaxy rotation
    rotation += speed;
  };
};

export default GalaxySpiral;
