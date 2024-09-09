"use client";

import { useSearchInput } from "@/contexts/search";
import "./Search.scss";
import { maybeCloseTaskbarMenu, SEARCH_BUTTON_TITLE } from "../functions";
import { FOCUSABLE_ELEMENT } from "@/lib/constants";
import { haltEvent } from "@/lib/utils";
import { Documents, Pictures, Videos } from "../StartMenu/Sidebar/SidebarIcons";
import { useSession } from "@/contexts/session";
import { useFileSystem } from "@/contexts/fileSystem";
import { useState } from "react";
import { useProcesses } from "@/contexts/process";
import lunr from "lunr";
import { useSearch } from "./useSearch";

type SearchPanelProps = {
  toggleSearch: (showMenu?: boolean) => void;
};

const TABS = ["All", "Documents", "Photos", "Videos"] as const;

export type TabName = (typeof TABS)[number];

type TabData = {
  icon: React.JSX.Element;
  subtitle?: string;
  title: string;
};

export const NO_RESULTS = "NO_RESULTS";

const SUGGESTED = ["FileExplorer", "Terminal", "Messenger", "Browser", "Paint"];

const GAMES = ["SpaceCadet", "Quake3", "DXBall"];

const INITIAL_DATA = {
  Documents: {
    icon: <Documents />,
    subtitle: "for documents",
    title: "Documents",
  },
  Photos: {
    icon: <Pictures />,
    title: "Photos",
  },
  Videos: {
    icon: <Videos />,
    title: "Videos",
  },
} as Record<TabName, TabData>;

const SearchPanel = ({ toggleSearch }: SearchPanelProps) => {
  const { value: searchTerm, inputRef, menuRef } = useSearchInput();
  const { recentFiles, updateRecentFiles } = useSession();
  const { lstat, readFile } = useFileSystem();
  const { open } = useProcesses();
  const [activeTab, setActiveTab] = useState<TabName>("All");
  const results = useSearch(searchTerm);
  const [bestMatch, setBestMatch] = useState("");
  const [activeItem, setActiveItem] = useState("");
  const [subResults, setSubResults] = useState<[string, lunr.Index.Result[]][]>(
    [],
  );
  console.log("SEARCH PANEL", results);
  return (
    <div
      id="searchMenu"
      ref={menuRef}
      className="search-panel"
      onBlurCapture={(event) =>
        maybeCloseTaskbarMenu(
          event,
          menuRef.current,
          toggleSearch,
          inputRef.current,
          SEARCH_BUTTON_TITLE,
          true,
        )
      }
      onKeyDown={({ key }) => {
        if (key === "Escape") toggleSearch(false);
      }}
      onContextMenu={haltEvent}
      {...FOCUSABLE_ELEMENT}
    >
      <div className="search-content"></div>
    </div>
  );
};

export default SearchPanel;
