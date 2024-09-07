"use client";

import React, { useState } from "react";
import StartButtonIcon from "./StartButtonIcon";
import clsx from "clsx";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";
import { START_BUTTON_TITLE } from "../functions";
import "./StartButton.scss";

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
    <button
      id="startButton"
      aria-label={START_BUTTON_TITLE}
      title={START_BUTTON_TITLE}
      className={clsx("start-button", startMenuVisible && "--active")}
      onMouseOver={(e) => setIsHover(true)}
      onMouseOut={(e) => setIsHover(false)}
      onClick={() => {
        toggleStartMenu();
      }}
      {...FOCUSABLE_ELEMENT}
    >
      <StartButtonIcon isHover={isHover} />
    </button>
  );
};

export default StartButton;
