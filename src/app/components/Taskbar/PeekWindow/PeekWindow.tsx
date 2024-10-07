"use client";

import { useProcesses } from "@/contexts/process";
import { useSession } from "@/contexts/session";
import useWindowActions from "../../Window/useWindowActions";
import { useEffect, useMemo, useRef, useState } from "react";
import usePeekWindowTransition from "../usePeekWindowTransition";
import { motion } from "framer-motion";
import "./PeekWindow.scss";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";
import { CloseIcon } from "../../Window/Titlebar/Icon";
import useWindowPeek from "./useWindowPeek";
import Icon from "../../Common/Icon/Icon";
import clsx from "clsx";
import { PauseIcon, PlayIcon } from "./Icons";
import { haltEvent } from "@/lib/utils";

type PeekWindowProps = {
  id: string;
};

const PeekWindow = ({ id }: PeekWindowProps) => {
  const {
    minimize,
    processes: { [id]: process },
  } = useProcesses();
  const {
    pause,
    paused,
    play,
    minimized = false,
    title = id,
    peekElement,
    componentWindow,
    icon,
    hideTitlebarIcon,
  } = process || {};
  const { setForegroundId } = useSession();
  const { onClose } = useWindowActions(id);
  const [isVisibleClose, setIsVisibleClose] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const showControls = useMemo(
    () => Boolean(play && pause && paused),
    [pause, paused, play],
  );
  const image = useWindowPeek(id);
  const peekTransition = usePeekWindowTransition(showControls);
  const peekRef = useRef<HTMLDivElement | null>(null);
  const monitoringPaused = useRef(false);

  const onClick = (): void => {
    if (minimized) minimize(id);
    setForegroundId(id);
  };

  useEffect(() => {
    if (showControls && paused && !monitoringPaused.current) {
      monitoringPaused.current = true;
      setIsPaused(paused(setIsPaused));
    }
  }, [paused, showControls]);

  useEffect(() => {
    const previewElement = peekElement || componentWindow;
    if (peekRef.current && previewElement) {
      peekRef.current.appendChild(previewElement);
    }
  }, [peekElement, componentWindow]);

  return (
    image && (
      <motion.div
        ref={peekRef}
        className="peek-window"
        onClick={onClick}
        onMouseEnter={() => setIsVisibleClose(true)}
        onMouseLeave={() => setIsVisibleClose(false)}
        {...peekTransition}
        {...FOCUSABLE_ELEMENT}
      >
        <div className="title">
          <div className="title-text">
            {!hideTitlebarIcon && <Icon alt={title} imgSize={16} src={icon} />}
            {title}
          </div>
          <button
            className={clsx("close", !isVisibleClose && "!invisible")}
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <img
          className="peek-image"
          alt={title}
          decoding="async"
          loading="eager"
          src={image}
          fetchPriority="high"
        />
        {showControls && (
          <div className="controls">
            {isPaused && (
              <button
                onClick={(event) => {
                  haltEvent(event);
                  play?.();
                }}
                aria-label="Play"
                title="Play"
                {...FOCUSABLE_ELEMENT}
              >
                <PlayIcon />
              </button>
            )}
            {!isPaused && (
              <button
                onClick={(event) => {
                  haltEvent(event);
                  pause?.();
                }}
                aria-label="Pause"
                title="Pause"
                {...FOCUSABLE_ELEMENT}
              >
                <PauseIcon />
              </button>
            )}
          </div>
        )}
      </motion.div>
    )
  );
};

export default PeekWindow;
