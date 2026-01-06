"use client";
import React from "react";
import { useRef, useState } from "react";
import {
  Documents,
  Pictures,
  Power,
  Settings,
  SideMenu,
  Videos,
} from "./Icons";
import clsx from "clsx";
import "./Sidebar.scss";
import { haltEvent } from "@/lib/utils";
import { spotlightEffect } from "@/lib/spotlightEffect";
import { useFileSystem } from "@/contexts/fileSystem";
import { useSession } from "@/contexts/session";
import { resetStorage } from "@/contexts/fileSystem/utils";
import { useProcesses } from "@/contexts/process";
import { HOME } from "@/lib/constants";
import { AllProcess } from "@/contexts/process/directory";

type SidebarProps = { toggleStartMenu: (showMenu?: boolean) => void };

type SidebarButton = {
  name: string;
  icon: React.JSX.Element;
  tooltip?: string;
};

const buttons: SidebarButton[] = [
  { name: "Start", icon: <SideMenu width={16} height={16} /> },
  { name: "Documents", icon: <Documents width={16} height={16} /> },
  { name: "Pictures", icon: <Pictures width={16} height={16} /> },
  { name: "Videos", icon: <Videos width={16} height={16} /> },
  { name: "Settings", icon: <Settings width={16} height={16} /> },
  {
    name: "Power",
    icon: <Power width={16} height={16} />,
    tooltip: "Clears session data and reloads the page.",
  },
];

const Sidebar = ({ toggleStartMenu }: SidebarProps) => {
  const { rootFs } = useFileSystem();
  const { open } = useProcesses();
  const { setHaltSession } = useSession();
  const [expanded, setExpanded] = useState(false);
  const expandTimer = useRef<number>(null);
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
    switch (button.name) {
      case "Start": {
        setExpanded((expanded) => !expanded);
        break;
      }
      case "Documents": {
        open(AllProcess.FileExplorer, { url: `${HOME}/Documents` });
        toggleStartMenu(false);
        break;
      }
      case "Pictures": {
        open(AllProcess.FileExplorer, { url: `${HOME}/Pictures` });
        toggleStartMenu(false);
        break;
      }
      case "Videos": {
        open(AllProcess.FileExplorer, { url: `${HOME}/Videos` });
        toggleStartMenu(false);
        break;
      }
      case "Settings": {
        open(AllProcess.Settings, { settingType: "background" });
        toggleStartMenu(false);
        break;
      }
      case "Power": {
        setHaltSession(true);
        resetStorage(rootFs).finally(() => window.location.reload());
        break;
      }
      default: {
        break;
      }
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
              spotlightEffect(element, true, 1.5);
            }}
            aria-label={button.name}
            key={button.name}
            className={clsx(
              "side-bar-item",
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
