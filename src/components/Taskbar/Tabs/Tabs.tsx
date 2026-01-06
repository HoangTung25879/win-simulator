"use client";

import { useProcesses } from "@/contexts/process";
import "./Tabs.scss";
import { AnimatePresence } from "motion/react";
import Tab from "@/components/Taskbar/Tabs/Tab";

type TabsProps = {};

const Tabs = ({}: TabsProps) => {
  const { processes = {} } = useProcesses();
  return (
    <div className="tabs">
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {Object.entries(processes)
          .filter(
            ([, { closing, hideTaskbarEntry }]) =>
              !closing && !hideTaskbarEntry,
          )
          .map(([id, { icon, title }]) => (
            <Tab key={id} icon={icon} id={id} title={title} />
          ))}
      </AnimatePresence>
    </div>
  );
};

export default Tabs;
