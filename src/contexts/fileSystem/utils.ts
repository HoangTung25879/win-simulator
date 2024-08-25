import Stats from "browserfs/dist/node/core/node_fs_stats";
import {
  ExtendedEmscriptenFileSystem,
  Mount,
  RootFileSystem,
} from "./useAsyncFs";
import OverlayFS from "browserfs/dist/node/backend/OverlayFS";
import XmlHttpRequest from "browserfs/dist/node/backend/XmlHttpRequest";
import IndexedDBFileSystem from "browserfs/dist/node/backend/IndexedDB";
import InMemoryFileSystem from "browserfs/dist/node/backend/InMemory";
import { getExtension } from "@/lib/utils";
import {
  FS_HANDLES,
  getFileSystemHandles,
  getKeyValStore,
  KEYVAL_STORE_NAME,
  supportsIndexedDB,
} from "./core";
import { basename, dirname, join } from "path";
import { FileInfo } from "@/hooks/useFileInfo";
import ini from "ini";
import shortcutCache from "../../../public/.index/shortcutCache.json";
import { SYSTEM_FILES, SYSTEM_PATHS } from "@/lib/constants";

type InternetShortcut = {
  BaseURL: string;
  Comment: string;
  IconFile: string;
  Type: string;
  URL: string;
};

const KNOWN_IDB_DBS = [
  "/classicube",
  "/data/saves",
  "ejs-bios",
  "ejs-roms",
  "ejs-romsdata",
  "ejs-states",
  "ejs-system",
  "js-dos-cache (emulators-ui-saves)",
  "keyval-store",
];

export const isExistingFile = (
  { birthtimeMs, ctimeMs }: any = {} as Stats,
): boolean => Boolean(birthtimeMs && birthtimeMs === ctimeMs);

export const resetStorage = (rootFs?: RootFileSystem): Promise<void> =>
  new Promise((resolve, reject) => {
    setTimeout(reject, 750);

    window.localStorage.clear();
    window.sessionStorage.clear();

    const clearFs = (): void => {
      const overlayFs = rootFs?._getFs("/")?.fs as OverlayFS;
      const overlayedFileSystems = overlayFs?.getOverlayedFileSystems();
      const readable = overlayedFileSystems?.readable as XmlHttpRequest;
      const writable = overlayedFileSystems?.writable as
        | IndexedDBFileSystem
        | InMemoryFileSystem;

      readable?.empty();

      if (writable?.getName() === "InMemory" || !writable?.empty) {
        resolve();
      } else {
        writable.empty((apiError) => (apiError ? reject(apiError) : resolve()));
      }
    };

    if (window.indexedDB) {
      import("idb").then(({ deleteDB }) => {
        if (window.indexedDB.databases) {
          window.indexedDB
            .databases()
            .then((databases) =>
              databases
                .filter(({ name }) => name && name !== "browserfs")
                .forEach(({ name }) => deleteDB(name as string)),
            )
            .then(clearFs)
            .catch(clearFs);
        } else {
          KNOWN_IDB_DBS.forEach((name) => deleteDB(name));
          clearFs();
        }
      });
    } else {
      clearFs();
    }
  });

export const isMountedFolder = (mount?: Mount): boolean =>
  typeof mount === "object" &&
  (mount.getName() === "FileSystemAccess" ||
    (mount as ExtendedEmscriptenFileSystem)._FS?.DB_STORE_NAME === "FILE_DATA");

export const removeInvalidFilenameCharacters = (name = ""): string =>
  name.replace(/["*/:<>?\\|]/g, "");

export const getMimeType = (url: string): string => {
  switch (getExtension(url)) {
    case ".ani":
    case ".cur":
    case ".ico":
      return "image/vnd.microsoft.icon";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".json":
      return "application/json";
    case ".html":
    case ".htm":
    case ".whtml":
      return "text/html";
    case ".m3u":
    case ".m3u8":
      return "application/x-mpegURL";
    case ".m4v":
    case ".mkv":
    case ".mov":
    case ".mp4":
      return "video/mp4";
    case ".mp3":
      return "audio/mpeg";
    case ".oga":
      return "audio/ogg";
    case ".ogg":
    case ".ogm":
    case ".ogv":
      return "video/ogg";
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".md":
    case ".txt":
      return "text/plain";
    case ".wav":
      return "audio/wav";
    case ".webm":
      return "video/webm";
    case ".webp":
      return "image/webp";
    case ".xml":
      return "application/xml";
    case ".wsz":
    case ".jsdos":
    case ".zip":
      return "application/zip";
    default:
      return "";
  }
};

export const addFileSystemHandle = async (
  directory: string,
  handle: FileSystemDirectoryHandle,
  mappedName: string,
): Promise<void> => {
  if (!(await supportsIndexedDB())) return;

  const db = await getKeyValStore();

  try {
    db.put(
      KEYVAL_STORE_NAME,
      {
        ...(await getFileSystemHandles()),
        [join(directory, mappedName)]: handle,
      },
      FS_HANDLES,
    );
  } catch {
    // Ignore errors storing handle
  }
};

export const getShortcutInfo = (
  contents?: Buffer,
  shortcutData?: InternetShortcut,
): FileInfo => {
  const {
    InternetShortcut: {
      BaseURL: pid = "",
      Comment: comment = "",
      IconFile: icon = "",
      Type: type = "",
      URL: url = "",
    } = {},
  } = shortcutData
    ? { InternetShortcut: shortcutData }
    : ((ini.parse(contents?.toString() || "") || {}) as {
        InternetShortcut: InternetShortcut;
      });

  return {
    comment,
    // icon:
    //   !icon && pid && pid !== "FileExplorer"
    //     ? processDirectory[pid]?.icon
    //     : icon,
    icon,
    pid,
    type,
    url,
  };
};

export const getCachedShortcut = (path: string): FileInfo =>
  getShortcutInfo(
    undefined,
    (
      shortcutCache as unknown as Record<
        string,
        Record<string, InternetShortcut>
      >
    )?.[dirname(path)]?.[basename(path)],
  );

export const filterSystemFiles =
  (directory: string) =>
  (file: string): boolean =>
    !SYSTEM_PATHS.has(join(directory, file)) && !SYSTEM_FILES.has(file);
