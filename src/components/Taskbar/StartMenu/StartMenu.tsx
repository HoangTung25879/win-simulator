"use client";

import {
  FOCUSABLE_ELEMENT,
  PREVENT_SCROLL,
  START_MENU_PATH,
} from "@/lib/constants";
import Sidebar from "./Sidebar/Sidebar";
import "./StartMenu.scss";
import { useCallback, useRef } from "react";
import { motion } from "motion/react";
import useTaskbarMenuTransition from "../useTaskbarMenuTransition";
import sizes from "@/lib/sizes";
import { useSearchInput } from "@/contexts/search";
import { IDS_MENU } from "../Taskbar";
import FileManager from "../../Files/FileManager/FileManager";

type StartMenuProps = { toggleStartMenu: (showMenu?: boolean) => void };

const StartMenu = ({ toggleStartMenu }: StartMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTransition = useTaskbarMenuTransition(sizes.startMenu.maxHeight);
  const { inputRef } = useSearchInput();

  const focusOnRenderCallback = useCallback(
    (element: HTMLDivElement | null) => {
      element?.focus(PREVENT_SCROLL);
      menuRef.current = element;
    },
    [],
  );

  return (
    <motion.div
      id={IDS_MENU.startMenu}
      ref={focusOnRenderCallback}
      className="start-menu border-taskbar-peekBorder"
      onKeyDown={({ key }) => {
        if (key === "Escape") toggleStartMenu(false);
        else if (key.length === 1) {
          toggleStartMenu(false);
          inputRef.current?.focus();
          inputRef.current?.parentElement?.click();
        }
      }}
      {...menuTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <div className="blur-background" />
      <Sidebar toggleStartMenu={toggleStartMenu} />
      <FileManager
        url={START_MENU_PATH}
        view="list"
        hideLoading
        hideShortcutIcons
        isStartMenu
        toggleStartMenu={toggleStartMenu}
        loadIconsImmediately
        readOnly
        skipFsWatcher
        skipSorting
      />
    </motion.div>
  );
};

export default StartMenu;
