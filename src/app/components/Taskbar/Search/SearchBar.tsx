"use client";

import { useCallback, useRef } from "react";
import { SearchIcon } from "../../FileExplorer/Icons";
import { useSearchInput } from "@/contexts/search";
import { KEYPRESS_DEBOUNCE_MS } from "@/lib/constants";
import { SEARCH_BUTTON_TITLE } from "../functions";

type SearchBarProps = {
  searchVisible: boolean;
  toggleSearch: (showMenu?: boolean) => void;
};

const SearchBar = ({ searchVisible, toggleSearch }: SearchBarProps) => {
  const { inputRef, setValue } = useSearchInput();
  const searchTimeoutRef = useRef(0);

  return (
    <div
      className="search-bar"
      onClick={() => toggleSearch()}
      title={SEARCH_BUTTON_TITLE}
    >
      <SearchIcon />
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
          // if (key === "Enter" && firstResult?.ref) {
          //   const bestMatchElement = menuRef.current?.querySelector(
          //     ".list li:first-child figure"
          //   );
          //   (bestMatchElement as HTMLElement)?.click();
          // }
        }}
        placeholder={SEARCH_BUTTON_TITLE}
        enterKeyHint="search"
        inputMode="search"
        type="search"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
    </div>
  );
};

export default SearchBar;
