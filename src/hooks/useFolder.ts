import { FocusEntryFunctions } from "@/app/components/Files/FileEntry/useFocusableEntries";
import {
  FileStat,
  sortByDate,
  sortBySize,
  sortContents,
} from "@/app/components/Files/FileManager/functions";
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
  SHORTCUT_EXTENSION,
  SYSTEM_SHORTCUT_DIRECTORIES,
} from "@/lib/constants";
import { getExtension } from "@/lib/utils";
import Stats from "browserfs/dist/node/core/node_fs_stats";
import { basename, join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";

export type CompleteAction = "rename" | "updateUrl";

export type FileActions = {
  archiveFiles: (paths: string[]) => void;
  deleteLocalPath: (path: string) => Promise<void>;
  downloadFiles: (paths: string[]) => void;
  extractFiles: (path: string) => void;
  newShortcut: (path: string, process: string) => void;
  renameFile: (path: string, name?: string) => void;
};

export type FolderActions = {
  addToFolder: () => Promise<string[]>;
  newPath: NewPath;
  pasteToFolder: (event?: React.MouseEvent) => void;
  resetFiles: () => void;
  // sortByOrder: [SortByOrder, SetSortBy];
};

export type Files = Record<string, FileStat>;

export type NewPath = (
  fileName: string,
  buffer?: Buffer,
  completeAction?: CompleteAction,
) => Promise<string>;

type Folder = {
  // fileActions: FileActions;
  files: Files;
  // folderActions: FolderActions;
  isLoading: boolean;
  // updateFiles: (newFile?: string, oldFile?: string) => void;
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
  const [currentDirectory, setCurrentDirectory] = useState(directory);
  const [files, setFiles] = useState<Files | typeof NO_FILES>();
  const [isLoading, setIsLoading] = useState(true);
  const {
    // addFile,
    // addFsWatcher,
    // copyEntries,
    // createPath,
    // deletePath,
    exists,
    fs,
    lstat,
    mkdir,
    // mkdirRecursive,
    // pasteList,
    readdir,
    readFile,
    // removeFsWatcher,
    rename,
    stat,
    // updateFolder,
    writeFile,
  } = useFileSystem();
  const { iconPositions, sessionLoaded, setSortOrder, sortOrders } =
    useSession();
  const { [directory]: [sortOrder, sortBy, sortAscending] = [] } =
    sortOrders || {};
  const {} = useProcesses();

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
                  // eslint-disable-next-line no-param-reassign
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
          // if ((error as ApiError).code === "ENOENT") {
          //   closeProcessesByUrr(directory);
          // }
        }

        setIsLoading(false);
      }
    },
    [
      blurEntry,
      // closeProcessesByUrl,
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
  }, [currentDirectory, directory, files, sessionLoaded]);

  return {
    // fileActions: {
    //   archiveFiles,
    //   deleteLocalPath,
    //   downloadFiles,
    //   extractFiles,
    //   newShortcut,
    //   renameFile,
    // },
    files: files || {},
    // folderActions,
    isLoading,
    // updateFiles,
  };
};
export default useFolder;
