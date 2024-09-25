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
    processes: { [id]: process },
  } = useProcesses();
  const { maximized, minimized } = process || {};
  const rndRef = useRef<Rnd | null>(null);
  const rndProps = useRnd(id);

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
