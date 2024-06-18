"use client";

import { useCallback, useRef, useState } from "react";
import useWorker from "@/app/hooks/useWorker";
import { CLOCK_CANVAS_BASE_WIDTH, TASKBAR_HEIGHT } from "@/app/lib/constants";
import { createOffscreenCanvas } from "@/app/lib/utils";
import clsx from "clsx";

type ClockProps = {};

const Clock = ({}: ClockProps) => {
  const [clockRendered, setClockRendered] = useState(false);
  const offScreenClockCanvas = useRef<OffscreenCanvas>();
  const clockContainer = useRef<HTMLDivElement>(null);
  const supportOffScreenCanvas =
    typeof window !== "undefined" && typeof OffscreenCanvas !== "undefined";
  const clockWorkerInit = useCallback(() => {
    return new Worker(new URL("Clock.worker", import.meta.url), {
      name: "Clock",
    });
  }, []);
  const clockHandler = useCallback(
    ({ data }) => {
      console.log("MAIN", data, clockContainer.current);
      if (data === "create clock") {
        if (
          supportOffScreenCanvas &&
          !!currentWorker.current &&
          !offScreenClockCanvas.current &&
          clockContainer.current instanceof HTMLDivElement
        ) {
          offScreenClockCanvas.current = createOffscreenCanvas(
            clockContainer.current,
            window.devicePixelRatio,
            {
              width: CLOCK_CANVAS_BASE_WIDTH,
              height: TASKBAR_HEIGHT,
            },
          );
          currentWorker.current?.postMessage(
            {
              canvas: offScreenClockCanvas.current,
              devicePixelRatio: window.devicePixelRatio,
            },
            [offScreenClockCanvas.current],
          );
        }
      }
      if (data === "start clock") {
        setClockRendered(true);
      }
    },
    [supportOffScreenCanvas],
  );
  const currentWorker = useWorker(clockWorkerInit, clockHandler);

  return (
    <div
      ref={clockContainer}
      className={clsx(
        "text-sm text-white h-full text-center flex items-center justify-center ml-auto p-2",
        `w-[${CLOCK_CANVAS_BASE_WIDTH}px]`,
      )}
      suppressHydrationWarning
      role="timer"
    >
      {!clockRendered && <div className="absolute">Clock not available</div>}
    </div>
  );
};

export default Clock;
