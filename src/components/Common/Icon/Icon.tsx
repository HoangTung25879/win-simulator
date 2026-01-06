"use client";

import { cleanUpBufferUrl } from "@/lib/utils";
import Image from "next/image";
import React, { forwardRef, memo, useEffect, useMemo, useState } from "react";

export type IconProps = {
  imgSize: number;
  displaySize?: number;
  eager?: boolean;
  moving?: boolean;
};

const Icon = forwardRef<
  HTMLImageElement,
  IconProps & React.ImgHTMLAttributes<HTMLImageElement>
>(({ alt, imgSize, src, displaySize = 0, eager, moving, style = {} }, ref) => {
  const [loaded, setLoaded] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string>();

  const dimensionProps = useMemo(() => {
    const size = displaySize > imgSize ? imgSize : displaySize || imgSize;
    const offset = displaySize > imgSize ? `${displaySize - imgSize}px` : 0;
    return {
      height: size,
      offset,
      width: size,
    };
  }, [displaySize, imgSize]);
  const { height, offset, width } = dimensionProps;
  useEffect(
    () => () => {
      if (loaded && typeof src === "string" && src.startsWith("blob:")) cleanUpBufferUrl(src);
    },
    [loaded, src],
  );

  return (
    src && (
      <Image
        ref={ref}
        loading={eager ? "eager" : "lazy"}
        width={width}
        height={height}
        decoding="async"
        draggable={false}
        priority={eager ? true : false}
        fetchPriority={eager ? "high" : "auto"}
        className="pointer-events-none aspect-square object-contain"
        style={{
          left: displaySize || undefined,
          maxHeight: `${height}px`,
          maxWidth: `${width}px`,
          minHeight: `${height}px`,
          minWidth: `${width}px`,
          opacity: `${moving ? 0.5 : 1}`,
          top: offset || undefined,
          visibility: loaded ? "visible" : "hidden",
          ...style,
        }}
        onError={({ target }) => {
          const { currentSrc = "" } = (target as HTMLImageElement) || {};
          try {
            const { pathname } = new URL(currentSrc);
            if (pathname && failedUrl !== pathname) {
              setFailedUrl(pathname);
            }
          } catch {
            // Ignore failure to log failed url
          }
        }}
        onLoad={() => setLoaded(true)}
        src={src as string}
        alt={alt || ""}
      />
    )
  );
});

export default memo(Icon);
