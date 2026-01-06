"use client";

import { useProcesses } from "@/contexts/process";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "../../Taskbar/Search/useSearch";
import { useMenu } from "@/contexts/menu";
import { useFileSystem } from "@/contexts/fileSystem";
import { useSession } from "@/contexts/session";
import { SearchIcon } from "../Icons";
import { MenuItem } from "@/contexts/menu/useMenuContextState";
import { getResultInfo } from "../../Taskbar/Search/functions";
import { basename } from "path";
import { SHORTCUT_EXTENSION } from "@/lib/constants";

type SearchBarProps = {
  id: string;
};

const MAX_ENTRIES = 10;

const SearchBar = ({ id }: SearchBarProps) => {
  const {
    open,
    processes: {
      [id]: { url = "" },
    },
  } = useProcesses();
  const [searchTerm, setSearchTerm] = useState("");
  const results = useSearch(searchTerm);
  const { contextMenu } = useMenu();
  const { fs } = useFileSystem();
  const { updateRecentFiles } = useSession();
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const hasUsedSearch = useRef(false);

  useEffect(() => {
    if (searchBarRef.current && hasUsedSearch.current) {
      const getItems = (): Promise<MenuItem[]> =>
        Promise.all(
          [
            ...results.filter(({ ref: path }) => path.startsWith(url)),
            ...results.filter(({ ref: path }) => !path.startsWith(url)),
          ]
            .slice(0, MAX_ENTRIES - 1)
            .map(async ({ ref: path }) => {
              const {
                icon,
                url: infoUrl,
                pid = "",
              } = (await getResultInfo(fs, path)) || {};

              return {
                action: () => {
                  open(pid, { url: infoUrl });
                  setSearchTerm("");

                  if (searchBarRef.current) {
                    searchBarRef.current.value = "";
                    searchBarRef.current.blur();
                  }
                  if (infoUrl && pid) updateRecentFiles(infoUrl, pid);
                },
                icon,
                label: basename(path, SHORTCUT_EXTENSION),
                tooltip: path,
              };
            }),
        );
      getItems().then((items) => {
        if (searchBarRef.current?.value || items.length === 0) {
          const searchBarRect = searchBarRef.current?.getBoundingClientRect();
          contextMenu?.(() => items).onContextMenuCapture(
            undefined,
            searchBarRect,
            { staticY: (searchBarRect?.y || 0) + (searchBarRect?.height || 0) },
          );
        }
      });
    }
  }, [contextMenu, fs, open, results, updateRecentFiles, url]);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
      setSearchTerm("");
    }
  }, [url]);

  return (
    <div className="file-search-bar">
      <input
        ref={searchBarRef}
        onChange={({ target }) => {
          hasUsedSearch.current = true;
          setSearchTerm(target.value);
        }}
        placeholder="Search"
        enterKeyHint="search"
        inputMode="search"
        type="search"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      <SearchIcon />
    </div>
  );
};

export default SearchBar;
