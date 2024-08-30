import { SortBy } from "@/app/components/Files/FileEntry/useSortBy";
import { Prettify } from "@/lib/types";
import { Position, Props } from "react-rnd";

declare global {
  interface Window {
    sessionIsWriteable: boolean;
  }
}

export type Size = NonNullable<Props["size"]>;

export type UpdateFiles = (newFile?: string, oldFile?: string) => Promise<void>;

export type RecentFiles = [string, string, string][];

export type WindowState = {
  maximized?: boolean;
  position?: Position;
  size?: Size;
};

export type WindowStates = Record<string, WindowState>;

type SortOrder = [string[], SortBy?, boolean?];

export type SortOrders = Record<string, SortOrder>;

export type IconPosition = {
  gridColumnStart: number;
  gridRowStart: number;
};

export type IconPositions = Record<string, IconPosition>;

export type SessionData = {
  // clockSource: ClockSource;
  cursor: string;
  iconPositions: IconPositions;
  recentFiles: RecentFiles;
  runHistory: string[];
  sortOrders: SortOrders;
  // themeName: ThemeName;
  // wallpaperFit: WallpaperFit;
  // wallpaperImage: string;
  windowStates: WindowStates;
};

export type SessionContextState = Prettify<
  SessionData & {
    foregroundId: string;
    setForegroundId: React.Dispatch<React.SetStateAction<string>>;
    prependToStack: (id: string) => void;
    removeFromStack: (id: string) => void;
    sessionLoaded: boolean;
    setHaltSession: React.Dispatch<React.SetStateAction<boolean>>;
    setCursor: React.Dispatch<React.SetStateAction<string>>;
    setRunHistory: React.Dispatch<React.SetStateAction<string[]>>;
    setWindowStates: React.Dispatch<React.SetStateAction<WindowStates>>;
    setSortOrder: (
      directory: string,
      order: string[] | ((currentSortOrder: string[]) => string[]),
      sortBy?: SortBy,
      ascending?: boolean,
    ) => void;
    setIconPositions: React.Dispatch<React.SetStateAction<IconPositions>>;
    stackOrder: string[];
    updateRecentFiles: (url: string, pid: string, title?: string) => void;
  }
>;
