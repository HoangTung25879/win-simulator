"use client";

import React, { useCallback, useState } from "react";
import StartButton from "./StartButton/StartButton";
import Clock from "./Clock/Clock";
import Calendar from "./Calendar/Calendar";
import { AnimatePresence } from "framer-motion";

const Taskbar = () => {
  const [calendarVisible, setCalendarVisible] = useState(false);

  const toggleCalendar = useCallback(
    (showCalendar?: boolean): void =>
      setCalendarVisible(
        (currentCalendarState) => showCalendar ?? !currentCalendarState,
      ),
    [],
  );

  return (
    <footer className="fixed bottom-0 left-0 flex h-taskbar-height w-screen items-center bg-taskbar">
      <StartButton />
      <Clock toggleCalendar={toggleCalendar} />
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {calendarVisible && <Calendar toggleCalendar={toggleCalendar} />}
      </AnimatePresence>
    </footer>
  );
};

export default Taskbar;
