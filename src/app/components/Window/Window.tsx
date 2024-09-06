"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../Apps/RenderComponent";
import { useSession } from "@/contexts/session";
import useFocusable from "./useFocusable";
import RndWrapper from "./RndWrapper";
import colors from "@/lib/colors";
import { motion } from "framer-motion";
import useWindowTransitions from "./useWindowTransitions";
import { useCallback } from "react";
import Titlebar from "./Titlebar/Titlebar";
import "./Window.scss";
import clsx from "clsx";

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
  const windowTransitions = useWindowTransitions(id);
  const isForeground = id === foregroundId;
  const linkViewportEntry = useCallback(
    (viewportEntry: HTMLDivElement) => {
      if (Component && !peekElement && viewportEntry) {
        linkElement(id, "peekElement", viewportEntry);
      }
    },
    [Component, id, linkElement, peekElement],
  );
  return (
    <RndWrapper id={id} zIndex={zIndex}>
      <motion.section
        className={clsx("window-section", isForeground ? "is-foreground" : "")}
        style={{
          backgroundColor: backgroundColor || colors.window.background,
        }}
        {...focusableProps}
        {...windowTransitions}
      >
        <div
          className="h-[inherit] w-[inherit] bg-inherit"
          ref={linkViewportEntry}
        >
          {!hideTitlebar && <Titlebar id={id} />}
          {children}
        </div>
      </motion.section>
    </RndWrapper>
  );
};

export default Window;
