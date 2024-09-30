"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../Apps/RenderComponent";
import Select, { SelectItem } from "../Common/Select/Select";
import "./Settings.scss";
import { useEffect, useMemo, useRef } from "react";
import SimpleBar from "simplebar-react";
import { useSession } from "@/contexts/session";
import { WallpaperImage } from "@/contexts/session/types";
import { startCase } from "es-toolkit";
import { useWallpaper } from "@/contexts/wallpaper";
import { haltEvent } from "@/lib/utils";
import { hsvaToRgbaString, rgbaStringToHsva } from "@uiw/color-convert";
import Sketch from "@uiw/react-color-sketch";

type SettingsProps = {} & ComponentProcessProps;

interface WallpaperOption extends SelectItem {
  id: string;
  label: WallpaperImage;
  value: WallpaperImage;
}

const wallPaperOptions: WallpaperOption[] = [
  {
    id: "1",
    label: "Vanta Waves",
    value: "VANTA WAVES",
  },
  {
    id: "2",
    label: "Vanta Clouds",
    value: "VANTA CLOUDS",
  },
  {
    id: "3",
    label: "Synthwave",
    value: "SYNTHWAVE",
  },
  {
    id: "4",
    label: "Ambient Swirl",
    value: "AMBIENT SWIRL",
  },
  {
    id: "5",
    label: "Ambient Shift",
    value: "AMBIENT SHIFT",
  },
  {
    id: "6",
    label: "Ambient Coalesce",
    value: "AMBIENT COALESCE",
  },
  {
    id: "7",
    label: "Falling Food Fiesta",
    value: "FALLING FOOD FIESTA",
  },
  {
    id: "8",
    label: "Matrix Rain",
    value: "MATRIX RAIN",
  },
  {
    id: "9",
    label: "Galaxy Spiral",
    value: "GALAXY SPIRAL",
  },
  {
    id: "10",
    label: "Solid Color",
    value: "SOLID COLOR",
  },
];

const Settings = ({ id }: SettingsProps) => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { settingType = "", titlebarColor } = process || {};
  const {
    wallpaperImage,
    wallpaperFit,
    setWallpaper,
    wallpaperColor,
    setWallpaperColor,
  } = useSession();
  const { desktopRef, canvasRef } = useWallpaper();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasPreview = useRef<HTMLCanvasElement | null>(null);
  const contextCanvas = useRef<CanvasRenderingContext2D | null>(null);
  const animated = useRef(false);
  const onChangeSelect = (item: WallpaperOption) => {
    if (item.value === wallpaperImage) return;
    setWallpaper(item.value);
  };

  const copyFrame = (
    sourceCanvas: HTMLCanvasElement,
    destinationCanvas: HTMLCanvasElement,
    destinationCtx: CanvasRenderingContext2D | null,
  ) => {
    if (!animated.current) return;
    if (destinationCanvas.width !== sourceCanvas.width) {
      destinationCanvas.width = sourceCanvas.width;
    }
    if (destinationCanvas.height !== sourceCanvas.height) {
      destinationCanvas.height = sourceCanvas.height;
    }
    destinationCtx?.drawImage(
      sourceCanvas,
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height,
      0,
      0,
      canvasPreview.current?.width || 0,
      canvasPreview.current?.height || 0,
    );
    window.requestAnimationFrame(() =>
      copyFrame(sourceCanvas, destinationCanvas, destinationCtx),
    );
  };

  useEffect(() => {
    if (wallpaperImage === "SOLID COLOR") {
      const ctx = canvasPreview.current?.getContext("2d");
      if (ctx) {
        ctx.fillStyle = wallpaperColor;
        ctx.fillRect(
          0,
          0,
          canvasPreview.current?.width || 0,
          canvasPreview.current?.height || 0,
        );
      }
    } else {
      const handlePreviewBackground = () => {
        if (canvasRef.current && canvasPreview.current) {
          if (!contextCanvas.current) {
            contextCanvas.current = canvasPreview.current.getContext("2d");
          }
          animated.current = true;
          copyFrame(
            canvasRef.current,
            canvasPreview.current,
            contextCanvas.current,
          );
        }
      };
      setTimeout(handlePreviewBackground, 100);
    }
    return () => {
      animated.current = false;
      contextCanvas.current = null;
    };
  }, [wallpaperImage, wallpaperFit, wallpaperColor]);

  const formattedValue: WallpaperOption | undefined = useMemo(() => {
    return wallPaperOptions.find((item) => item.value === wallpaperImage);
  }, [wallpaperImage, wallpaperFit]);

  return (
    <>
      <div
        className="settings-header"
        style={{ backgroundColor: titlebarColor }}
        onContextMenu={haltEvent}
      >
        {startCase(settingType)}
      </div>
      <SimpleBar
        className="settings-window"
        autoHide={false}
        onContextMenu={haltEvent}
      >
        <div className="settings-main" ref={wrapperRef}>
          <div className="canvas-background-preview">
            <canvas ref={canvasPreview} />
            <div className="start-menu-preview"></div>
            <div className="taskbar-preview"></div>
          </div>
          <div className="flex justify-between">
            <Select
              scrollContainer={wrapperRef.current}
              value={formattedValue}
              options={wallPaperOptions}
              title="Background"
              onChange={onChangeSelect}
              valueFormatter={(value) => {
                return startCase(value);
              }}
            />
            {wallpaperImage === "SOLID COLOR" && (
              <div className="color-picker">
                <label>Choose your background color</label>
                <Sketch
                  color={rgbaStringToHsva(wallpaperColor)}
                  onChange={(color) => {
                    setWallpaperColor(hsvaToRgbaString(color.hsva));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </SimpleBar>
    </>
  );
};

export default Settings;
