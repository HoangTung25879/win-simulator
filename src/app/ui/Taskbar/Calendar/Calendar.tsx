"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar as ICalendar, createCalendar, isSameDate } from "./functions";
import clsx from "clsx";
import { Down, Up } from "./Icons";
import dayjs from "dayjs";

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarProps = {};

const Calendar = ({}: CalendarProps) => {
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [calendar, setCalendar] = useState<ICalendar>(createCalendar(date));
  const today = useMemo(() => new Date(), []);
  const isCurrentDate = useMemo(
    () =>
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear(),
    [date, today],
  );
  const calendarRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const changeMonth = useCallback(
    (direction: number): void => {
      const newDate = new Date(date);
      const newMonth = newDate.getMonth() + direction;

      newDate.setDate(1);
      newDate.setMonth(newMonth);

      const isCurrentMonth =
        (newMonth === 12 ? 0 : newMonth === -1 ? 11 : newMonth) ===
        today.getMonth();

      if (isCurrentMonth) newDate.setDate(today.getDate());

      setDate(newDate);
      setCalendar(createCalendar(newDate));
    },
    [date],
  );

  const handleClickDate = (clickedDate: Date | undefined) => {
    if (isSameDate(selectedDate, clickedDate)) return;
    setSelectedDate(clickedDate);
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
    <div
      className={clsx(
        `absolute bottom-taskbar-height right-0 z-[99999] border border-b-0 border-r-0
        border-solid border-windows-border bg-[#363636] text-white backdrop-blur-[12px]`,
      )}
    >
      <div className="p-4"></div>
      <div className="calendar border-t border-windows-border">
        <div className="calendar-header relative z-[100] bg-[#363636]">
          <header>{dayjs(date).format("MMMM YYYY")}</header>
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
        <div className="calendar-weekday relative z-[100] bg-[#363636]">
          {DAY_NAMES.map((dayName) => (
            <div key={dayName}>{dayName}</div>
          ))}
        </div>
        <div className="grid-calendar">
          <div className="z-[100] bg-[#363636] [grid-area:left]" />
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
          <div className="z-[100] bg-[#363636] [grid-area:right]" />
          <div className="z-[100] bg-[#363636] [grid-area:bottom]" />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
