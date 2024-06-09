import React from "react";
import StartButton from "./StartButton/StartButton";

const Taskbar = () => {
  const a = 0;
  return (
    <footer className="fixed w-screen left-0 bottom-0 bg-dark-grey h-10 text-white">
      <StartButton />
    </footer>
  );
};

export default Taskbar;
