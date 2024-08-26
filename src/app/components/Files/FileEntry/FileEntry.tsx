"use client";

import { useLayoutEffect, useRef } from "react";
import "./FileEntry.scss";
import { FileStat } from "../FileManager/functions";
import Icon from "../../Icon/Icon";
import useFileInfo from "@/hooks/useFileInfo";
import { FocusEntryFunctions } from "./useFocusableEntries";
import { SelectionRect } from "../FileManager/Selection/useSelection";
import { basename } from "path";
import { isSelectionIntersecting } from "../FileManager/Selection/function";
import { PREVENT_SCROLL } from "@/lib/constants";

type FileEntryProps = {
  name: string;
  path: string;
  stats: FileStat;
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>;
  focusFunctions: FocusEntryFunctions;
  focusedEntries: string[];
  selectionRect?: SelectionRect;
  isDesktop?: boolean;
};

//Desktop
// fileActions{
//   archiveFiles
//   deleteLocalPath
//   downloadFiles
//   extractFiles
//   newShorcut
//   renameFile
// }

// isDesktop true
// isHeading true
// loadIconsImmediately true
// name "Public"
// path "/Users/Public/Desktop/Public.url"
// view icon

const focusing: string[] = [];

const FileEntry = ({
  name,
  path,
  stats,
  fileManagerRef,
  focusFunctions,
  focusedEntries,
  isDesktop,
  selectionRect,
}: FileEntryProps) => {
  const { blurEntry, focusEntry } = focusFunctions;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [{ comment, getIcon, icon, pid, subIcons, url }, setInfo] = useFileInfo(
    path,
    stats.isDirectory(),
    false,
    isDesktop,
  );
  const iconRef = useRef<HTMLImageElement | null>(null);
  const fileName = basename(path);
  // console.log("FileEntry", {
  //   comment,
  //   getIcon,
  //   icon,
  //   pid,
  //   subIcons,
  //   url,
  //   name,
  //   path,
  //   stats,
  // });

  useLayoutEffect(() => {
    if (buttonRef.current && fileManagerRef.current) {
      const inFocusedEntries = focusedEntries.includes(fileName);
      const inFocusing = focusing.includes(fileName);
      const isFocused = inFocusedEntries || inFocusing;

      if (inFocusedEntries && inFocusing) {
        focusing.splice(focusing.indexOf(fileName), 1);
      }

      if (selectionRect) {
        const selected = isSelectionIntersecting(
          buttonRef.current.getBoundingClientRect(),
          fileManagerRef.current.getBoundingClientRect(),
          selectionRect,
          fileManagerRef.current.scrollTop,
        );

        if (selected && !isFocused) {
          focusing.push(fileName);
          focusEntry(fileName);
          buttonRef.current.focus(PREVENT_SCROLL);
        } else if (!selected && isFocused) {
          blurEntry(fileName);
        }
      } else if (
        isFocused &&
        buttonRef.current !== document.activeElement &&
        focusedEntries.length === 1 &&
        !buttonRef.current.contains(document.activeElement)
      ) {
        buttonRef.current.focus(PREVENT_SCROLL);
      }
    }
  }, [
    blurEntry,
    fileManagerRef,
    fileName,
    focusEntry,
    focusedEntries,
    selectionRect,
  ]);

  return (
    <button aria-label={name} ref={buttonRef} className="file-entry">
      <figure>
        <Icon ref={iconRef} imgSize={48} src={icon} alt={name} eager />
        <figcaption className="pointer-events-none">{name}</figcaption>
      </figure>
    </button>
  );
};

export default FileEntry;
