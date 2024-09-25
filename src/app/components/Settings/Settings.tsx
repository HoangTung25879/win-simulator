"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../Apps/RenderComponent";
import Select, { SelectItem } from "../Common/Select/Select";
import "./Settings.scss";
import { useEffect, useRef } from "react";
import SimpleBar from "simplebar-react";
import { useSession } from "@/contexts/session";

type SettingsProps = {} & ComponentProcessProps;

const options: SelectItem[] = [...Array(3)].map((_, i) => ({
  id: `${i}`,
  label: `bg${i}`,
  value: `bg${i}`,
}));

const Settings = ({ id }: SettingsProps) => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const { wallpaperImage, wallpaperFit, setWallpaper } = useSession();
  const {
    icon = "",
    url = "",
    settingType = "",
    titlebarColor,
  } = process || {};
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {}, []);
  return (
    <>
      <div
        className="settings-header"
        style={{ backgroundColor: titlebarColor }}
      >
        {settingType}
      </div>
      <div className="settings-window">
        <SimpleBar autoHide={false}>
          <div className="settings-main" ref={wrapperRef}>
            <canvas id="backgroundPreview" width={450} height={250} />
            <Select
              scrollContainer={wrapperRef.current}
              defaultValue={options[0]}
              options={options}
              title="Background"
            />
          </div>
        </SimpleBar>
      </div>
    </>
  );
};

export default Settings;
