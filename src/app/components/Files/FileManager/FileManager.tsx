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
  MOUNTABLE_EXTENSIONS,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
} from "@/lib/constants";
import useFocusableEntries from "../FileEntry/useFocusableEntries";
import clsx from "clsx";
import useSelection from "./Selection/useSelection";
import SelectionArea from "./Selection/SelectionArea";
import useDraggableEntries from "../FileEntry/useDraggableEntries";
import useFolderContextMenu from "../FileEntry/useFolderContextMenu";
import useFileKeyboardShortcuts, {
  FileManagerViewNames,
} from "../FileEntry/useFileKeyboardShortcuts";
import { requestPermission } from "@/contexts/fileSystem/utils";
import { getExtension, haltEvent } from "@/lib/utils";
import Empty from "./Empty";
import useFileDrop from "../FileEntry/useFileDrop";
import StatusBar from "./StatusBar";
import { useSession } from "@/contexts/session";
import Loading from "../../Common/Loading/Loading";

type FileManagerProps = {
  allowMovingDraggableEntries?: boolean;
  hideFolders?: boolean;
  hideLoading?: boolean;
  hideScrolling?: boolean;
  hideShortcutIcons?: boolean;
  id?: string;
  isDesktop?: boolean;
  isStartMenu?: boolean;
  isFileExplorer?: boolean;
  loadIconsImmediately?: boolean;
  readOnly?: boolean;
  skipFsWatcher?: boolean;
  skipSorting?: boolean;
  url: string;
  view: FileManagerViewNames;
};

const FileManager = ({
  allowMovingDraggableEntries,
  hideFolders,
  hideLoading,
  hideScrolling,
  hideShortcutIcons,
  id,
  isDesktop,
  isStartMenu,
  isFileExplorer,
  loadIconsImmediately,
  readOnly,
  skipFsWatcher,
  skipSorting,
  url,
  view,
}: FileManagerProps) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [renaming, setRenaming] = useState("");
  const [mounted, setMounted] = useState<boolean>(false);
  const [permission, setPermission] = useState<PermissionState>("prompt");
  const fileManagerRef = useRef<HTMLOListElement | null>(null);
  const { focusedEntries, focusableEntry, ...focusFunctions } =
    useFocusableEntries(fileManagerRef);
  const { fileActions, files, folderActions, isLoading, updateFiles } =
    useFolder(url, setRenaming, focusFunctions, {
      hideFolders,
      hideLoading,
      skipFsWatcher,
      skipSorting,
    });
  const { hideDesktopIcon } = useSession();
  const { lstat, mountFs, rootFs } = useFileSystem();
  const { isSelecting, selectionRect, selectionStyling, selectionEvents } =
    useSelection(fileManagerRef, focusedEntries, focusFunctions);
  const draggableEntry = useDraggableEntries(
    focusedEntries,
    focusFunctions,
    fileManagerRef,
    isSelecting,
    allowMovingDraggableEntries,
  );
  const fileDrop = useFileDrop({
    callback: folderActions.newPath,
    directory: url,
    updatePositions: allowMovingDraggableEntries,
  });
  const folderContextMenu = useFolderContextMenu(
    url,
    folderActions,
    isDesktop,
    isStartMenu,
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
    id,
    "icon",
  );
  const requestingPermissions = useRef(false);
  const fileKeys = useMemo(() => Object.keys(files), [files]);
  const loading = (!hideLoading && isLoading) || url !== currentUrl;
  const isEmptyFolder =
    !isDesktop &&
    !isStartMenu &&
    !loading &&
    view === "icon" &&
    fileKeys.length === 0;

  const onKeyDown = useMemo(
    () => (renaming === "" ? keyShortcuts() : undefined),
    [keyShortcuts, renaming],
  );

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
    if (!mounted && MOUNTABLE_EXTENSIONS.has(getExtension(url))) {
      const mountUrl = async (): Promise<void> => {
        if (!(await lstat(url)).isDirectory()) {
          setMounted((currentlyMounted) => {
            if (!currentlyMounted) {
              mountFs(url)
                .then(() => setTimeout(updateFiles, 100))
                .catch(() => {
                  // Ignore race-condtion failures
                });
            }
            return true;
          });
        }
      };
      mountUrl();
    }
  }, [lstat, mountFs, mounted, updateFiles, url]);

  useEffect(() => {
    if (url !== currentUrl) {
      folderActions.resetFiles();
      setCurrentUrl(url);
      setPermission("denied");
    }
  }, [currentUrl, folderActions, url]);

  useEffect(() => {
    if (!loading && !isDesktop && !isStartMenu) {
      fileManagerRef.current?.focus(PREVENT_SCROLL);
    }
  }, [isDesktop, isStartMenu, loading]);

  return (
    <>
      {loading ? (
        <Loading className={isFileExplorer ? "file-explorer-loading" : ""} />
      ) : (
        <>
          {isEmptyFolder && <Empty />}
          <ol
            id={isDesktop ? DESKTOP_GRID_ID : undefined}
            ref={fileManagerRef}
            className={clsx(
              "file-manager",
              view === "icon" && "icon-view",
              view === "list" && "list-view",
              isDesktop && "desktop-view",
              isStartMenu && "start-menu-view",
              isFileExplorer && "file-explorer-view",
              !hideScrolling && "--scrollable",
              isSelecting ? "pointer-events-auto" : "",
              !isEmptyFolder && !hideScrolling ? "" : "overflow-hidden",
            )}
            onKeyDown={onKeyDown}
            {...(readOnly
              ? { onContextMenu: haltEvent }
              : {
                  ...fileDrop,
                  ...folderContextMenu,
                  ...selectionEvents,
                })}
            {...FOCUSABLE_ELEMENT}
          >
            {isSelecting && <SelectionArea style={selectionStyling} />}
            {fileKeys.map((file) => {
              const { className, ...rest } = focusableEntry(file);
              return (
                <li
                  key={file}
                  className={clsx(
                    className,
                    isLoading && "!invisible",
                    "list-file",
                    isSelecting && "selecting",
                    hideDesktopIcon && isDesktop && "hide-desktop-icon",
                  )}
                  {...(!readOnly &&
                    draggableEntry(url, file, renaming === file))}
                  {...(renaming === "" && { onKeyDown: keyShortcuts(file) })}
                  {...rest}
                >
                  <FileEntry
                    id={id}
                    fileActions={fileActions}
                    fileManagerId={id}
                    fileManagerRef={fileManagerRef}
                    focusFunctions={focusFunctions}
                    focusedEntries={focusedEntries}
                    hasNewFolderIcon={isStartMenu}
                    hideShortcutIcon={hideShortcutIcons}
                    isDesktop={isDesktop}
                    isHeading={isDesktop && files[file].systemShortcut}
                    isLoadingFileManager={isLoading}
                    loadIconImmediately={loadIconsImmediately}
                    name={basename(file, SHORTCUT_EXTENSION)}
                    path={join(url, file)}
                    readOnly={readOnly}
                    renaming={renaming === file}
                    selectionRect={selectionRect}
                    setRenaming={setRenaming}
                    stats={files[file]}
                    view={view}
                  />
                </li>
              );
            })}
          </ol>
        </>
      )}
      {isFileExplorer && (
        <StatusBar
          id={id}
          count={loading ? 0 : fileKeys.length}
          directory={url}
          fileDrop={fileDrop}
          selected={focusedEntries}
        />
      )}
    </>
  );
};

export default FileManager;
