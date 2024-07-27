"use client";
import { useEffect, useMemo, useRef } from "react";
import {
  CalendarMode,
  getDecadeRange,
  Calendar as ICalendar,
  isSameDate,
} from "./functions";
import clsx from "clsx";
import useCalendarGridTransition from "@/app/hooks/useCalendarGridTransition";

type CalendarGridProps = {
  date: Date;
  selectedDate: Date;
  calendar: ICalendar;
  mode: CalendarMode;
  handleClickDate: (clickedDate: Date) => void;
};

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CalendarGrid = ({
  date,
  selectedDate,
  calendar,
  mode,
  handleClickDate,
}: CalendarGridProps) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const calendarGridTransition = useCalendarGridTransition();

  const isCurrentDate = useMemo(() => {
    const today = new Date();
    if (mode === "month") {
      return date.getFullYear() === today.getFullYear();
    }
    if (mode === "year") {
      const range = getDecadeRange(date.getFullYear());
      const currentYear = today.getFullYear();
      return currentYear >= range[0] && currentYear <= range[1];
    }
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, [date, mode]);

  const formatCell = (value: number) => {
    if (mode === "week" || mode === "year") return value;
    return MONTH_NAMES[value];
  };

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
    <>
      {mode === "week" && (
        <div className="calendar-weekday relative z-[100] bg-[#393939]">
          {DAY_NAMES.map((dayName) => (
            <div key={dayName}>{dayName}</div>
          ))}
        </div>
      )}
      <div className="grid-calendar">
        <div className="z-[100] bg-[#393939] [grid-area:left]" />
        <div
          className={clsx(
            "calendar-date [grid-area:content]",
            isCurrentDate ? "curr" : undefined,
          )}
          ref={calendarRef}
        >
          <div ref={spotlightRef} id="spotlight"></div>
          {calendar?.map((week) => (
            <div className="calendar-row" key={week.toString()}>
              {week.map(([vDay, vType, vDate]) => (
                <div
                  role="button"
                  onClick={() => handleClickDate(vDate)}
                  key={`${vDay}${vType}`}
                  className={clsx(
                    "date",
                    vType,
                    mode !== "week" && "--large",
                    mode === "week" && isSameDate(vDate, selectedDate)
                      ? "--selected"
                      : "",
                  )}
                >
                  {formatCell(vDay)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="z-[100] bg-[#393939] [grid-area:right]" />
        <div className="z-[100] bg-[#393939] [grid-area:bottom]" />
      </div>
    </>
  );
};

export default CalendarGrid;
