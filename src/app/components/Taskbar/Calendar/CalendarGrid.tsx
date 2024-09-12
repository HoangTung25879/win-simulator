"use client";
import { useMemo } from "react";
import {
  CalendarMode,
  getDecadeRange,
  Calendar as ICalendar,
  isSameDate,
} from "./functions";
import clsx from "clsx";
import useCalendarGridTransition from "./useCalendarGridTransition";
import { spotlightEffect } from "@/lib/spotlightEffect";

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
  // const calendarGridTransition = useCalendarGridTransition();
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

  return (
    <>
      {mode === "week" && (
        <div className="calendar-weekday">
          {DAY_NAMES.map((dayName) => (
            <div key={dayName}>{dayName}</div>
          ))}
        </div>
      )}
      <div
        className={clsx("calendar-date", isCurrentDate ? "curr" : undefined)}
      >
        {calendar?.map((week) => (
          <div className="calendar-row" key={week.toString()}>
            {week.map(([vDay, vType, vDate]) => (
              <button
                ref={(element: HTMLButtonElement) => {
                  if (vType !== "today") spotlightEffect(element, true, 1.5);
                }}
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
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default CalendarGrid;
