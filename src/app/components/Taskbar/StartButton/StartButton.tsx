"use client";

import React, { useState } from "react";
import StartButtonIcon from "./StartButtonIcon";
import clsx from "clsx";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";

type StartButtonProps = {
  toggleStartMenu: (showMenu?: boolean) => void;
  startMenuVisible: boolean;
};

const StartButton = ({
  toggleStartMenu,
  startMenuVisible,
}: StartButtonProps) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      role="button"
      id="startButton"
      title="Start"
      className={clsx(
        "h-full w-10 cursor-default p-3 hover:bg-taskbar-hover",
        startMenuVisible && "bg-taskbar-hover",
      )}
      onMouseOver={(e) => setIsHover(true)}
      onMouseOut={(e) => setIsHover(false)}
      onClick={() => {
        toggleStartMenu();
      }}
      {...FOCUSABLE_ELEMENT}
    >
      <StartButtonIcon isHover={isHover} />
    </div>
  );
};

export default StartButton;
