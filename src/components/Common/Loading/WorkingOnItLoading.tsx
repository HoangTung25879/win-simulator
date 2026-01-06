"use client";

import clsx from "clsx";

type WorkingOnItLoadingProps = { className?: string };

const WorkingOnItLoading = ({ className = "" }: WorkingOnItLoadingProps) => {
  return <div className={clsx("working-on-it-loading", className)}></div>;
};

export default WorkingOnItLoading;
