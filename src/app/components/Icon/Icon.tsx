"use client";

import React from "react";

interface IconProps {
  alt?: string;
  imgSize: number;
  src: string;
}

const Icon: React.FC<IconProps> = ({ alt, imgSize, src }) => {
  return <img alt={alt} src={src} width={imgSize} height={imgSize} />;
};

export default Icon;
