import { useCallback, useEffect, useRef, useState } from "react";
import useAsyncFs, { AsyncFS, RootFileSystem } from "./useAsyncFs";
import { UpdateFiles } from "../session/types";
import {
  CLIPBOARD_FILE_EXTENSIONS,
  DEFAULT_MAPPED_NAME,
  DESKTOP_PATH,
  TRANSITIONS_IN_MS,
} from "@/lib/constants";
import { bufferToBlob, getExtension } from "@/lib/utils";
import {
  getMimeType,
  isMountedFolder,
  removeInvalidFilenameCharacters,
} from "./utils";
import { EmscriptenFS } from "browserfs";
import { FSModule } from "browserfs/dist/node/core/FS";
import { NewPath } from "@/hooks/useFolder";
import { getFileSystemHandles } from "./core";
import { dirname, join } from "path";
import { BFSCallback, FileSystem } from "browserfs/dist/node/core/file_system";

type FilePasteOperations = Record<string, "copy" | "move">;
type FileSystemWatchers = Record<string, UpdateFiles[]>;

type IFileSystemAccess = {
  FileSystem: {
    FileSystemAccess: {
      Create: (
        opts: { handle: FileSystemDirectoryHandle },
        cb: BFSCallback<FileSystem>,
      ) => void;
    };
  };
};

type FileSystemContextState = AsyncFS & {
  // addFile: (
  //   directory: string,
  //   callback: NewPath,
  //   accept?: string,
  //   multiple?: boolean,
  // ) => Promise<string[]>;
  // addFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  // copyEntries: (entries: string[]) => void;
  // createPath: (
  //   name: string,
  //   directory: string,
  //   buffer?: Buffer,
  // ) => Promise<string>;
  // deletePath: (path: string) => Promise<boolean>;
  fs?: FSModule;
  // mapFs: (
  //   directory: string,
  //   existingHandle?: FileSystemDirectoryHandle,
  // ) => Promise<string>;
  // mkdirRecursive: (path: string) => Promise<void>;
  // mountEmscriptenFs: (FS: EmscriptenFS, fsName?: string) => Promise<string>;
  // mountFs: (url: string) => Promise<void>;
  // moveEntries: (entries: string[]) => void;
  // pasteList: FilePasteOperations;
  // removeFsWatcher: (folder: string, updateFiles: UpdateFiles) => void;
  rootFs?: RootFileSystem;
  // unMapFs: (directory: string, hasNoHandle?: boolean) => Promise<void>;
  // unMountFs: (url: string) => void;
  // updateFolder: (
  //   folder: string,
  //   newFile?: string,
  //   oldFile?: string,
  // ) => Promise<void>;
};

const SYSTEM_DIRECTORIES = new Set(["/OPFS"]);

const useFileSystemContextState = (): FileSystemContextState => {
  const asyncFs = useAsyncFs();
  const {
    exists,
    mkdir,
    readdir,
    readFile,
    rename,
    rmdir,
    rootFs,
    unlink,
    writeFile,
  } = asyncFs;

  const restoredFsHandles = useRef(false);
  const unusedMountsCleanupTimerRef = useRef(0);
  const fsWatchersRef = useRef<FileSystemWatchers>(
    Object.create(null) as FileSystemWatchers,
  );
  const [pasteList, setPasteList] = useState<FilePasteOperations>(
    Object.create(null) as FilePasteOperations,
  );
  const updatePasteEntries = useCallback(
    (entries: string[], operation: "copy" | "move"): void =>
      setPasteList(
        Object.fromEntries(entries.map((entry) => [entry, operation])),
      ),
    [],
  );

  const copyToClipboard = useCallback(
    (entry: string) => {
      if (!CLIPBOARD_FILE_EXTENSIONS.has(getExtension(entry))) return;

      let type = getMimeType(entry);

      if (!type) return;

      // Bypass "Type image/jpeg not supported on write."
      if (type === "image/jpeg") type = "image/png";

      try {
        navigator.clipboard?.write?.([
          new ClipboardItem({
            [type]: readFile(entry).then((buffer) =>
              bufferToBlob(buffer, type),
            ),
          }),
        ]);
      } catch {
        // Ignore failure to copy image to clipboard
      }
    },
    [readFile],
  );

  const copyEntries = useCallback(
    (entries: string[]): void => {
      if (entries.length === 1) copyToClipboard(entries[0]);
      updatePasteEntries(entries, "copy");
    },
    [copyToClipboard, updatePasteEntries],
  );

  const moveEntries = useCallback(
    (entries: string[]): void => updatePasteEntries(entries, "move"),
    [updatePasteEntries],
  );

  const addFsWatcher = useCallback(
    (folder: string, updateFiles: UpdateFiles): void => {
      fsWatchersRef.current[folder] = [
        ...(fsWatchersRef.current[folder] || []),
        updateFiles,
      ];
    },
    [],
  );

  const cleanupUnusedMounts = useCallback(
    (secondCheck?: boolean) => {
      if (rootFs) {
        const mountedPaths = Object.keys(rootFs.mntMap || {}).filter(
          (mountedPath) => mountedPath !== "/",
        );

        if (mountedPaths.length === 0) return;

        const watchedPaths = Object.keys(fsWatchersRef.current).filter(
          (watchedPath) => fsWatchersRef.current[watchedPath].length > 0,
        );

        mountedPaths.forEach((mountedPath) => {
          if (
            !watchedPaths.some((watchedPath) =>
              watchedPath.startsWith(mountedPath),
            ) &&
            !isMountedFolder(rootFs.mntMap[mountedPath])
          ) {
            if (secondCheck) {
              rootFs.umount?.(mountedPath);
            } else {
              unusedMountsCleanupTimerRef.current = window.setTimeout(
                () => cleanupUnusedMounts(true),
                TRANSITIONS_IN_MS.WINDOW,
              );
            }
          }
        });
      }
    },
    [rootFs],
  );

  const removeFsWatcher = useCallback(
    (folder: string, updateFiles: UpdateFiles): void => {
      fsWatchersRef.current[folder] = (
        fsWatchersRef.current[folder] || []
      ).filter((updateFilesInstance) => updateFilesInstance !== updateFiles);

      if (unusedMountsCleanupTimerRef.current) {
        window.clearTimeout(unusedMountsCleanupTimerRef.current);
      }
      unusedMountsCleanupTimerRef.current = window.setTimeout(
        cleanupUnusedMounts,
        TRANSITIONS_IN_MS.WINDOW,
      );
    },
    [cleanupUnusedMounts],
  );

  const updateFolder = useCallback(
    async (
      folder: string,
      newFile?: string,
      oldFile?: string,
    ): Promise<void> => {
      const { [folder]: folderWatchers } = fsWatchersRef.current;

      if (folderWatchers) {
        await Promise.all(
          folderWatchers.map((updateFiles) => updateFiles(newFile, oldFile)),
        );
      }
    },
    [],
  );

  const mountEmscriptenFs = useCallback(
    async (FS: EmscriptenFS, fsName?: string) =>
      new Promise<string>((resolve, reject) => {
        // import("public/System/BrowserFS/extrafs.min.js").then((ExtraFS) => {
        //   const {
        //     FileSystem: { Emscripten },
        //   } = ExtraFS as typeof IBrowserFS;
        //   Emscripten?.Create({ FS }, (error, newFs) => {
        //     const emscriptenFS =
        //       newFs as unknown as ExtendedEmscriptenFileSystem;
        //     if (error || !newFs || !emscriptenFS._FS?.DB_NAME) {
        //       reject(new Error("Error while mounting Emscripten FS."));
        //       return;
        //     }
        //     const dbName =
        //       fsName ||
        //       `${emscriptenFS._FS?.DB_NAME().replace(/\/+$/, "")}${
        //         emscriptenFS._FS?.DB_STORE_NAME
        //       }`;
        //     try {
        //       rootFs?.mount?.(join("/", dbName), newFs);
        //     } catch {
        //       // Ignore error during mounting
        //     }
        //     resolve(dbName);
        //   });
        // });
      }),
    [rootFs],
  );

  const mapFs = useCallback(
    async (
      directory: string,
      existingHandle?: FileSystemDirectoryHandle,
    ): Promise<string> => {
      let handle: FileSystemDirectoryHandle;

      try {
        handle =
          existingHandle ??
          (await window.showDirectoryPicker({
            id: "MapDirectoryPicker",
            mode: "readwrite",
            startIn: "desktop",
          }));
      } catch {
        // Ignore cancelling the dialog
      }

      return new Promise((resolve, reject) => {
        if (handle instanceof FileSystemDirectoryHandle) {
          import("../../../public/System/BrowserFS/extrafs.min.js").then(
            (ExtraFS) => {
              const {
                FileSystem: { FileSystemAccess },
              } = ExtraFS as IFileSystemAccess;
              FileSystemAccess?.Create({ handle }, (error, newFs) => {
                if (error || !newFs) {
                  reject(
                    new Error("Error while mounting FileSystemAccess FS."),
                  );
                  return;
                }
                const systemDirectory = SYSTEM_DIRECTORIES.has(directory);
                const mappedName =
                  removeInvalidFilenameCharacters(handle.name).trim() ||
                  (systemDirectory ? "" : DEFAULT_MAPPED_NAME);
                rootFs?.mount?.(join(directory, mappedName), newFs);
                resolve(systemDirectory ? directory : mappedName);
                import("./utils").then(({ addFileSystemHandle }) =>
                  addFileSystemHandle(directory, handle, mappedName),
                );
              });
            },
          );
        } else {
          reject(new Error("Unsupported FileSystemDirectoryHandle type."));
        }
      });
    },
    [rootFs],
  );

  const unMountFs = useCallback(
    (url: string): void => rootFs?.umount?.(url),
    [rootFs],
  );

  const unMapFs = useCallback(
    async (directory: string, hasNoHandle?: boolean): Promise<void> => {
      // unMountFs(directory);
      // updateFolder(dirname(directory), undefined, directory);
      // if (hasNoHandle) return;
      // const { removeFileSystemHandle } = await import(
      //   "contexts/fileSystem/functions"
      // );
      // removeFileSystemHandle(directory);
    },
    [unMountFs, updateFolder],
  );

  // const addFile = useCallback(
  //   (directory: string, callback: NewPath): Promise<string[]> =>
  //     new Promise((resolve) => {
  //       const fileInput = document.createElement("input");

  //       fileInput.type = "file";
  //       fileInput.multiple = true;
  //       fileInput.setAttribute("style", "display: none");
  //       fileInput.addEventListener(
  //         "change",
  //         (event) => {
  //           handleFileInputEvent(
  //             event as InputChangeEvent,
  //             callback,
  //             directory,
  //             openTransferDialog,
  //           );

  //           const { files } = getEventData(event as InputChangeEvent);

  //           if (files) {
  //             resolve(
  //               [...files].map((file) =>
  //                 files instanceof FileList
  //                   ? (file as File).name
  //                   : (
  //                       (
  //                         file as DataTransferItem
  //                       ).webkitGetAsEntry() as FileSystemEntry
  //                     ).name,
  //               ),
  //             );
  //           }

  //           fileInput.remove();
  //         },
  //         { once: true },
  //       );
  //       document.body.append(fileInput);
  //       fileInput.click();
  //     }),
  //   [],
  // );

  useEffect(() => {
    if (!restoredFsHandles.current && rootFs) {
      const restoreFsHandles = async (): Promise<void> => {
        restoredFsHandles.current = true;

        let mappedOntoDesktop = false;

        await Promise.all(
          Object.entries(await getFileSystemHandles()).map(
            async ([handleDirectory, handle]) => {
              if (!(await exists(handleDirectory))) {
                try {
                  const mapDirectory = SYSTEM_DIRECTORIES.has(handleDirectory)
                    ? handleDirectory
                    : dirname(handleDirectory);

                  await mapFs(mapDirectory, handle);

                  if (mapDirectory === DESKTOP_PATH) mappedOntoDesktop = true;
                } catch {
                  // Ignore failure
                }
              }
            },
          ),
        );

        if (mappedOntoDesktop) updateFolder(DESKTOP_PATH);
      };

      restoreFsHandles();
    }
  }, [exists, mapFs, rootFs, updateFolder]);

  return {
    // addFile,
    // addFsWatcher,
    // copyEntries,
    // createPath,
    // deletePath,
    // mapFs,
    // mkdirRecursive,
    // mountEmscriptenFs,
    // mountFs,
    // moveEntries,
    // pasteList,
    // removeFsWatcher,
    // unMapFs,
    // unMountFs,
    // updateFolder,
    ...asyncFs,
  };
};

export default useFileSystemContextState;
