"use client";

import { useCallback, useRef, useState } from "react";
import useWorker from "@/app/hooks/useWorker";
import { CLOCK_CANVAS_BASE_WIDTH, TASKBAR_HEIGHT } from "@/app/lib/constants";
import { createOffscreenCanvas } from "@/app/lib/utils";
import clsx from "clsx";
import dayjs from "dayjs";

type ClockProps = {};

const formatDate = "dddd, MMMM D, YYYY";

const Clock = ({}: ClockProps) => {
  const [date, setDate] = useState<string>(dayjs().format(formatDate));
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
      // console.log("MAIN", data, clockContainer.current);
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
      onMouseOver={() => {
        if (clockRendered) {
          setDate(dayjs().format(formatDate));
        }
      }}
      title={clockRendered ? date : undefined}
      className={clsx(
        `ml-auto flex h-full items-center justify-center p-2 text-center text-sm
        text-white hover:bg-taskbar-hover`,
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
