"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { clearInterval, setInterval } from "worker-timers";

type TimeCounterProps = {
  onClickToday: () => void;
};
type Meridiem = "AM" | "PM";

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
  meridiem: Meridiem;
}

const TimeCounter = ({ onClickToday }: TimeCounterProps) => {
  const [timeObj, setTimeObj] = useState<Time>({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds(),
    meridiem: "AM",
  });
  useEffect(() => {
    const timerId = setInterval(() => {
      const date = new Date();
      let hours = date.getHours();
      let meridiem: Meridiem = "AM";
      if (hours > 12) {
        hours = hours - 12;
        meridiem = "PM";
      }
      if (hours === 0) {
        hours = 12;
      }
      setTimeObj({
        hours,
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        meridiem,
      });
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);
  return (
    <div className="relative z-[100] bg-[#393939] p-5">
      <div className="flex gap-2">
        <div className="text-5xl font-thin leading-10">
          {timeObj.hours}:
          {timeObj.minutes < 10 ? "0" + timeObj.minutes : timeObj.minutes}:
          {timeObj.seconds < 10 ? "0" + timeObj.seconds : timeObj.seconds}
        </div>
        <div className="self-end text-xl leading-4 text-[#989898]">
          {timeObj.meridiem}
        </div>
      </div>
      <div
        role="button"
        className="mt-3 w-fit text-sm text-[#a1ccef] hover:text-[#7d7d7d]"
        onClick={onClickToday}
      >
        {dayjs().format("dddd, MMMM D, YYYY")}
      </div>
    </div>
  );
};

export default TimeCounter;
