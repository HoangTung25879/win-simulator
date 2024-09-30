"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import "./FileEntry.scss";
import {
  FileStat,
  getCachedIconUrl,
  getModifiedTime,
} from "../FileManager/functions";
import Icon from "../../Common/Icon/Icon";
import useFileInfo from "./useFileInfo";
import { FocusEntryFunctions } from "./useFocusableEntries";
import { SelectionRect } from "../FileManager/Selection/useSelection";
import { basename, dirname, extname, join } from "path";
import { isSelectionIntersecting } from "../FileManager/Selection/function";
import {
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  ICON_PATH,
  IMAGE_FILE_EXTENSIONS,
  MOUNTABLE_EXTENSIONS,
  ONE_TIME_PASSIVE_EVENT,
  PREVENT_SCROLL,
  SHORTCUT_EXTENSION,
  SYSTEM_FONT,
  TRANSITIONS_IN_MS,
  USER_ICON_PATH,
  VIDEO_FILE_EXTENSIONS,
} from "@/lib/constants";
import { FileActions } from "./useFolder";
import { FileManagerViewNames } from "./useFileKeyboardShortcuts";
import { useProcesses } from "@/contexts/process";
import { useIsVisible } from "@/hooks/useIsVisible";
import useFile from "./useFile";
import { useFileSystem } from "@/contexts/fileSystem";
import {
  bufferToUrl,
  getExtension,
  getFormattedSize,
  isYouTubeUrl,
} from "@/lib/utils";
import { truncateName } from "./functions";
import sizes from "@/lib/sizes";
import extensions from "../extensions";
import { UNKNOWN_SIZE } from "@/contexts/fileSystem/core";
import dayjs from "dayjs";
import useDoubleClick from "@/hooks/useDoubleClick";
import clsx from "clsx";
import useFileContextMenu from "./useFileContextMenu";
import RenameBox from "./RenameBox";
import { spotlightEffect } from "@/lib/spotlightEffect";
import { DownIcon } from "../../FileExplorer/Navigation/Icons";
import FileManager from "../FileManager/FileManager";
import useFileDrop from "./useFileDrop";
import { toCanvas } from "html-to-image";
import colors from "@/lib/colors";
import { FileEntryIconSize } from "./constants";
import SubIcons from "../../Common/Icon/SubIcons";

type FileEntryProps = {
  id?: string;
  fileActions: FileActions;
  fileManagerId?: string;
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>;
  focusFunctions: FocusEntryFunctions;
  focusedEntries: string[];
  hasNewFolderIcon?: boolean;
  hideShortcutIcon?: boolean;
  isDesktop?: boolean;
  isHeading?: boolean;
  isLoadingFileManager: boolean;
  loadIconImmediately?: boolean;
  name: string;
  path: string;
  readOnly?: boolean;
  renaming: boolean;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
  stats: FileStat;
  view: FileManagerViewNames;
  selectionRect?: SelectionRect;
};

const focusing: string[] = [];

const cacheQueue: (() => Promise<void>)[] = [];

const FileEntry = ({
  id,
  fileActions,
  fileManagerId,
  fileManagerRef,
  focusedEntries,
  focusFunctions,
  hideShortcutIcon,
  isDesktop,
  isHeading,
  isLoadingFileManager,
  loadIconImmediately,
  name,
  path,
  readOnly,
  renaming,
  selectionRect,
  setRenaming,
  stats,
  hasNewFolderIcon,
  view,
}: FileEntryProps) => {
  const { blurEntry, focusEntry } = focusFunctions;
  const {
    url: changeUrl,
    processes: { [id || ""]: process },
  } = useProcesses();
  const { textColor } = process || {};
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isVisible = useIsVisible(buttonRef, fileManagerRef, isDesktop);
  const [{ comment, getIcon, icon, pid, subIcons, url }, setInfo] = useFileInfo(
    path,
    stats.isDirectory(),
    hasNewFolderIcon,
    isDesktop || isVisible,
  );
  const fileContextMenu = useFileContextMenu(
    url,
    pid,
    path,
    setRenaming,
    fileActions,
    focusFunctions,
    focusedEntries,
    stats,
    fileManagerId,
    readOnly,
  );
  const openFile = useFile(url, path);
  const {
    createPath,
    exists,
    fs,
    mkdirRecursive,
    pasteList,
    stat,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const [tooltip, setTooltip] = useState<string>();
  const [showInFileManager, setShowInFileManager] = useState(false);
  const iconRef = useRef<HTMLImageElement | null>(null);
  const isIconCached = useRef(false);
  const isDynamicIconLoaded = useRef(false);
  const getIconAbortController = useRef<AbortController>();
  const fileName = basename(path);
  const urlExt = getExtension(url);
  const isYTUrl = useMemo(() => isYouTubeUrl(url), [url]);
  const isDynamicIcon = useMemo(
    () =>
      IMAGE_FILE_EXTENSIONS.has(urlExt) ||
      VIDEO_FILE_EXTENSIONS.has(urlExt) ||
      isYTUrl,
    [isYTUrl, urlExt],
  );
  const extension = useMemo(() => getExtension(path), [path]);
  const isShortcut = useMemo(
    () => extension === SHORTCUT_EXTENSION,
    [extension],
  );
  const directory = isShortcut ? url : path;
  const isOnlyFocusedEntry =
    focusedEntries.length === 1 && focusedEntries[0] === fileName;
  const isListView = view === "list";
  const openInFileExplorer = pid === "FileExplorer";

  const fileDrop = useFileDrop({
    callback: async (fileDropName, data) => {
      if (!focusedEntries.includes(fileName)) {
        const uniqueName = await createPath(fileDropName, directory, data);
        if (uniqueName) {
          updateFolder(directory, uniqueName);
          return uniqueName;
        }
      }
      return "";
    },
    directory,
  });

  const truncatedName = useMemo(
    () =>
      truncateName(
        name,
        sizes.fileEntry.fontSize,
        SYSTEM_FONT,
        sizes.fileEntry[
          isListView ? "maxListTextDisplayWidth" : "maxIconTextDisplayWidth"
        ],
        !isDesktop,
      ),
    [isDesktop, isListView, name, sizes.fileEntry],
  );

  const createTooltip = useCallback(async (): Promise<string> => {
    if (stats.isDirectory()) return "";
    if (isShortcut) {
      if (comment) return comment;
      if (url) {
        if (url.startsWith("http:") || url.startsWith("https:")) {
          return decodeURIComponent(url);
        }
        const directoryPath = dirname(url);
        return `Location: ${basename(url, extname(url))}${
          !directoryPath || directoryPath === "." ? "" : ` (${dirname(url)})`
        }`;
      }
      return "";
    }
    const type =
      extensions[extension]?.type ||
      `${extension.toUpperCase().replace(".", "")} File`;
    const fullStats = stats.size === UNKNOWN_SIZE ? await stat(path) : stats;
    const { size: sizeInBytes } = fullStats;
    const modifiedTime = getModifiedTime(path, fullStats);
    const size = getFormattedSize(sizeInBytes);
    const toolTip = `Type: ${type}${
      size === "-1 bytes" ? "" : `\nSize: ${size}`
    }`;
    const date = new Date(modifiedTime).toISOString().slice(0, 10);
    const time = dayjs(modifiedTime).format("h:mm A");
    const dateModified = `${date} ${time}`;
    return `${toolTip}\nDate modified: ${dateModified}`;
  }, [comment, extension, isShortcut, path, stat, stats, url]);

  const clickHandler = useCallback(() => {
    if (
      openInFileExplorer &&
      fileManagerId &&
      // !window.globalKeyStates?.ctrlKey &&
      !MOUNTABLE_EXTENSIONS.has(urlExt)
    ) {
      changeUrl(fileManagerId, url);
      blurEntry();
    } else if (openInFileExplorer && isListView) {
      setShowInFileManager((currentState) => !currentState);
    } else {
      openFile(pid, isDynamicIcon ? undefined : icon);
    }
  }, [
    blurEntry,
    changeUrl,
    fileManagerId,
    icon,
    isDynamicIcon,
    isListView,
    openFile,
    openInFileExplorer,
    pid,
    url,
    urlExt,
  ]);

  useEffect(() => {
    if (!isLoadingFileManager && isVisible && !isIconCached.current && fs) {
      const updateIcon = async (): Promise<void> => {
        const cachedIconPath = join(
          ICON_CACHE,
          `${path}${ICON_CACHE_EXTENSION}`,
        );
        if (icon.startsWith("blob:") || icon.startsWith("data:")) {
          if (icon.startsWith("data:image/jpeg;base64,")) return;
          isIconCached.current = true;
          if (
            urlExt !== ".ico" &&
            !url.startsWith(ICON_PATH) &&
            !url.startsWith(USER_ICON_PATH) &&
            !(await exists(cachedIconPath)) &&
            iconRef.current instanceof HTMLImageElement
          ) {
            const cacheIcon = async (
              retryCanvasDraw?: boolean,
            ): Promise<void> => {
              if (!(iconRef.current instanceof HTMLImageElement)) return;
              const nextQueueItem = (): Promise<void> => {
                cacheQueue.shift();
                return cacheQueue[0]?.();
              };
              let generatedIcon = "";
              if (
                iconRef.current.currentSrc.startsWith("data:image/gif;base64,")
              ) {
                generatedIcon = iconRef.current.currentSrc;
              } else {
                const {
                  clientHeight,
                  clientWidth,
                  naturalHeight,
                  naturalWidth,
                } = iconRef.current;
                const naturalAspectRatio = naturalWidth / naturalHeight;
                const clientAspectRatio = clientWidth / clientHeight;
                let height: number | undefined;
                let width: number | undefined;
                if (naturalAspectRatio !== clientAspectRatio) {
                  if (naturalWidth > naturalHeight) {
                    height = clientHeight / naturalAspectRatio;
                  } else {
                    width = clientWidth * naturalAspectRatio;
                  }
                }
                let iconCanvas: HTMLCanvasElement | undefined;
                try {
                  iconCanvas = await toCanvas(iconRef.current, {
                    height,
                    skipAutoScale: true,
                    style: {
                      objectPosition: height
                        ? "top"
                        : width
                          ? "left"
                          : undefined,
                    },
                    width,
                    //* Fix nextjs image issue https://github.com/bubkoo/html-to-image/issues/377
                    includeQueryParams: true,
                  });
                } catch (error) {
                  // Ignore failure to capture
                  console.error(error);
                }
                if (iconCanvas && retryCanvasDraw) {
                  generatedIcon = iconCanvas.toDataURL("image/png");
                } else {
                  setTimeout(() => cacheIcon(true), TRANSITIONS_IN_MS.WINDOW);
                }
              }
              if (generatedIcon) {
                cacheQueue.push(async () => {
                  const baseCachedPath = dirname(cachedIconPath);
                  await mkdirRecursive(baseCachedPath);
                  const cachedIcon = Buffer.from(
                    generatedIcon.replace(/data:.*;base64,/, ""),
                    "base64",
                  );
                  await writeFile(cachedIconPath, cachedIcon, true);
                  setInfo((info) => ({
                    ...info,
                    icon: bufferToUrl(cachedIcon),
                  }));
                  updateFolder(baseCachedPath, basename(cachedIconPath));
                  return nextQueueItem();
                });
              }
              if (cacheQueue.length === 1) await cacheQueue[0]();
            };
            if (iconRef.current.complete) {
              cacheIcon();
            } else {
              iconRef.current.addEventListener(
                "load",
                () => cacheIcon(),
                ONE_TIME_PASSIVE_EVENT,
              );
            }
          }
        } else if (!isShortcut || typeof getIcon === "function" || isYTUrl) {
          const cachedIconUrl = await getCachedIconUrl(fs, cachedIconPath);
          if (cachedIconUrl) {
            isIconCached.current = true;
            setInfo((info) => ({ ...info, icon: cachedIconUrl }));
          } else if (
            !isDynamicIconLoaded.current &&
            buttonRef.current &&
            typeof getIcon === "function"
          ) {
            getIconAbortController.current = new AbortController();
            await getIcon(getIconAbortController.current.signal);
            isDynamicIconLoaded.current =
              !getIconAbortController.current.signal.aborted;
          }
        }
      };
      updateIcon();
    }
    if (!isVisible && getIconAbortController.current) {
      getIconAbortController.current.abort();
    }
  }, [
    exists,
    fs,
    getIcon,
    icon,
    isLoadingFileManager,
    isShortcut,
    isVisible,
    isYTUrl,
    mkdirRecursive,
    path,
    setInfo,
    updateFolder,
    url,
    urlExt,
    writeFile,
  ]);

  useEffect(
    () => () => {
      try {
        getIconAbortController.current?.abort();
      } catch {
        // Failed to abort getIcon
      }
    },
    [],
  );

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

  const onDoubleClick = useDoubleClick(clickHandler);

  return (
    <>
      <motion.button
        ref={buttonRef}
        style={
          {
            "--file-entry-text": textColor || colors.fileEntry.text,
          } as React.CSSProperties
        }
        onMouseOver={() => createTooltip().then(setTooltip)}
        title={tooltip}
        aria-label={name}
        className="file-entry"
        onClick={isListView ? clickHandler : onDoubleClick}
        {...(openInFileExplorer && fileDrop)}
        {...(isListView && {
          animate: { opacity: 1 },
          initial: { opacity: 0 },
          transition: { duration: 0.15 },
        })}
        {...fileContextMenu}
      >
        <figure
          ref={(node: HTMLElement) => {
            if (isListView) spotlightEffect(node);
          }}
          className={clsx(renaming ? "pointer-events-[all" : "")}
        >
          <Icon
            ref={iconRef}
            src={icon}
            alt={name}
            eager={loadIconImmediately}
            moving={pasteList[path] === "move"}
            {...FileEntryIconSize[view]}
          />
          <SubIcons
            icon={icon}
            isDesktop={isDesktop}
            name={name}
            showShortcutIcon={Boolean(hideShortcutIcon || stats.systemShortcut)}
            subIcons={subIcons}
            view={view}
          />
          {renaming ? (
            <RenameBox
              isDesktop={isDesktop}
              name={name}
              path={path}
              renameFile={(originPath, newName) => {
                fileActions.renameFile(originPath, newName);
                setRenaming("");
              }}
              setRenaming={setRenaming}
            />
          ) : (
            <figcaption
              {...(isHeading && {
                "aria-level": 1,
                role: "heading",
              })}
              className="pointer-events-none"
            >
              {!isOnlyFocusedEntry || name.length === truncatedName.length
                ? truncatedName
                : name}
            </figcaption>
          )}
          {isListView && openInFileExplorer && (
            <DownIcon flip={showInFileManager} />
          )}
        </figure>
      </motion.button>
      {showInFileManager && (
        <FileManager
          url={url}
          view="list"
          hideFolders
          hideLoading
          hideShortcutIcons
          loadIconsImmediately
          readOnly
          skipFsWatcher
          skipSorting
        />
      )}
    </>
  );
};

export default FileEntry;
