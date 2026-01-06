import { SYSTEM_FONT } from "@/lib/constants";
import { OffscreenRenderProps } from "@/lib/types";
import dayjs, { Dayjs } from "dayjs";

let initialized: boolean;
const MILLISECONDS_IN_SECOND = 1000;

const fontSize = 12;
const textColor = "#ffffff";

let offscreenCanvas: OffscreenCanvas;
let offscreenContext: OffscreenCanvasRenderingContext2D;

const timePosition = {
  x: 0,
  y: 0,
};

const datePosition = {
  x: 0,
  y: 0,
};

const TEXT_HEIGHT_OFFSET = 1;

const styleClock = (): void => {
  offscreenContext.scale(
    globalThis.devicePixelRatio,
    globalThis.devicePixelRatio,
  );
  offscreenContext.fillStyle = textColor;
  offscreenContext.font = `${fontSize}px ${SYSTEM_FONT}`;
  offscreenContext.textAlign = "center";
  offscreenContext.textBaseline = "middle";

  timePosition.y =
    Math.floor(offscreenCanvas.height / globalThis.devicePixelRatio / 3.5) +
    TEXT_HEIGHT_OFFSET;
  timePosition.x = Math.floor(
    offscreenCanvas.width / globalThis.devicePixelRatio / 2,
  );
  datePosition.y = timePosition.y + fontSize + 6;
  datePosition.x = timePosition.x;
};

const drawClockText = (time: Dayjs): void => {
  offscreenContext.clearRect(
    0,
    0,
    offscreenCanvas.width,
    offscreenCanvas.height,
  );
  offscreenContext.fillText(
    time.format("h:mm A"),
    timePosition.x,
    timePosition.y,
  );
  offscreenContext.fillText(
    time.format("M/D/YYYY"),
    datePosition.x,
    datePosition.y,
  );
};

const updateTick = (): void => {
  if (offscreenCanvas) drawClockText(dayjs());
};

globalThis.onmessage = ({ data }: { data: OffscreenRenderProps | "init" }) => {
  if (!initialized) {
    if (data === "init") {
      initialized = true;
      globalThis.postMessage("create clock");
    }
    return;
  }
  if ((data as OffscreenRenderProps)?.canvas) {
    const { canvas, devicePixelRatio } = data as OffscreenRenderProps;
    globalThis.devicePixelRatio = devicePixelRatio;
    if (canvas instanceof OffscreenCanvas) {
      offscreenCanvas = canvas;
      offscreenContext = offscreenCanvas.getContext(
        "2d",
      ) as OffscreenCanvasRenderingContext2D;
    }
    styleClock();
    globalThis.setTimeout(() => {
      globalThis.postMessage("start clock");
      updateTick();
      globalThis.setInterval(updateTick, MILLISECONDS_IN_SECOND);
    }, MILLISECONDS_IN_SECOND - dayjs().millisecond());
  }
};
