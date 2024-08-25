"use client";

import clsx from "clsx";
import React, { HTMLAttributes, useEffect } from "react";

type SelectionAreaProps = HTMLAttributes<HTMLSpanElement>;

const SelectionArea = (props: SelectionAreaProps) => {
  const { className, ...rest } = props;
  useEffect(() => {
    document.body.style.pointerEvents = "none";
    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, []);
  return (
    <span
      className={clsx(
        `absolute z-[2] border border-solid border-[hsla(207,100%,45%,90%)]
        bg-[hsla(207,100%,45%,30%)]`,
        className,
      )}
      {...rest}
    ></span>
  );
};

export default SelectionArea;
