"use client";
import React from "react";
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
import { haltEvent, hasFinePointer } from "@/lib/utils";
import { spotlightEffect } from "@/lib/spotlightEffect";
import { useFileSystem } from "@/contexts/fileSystem";
import { useSession } from "@/contexts/session";
import { resetStorage } from "@/contexts/fileSystem/utils";

type SidebarProps = {};

type SidebarButton = {
  name: string;
  icon: React.JSX.Element;
  tooltip?: string;
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
    tooltip: "Clears session data and reloads the page.",
  },
];

const Sidebar = ({}: SidebarProps) => {
  const { rootFs } = useFileSystem();
  const { setHaltSession } = useSession();
  const [expanded, setExpanded] = useState(false);
  const expandTimer = useRef<number>();
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
    if (button.name === "Power") {
      setHaltSession(true);
      resetStorage(rootFs).finally(() => window.location.reload());
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx("side-bar", expanded ? "expanded" : "")}
      onContextMenu={haltEvent}
    >
      {buttons.map((button) => {
        return (
          <div
            ref={(element: HTMLDivElement) => {
              if (hasFinePointer()) spotlightEffect(element, true, 1.5);
            }}
            aria-label={button.name}
            key={button.name}
            className={clsx(
              "side-bar-item hover:bg-hover-item-menu",
              button.name === "Start" ? "mb-auto" : "",
            )}
            onClick={() => handleClickButton(button)}
            title={button.tooltip}
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
