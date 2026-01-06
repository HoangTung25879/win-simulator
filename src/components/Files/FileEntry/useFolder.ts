import { FocusEntryFunctions } from "@/components/Files/FileEntry/useFocusableEntries";
import {
  createShortcut,
  FileStat,
  getParentDirectories,
  removeInvalidFilenameCharacters,
  sortByDate,
  sortBySize,
  sortContents,
} from "@/components/Files/FileManager/functions";
import { useFileSystem } from "@/contexts/fileSystem";
import {
  filterSystemFiles,
  getCachedShortcut,
  getShortcutInfo,
  isExistingFile,
} from "@/contexts/fileSystem/utils";
import { useProcesses } from "@/contexts/process";
import { useSession } from "@/contexts/session";
import {
  DESKTOP_PATH,
  SHORTCUT_APPEND,
  SHORTCUT_EXTENSION,
  SYSTEM_SHORTCUT_DIRECTORIES,
} from "@/lib/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  getExtension,
  updateIconPositions,
} from "@/lib/utils";
import Stats from "browserfs/dist/node/core/node_fs_stats";
import { basename, dirname, extname, join, relative } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSortBy, { SetSortBy, SortByOrder } from "./useSortBy";
import useTransferDialog, {
  ObjectReader,
} from "../../Dialogs/Transfer/useTransferDiaglog";
import { ApiError } from "browserfs/dist/node/core/api_error";

export type CompleteAction = "rename" | "updateUrl";

export const COMPLETE_ACTION: Record<string, CompleteAction> = {
  RENAME: "rename",
  UPDATE_URL: "updateUrl",
};

export type FileActions = {
  // archiveFiles: (paths: string[]) => void;
  deleteLocalPath: (path: string) => Promise<void>;
  // downloadFiles: (paths: string[]) => void;
  // extractFiles: (path: string) => void;
  newShortcut: (path: string, process: string) => void;
  renameFile: (path: string, name?: string) => void;
};

export type FolderActions = {
  addToFolder: () => Promise<string[]>;
  newPath: NewPath;
  pasteToFolder: (event?: React.MouseEvent) => void;
  resetFiles: () => void;
  sortByOrder: [SortByOrder, SetSortBy];
};

type ZipFile = [string, Buffer];

export type Files = Record<string, FileStat>;

export type NewPath = (
  fileName: string,
  buffer?: Buffer,
  completeAction?: CompleteAction,
) => Promise<string>;

type Folder = {
  fileActions: FileActions;
  files: Files;
  folderActions: FolderActions;
  isLoading: boolean;
  updateFiles: (newFile?: string, oldFile?: string) => void;
};

type FolderFlags = {
  hideFolders?: boolean;
  hideLoading?: boolean;
  skipFsWatcher?: boolean;
  skipSorting?: boolean;
};

const NO_FILES = undefined;

const useFolder = (
  directory: string,
  setRenaming: React.Dispatch<React.SetStateAction<string>>,
  { blurEntry, focusEntry }: FocusEntryFunctions,
  { hideFolders, hideLoading, skipFsWatcher, skipSorting }: FolderFlags,
): Folder => {
  const {
    addFile,
    addFsWatcher,
    copyEntries,
    createPath,
    deletePath,
    exists,
    fs,
    lstat,
    mkdir,
    mkdirRecursive,
    pasteList,
    readdir,
    readFile,
    removeFsWatcher,
    rename,
    stat,
    updateFolder,
    writeFile,
  } = useFileSystem();
  const {
    iconPositions,
    sessionLoaded,
    setIconPositions,
    setSortOrder,
    sortOrders,
  } = useSession();
  const [files, setFiles] = useState<Files | typeof NO_FILES>();
  const [downloadLink, setDownloadLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentDirectory, setCurrentDirectory] = useState(directory);
  const { openTransferDialog } = useTransferDialog();
  const { close, closeProcessesByUrl } = useProcesses();
  const sortByOrder = useSortBy(directory, files);
  const { [directory]: [sortOrder, sortBy, sortAscending] = [] } =
    sortOrders || {};

  const updatingFiles = useRef(false);

  const statsWithShortcutInfo = useCallback(
    async (fileName: string, stats: Stats): Promise<FileStat> => {
      if (
        SYSTEM_SHORTCUT_DIRECTORIES.has(directory) &&
        getExtension(fileName) === SHORTCUT_EXTENSION
      ) {
        const shortcutPath = join(directory, fileName);
        const { type } = isExistingFile(stats)
          ? getCachedShortcut(shortcutPath)
          : getShortcutInfo(await readFile(shortcutPath));

        return Object.assign(stats, { systemShortcut: type === "System" });
      }

      return stats;
    },
    [directory, readFile],
  );

  const isSimpleSort =
    skipSorting || !sortBy || sortBy === "name" || sortBy === "type";

  const updateFiles = useCallback(
    async (newFile?: string, oldFile?: string) => {
      if (oldFile) {
        if (!(await exists(join(directory, oldFile)))) {
          const oldName = basename(oldFile);

          if (newFile) {
            setFiles((currentFiles = {}) =>
              Object.entries(currentFiles).reduce<Files>(
                (newFiles, [fileName, fileStats]) => {
                  newFiles[
                    fileName === oldName ? basename(newFile) : fileName
                  ] = fileStats;

                  return newFiles;
                },
                {},
              ),
            );
          } else {
            blurEntry(oldName);
            setFiles(
              ({ [oldName]: _fileStats, ...currentFiles } = {}) => currentFiles,
            );
          }
        }
      } else if (newFile) {
        const baseName = basename(newFile);
        const filePath = join(directory, newFile);
        const fileStats = await statsWithShortcutInfo(
          baseName,
          isSimpleSort ? await lstat(filePath) : await stat(filePath),
        );

        setFiles((currentFiles = {}) => ({
          ...currentFiles,
          [baseName]: fileStats,
        }));
      } else {
        setIsLoading(true);

        try {
          const dirContents = (await readdir(directory)).filter(
            filterSystemFiles(directory),
          );
          const sortedFiles = await dirContents.reduce(
            async (processedFiles, file) => {
              try {
                const filePath = join(directory, file);
                const fileStats = isSimpleSort
                  ? await lstat(filePath)
                  : await stat(filePath);
                const hideEntry = hideFolders && fileStats.isDirectory();
                let newFiles = await processedFiles;

                if (!hideEntry) {
                  newFiles[file] = await statsWithShortcutInfo(file, fileStats);
                  newFiles = sortContents(
                    newFiles,
                    (!skipSorting && sortOrder) || [],
                    isSimpleSort
                      ? undefined
                      : sortBy === "date"
                        ? sortByDate(directory)
                        : sortBySize,
                    sortAscending,
                  );
                }

                if (hideLoading) setFiles(newFiles);

                return newFiles;
              } catch {
                return processedFiles;
              }
            },
            Promise.resolve({} as Files),
          );

          if (dirContents.length > 0) {
            if (!hideLoading) setFiles(sortedFiles);

            const newSortOrder = Object.keys(sortedFiles);

            if (
              !skipSorting &&
              (!sortOrder ||
                sortOrder?.some(
                  (entry, index) => newSortOrder[index] !== entry,
                ))
            ) {
              window.requestAnimationFrame(() =>
                setSortOrder(directory, newSortOrder),
              );
            }
          } else {
            setFiles(Object.create(null) as Files);
          }
        } catch (error) {
          if ((error as ApiError).code === "ENOENT") {
            closeProcessesByUrl(directory);
          }
        }

        setIsLoading(false);
      }
    },
    [
      blurEntry,
      closeProcessesByUrl,
      directory,
      exists,
      hideFolders,
      hideLoading,
      isSimpleSort,
      lstat,
      readdir,
      setSortOrder,
      skipSorting,
      sortAscending,
      sortBy,
      sortOrder,
      stat,
      statsWithShortcutInfo,
    ],
  );

  const deleteLocalPath = useCallback(
    async (path: string): Promise<void> => {
      if (await deletePath(path)) {
        updateFolder(directory, undefined, basename(path));
      }
    },
    [deletePath, directory, updateFolder],
  );

  const createLink = (contents: Buffer, fileName?: string): void => {
    const link = document.createElement("a");
    link.href = bufferToUrl(contents);
    link.download = fileName
      ? extname(fileName)
        ? fileName
        : `${fileName}.zip`
      : "download.zip";
    link.click();
    setDownloadLink(link.href);
  };

  const getFile = useCallback(
    async (path: string): Promise<ZipFile> => [
      relative(directory, path),
      await readFile(path),
    ],
    [directory, readFile],
  );

  const renameFile = async (path: string, name?: string): Promise<void> => {
    let newName = removeInvalidFilenameCharacters(name).trim();

    if (newName?.endsWith(".")) {
      newName = newName.slice(0, -1);
    }

    if (newName) {
      const renamedPath = join(
        directory,
        `${newName}${
          path.endsWith(SHORTCUT_EXTENSION) ? SHORTCUT_EXTENSION : ""
        }`,
      );

      if (!(await exists(renamedPath)) && (await rename(path, renamedPath))) {
        updateFolder(directory, renamedPath, path);
      }

      if (dirname(path) === DESKTOP_PATH) {
        setIconPositions((currentPositions) => {
          const { [path]: iconPosition, ...newPositions } = currentPositions;

          if (iconPosition) {
            newPositions[renamedPath] = iconPosition;
          }

          return newPositions;
        });
      }
    }
  };

  const newPath = useCallback(
    async (
      name: string,
      buffer?: Buffer,
      completeAction?: CompleteAction,
    ): Promise<string> => {
      const uniqueName = await createPath(name, directory, buffer);

      if (uniqueName && !uniqueName.includes("/")) {
        updateFolder(directory, uniqueName);

        if (completeAction === "rename") setRenaming(uniqueName);
        else {
          blurEntry();
          focusEntry(uniqueName);
        }
      }

      return uniqueName;
    },
    [blurEntry, createPath, directory, focusEntry, setRenaming, updateFolder],
  );

  const newShortcut = useCallback(
    (path: string, process: string): void => {
      const pathExtension = getExtension(path);

      if (pathExtension === SHORTCUT_EXTENSION) {
        fs?.readFile(path, (_readError, contents = Buffer.from("")) =>
          newPath(basename(path), contents),
        );
        return;
      }

      const baseName = basename(path);
      const shortcutPath = `${baseName}${SHORTCUT_APPEND}${SHORTCUT_EXTENSION}`;
      const shortcutData = createShortcut({ BaseURL: process, URL: path });

      newPath(shortcutPath, Buffer.from(shortcutData));
    },
    [fs, newPath],
  );

  const pasteToFolder = useCallback(
    (event?: React.MouseEvent): void => {
      [directory, ...getParentDirectories(directory)].forEach(
        (parentDirectory) =>
          pasteList[parentDirectory] && delete pasteList[parentDirectory],
      );

      const pasteEntries = Object.entries(pasteList);
      const moving = pasteEntries.some(([, operation]) => operation === "move");
      const copyFiles = async (entry: string, basePath = ""): Promise<void> => {
        const newBasePath = join(basePath, basename(entry));
        let uniquePath: string;

        if ((await lstat(entry)).isDirectory()) {
          uniquePath = await createPath(newBasePath, directory);

          await Promise.all(
            (await readdir(entry)).map((dirEntry) =>
              copyFiles(join(entry, dirEntry), uniquePath),
            ),
          );
        } else {
          uniquePath = await createPath(
            newBasePath,
            directory,
            await readFile(entry),
          );
        }

        if (!basePath) updateFolder(directory, uniquePath);
      };
      const movedPaths: string[] = [];
      const objectReaders = pasteEntries.map<ObjectReader>(([pasteEntry]) => {
        let aborted = false;

        return {
          abort: () => {
            aborted = true;
          },
          directory,
          done: () => {
            if (moving) {
              movedPaths
                .filter(Boolean)
                .forEach((movedPath) => updateFolder(directory, movedPath));

              copyEntries([]);
            }
          },
          name: pasteEntry,
          operation: moving ? "Moving" : "Copying",
          read: async () => {
            if (aborted) return;

            if (moving) {
              movedPaths.push(await createPath(pasteEntry, directory));
            } else await copyFiles(pasteEntry);
          },
        };
      });

      if (event) {
        const { clientX: x, clientY: y } =
          "TouchEvent" in window && event.nativeEvent instanceof TouchEvent
            ? event.nativeEvent.touches[0]
            : (event.nativeEvent as MouseEvent);

        updateIconPositions(
          directory,
          event.target as HTMLElement,
          iconPositions,
          sortOrders,
          { x, y },
          pasteEntries.map(([entry]) => basename(entry)),
          setIconPositions,
          exists,
        );
      }

      openTransferDialog(objectReaders);
    },
    [
      copyEntries,
      createPath,
      directory,
      exists,
      iconPositions,
      lstat,
      openTransferDialog,
      pasteList,
      readFile,
      readdir,
      setIconPositions,
      sortOrders,
      updateFolder,
    ],
  );

  const folderActions = useMemo(
    () => ({
      addToFolder: () => addFile(directory, newPath),
      newPath,
      pasteToFolder,
      resetFiles: () => setFiles(NO_FILES),
      sortByOrder,
    }),
    [addFile, directory, newPath, pasteToFolder, sortByOrder],
  );

  useEffect(() => {
    if (directory !== currentDirectory) {
      setCurrentDirectory(directory);
      setFiles(NO_FILES);
    }
  }, [currentDirectory, directory]);

  useEffect(() => {
    if (sessionLoaded) {
      if (files) {
        const fileNames = Object.keys(files);

        if (
          sortOrder &&
          fileNames.length === sortOrder.length &&
          directory === currentDirectory
        ) {
          if (fileNames.some((file) => !sortOrder.includes(file))) {
            const oldName = sortOrder.find(
              (entry) => !fileNames.includes(entry),
            );
            const newName = fileNames.find(
              (entry) => !sortOrder.includes(entry),
            );

            if (oldName && newName) {
              setSortOrder(
                directory,
                sortOrder.map((entry) => (entry === oldName ? newName : entry)),
              );
            }
          } else if (
            fileNames.some((file, index) => file !== sortOrder[index])
          ) {
            setFiles((currentFiles) =>
              sortContents(currentFiles || files, sortOrder),
            );
          }
        }
      } else if (!updatingFiles.current) {
        updatingFiles.current = true;
        updateFiles().then(() => {
          updatingFiles.current = false;
        });
      }
    }
  }, [
    currentDirectory,
    directory,
    files,
    sessionLoaded,
    setSortOrder,
    sortOrder,
    updateFiles,
  ]);

  useEffect(
    () => () => {
      if (downloadLink) cleanUpBufferUrl(downloadLink);
    },
    [downloadLink],
  );

  useEffect(() => {
    if (!skipFsWatcher) addFsWatcher?.(directory, updateFiles);

    return () => {
      if (!skipFsWatcher) removeFsWatcher?.(directory, updateFiles);
    };
  }, [addFsWatcher, directory, removeFsWatcher, skipFsWatcher, updateFiles]);

  return {
    fileActions: {
      // archiveFiles,
      deleteLocalPath,
      // downloadFiles,
      // extractFiles,
      newShortcut,
      renameFile,
    },
    files: files || {},
    folderActions,
    isLoading,
    updateFiles,
  };
};
export default useFolder;
