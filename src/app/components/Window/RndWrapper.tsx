"use client";

import { useProcesses } from "@/contexts/process";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "@/lib/constants";
import { haltEvent } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import useRnd from "./useRnd";

type RndWrapperProps = {
  id: string;
  zIndex: number;
  children: React.ReactNode;
};

const reRouteFocus =
  (focusElement?: HTMLElement) =>
  (element?: Element): void => {
    element?.setAttribute("tabindex", FOCUSABLE_ELEMENT.tabIndex.toString());
    element?.addEventListener("contextmenu", haltEvent);
    element?.addEventListener("mousedown", (event) => {
      event.preventDefault();
      focusElement?.focus(PREVENT_SCROLL);
    });
  };

const RndWrapper = ({ children, id, zIndex }: RndWrapperProps) => {
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { Component, componentWindow, maximized, minimized } = process || {};
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id);

  const linkComponentWindow = useCallback(
    (rndEntry: Rnd) => {
      rndRef.current = rndEntry;
      const rndWindowElements =
        rndEntry?.resizableElement?.current?.children || [];
      const [windowContainer] = rndWindowElements as HTMLElement[];
      if (Component && !componentWindow && windowContainer) {
        linkElement(id, "componentWindow", windowContainer);
      }
    },
    [Component, componentWindow, id, linkElement],
  );

  useEffect(() => {
    if (!maximized) {
      const { current: currentWindow } = rndRef;
      const rndWindowElements =
        currentWindow?.resizableElement?.current?.children || [];
      const [windowContainer, resizeHandleContainer] =
        rndWindowElements as HTMLElement[];
      const resizeHandles = [...(resizeHandleContainer?.children || [])];
      resizeHandles.forEach(reRouteFocus(windowContainer));
    }
  }, [maximized]);

  return (
    <Rnd
      ref={linkComponentWindow}
      style={{
        pointerEvents: minimized ? "none" : undefined,
        zIndex,
      }}
      {...rndProps}
    >
      {children}
    </Rnd>
  );
};

export default RndWrapper;
