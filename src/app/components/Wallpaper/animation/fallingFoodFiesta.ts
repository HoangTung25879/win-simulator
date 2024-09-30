import { AnimationRenderer } from "../types";

const FallingFoodFiesta: AnimationRenderer = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const foodItems: any[] = [];
  const foodTypes = [
    "🍔",
    "🍕",
    "🌭",
    "🍟",
    "🌮",
    "🍣",
    "🍩",
    "🍦",
    "🍎",
    "🍇",
    "🍓",
    "🍑",
    "🍍",
    "🥑",
    "🥕",
    "🥪",
    "🥨",
    "🧀",
    "🥐",
    "🥯",
    "🍱",
    "🍜",
    "🍙",
    "🍗",
    "🥟",
    "🥘",
    "🍤",
    "🥞",
    "🧇",
    "🥓",
  ];
  const numItems = 50;

  // Lighter gradient colors
  const colors = [
    { r: 255, g: 102, b: 102 }, // Light Red
    { r: 255, g: 178, b: 102 }, // Light Orange
    { r: 255, g: 255, b: 153 }, // Light Yellow
    { r: 153, g: 255, b: 153 }, // Light Green
    { r: 153, g: 204, b: 255 }, // Light Blue
    { r: 178, g: 102, b: 255 }, // Light Indigo
    { r: 255, g: 153, b: 255 }, // Light Violet
  ];

  let colorIndex = 0;
  let nextColorIndex = 1;
  let colorT = 0;
  const colorSpeed = 0.005;

  for (let i = 0; i < numItems; i++) {
    foodItems.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      emoji: foodTypes[Math.floor(Math.random() * foodTypes.length)],
      size: Math.random() * 20 + 30,
      speed: Math.random() * 1.5 + 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() * 2 - 1) * 0.02,
    });
  }

  const lerpColor = (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    t: number,
  ) => {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * t),
      g: Math.round(color1.g + (color2.g - color1.g) * t),
      b: Math.round(color1.b + (color2.b - color1.b) * t),
    };
  };

  return function render() {
    // Update gradient colors
    colorT += colorSpeed;
    if (colorT >= 1) {
      colorT = 0;
      colorIndex = nextColorIndex;
      nextColorIndex = (nextColorIndex + 1) % colors.length;
    }
    const currentColor = lerpColor(
      colors[colorIndex],
      colors[nextColorIndex],
      colorT,
    );

    // Create moving gradient with lighter colors
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(
      0,
      `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`,
    );
    gradient.addColorStop(
      1,
      `rgb(${255 - currentColor.r}, ${255 - currentColor.g}, ${255 - currentColor.b})`,
    );

    // Apply blur effect to the gradient
    ctx.filter = "blur(5px)";

    // Draw gradient background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Reset filter for subsequent drawing
    ctx.filter = "none";

    // Draw food items
    foodItems.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      ctx.font = `${item.size}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Add a white outline for better visibility
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeText(item.emoji, 0, 0);

      // Fill with black for contrast
      ctx.fillStyle = "black";
      ctx.fillText(item.emoji, 0, 0);
      ctx.restore();

      item.y += item.speed;
      item.rotation += item.rotationSpeed;
      if (item.y > height + item.size) {
        item.y = -item.size;
        item.x = Math.random() * width;
      }
    });
  };
};

export default FallingFoodFiesta;
