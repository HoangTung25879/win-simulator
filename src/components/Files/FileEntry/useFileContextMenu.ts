import {
  ContextMenuCapture,
  MenuItem,
} from "@/contexts/menu/useMenuContextState";
import { FileStat, getProcessByFileExtension } from "../FileManager/functions";
import { FocusEntryFunctions } from "./useFocusableEntries";
import { FileActions } from "./useFolder";
import { useProcesses } from "@/contexts/process";
import { useProcessesRef } from "@/contexts/process/useProcessesRef";
import { useSession } from "@/contexts/session";
import { basename, dirname, join } from "path";
import useFile from "./useFile";
import { useFileSystem } from "@/contexts/fileSystem";
import { useMenu } from "@/contexts/menu";
import { useCallback, useMemo } from "react";
import {
  CURSOR_FILE_EXTENSIONS,
  DESKTOP_PATH,
  IMAGE_FILE_EXTENSIONS,
  MENU_SEPERATOR,
  MOUNTABLE_EXTENSIONS,
  PROCESS_DELIMITER,
  ROOT_SHORTCUT,
  SHORTCUT_EXTENSION,
  VIDEO_FILE_EXTENSIONS,
} from "@/lib/constants";
import { getExtension } from "@/lib/utils";
import extensions from "../extensions";
import { isMountedFolder } from "@/contexts/fileSystem/utils";
import processDirectory, { AllProcess } from "@/contexts/process/directory";

const useFileContextMenu = (
  url: string,
  pid: string,
  path: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  {
    // archiveFiles,
    deleteLocalPath,
    // downloadFiles,
    // extractFiles,
    newShortcut,
  }: FileActions,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  focusedEntries: string[],
  stats: FileStat,
  fileManagerId?: string,
  readOnly?: boolean,
): ContextMenuCapture => {
  const { minimize, open, url: changeUrl } = useProcesses();
  const processesRef = useProcessesRef();
  const { setCursor, setForegroundId, updateRecentFiles, setWallpaper } =
    useSession();
  const baseName = basename(path);
  const isFocusedEntry = focusedEntries.includes(baseName);
  const openFile = useFile(url, path);
  const {
    copyEntries,
    createPath,
    lstat,
    mapFs,
    moveEntries,
    readFile,
    rootFs,
    unMapFs,
    updateFolder,
  } = useFileSystem();
  const { contextMenu } = useMenu();
  const urlExtension = getExtension(url);
  const pathExtension = getExtension(path);

  const { onContextMenuCapture, ...contextMenuHandlers } = useMemo(() => {
    return contextMenu?.(() => {
      const { process: extensionProcesses = [] } =
        urlExtension in extensions ? extensions[urlExtension] : {};
      const openWith = extensionProcesses.filter((process) => process !== pid);
      const openWithFiltered = openWith.filter((id) => id !== pid);
      const isSingleSelection = focusedEntries.length === 1;
      const absoluteEntries = (): string[] =>
        isSingleSelection || !isFocusedEntry
          ? [path]
          : [
              ...new Set([
                path,
                ...focusedEntries.map((entry) => join(dirname(path), entry)),
              ]),
            ];
      const menuItems: MenuItem[] = [];
      const isShortcut = pathExtension === SHORTCUT_EXTENSION;
      const remoteMount = rootFs?.mountList.some(
        (mountPath) =>
          mountPath === path && isMountedFolder(rootFs?.mntMap[mountPath]),
      );
      if (!readOnly && !remoteMount) {
        const defaultProcess = getProcessByFileExtension(urlExtension);
        menuItems.push(
          { action: () => moveEntries(absoluteEntries()), label: "Cut" },
          { action: () => copyEntries(absoluteEntries()), label: "Copy" },
          MENU_SEPERATOR,
        );

        if (defaultProcess || isShortcut || (!pathExtension && !urlExtension)) {
          menuItems.push({
            action: () =>
              absoluteEntries().forEach(async (entry) => {
                const shortcutProcess =
                  defaultProcess && !(await lstat(entry)).isDirectory()
                    ? defaultProcess
                    : "FileExplorer";

                newShortcut(entry, shortcutProcess);
              }),
            label: "Create shortcut",
          });
        }

        menuItems.push(
          {
            action: () =>
              absoluteEntries().forEach((entry) => deleteLocalPath(entry)),
            label: "Delete",
          },
          { action: () => setRenaming(baseName), label: "Rename" },
          // MENU_SEPERATOR,
          // {
          //   action: () => {
          //     const activePid = Object.keys(processesRef.current).find(
          //       (p) => p === `Properties${PROCESS_DELIMITER}${url}`,
          //     );
          //     if (activePid) {
          //       if (processesRef.current[activePid].minimized) {
          //         minimize(activePid);
          //       }
          //       setForegroundId(activePid);
          //     } else {
          //       open(AllProcess.Properties, {
          //         shortcutPath: isShortcut ? path : undefined,
          //         url: isShortcut ? path : url,
          //       });
          //     }
          //   },
          //   label: "Properties",
          // },
        );

        if (path) {
          if (path === join(DESKTOP_PATH, ROOT_SHORTCUT)) {
            //Map directory
          } else {
            //Convert to
          }
        }
        menuItems.unshift(MENU_SEPERATOR);
      }
      const hasBackgroundVideoExtension =
        VIDEO_FILE_EXTENSIONS.has(urlExtension);
      if (
        hasBackgroundVideoExtension ||
        (IMAGE_FILE_EXTENSIONS.has(urlExtension) &&
          !CURSOR_FILE_EXTENSIONS.has(urlExtension) &&
          urlExtension !== ".svg")
      ) {
        menuItems.unshift({
          label: "Set as background",
          ...(hasBackgroundVideoExtension
            ? {
                action: () => setWallpaper(url),
              }
            : {
                menu: [
                  {
                    action: () => setWallpaper(url, "fill"),
                    label: "Fill",
                  },
                  {
                    action: () => setWallpaper(url, "fit"),
                    label: "Fit",
                  },
                  {
                    action: () => setWallpaper(url, "stretch"),
                    label: "Stretch",
                  },
                  {
                    action: () => setWallpaper(url, "tile"),
                    label: "Tile",
                  },
                  {
                    action: () => setWallpaper(url, "center"),
                    label: "Center",
                  },
                ],
              }),
        });
      }

      if (pid) {
        const { icon: pidIcon } = processDirectory[pid] || {};

        if (
          isShortcut &&
          url &&
          url !== "/" &&
          !url.startsWith("http:") &&
          !url.startsWith("https:") &&
          !url.startsWith("nostr:")
        ) {
          const isFolder = urlExtension === "" || urlExtension === ".zip";

          menuItems.unshift({
            action: () =>
              open(AllProcess.FileExplorer, { url: dirname(url) }, ""),
            label: `Open ${isFolder ? "folder" : "file"} location`,
          });
        }

        if (
          fileManagerId &&
          pid === "FileExplorer" &&
          !MOUNTABLE_EXTENSIONS.has(urlExtension)
        ) {
          menuItems.unshift({
            action: () => {
              openFile(pid, pidIcon);
            },
            label: "Open in new window",
          });
        }

        menuItems.unshift({
          action: () => {
            if (
              pid === "FileExplorer" &&
              fileManagerId &&
              !MOUNTABLE_EXTENSIONS.has(urlExtension)
            ) {
              changeUrl(fileManagerId, url);
            } else {
              openFile(pid, pidIcon);
            }
          },
          icon: pidIcon,
          label: "Open",
          primary: true,
        });
      }
      return menuItems[0] === MENU_SEPERATOR ? menuItems.slice(1) : menuItems;
    });
  }, [
    // archiveFiles,
    baseName,
    changeUrl,
    contextMenu,
    copyEntries,
    createPath,
    deleteLocalPath,
    // downloadFiles,
    // extractFiles,
    fileManagerId,
    focusedEntries,
    isFocusedEntry,
    lstat,
    mapFs,
    minimize,
    moveEntries,
    newShortcut,
    open,
    openFile,
    path,
    pid,
    processesRef,
    readFile,
    readOnly,
    rootFs?.mntMap,
    rootFs?.mountList,
    setCursor,
    setForegroundId,
    setRenaming,
    setWallpaper,
    stats,
    unMapFs,
    updateFolder,
    updateRecentFiles,
    url,
  ]);
  return {
    onContextMenuCapture: (event?: React.MouseEvent) => {
      if (!isFocusedEntry) {
        blurEntry();
        focusEntry(baseName);
      }
      onContextMenuCapture(event);
    },
    ...contextMenuHandlers,
  };
};

export default useFileContextMenu;
