import { useProcesses } from "@/contexts/process";
import { MILLISECONDS_IN_SECOND } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { toCanvas } from "html-to-image";
import sizes from "@/lib/sizes";

const FPS = 30;

const renderFrame = async (
  previewElement: HTMLElement,
  animate: React.MutableRefObject<boolean>,
  staticPeekImage = true,
  callback: (url: string) => void,
): Promise<void> => {
  if (!animate.current) return;
  const { peekMaxWidth } = sizes.taskbar.entry;
  const nextFrame = (): number =>
    window.requestAnimationFrame(() =>
      renderFrame(previewElement, animate, staticPeekImage, callback),
    );
  let dataCanvas: HTMLCanvasElement | undefined;
  try {
    const spacing =
      previewElement.tagName === "VIDEO" ? { margin: "0", padding: "0" } : {};
    console.time("toCanvas");
    dataCanvas = await toCanvas(previewElement, {
      filter: (element) => !(element instanceof HTMLSourceElement),
      skipAutoScale: true,
      style: {
        inset: "0",
        ...spacing,
      },
      skipFonts: true,
      ...(previewElement.clientWidth > peekMaxWidth && {
        canvasHeight: Math.round(
          (peekMaxWidth / previewElement.clientWidth) *
            previewElement.clientHeight,
        ),
        canvasWidth: peekMaxWidth,
      }),
      //* Fix nextjs image issue https://github.com/bubkoo/html-to-image/issues/377
      includeQueryParams: true,
    });
    console.timeEnd("toCanvas");
  } catch (error) {
    // Ignore failure to capture
    console.error(error);
  }

  if (!animate.current) return;

  if (dataCanvas && dataCanvas.width > 0 && dataCanvas.height > 0) {
    const dataUrl = dataCanvas.toDataURL();
    callback(dataUrl);
    if (!staticPeekImage) {
      window.setTimeout(nextFrame, MILLISECONDS_IN_SECOND / FPS);
    }
  }
};
const useWindowPeek = (id: string): string => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { peekElement, componentWindow, staticPeekImage } = process || {};
  const [imageSrc, setImageSrc] = useState("");
  const previewTimer = useRef<number>();
  const animate = useRef(true);

  useEffect(() => {
    const previewElement = peekElement || componentWindow;
    if (!previewTimer.current && previewElement) {
      previewTimer.current = window.setTimeout(
        () =>
          window.requestAnimationFrame(() =>
            renderFrame(previewElement, animate, staticPeekImage, setImageSrc),
          ),
        document.querySelector(".peek-window") ? 0 : MILLISECONDS_IN_SECOND / 3,
      );
      animate.current = true;
    }

    return () => {
      if (previewTimer.current) {
        clearTimeout(previewTimer.current);
        previewTimer.current = undefined;
      }
      animate.current = false;
    };
  }, [componentWindow, peekElement]);

  return imageSrc;
};

export default useWindowPeek;
