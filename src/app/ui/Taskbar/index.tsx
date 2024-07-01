import React from "react";
import StartButton from "./StartButton/StartButton";
import Clock from "./Clock/Clock";
import Calendar from "./Calendar/Calendar";

const Taskbar = () => {
  const a = 0;
  return (
    <footer className="fixed bottom-0 left-0 flex h-10 w-screen items-center bg-taskbar">
      <StartButton />
      <Clock />
      <Calendar />
    </footer>
  );
};

export default Taskbar;
