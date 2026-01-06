"use client";

import { useSession } from "@/contexts/session";
import useNextFocusable from "../../Window/useNextFocusable";
import { useProcesses } from "@/contexts/process";
import { useEffect, useState } from "react";
import clsx from "clsx";
import useTaskbarTabTransition from "../useTaskbarTabTransition";
import useTitlebarContextMenu from "../../Window/Titlebar/useTitlebarContextMenu";
import { AnimatePresence, motion } from "motion/react";
import Icon from "../../Common/Icon/Icon";
import colors from "@/lib/colors";
import dynamic from "next/dynamic";
import { generateTaskbarElementId, getTaskbarElement } from "@/lib/utils";

const PeekWindow = dynamic(
  () => import("@/components/Taskbar/PeekWindow/PeekWindow"),
);

type TabProps = { icon: string; id: string; title: string };

const Tab = ({ icon, id, title }: TabProps) => {
  const nextFocusableId = useNextFocusable(id);
  const { foregroundId, setForegroundId } = useSession();
  const isForeground = id === foregroundId;
  const {
    linkElement,
    minimize,
    processes: { [id]: process },
  } = useProcesses();
  const { minimized, progress = 0 } = process || {};
  const [isPeekVisible, setIsPeekVisible] = useState(false);
  const tabTransition = useTaskbarTabTransition();
  const tabContextMenu = useTitlebarContextMenu(id);

  useEffect(() => {
    const taskbarEntry = getTaskbarElement(id);
    if (taskbarEntry) {
      linkElement(id, "taskbarEntry", taskbarEntry);
    }
  }, [id]);

  const hidePeek = (): void => setIsPeekVisible(false);

  const showPeek = (): void => setIsPeekVisible(true);

  const onClick = (): void => {
    if (minimized || isForeground) minimize(id);
    setForegroundId(isForeground ? nextFocusableId : id);
  };

  const showProgress = progress > 0 && progress < 100;

  return (
    <motion.div
      className={clsx(
        "tab",
        isForeground && "is-foreground",
        showProgress && "progressing",
      )}
      style={{
        backgroundImage: showProgress
          ? `linear-gradient(to right, ${colors.progressBackground} 0% ${progress}%, transparent ${progress}% 100%)`
          : "",
      }}
      onClick={hidePeek}
      onMouseEnter={showPeek}
      onMouseLeave={hidePeek}
      {...tabTransition}
      {...tabContextMenu}
    >
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {isPeekVisible && <PeekWindow id={id} />}
      </AnimatePresence>
      <button
        id={generateTaskbarElementId(id)}
        onClick={onClick}
        aria-label={title}
        title={title}
        type={undefined}
      >
        <figure>
          <Icon alt={title} imgSize={24} src={icon} />
          <figcaption>{title}</figcaption>
        </figure>
      </button>
    </motion.div>
  );
};

export default Tab;
