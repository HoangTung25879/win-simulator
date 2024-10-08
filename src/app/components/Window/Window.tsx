"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../Apps/RenderComponent";
import { useSession } from "@/contexts/session";
import useFocusable from "./useFocusable";
import RndWrapper from "./RndWrapper";
import colors from "@/lib/colors";
import { motion } from "framer-motion";
import useWindowTransitions from "./useWindowTransitions";
import { useCallback, useEffect } from "react";
import Titlebar from "./Titlebar/Titlebar";
import "./Window.scss";
import clsx from "clsx";
import {
  generatePeekElementId,
  generateWindowElementId,
  getPeekElement,
  getWindowElement,
} from "@/lib/utils";

type WindowProps = ComponentProcessProps & {
  children: React.ReactNode;
};

const Window = ({ children, id }: WindowProps) => {
  const {
    linkElement,
    processes: { [id]: process },
  } = useProcesses();
  const { backgroundColor, Component, hideTitlebar, peekElement } =
    process || {};
  const { foregroundId } = useSession();
  const { zIndex, ...focusableProps } = useFocusable(id);
  const windowTransitions = useWindowTransitions(id, true);
  const isForeground = id === foregroundId;

  useEffect(() => {
    const viewportEntry = getPeekElement(id);
    const windowContainer = getWindowElement(id);
    if (viewportEntry) {
      linkElement(id, "peekElement", viewportEntry);
    }
    if (windowContainer) {
      linkElement(id, "componentWindow", windowContainer);
    }
  }, [id]);

  return (
    <RndWrapper id={id} zIndex={zIndex}>
      <motion.section
        id={generateWindowElementId(id)}
        style={
          {
            "--window-background": backgroundColor || colors.window.background,
          } as React.CSSProperties
        }
        className={clsx("window-section", isForeground ? "is-foreground" : "")}
        {...focusableProps}
        {...windowTransitions}
      >
        <div
          id={generatePeekElementId(id)}
          className="h-[inherit] w-[inherit] bg-inherit"
        >
          {!hideTitlebar && <Titlebar id={id} />}
          {children}
        </div>
      </motion.section>
    </RndWrapper>
  );
};

export default Window;
