"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useWorker from "@/hooks/useWorker";
import {
  CLOCK_CANVAS_BASE_WIDTH,
  FOCUSABLE_ELEMENT,
  TASKBAR_HEIGHT,
} from "@/lib/constants";
import { createOffscreenCanvas } from "@/lib/utils";
import clsx from "clsx";
import dayjs, { Dayjs } from "dayjs";
import { clearInterval, setInterval } from "worker-timers";

type ClockProps = {
  toggleCalendar: () => void;
};

const formatDate = "dddd, MMMM D, YYYY";

//*: Using worker canvas
// const Clock = ({ toggleCalendar }: ClockProps) => {
//   const [date, setDate] = useState<string>(dayjs().format(formatDate));
//   const [clockRendered, setClockRendered] = useState(false);
//   const offScreenClockCanvas = useRef<OffscreenCanvas>();
//   const clockContainer = useRef<HTMLDivElement>(null);
//   const supportOffScreenCanvas =
//     typeof window !== "undefined" && typeof OffscreenCanvas !== "undefined";
//   const clockWorkerInit = useCallback(() => {
//     return new Worker(new URL("Clock.worker", import.meta.url), {
//       name: "Clock",
//     });
//   }, []);
//   const clockHandler = useCallback(
//     ({ data }) => {
//       if (data === "create clock") {
//         if (
//           supportOffScreenCanvas &&
//           !!currentWorker.current &&
//           !offScreenClockCanvas.current &&
//           clockContainer.current instanceof HTMLDivElement
//         ) {
//           offScreenClockCanvas.current = createOffscreenCanvas(
//             clockContainer.current,
//             window.devicePixelRatio,
//             {
//               width: CLOCK_CANVAS_BASE_WIDTH,
//               height: TASKBAR_HEIGHT,
//             },
//           );
//           currentWorker.current?.postMessage(
//             {
//               canvas: offScreenClockCanvas.current,
//               devicePixelRatio: window.devicePixelRatio,
//             },
//             [offScreenClockCanvas.current],
//           );
//         }
//       }
//       if (data === "start clock") {
//         setClockRendered(true);
//       }
//     },
//     [supportOffScreenCanvas],
//   );
//   const currentWorker = useWorker(clockWorkerInit, clockHandler);

//   return (
//     <div
//       ref={clockContainer}
//       onMouseOver={() => {
//         if (clockRendered) {
//           setDate(dayjs().format(formatDate));
//         }
//       }}
//       title={clockRendered ? date : undefined}
//       className={clsx(
//         `ml-auto flex h-full items-center justify-center p-2 text-center text-sm
//         text-white hover:bg-taskbar-hover`,
//         `w-[${CLOCK_CANVAS_BASE_WIDTH}px]`,
//       )}
//       suppressHydrationWarning
//       role="timer"
//     >
//       {!clockRendered && <div className="absolute">Clock not available</div>}
//     </div>
//   );
// };

//* Using worker timer
const Clock = ({ toggleCalendar }: ClockProps) => {
  const [date, setDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const timerId = setInterval(() => {
      setDate(dayjs());
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div
      id="clock"
      title={date.format(formatDate)}
      className="ml-auto flex h-full flex-col items-center justify-center p-2 text-center text-xs
        text-white hover:bg-taskbar-hover"
      suppressHydrationWarning
      role="timer"
      onClick={() => {
        toggleCalendar();
      }}
      {...FOCUSABLE_ELEMENT}
    >
      <div>{date.format("h:mm A")}</div>
      <div>{date.format("M/D/YYYY")}</div>
    </div>
  );
};
export default Clock;
