"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../RenderComponent";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFileSystem } from "@/contexts/fileSystem";
import {
  ExitFullscreenIcon,
  FullscreenIcon,
  RotateClockWiseIcon,
  ZoomActualSizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ZoomToFitIcon,
} from "./Icons";
import clsx from "clsx";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchContentRef,
  useTransformEffect,
  getMatrixTransformStyles,
} from "react-zoom-pan-pinch";
import { getExtension, haltEvent, imageToBufferUrl } from "@/lib/utils";
import useFileDrop from "../../Files/FileEntry/useFileDrop";
import { basename, dirname, extname, join } from "path";
import useTitle from "../../Window/useTitle";
import { useFullScreen } from "@/contexts/fullScreen";
import { IMAGE_FILE_EXTENSIONS } from "@/lib/constants";
import "./Photos.scss";
import useResizeObserver from "@/hooks/useResizeObserver";
import { throttle } from "es-toolkit";

type PhotosProps = {} & ComponentProcessProps;

const MAX_SCALE = 7;
const ROTATE_STEP = 90;

const GetScale = ({
  setScale,
}: {
  setScale: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const throttleSetScale = throttle((scale: number) => {
    setScale(scale);
  }, 100);
  useTransformEffect(({ state }) => {
    throttleSetScale(Number(state.scale.toFixed(2)));
    return () => {
      // unmount
    };
  });
  return null;
};

const Photos = ({ id }: PhotosProps) => {
  const { processes: { [id]: process } = {}, url: setUrl } = useProcesses();
  const { componentWindow, closing = false, url = "" } = process || {};
  const { readFile, readdir } = useFileSystem();
  const fileDrop = useFileDrop({ id });
  const { prependFileToTitle } = useTitle(id);
  const { fullscreenElement, toggleFullscreen } = useFullScreen();
  const [src, setSrc] = useState<Record<string, string>>({});
  const [brokenImage, setBrokenImage] = useState(false);
  const [imageScale, setImageScale] = useState<number>(0);
  const [scale, setScale] = useState<number>(0);
  const [hasInitTransform, setHasInitTransform] = useState(true);
  const [rotateDegree, setRotateDegree] = useState<number>(0);
  const [imageContainerSize, setImageContainerSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const controlRef = useRef<ReactZoomPanPinchContentRef>(
    Object.create({}) as ReactZoomPanPinchContentRef,
  );
  const transformTimeout = useRef<number | undefined>(undefined);
  const urlBaseName = basename(url);

  const loadSrc = useCallback(async (): Promise<void> => {
    const fileContents = await readFile(url);
    const ext = getExtension(url);
    setSrc((currentSrc) => {
      const [currentUrl] = Object.keys(currentSrc);
      if (currentUrl) {
        if (currentUrl === url) return currentSrc;
      }
      return { [url]: imageToBufferUrl(ext, fileContents) };
    });
    prependFileToTitle(urlBaseName);
  }, [prependFileToTitle, readFile, url]);

  const onKeyDown = useCallback(
    async ({ key }: KeyboardEvent): Promise<void> => {
      switch (key) {
        case "ArrowRight":
        case "ArrowLeft": {
          const directory = await readdir(dirname(url));
          const currentIndex = directory.indexOf(urlBaseName);
          const nextPhoto = (index: number, next: boolean): void => {
            if (index === -1) return;
            const nextIndex = index + (next ? 1 : -1);
            if (nextIndex === -1 || nextIndex === directory.length) {
              return;
            }
            const nextUrl = directory[nextIndex];

            if (IMAGE_FILE_EXTENSIONS.has(getExtension(nextUrl))) {
              setHasInitTransform(false);
              setUrl(id, join(dirname(url), nextUrl));
            } else {
              nextPhoto(nextIndex, next);
            }
          };
          nextPhoto(currentIndex, key === "ArrowRight");
          break;
        }
      }
    },
    [id, readdir, setUrl, url],
  );

  const calculateImageScale = (image: HTMLImageElement | null, rotate = 0) => {
    if (!image) return;
    controlRef.current?.resetTransform?.(0);
    const isVertical = rotate % 180 !== 0;
    const imageWidth = isVertical ? image.naturalHeight : image.naturalWidth;
    const imageHeight = isVertical ? image.naturalWidth : image.naturalHeight;
    image.style.width = `${imageWidth}px`;
    image.style.height = `${imageHeight}px`;
    const rect = imageContainerRef.current?.getBoundingClientRect() || {
      width: 0,
      height: 0,
    };
    const scale = Number(
      Math.min(rect.width / imageWidth, rect.height / imageHeight).toFixed(2),
    );
    setBrokenImage(false);
    setHasInitTransform(false);
    setImageContainerSize({ width: rect.width, height: rect.height });
    setImageScale(scale);
    setScale(scale);
    setRotateDegree(rotate);
  };

  const handleResize = useCallback(() => {
    calculateImageScale(imageRef.current);
  }, []);

  const handleZoomToActualSize = () => {
    if (controlRef.current) {
      const { wrapperComponent, transformState } = controlRef.current.instance;
      const { positionX, positionY } = transformState;
      const wrapperWidth = wrapperComponent?.offsetWidth || 0;
      const wrapperHeight = wrapperComponent?.offsetHeight || 0;
      const newScale = 1;
      const mouseX = (wrapperWidth / 2 - positionX) / scale;
      const mouseY = (wrapperHeight / 2 - positionY) / scale;
      const scaleDifference = newScale - scale;
      const calculatedPositionX = positionX - mouseX * scaleDifference;
      const calculatedPositionY = positionY - mouseY * scaleDifference;
      controlRef.current.setTransform?.(
        calculatedPositionX,
        calculatedPositionY,
        newScale,
        0,
      );
    }
  };

  const loadImage = useCallback(() => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "high";
    image.src = src[url];
    image.onload = () => calculateImageScale(image);
    image.onerror = () => setBrokenImage(true);
  }, [src, url]);

  useEffect(() => {
    if (url && !src[url] && !closing) loadSrc();
  }, [closing, loadSrc, src, url]);

  useEffect(() => {
    if (src[url]) {
      loadImage();
    }
  }, [src, url]);

  useEffect(() => {
    if (!hasInitTransform) {
      transformTimeout.current = window.setTimeout(() => {
        setHasInitTransform(true);
      }, 200);
    }
    return () => {
      if (transformTimeout.current) {
        clearTimeout(transformTimeout.current);
        transformTimeout.current = undefined;
      }
    };
  }, [hasInitTransform]);

  useEffect(() => {
    componentWindow?.addEventListener("keydown", onKeyDown);
    return () => componentWindow?.removeEventListener("keydown", onKeyDown);
  }, [componentWindow, onKeyDown]);

  useResizeObserver(componentWindow, handleResize);

  return (
    <div
      ref={containerRef}
      className={clsx("photos-app", !url && "--empty")}
      onContextMenu={haltEvent}
      {...fileDrop}
    >
      {/* <nav className="top"></nav> */}
      <figure
        className={clsx("photos-image-container")}
        ref={imageContainerRef}
      >
        {imageScale > 0 && (
          <TransformWrapper
            key={`${imageContainerSize.width}x${imageContainerSize.height}x${imageScale}`}
            ref={controlRef}
            initialScale={imageScale}
            minScale={imageScale}
            maxScale={MAX_SCALE}
            centerOnInit
            disablePadding
            panning={{
              disabled: scale === imageScale,
              velocityDisabled: true,
            }}
            zoomAnimation={{
              disabled: true,
              animationTime: 0,
            }}
            velocityAnimation={{
              disabled: true,
              animationTime: 0,
            }}
            alignmentAnimation={{
              disabled: true,
              animationTime: 0,
            }}
            doubleClick={{
              step: 1,
              mode: scale === imageScale ? "zoomIn" : "reset",
              animationTime: 0,
            }}
            customTransform={getMatrixTransformStyles}
            onInit={() => setHasInitTransform(true)}
          >
            <GetScale setScale={setScale} />
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
              contentStyle={{
                cursor: scale > imageScale ? "pointer" : "auto",
                willChange: "transform",
              }}
            >
              <img
                ref={imageRef}
                className={clsx(
                  "photos-image",
                  Boolean(src[url] && !brokenImage && hasInitTransform)
                    ? ""
                    : "!invisible",
                )}
                style={{
                  transform: `rotate(${rotateDegree}deg)`,
                }}
                alt={basename(url, extname(url))}
                src={src[url]}
              />
            </TransformComponent>
          </TransformWrapper>
        )}
        {brokenImage && (
          <div className="broken-image">
            {urlBaseName}
            <br />
            Sorry, Photos can&apos;t open this file because the format is
            currently unsupported, or the file is corrupted
          </div>
        )}
      </figure>
      <nav className="bottom">
        {scale > 0 && (
          <div className="scale">{`${Math.floor(scale * 100)}%`}</div>
        )}
        <button
          disabled={!url || scale === imageScale || brokenImage}
          onClick={() => controlRef.current?.zoomOut?.(undefined, 0)}
          title="Zoom out"
        >
          <ZoomOutIcon />
        </button>
        <button
          disabled={!url || scale === MAX_SCALE || brokenImage}
          onClick={() => controlRef.current?.zoomIn?.(undefined, 0)}
          title="Zoom in"
        >
          <ZoomInIcon />
        </button>
        <button
          disabled={!url || brokenImage}
          onClick={() =>
            calculateImageScale(
              imageRef.current,
              (rotateDegree + ROTATE_STEP) % 360,
            )
          }
          title="Rotate"
        >
          <RotateClockWiseIcon />
        </button>
        <button
          disabled={!url || scale === imageScale || brokenImage}
          onClick={() => {
            controlRef.current?.resetTransform?.(0);
            controlRef.current?.centerView?.(undefined, 0);
          }}
          title="Zoom to fit"
        >
          <ZoomToFitIcon />
        </button>
        <button
          disabled={!url || scale === 1 || brokenImage}
          onClick={handleZoomToActualSize}
          title="Zoom to actual size"
        >
          <ZoomActualSizeIcon />
        </button>
        <div className="split" />
        <button
          disabled={!url}
          onClick={() => toggleFullscreen(containerRef.current, "show")}
          title="Fullscreen"
        >
          {fullscreenElement === containerRef.current ? (
            <ExitFullscreenIcon />
          ) : (
            <FullscreenIcon />
          )}
        </button>
      </nav>
    </div>
  );
};

export default Photos;
