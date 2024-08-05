"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarMode,
  Calendar as ICalendar,
  createCalendar,
  getDecadeRange,
} from "./functions";
import clsx from "clsx";
import dayjs from "dayjs";
import TimeCounter from "./TimeCounter/TimeCounter";
import CalendarGrid from "./CalendarGrid";
import { Down, Up } from "./Icons";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "@/app/lib/constants";
import { motion } from "framer-motion";
import useTaskbarMenuTransition from "@/app/hooks/useTaskbarMenuTransition";
import "./Calendar.scss";

type CalendarProps = {
  toggleCalendar: (showCalendar?: boolean) => void;
};

const Calendar = ({ toggleCalendar }: CalendarProps) => {
  const [mode, setMode] = useState<CalendarMode>("week");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const calendar = useMemo<ICalendar>(
    () => createCalendar(date, mode),
    [date, mode],
  );

  const menuTransition = useTaskbarMenuTransition();

  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const handleClickDate = (clickedDate: Date) => {
    if (mode === "week") {
      setSelectedDate(clickedDate);
    }
    if (mode === "month") {
      setMode("week");
      setDate(clickedDate);
    }
    if (mode === "year") {
      setMode("month");
      setDate(clickedDate);
    }
  };

  const onClickToday = () => {
    const today = new Date();
    setDate(today);
    setMode("week");
    setSelectedDate(today);
  };

  const changeDirection = useCallback(
    (direction: number): void => {
      if (mode === "week") {
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
      }
      if (mode === "month") {
        const newDate = new Date(date);
        const newYear = newDate.getFullYear() + direction;
        newDate.setFullYear(newYear);
        setDate(newDate);
      }
      if (mode === "year") {
        const newDate = new Date(date);
        const newYear = newDate.getFullYear() + direction * 10;
        newDate.setFullYear(newYear);
        setDate(newDate);
      }
    },
    [date, mode],
  );

  const formatDate = (date: Date) => {
    const dateFormatMapping = {
      week: "MMMM YYYY",
      month: "YYYY",
      year: getDecadeRange(date.getFullYear()).join("-"),
    };
    return dayjs(date).format(dateFormatMapping[mode]);
  };

  const changeMode = () => {
    const modeState: Record<CalendarMode, CalendarMode> = {
      week: "month",
      month: "year",
      year: "year",
    };
    setMode(modeState[mode]);
  };

  useEffect(() => {
    const handleBlurCalendar = ({ relatedTarget }: FocusEvent) => {
      if (relatedTarget instanceof HTMLElement) {
        if (calendarContainerRef.current?.contains(relatedTarget)) {
          calendarContainerRef.current?.focus(PREVENT_SCROLL);
          return;
        }
        const clockElement = document.getElementById("clock");
        if (
          clockElement instanceof HTMLDivElement &&
          clockElement === relatedTarget
        ) {
          return;
        }
      }
      toggleCalendar(false);
    };
    calendarContainerRef.current?.addEventListener("blur", handleBlurCalendar);
    calendarContainerRef.current?.focus(PREVENT_SCROLL);
    return () => {
      calendarContainerRef.current?.removeEventListener(
        "blur",
        handleBlurCalendar,
      );
    };
  }, [toggleCalendar]);

  return (
    <motion.div
      ref={calendarContainerRef}
      className={clsx(
        `fixed bottom-taskbar-height right-0 z-[999] border-b-0 border-r-0 border-solid
        border-windows-border bg-[#393939] text-white`,
      )}
      {...menuTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <TimeCounter onClickToday={onClickToday} />
      <div className="calendar">
        <div className="calendar-header relative z-[100] bg-[#393939]">
          <div onClick={changeMode}>{formatDate(date)}</div>
          <nav>
            <button
              className="w-full bg-transparent"
              onClick={() => changeDirection(-1)}
            >
              <Up />
            </button>
            <button
              className="w-full bg-transparent"
              onClick={() => changeDirection(1)}
            >
              <Down />
            </button>
          </nav>
        </div>
        <CalendarGrid
          date={date}
          calendar={calendar}
          selectedDate={selectedDate}
          mode={mode}
          handleClickDate={handleClickDate}
        />
      </div>
    </motion.div>
  );
};

export default Calendar;
