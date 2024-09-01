"use client";

import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "@/lib/constants";
import Sidebar from "./Sidebar/Sidebar";
import "./StartMenu.scss";
import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useTaskbarMenuTransition from "../useTaskbarMenuTransition";
import { maybeCloseTaskbarMenu, START_BUTTON_TITLE } from "../functions";

type StartMenuProps = {
  toggleStartMenu: (showMenu?: boolean) => void;
};

const StartMenu = ({ toggleStartMenu }: StartMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTransition = useTaskbarMenuTransition();

  const focusOnRenderCallback = useCallback(
    (element: HTMLDivElement | null) => {
      element?.focus(PREVENT_SCROLL);
      menuRef.current = element;
    },
    [],
  );

  return (
    <motion.div
      ref={focusOnRenderCallback}
      id="startMenu"
      className="start-menu bottom-taskbar-height border-windows-border"
      onKeyDown={({ key }) => {
        if (key === "Escape") toggleStartMenu(false);
      }}
      // Click button will trigger process -> component rerender -> trigger onBlur event
      onBlurCapture={(event) =>
        maybeCloseTaskbarMenu(
          event,
          menuRef.current,
          toggleStartMenu,
          undefined,
          START_BUTTON_TITLE,
        )
      }
      {...menuTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <div className="blur-background" />
      <Sidebar />
      <div className="w-[200px] pl-12">File</div>
    </motion.div>
  );
};

export default StartMenu;
