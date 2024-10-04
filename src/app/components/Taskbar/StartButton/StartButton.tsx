"use client";

import React, { useState } from "react";
import StartButtonIcon from "./StartButtonIcon";
import clsx from "clsx";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";
import "./StartButton.scss";
import useTaskbarContextMenu from "../useTaskbarContextMenu";
import { START_BUTTON_TITLE } from "../functions";
import { LABEL_MENU_TRIGGER } from "../Taskbar";

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
      aria-label={LABEL_MENU_TRIGGER.startMenu}
      title={START_BUTTON_TITLE}
      className={clsx("start-button", startMenuVisible && "--active")}
      onMouseOver={(e) => setIsHover(true)}
      onMouseOut={(e) => setIsHover(false)}
      onClick={() => {
        toggleStartMenu();
      }}
      {...useTaskbarContextMenu(true)}
      {...FOCUSABLE_ELEMENT}
    >
      <StartButtonIcon
        ariaLabel={LABEL_MENU_TRIGGER.startMenu}
        isHover={isHover}
      />
    </button>
  );
};

export default StartButton;
