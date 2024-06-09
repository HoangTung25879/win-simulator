"use client";

import React, { useState } from "react";
import StartButtonIcon from "./StartButtonIcon";

const StartButton = () => {
  const [isHover, setIsHover] = useState(false);
  return (
    <button
      onMouseOver={(e) => setIsHover(true)}
      onMouseOut={(e) => setIsHover(false)}
      className="p-3 w-10 cursor-default"
    >
      <StartButtonIcon isHover={isHover} />
    </button>
  );
};

export default StartButton;
