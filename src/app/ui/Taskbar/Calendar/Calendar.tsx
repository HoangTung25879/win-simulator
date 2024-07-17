"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  WeekCalendar as IWeekCalendar,
  createWeekCalendar,
  isSameDate,
} from "./functions";
import clsx from "clsx";
import dayjs from "dayjs";
import TimeCounter from "./TimeCounter/TimeCounter";
import WeekCalendar from "./WeekCalendar";

type CalendarProps = {};

const Calendar = ({}: CalendarProps) => {
  const [date, setDate] = useState(new Date());
  const [weekCalendar, setWeekCalendar] = useState<IWeekCalendar>(
    createWeekCalendar(date),
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const handleClickDate = (clickedDate: Date | undefined) => {
    if (isSameDate(selectedDate, clickedDate)) return;
    setSelectedDate(clickedDate);
  };

  const onClickToday = () => {
    const today = new Date();
    setDate(today);
    setWeekCalendar(createWeekCalendar(today));
    setSelectedDate(today);
  };

  const changeMonth = useCallback(
    (direction: number): void => {
      const newDate = new Date(date);
      const newMonth = newDate.getMonth() + direction;
      const today = new Date();
      newDate.setDate(1);
      newDate.setMonth(newMonth);
      const isCurrentMonth =
        (newMonth === 12 ? 0 : newMonth === -1 ? 11 : newMonth) ===
        today.getMonth();
      if (isCurrentMonth) newDate.setDate(today.getDate());
      setDate(newDate);
      setWeekCalendar(createWeekCalendar(newDate));
    },
    [date],
  );

  return (
    <div
      className={clsx(
        `absolute bottom-taskbar-height right-0 z-[99999] border border-b-0 border-r-0
        border-solid border-windows-border bg-[#393939] text-white backdrop-blur-[12px]`,
      )}
    >
      <TimeCounter onClickToday={onClickToday} />
      <WeekCalendar
        date={date}
        calendar={weekCalendar}
        changeMonth={changeMonth}
        selectedDate={selectedDate}
        handleClickDate={handleClickDate}
      />
    </div>
  );
};

export default Calendar;
