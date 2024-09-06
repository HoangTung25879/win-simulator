"use client";

import { useFileSystem } from "@/contexts/fileSystem";
import useFolder from "../FileEntry/useFolder";
import { useEffect, useMemo, useRef, useState } from "react";
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
import useFolderContextMenu from "../FileEntry/useFolderContextMenu";
import useFileKeyboardShortcuts from "../FileEntry/useFileKeyboardShortcuts";
import { requestPermission } from "@/contexts/fileSystem/utils";

type DesktopFileManagerProps = {
  url: string;
};

const allowMoving = true;
const folderFlags = {
  hideFolders: false,
  hideLoading: true,
  skipFsWatcher: false,
  skipSorting: false,
};

const DesktopFileManager = ({ url }: DesktopFileManagerProps) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [renaming, setRenaming] = useState("");
  const [mounted, setMounted] = useState<boolean>(false);
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { focusedEntries, focusableEntry, ...focusFunctions } =
    useFocusableEntries(fileManagerRef);
  const { fileActions, files, folderActions, isLoading, updateFiles } =
    useFolder(url, setRenaming, focusFunctions, folderFlags);
  const { lstat, rootFs } = useFileSystem();
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef, focusedEntries, focusFunctions);
  const draggableEntry = useDraggableEntries(
    focusedEntries,
    focusFunctions,
    fileManagerRef,
    isSelecting,
    allowMoving,
  );
  const folderContextMenu = useFolderContextMenu(
    url,
    folderActions,
    true,
    false,
  );
  const keyShortcuts = useFileKeyboardShortcuts(
    files,
    url,
    focusedEntries,
    setRenaming,
    focusFunctions,
    folderActions,
    updateFiles,
    fileManagerRef,
    undefined,
    "icon",
  );
  const [permission, setPermission] = useState<PermissionState>("prompt");
  const requestingPermissions = useRef(false);
  const onKeyDown = useMemo(
    () => (renaming === "" ? keyShortcuts() : undefined),
    [keyShortcuts, renaming],
  );
  const fileKeys = useMemo(() => Object.keys(files), [files]);

  useEffect(() => {
    if (
      !requestingPermissions.current &&
      permission !== "granted" &&
      rootFs?.mntMap[currentUrl]?.getName() === "FileSystemAccess"
    ) {
      requestingPermissions.current = true;
      requestPermission(currentUrl)
        .then((permissions) => {
          const isGranted = permissions === "granted";

          if (!permissions || isGranted) {
            setPermission("granted");

            if (isGranted) updateFiles();
          }
        })
        .catch((error: Error) => {
          if (error?.message === "Permission already granted") {
            setPermission("granted");
          }
        })
        .finally(() => {
          requestingPermissions.current = false;
        });
    }
  }, [currentUrl, permission, rootFs?.mntMap, updateFiles]);

  useEffect(() => {
    if (url !== currentUrl) {
      folderActions.resetFiles();
      setCurrentUrl(url);
      setPermission("denied");
    }
  }, [currentUrl, folderActions, url]);

  return (
    <ol
      id={DESKTOP_GRID_ID}
      ref={fileManagerRef}
      className={clsx(
        "desktop-file-manager",
        isSelecting ? "pointer-events-auto" : "",
      )}
      {...selectionEvents}
      {...folderContextMenu}
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
              isDesktop
              isHeading={files[file].systemShortcut}
              fileActions={fileActions}
              fileManagerRef={fileManagerRef}
              focusFunctions={focusFunctions}
              focusedEntries={focusedEntries}
              selectionRect={selectionRect}
              name={basename(file, SHORTCUT_EXTENSION)}
              path={join(url, file)}
              stats={files[file]}
              renaming={renaming === file}
              setRenaming={setRenaming}
              view="icon"
              isLoadingFileManager={false}
              loadIconImmediately
            />
          </li>
        );
      })}
    </ol>
  );
};

export default DesktopFileManager;
