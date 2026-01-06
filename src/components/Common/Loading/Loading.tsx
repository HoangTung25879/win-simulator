"use client";

import clsx from "clsx";
import "./Loading.scss";

type LoadingProps = {
  className?: string;
};

const Loading = ({ className = "" }: LoadingProps) => {
  return <div className={clsx("loading", className)}></div>;
};

export default Loading;
