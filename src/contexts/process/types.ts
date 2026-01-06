import { ComponentProcessProps } from "@/components/Apps/RenderComponent";
import { Size } from "../session/types";
import {
  FileReaders,
  ObjectReaders,
} from "@/components/Dialogs/Transfer/useTransferDiaglog";
import { Prettify } from "@/lib/types";

export type ProcessElements = {
  componentWindow?: HTMLElement;
  peekElement?: HTMLElement;
  taskbarEntry?: HTMLElement;
};

export type RelativePosition = {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
};

type BaseProcessArguments = {
  allowResizing?: boolean;
  autoSizing?: boolean;
  titlebarColor?: string;
  titlebarButtonColor?: string;
  titlebarButtonHoverColor?: string;
  titlebarBorderColor?: string;
  navigationbarColor?: string;
  navigationbarButtonDisabledColor?: string;
  navigationbarButtonColor?: string;
  navigationbarButtonHoverColor?: string;
  navigationbarBorderColor?: string;
  statusbarColor?: string;
  textColor?: string;
  backgroundColor?: string;
  dependantLibs?: string[];
  hideMaximizeButton?: boolean;
  hideMinimizeButton?: boolean;
  hideTaskbarEntry?: boolean;
  hideTitlebar?: boolean;
  hideTitlebarIcon?: boolean;
  initialRelativePosition?: RelativePosition;
  libs?: string[];
  lockAspectRatio?: boolean;
  url?: string;
};

type DialogProcessArguments = {
  fileReaders?: FileReaders | ObjectReaders;
  progress?: number;
  shortcutPath?: string;
};

type SettingProcessArguments = { settingType?: "background" };

type MediaPlayerProcessArguments = {
  pause?: () => void;
  paused?: (callback?: (paused: boolean) => void) => boolean;
  play?: () => void;
};

export type ProcessArguments = Prettify<
  BaseProcessArguments &
    DialogProcessArguments &
    MediaPlayerProcessArguments &
    SettingProcessArguments
>;

export type Process = Prettify<
  ProcessArguments &
    ProcessElements & {
      Component: React.ComponentType<ComponentProcessProps>;
      closing?: boolean;
      defaultSize?: Size;
      dialogProcess?: boolean;
      hasWindow?: boolean;
      icon: string;
      maximized?: boolean;
      minimized?: boolean;
      preferProcessIcon?: boolean;
      singleton?: boolean;
      title: string;
      staticPeekImage?: boolean;
    }
>;

export type Processes = Record<string, Process>;
