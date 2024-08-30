import { BASE_2D_CONTEXT_OPTIONS, NON_BREAKING_HYPHEN } from "@/lib/constants";

type WrapData = {
  lines: string[];
  width: number;
};

const canvasContexts = Object.create(null) as Record<
  string,
  CanvasRenderingContext2D
>;

export const measureText = (
  text: string,
  fontSize: string,
  fontFamily: string,
): number => {
  const font = `${fontSize} ${fontFamily}`;

  if (!canvasContexts[font]) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext(
      "2d",
      BASE_2D_CONTEXT_OPTIONS,
    ) as CanvasRenderingContext2D;

    context.font = font;
    canvasContexts[font] = context;
  }
  const { actualBoundingBoxLeft, actualBoundingBoxRight } =
    canvasContexts[font].measureText(text);

  return Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight);
};

export const getTextWrapData = (
  text: string,
  fontSize: string,
  fontFamily: string,
  maxWidth?: number,
): WrapData => {
  const lines = [""];

  const totalWidth = measureText(text, fontSize, fontFamily);

  if (!maxWidth) return { lines: [text], width: totalWidth };

  if (totalWidth > maxWidth) {
    const words = text.split(" ");

    [...text].forEach((character) => {
      const lineIndex = lines.length - 1;
      const lineText = `${lines[lineIndex]}${character}`;
      const lineWidth = measureText(lineText, fontSize, fontFamily);

      if (lineWidth > maxWidth) {
        const spacesInLine = lineText.split(" ").length - 1;
        const lineWithWords = words.splice(0, spacesInLine).join(" ");

        if (
          lines.length === 1 &&
          spacesInLine > 0 &&
          lines[0] !== lineWithWords
        ) {
          lines[0] = lineText.slice(0, lineWithWords.length);
          lines.push(lineText.slice(lineWithWords.length));
        } else {
          lines.push(character);
        }
      } else {
        lines[lineIndex] = lineText;
      }
    });
  }

  return {
    lines,
    width: Math.min(maxWidth, totalWidth),
  };
};

export const truncateName = (
  name: string,
  fontSize: string,
  fontFamily: string,
  maxWidth: number,
  alwaysShowPossibleLines = false,
): string => {
  const nonBreakingName = name.replace(/-/g, NON_BREAKING_HYPHEN);
  const { lines } = getTextWrapData(
    nonBreakingName,
    fontSize,
    fontFamily,
    maxWidth,
  );

  if (lines.length > 2) {
    const text =
      alwaysShowPossibleLines || name.includes(" ")
        ? lines.slice(0, 2).join("")
        : lines[0];

    return `${text.slice(0, -3).trim()}...`;
  }

  return nonBreakingName;
};
