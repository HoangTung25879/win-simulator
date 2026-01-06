"use client";

import React, { useCallback, useEffect, useState } from "react";
import StartButton from "./StartButton/StartButton";
import { AnimatePresence } from "motion/react";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";
import Tabs from "./Tabs/Tabs";
import SearchBar from "./Search/SearchBar";
import useTaskbarContextMenu from "./useTaskbarContextMenu";
import Calendar from "@/components/Taskbar/Calendar/Calendar";
import SearchMenu from "@/components/Taskbar/Search/SearchMenu";
import StartMenu from "@/components/Taskbar/StartMenu/StartMenu";
import Clock from "@/components/Taskbar/Clock/Clock";

export const IDS_MENU = {
  startMenu: "startMenu",
  searchMenu: "searchMenu",
  calendar: "calendar",
};

export const LABEL_MENU_TRIGGER = {
  startMenu: "startMenuTrigger",
  searchMenu: "searchMenuTrigger",
  calendar: "calendarTrigger",
};

const Taskbar = () => {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [startMenuVisible, setStartMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const toggleSearch = useCallback(
    (showSearch?: boolean): void =>
      setSearchVisible(
        (currentSearchState) => showSearch ?? !currentSearchState,
      ),
    [],
  );

  const toggleStartMenu = useCallback(
    (showMenu?: boolean): void =>
      setStartMenuVisible((currentMenuState) => showMenu ?? !currentMenuState),
    [],
  );

  const toggleCalendar = useCallback(
    (showCalendar?: boolean): void =>
      setCalendarVisible(
        (currentCalendarState) => showCalendar ?? !currentCalendarState,
      ),
    [],
  );

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!(startMenuVisible || searchVisible || calendarVisible)) {
        return;
      }
      const elementClicked = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      Object.values(IDS_MENU).forEach((id) => {
        const menuElement = document.getElementById(id);
        if (menuElement && !menuElement.contains(elementClicked)) {
          if (
            id === IDS_MENU.startMenu &&
            elementClicked?.ariaLabel !== LABEL_MENU_TRIGGER.startMenu
          ) {
            toggleStartMenu(false);
            return;
          }
          if (
            id === IDS_MENU.searchMenu &&
            elementClicked?.ariaLabel !== LABEL_MENU_TRIGGER.searchMenu
          ) {
            toggleSearch(false);
            return;
          }
          if (
            id === IDS_MENU.calendar &&
            elementClicked?.ariaLabel !== LABEL_MENU_TRIGGER.calendar
          ) {
            toggleCalendar(false);
            return;
          }
        }
      });
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [calendarVisible, searchVisible, startMenuVisible]);

  return (
    <>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {startMenuVisible && (
          <StartMenu key="startMenu" toggleStartMenu={toggleStartMenu} />
        )}
        {searchVisible && (
          <SearchMenu key="search" toggleSearch={toggleSearch} />
        )}
      </AnimatePresence>
      <footer
        className="fixed bottom-0 left-0 z-[1000] flex h-[var(--taskbar-height)] w-screen
          items-center bg-taskbar-background"
        {...useTaskbarContextMenu()}
        {...FOCUSABLE_ELEMENT}
      >
        <StartButton
          toggleStartMenu={toggleStartMenu}
          startMenuVisible={startMenuVisible}
        />
        <SearchBar
          startMenuVisible={startMenuVisible}
          searchVisible={searchVisible}
          toggleSearch={toggleSearch}
        />
        <Tabs />
        <Clock toggleCalendar={toggleCalendar} />
      </footer>
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {calendarVisible && <Calendar />}
      </AnimatePresence>
    </>
  );
};

export default Taskbar;
