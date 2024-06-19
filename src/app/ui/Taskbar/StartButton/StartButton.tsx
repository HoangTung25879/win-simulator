"use client";

import React, { useState } from "react";
import StartButtonIcon from "./StartButtonIcon";

const StartButton = () => {
  const [isHover, setIsHover] = useState(false);
  return (
    <button
      title="Start"
      onMouseOver={(e) => setIsHover(true)}
      onMouseOut={(e) => setIsHover(false)}
      className="p-3 w-10 h-full cursor-default hover:bg-taskbar-hover"
    >
      <StartButtonIcon isHover={isHover} />
    </button>
  );
};

export default StartButton;
