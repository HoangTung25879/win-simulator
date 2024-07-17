"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useRef } from "react";
import { Down, Up } from "./Icons";
import { WeekCalendar as IWeekCalendar, isSameDate } from "./functions";
import clsx from "clsx";

type WeekCalendarProps = {
  date: Date;
  selectedDate: Date | undefined;
  calendar: IWeekCalendar;
  changeMonth: (direction: number) => void;
  handleClickDate: (clickedDate: Date | undefined) => void;
};

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const WeekCalendar = ({
  date,
  selectedDate,
  calendar,
  changeMonth,
  handleClickDate,
}: WeekCalendarProps) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const isCurrentDate = useMemo(() => {
    const today = new Date();
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, [date]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (calendarRef.current && spotlightRef.current) {
        const rect = calendarRef.current.getBoundingClientRect();
        spotlightRef.current.style.left = e.clientX - rect.left + "px";
        spotlightRef.current.style.top = e.clientY - rect.top + "px";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="calendar border-t border-windows-border">
      <div className="calendar-header relative z-[100] bg-[#393939]">
        <div>{dayjs(date).format("MMMM YYYY")}</div>
        <nav>
          <button
            className="w-full bg-transparent"
            onClick={() => changeMonth(-1)}
          >
            <Up />
          </button>
          <button
            className="w-full bg-transparent"
            onClick={() => changeMonth(1)}
          >
            <Down />
          </button>
        </nav>
      </div>
      <div className="calendar-weekday relative z-[100] bg-[#393939]">
        {DAY_NAMES.map((dayName) => (
          <div key={dayName}>{dayName}</div>
        ))}
      </div>
      <div className="grid-calendar">
        <div className="z-[100] bg-[#393939] [grid-area:left]" />
        <div
          className={clsx(
            "calendar-date [grid-area:content]",
            isCurrentDate ? "curr" : undefined,
          )}
          ref={calendarRef}
        >
          <div ref={spotlightRef} className="spotlight"></div>
          {calendar.map((week) => (
            <div className="calendar-row" key={week.toString()}>
              {week.map(([vDay, vType, vDate]) => (
                <div
                  role="button"
                  onClick={() => handleClickDate(vDate)}
                  key={`${vDay}${vType}`}
                  className={clsx(
                    "date",
                    vType,
                    isSameDate(vDate, selectedDate) ? "--selected" : "",
                  )}
                >
                  {vDay}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="z-[100] bg-[#393939] [grid-area:right]" />
        <div className="z-[100] bg-[#393939] [grid-area:bottom]" />
      </div>
    </div>
  );
};

export default WeekCalendar;
