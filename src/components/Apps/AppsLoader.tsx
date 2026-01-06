"use client";

import { useProcesses } from "@/contexts/process";
import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";

const RenderComponent = dynamic(
  () => import("@/components/Apps/RenderComponent"),
);

type AppsLoaderProps = {};

const AppsLoader = ({}: AppsLoaderProps) => {
  const { processes = {} } = useProcesses();
  return (
    <AnimatePresence initial={false} presenceAffectsLayout={false}>
      {Object.entries(processes).map(
        ([id, { closing, Component, hasWindow }]) => {
          return (
            id &&
            Component &&
            !closing && (
              <RenderComponent
                key={id}
                Component={Component}
                hasWindow={hasWindow}
                id={id}
              />
            )
          );
        },
      )}
    </AnimatePresence>
  );
};

export default AppsLoader;
