"use client";

import { useCallback, useRef, useState } from "react";
import {
  AllApps,
  Documents,
  Pictures,
  Power,
  Settings,
  SideMenu,
} from "./SidebarIcons";
import clsx from "clsx";
import "./Sidebar.scss";
import { hasFinePointer } from "@/lib/utils";
import { spotlightEffect } from "@/lib/spotlightEffect";

type SidebarProps = {};

type SidebarButton = {
  name: string;
  icon: JSX.Element;
};

const buttons: SidebarButton[] = [
  {
    name: "Start",
    icon: <SideMenu width={16} height={16} />,
  },
  {
    name: "Documents",
    icon: <Documents width={16} height={16} />,
  },
  {
    name: "Pictures",
    icon: <Pictures width={16} height={16} />,
  },
  {
    name: "Settings",
    icon: <Settings width={16} height={16} />,
  },
  {
    name: "Power",
    icon: <Power width={16} height={16} />,
  },
];

const Sidebar = ({}: SidebarProps) => {
  const [expanded, setExpanded] = useState(false);
  const expandTimer = useRef<number>();
  const sidebarRef = useRef<HTMLElement>(null);
  const clearTimer = (): void => {
    if (expandTimer.current) clearTimeout(expandTimer.current);
  };
  const handleMouseEnter = () => {
    expandTimer.current = window.setTimeout(() => setExpanded(true), 700);
  };
  const handleMouseLeave = () => {
    clearTimer();
    setExpanded(false);
  };

  const handleClickButton = (button: SidebarButton) => {
    clearTimer();
    if (button.name === "Start") {
      setExpanded((expanded) => !expanded);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx("side-bar", expanded ? "expanded" : "")}
    >
      {buttons.map((button) => {
        return (
          <div
            ref={(element: HTMLDivElement) => {
              if (hasFinePointer()) spotlightEffect(element, true, 1.5);
            }}
            key={button.name}
            className={clsx(
              "side-bar-item hover:bg-hover-item-menu",
              button.name === "Start" ? "mb-auto" : "",
            )}
            onClick={() => handleClickButton(button)}
          >
            <div className="p-4">{button.icon}</div>
            <div
              className={clsx(
                button.name === "Start" ? "font-bold uppercase" : "",
              )}
            >
              {button.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
