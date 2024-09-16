"use client";

import clsx from "clsx";

type LoadingProps = {
  className?: string;
};

const Loading = ({ className = "" }: LoadingProps) => {
  return <div className={clsx("file-manager-loading", className)}></div>;
};

export default Loading;
