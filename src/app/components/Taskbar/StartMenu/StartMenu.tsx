"use client";

import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "@/lib/constants";
import clsx from "clsx";
import Sidebar from "./Sidebar/Sidebar";
import "./StartMenu.scss";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useTaskbarMenuTransition from "@/hooks/useTaskbarMenuTransition";

type StartMenuProps = {
  toggleStartMenu: (showMenu?: boolean) => void;
};

const StartMenu = ({ toggleStartMenu }: StartMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTransition = useTaskbarMenuTransition();

  useEffect(() => {
    const handleBlurMenu = ({ relatedTarget }: FocusEvent) => {
      if (relatedTarget instanceof HTMLElement) {
        if (menuRef.current?.contains(relatedTarget)) {
          menuRef.current?.focus(PREVENT_SCROLL);
          return;
        }
        const startButton = document.getElementById("startButton");
        if (
          startButton instanceof HTMLDivElement &&
          startButton === relatedTarget
        ) {
          return;
        }
      }
      toggleStartMenu(false);
    };
    menuRef.current?.addEventListener("blur", handleBlurMenu);
    menuRef.current?.focus(PREVENT_SCROLL);
    return () => {
      menuRef.current?.removeEventListener("blur", handleBlurMenu);
    };
  }, [toggleStartMenu]);

  return (
    <motion.div
      ref={menuRef}
      className="start-menu bottom-taskbar-height border-windows-border"
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
