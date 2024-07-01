"use client";

import { useEffect, useState } from "react";
import { Calendar as ICalendar, createCalendar } from "./functions";
import clsx from "clsx";

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarProps = {};

const Calendar = ({}: CalendarProps) => {
  const [date, setDate] = useState(new Date());
  const [calendar, setCalendar] = useState<ICalendar>(createCalendar(date));

  useEffect(() => {
    // createCalendar(new Date());
  }, []);

  return (
    <section
      className={clsx(
        `absolute bottom-taskbar-height right-0 z-[99999] border border-b-0 border-r-0
        border-solid border-windows-border bg-taskbar text-white`,
      )}
    >
      <table>
        <thead>
          <tr>
            <td colSpan={DAY_NAMES.length}>
              <div className="flex items-center justify-between">
                <header>July 14</header>
                <nav>
                  <button>up</button>
                  <button>down</button>
                </nav>
              </div>
            </td>
          </tr>
          <tr>
            {DAY_NAMES.map((dayName) => {
              <td key={dayName}>{dayName}</td>;
            })}
          </tr>
        </thead>
        <tbody>
          {calendar.map((week) => (
            <tr key={week.toString()}>
              {week.map(([day, type]) => (
                <td key={`${day}${type}`}>{day}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default Calendar;
