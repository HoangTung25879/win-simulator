"use client";

import { useEffect, useRef } from "react";
import { SearchIcon } from "../../FileExplorer/Icons";
import { useSearchInput } from "@/contexts/search";
import { KEYPRESS_DEBOUNCE_MS } from "@/lib/constants";
import { SEARCH_BUTTON_TITLE } from "../functions";
import useTaskbarContextMenu from "../useTaskbarContextMenu";
import clsx from "clsx";
import { SEARCH_PARENT_CLASS } from "./SearchMenu";

type SearchBarProps = {
  startMenuVisible: boolean;
  searchVisible: boolean;
  toggleSearch: (showMenu?: boolean) => void;
};

const SearchBar = ({
  startMenuVisible,
  searchVisible,
  toggleSearch,
}: SearchBarProps) => {
  const { inputRef, firstResultRef, menuRef, setValue } = useSearchInput();
  const searchTimeoutRef = useRef(0);

  useEffect(() => {
    if (!searchVisible && inputRef.current) {
      inputRef.current.value = "";
      setValue("");
    }
  }, [searchVisible]);

  return (
    <div
      className={clsx(
        "search-bar",
        searchVisible && "--active",
        startMenuVisible && "fake-focus",
      )}
      onClick={() => {
        if (!searchVisible) {
          toggleSearch(true);
        }
      }}
      title={SEARCH_BUTTON_TITLE}
      aria-label="searchBar"
      {...useTaskbarContextMenu()}
    >
      <SearchIcon aria-label="searchBar" />
      {startMenuVisible && <span className="blinking-cursor">|</span>}
      <input
        ref={inputRef}
        onChange={(e) => {
          const { value } = e.target;
          window.clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = window.setTimeout(
            () => setValue(value ?? ""),
            searchTimeoutRef.current > 0 ? KEYPRESS_DEBOUNCE_MS : 0,
          );
        }}
        onKeyDown={({ key }) => {
          if (key === "Enter" && firstResultRef.current?.ref) {
            const bestMatchElement = menuRef.current?.querySelector(
              `.${SEARCH_PARENT_CLASS} li:first-child figure`,
            );
            (bestMatchElement as HTMLElement)?.click();
          }
        }}
        placeholder={SEARCH_BUTTON_TITLE}
        enterKeyHint="search"
        inputMode="search"
        type="search"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-label="searchBar"
      />
    </div>
  );
};

export default SearchBar;
