import React from "react";
import StartButton from "./StartButton/StartButton";
import Clock from "./Clock/Clock";

const Taskbar = () => {
  const a = 0;
  return (
    <footer className="fixed w-screen left-0 bottom-0 bg-dark-grey h-10 flex items-center">
      <StartButton />
      <Clock />
    </footer>
  );
};

export default Taskbar;
