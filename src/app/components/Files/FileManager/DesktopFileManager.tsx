"use client";

import { useFileSystem } from "@/contexts/fileSystem";
import useFolder from "@/hooks/useFolder";
import { useMemo, useRef, useState } from "react";
import "./FileManager.scss";
import FileEntry from "../FileEntry/FileEntry";
import { basename, join } from "path";
import {
  DESKTOP_GRID_ID,
  FOCUSABLE_ELEMENT,
  SHORTCUT_EXTENSION,
} from "@/lib/constants";
import useFocusableEntries from "../FileEntry/useFocusableEntries";
import clsx from "clsx";
import useSelection from "./Selection/useSelection";
import SelectionArea from "./Selection/SelectionArea";
import useDraggableEntries from "../FileEntry/useDraggableEntries";

type DesktopFileManagerProps = {
  url: string;
};

const allowMoving = true;

const DesktopFileManager = ({ url }: DesktopFileManagerProps) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [renaming, setRenaming] = useState("");
  const [mounted, setMounted] = useState<boolean>(false);
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { focusedEntries, focusableEntry, ...focusFunctions } =
    useFocusableEntries(fileManagerRef);
  const { lstat, rootFs } = useFileSystem();
  const { files, isLoading } = useFolder(url, setRenaming, focusFunctions, {});
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef, focusedEntries, focusFunctions);
  const draggableEntry = useDraggableEntries(
    focusedEntries,
    focusFunctions,
    fileManagerRef,
    isSelecting,
    allowMoving,
  );

  const fileKeys = useMemo(() => Object.keys(files), [files]);
  return (
    <ol
      id={DESKTOP_GRID_ID}
      ref={fileManagerRef}
      className={clsx(
        "desktop-file-manager h-[calc(100%-theme(spacing[taskbar-height]))]",
        isSelecting ? "pointer-events-auto" : "",
      )}
      {...selectionEvents}
      {...FOCUSABLE_ELEMENT}
    >
      {isSelecting && <SelectionArea style={selectionStyling} />}
      {fileKeys.map((file) => {
        const { className, ...rest } = focusableEntry(file);
        return (
          <li
            key={file}
            className={clsx("list-desktop-file", className)}
            {...draggableEntry(url, file, renaming === file)}
            {...rest}
          >
            <FileEntry
              fileManagerRef={fileManagerRef}
              focusFunctions={focusFunctions}
              focusedEntries={focusedEntries}
              selectionRect={selectionRect}
              name={basename(file, SHORTCUT_EXTENSION)}
              path={join(url, file)}
              stats={files[file]}
            />
          </li>
        );
      })}
    </ol>
  );
};

export default DesktopFileManager;
