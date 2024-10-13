import { get9pModifiedTime } from "@/contexts/fileSystem/core";
import { RootFileSystem } from "@/contexts/fileSystem/useAsyncFs";
import {
  getCachedShortcut,
  getMimeType,
  getShortcutInfo,
  isExistingFile,
  isMountedFolder,
} from "@/contexts/fileSystem/utils";
import { FileInfo } from "../FileEntry/useFileInfo";
import { Files } from "../FileEntry/useFolder";
import {
  AUDIO_FILE_EXTENSIONS,
  BASE_2D_CONTEXT_OPTIONS,
  DYNAMIC_EXTENSION,
  DYNAMIC_PREFIX,
  FOLDER_BACK_ICON,
  FOLDER_FRONT_ICON,
  FOLDER_ICON,
  HEIF_IMAGE_FORMATS,
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  ICON_GIF_FPS,
  ICON_GIF_SECONDS,
  IMAGE_FILE_EXTENSIONS,
  MAX_ICON_SIZE,
  MOUNTED_FOLDER_ICON,
  NEW_FOLDER_ICON,
  NON_BREAKING_HYPHEN,
  ONE_TIME_PASSIVE_EVENT,
  PHOTO_ICON,
  ROOT_SHORTCUT,
  SHORTCUT_EXTENSION,
  SHORTCUT_ICON,
  SMALLEST_PNG_SIZE,
  TIFF_IMAGE_FORMATS,
  UNKNOWN_ICON_PATH,
  VIDEO_FALLBACK_MIME_TYPE,
  VIDEO_FILE_EXTENSIONS,
} from "@/lib/constants";
import {
  blobToBase64,
  bufferToUrl,
  getExtension,
  getGifJs,
  haltEvent,
  imageToBufferUrl,
  isCanvasDrawn,
  isSafari,
  toSorted,
} from "@/lib/utils";
import { FSModule } from "browserfs/dist/node/core/FS";
import Stats from "browserfs/dist/node/core/node_fs_stats";
import { basename, dirname, extname, join } from "path";
import { parse, encode } from "ini";
import extensions from "../extensions";
import processDirectory from "@/contexts/process/directory";
import { SortBy } from "../FileEntry/useSortBy";
import { COMPLETE_ACTION, NewPath } from "../FileEntry/useFolder";
import {
  FileReaders,
  ObjectReader,
  ObjectReaders,
} from "../../Dialogs/Transfer/useTransferDiaglog";
import { Prettify } from "@/lib/types";

type InternetShortcut = {
  BaseURL: string;
  Comment: string;
  IconFile: string;
  Type: string;
  URL: string;
};

type ShellClassInfo = {
  ShellClassInfo: {
    IconFile: string;
  };
};

type VideoElementWithSeek = HTMLVideoElement & {
  seekToNextFrame: () => Promise<void>;
};

export type FileStat = Prettify<
  Stats & {
    systemShortcut?: boolean;
  }
>;

type FileStats = [string, FileStat];

type SortFunction = (a: FileStats, b: FileStats) => number;

export const getModifiedTime = (path: string, stats: FileStat): number => {
  const { mtime } = stats;

  return isExistingFile(stats)
    ? get9pModifiedTime(path) || mtime.getTime()
    : mtime.getTime();
};

const sortByName = ([a]: FileStats, [b]: FileStats): number =>
  a.localeCompare(b, "en", { sensitivity: "base" });

export const sortByDate =
  (directory: string) =>
  ([aPath, aStats]: FileStats, [bPath, bStats]: FileStats): number =>
    getModifiedTime(join(directory, aPath), aStats) -
    getModifiedTime(join(directory, bPath), bStats);

export const sortBySize = (
  [, { size: aSize }]: FileStats,
  [, { size: bSize }]: FileStats,
): number => aSize - bSize;

const sortByType = ([a]: FileStats, [b]: FileStats): number =>
  extname(a).localeCompare(extname(b), "en", { sensitivity: "base" });

export const sortFiles = (
  directory: string,
  files: Files,
  sortBy: SortBy,
  ascending: boolean,
): Files => {
  const sortFunctionMap: Record<string, SortFunction> = {
    date: sortByDate(directory),
    name: sortByName,
    size: sortBySize,
    type: sortByType,
  };

  return sortBy in sortFunctionMap
    ? sortContents(files, [], sortFunctionMap[sortBy], ascending)
    : files;
};

const sortSystemShortcuts = (
  [aName, { systemShortcut: aSystem = false }]: FileStats,
  [bName, { systemShortcut: bSystem = false }]: FileStats,
): number => {
  if (aSystem === bSystem) {
    if (bSystem && bName === ROOT_SHORTCUT) return 1;

    return aSystem && aName === ROOT_SHORTCUT ? -1 : 0;
  }

  return aSystem ? -1 : 1;
};

export const sortContents = (
  contents: Files,
  sortOrder: string[],
  sortFunction?: SortFunction,
  ascending = true,
): Files => {
  if (sortOrder.length > 0) {
    const contentOrder = Object.keys(contents);

    return Object.fromEntries(
      sortOrder
        .filter((entry) => contentOrder.includes(entry))
        .concat(contentOrder.filter((entry) => !sortOrder.includes(entry)))
        .map((entry) => [entry, contents[entry]]),
    );
  }

  const files: FileStats[] = [];
  const folders: FileStats[] = [];

  Object.entries(contents).forEach((entry) => {
    const [, stat] = entry;

    if (stat.isDirectory()) folders.push(entry);
    else files.push(entry);
  });

  const sortContent = (fileStats: FileStats[]): FileStats[] => {
    const newFileStats = toSorted(fileStats, sortByName);

    return sortFunction && sortFunction !== sortByName
      ? toSorted(newFileStats, sortFunction)
      : newFileStats;
  };
  const sortedFolders = sortContent(folders);
  const sortedFiles = sortContent(files);

  if (!ascending) {
    sortedFolders.reverse();
    sortedFiles.reverse();
  }

  return Object.fromEntries(
    (ascending
      ? [...sortedFolders, ...sortedFiles]
      : [...sortedFiles, ...sortedFolders]
    ).sort(sortSystemShortcuts),
  );
};

export const getIconFromIni = (
  fs: FSModule,
  directory: string,
): Promise<string> =>
  new Promise((resolve) => {
    const iniPath = join(directory, "desktop.ini");

    fs.lstat(iniPath, (statError, stats) => {
      if (statError) resolve("");
      else if (stats && isExistingFile(stats)) {
        import("public/.index/iniIcons.json").then(({ default: iniCache }) =>
          resolve(iniCache[directory as keyof typeof iniCache] || ""),
        );
      } else {
        fs.readFile(iniPath, (readError, contents = Buffer.from("")) => {
          if (readError) resolve("");
          else {
            const {
              ShellClassInfo: { IconFile = "" },
            } = parse(contents.toString()) as ShellClassInfo;

            resolve(IconFile);
          }
        });
      }
    });
  });

export const getCachedIconUrl = async (
  fs: FSModule,
  cachedIconPath: string,
): Promise<string> =>
  new Promise((resolve) => {
    fs.lstat(cachedIconPath, (statError, cachedIconStats) => {
      if (!statError && cachedIconStats) {
        if (isExistingFile(cachedIconStats)) {
          resolve(cachedIconPath);
        } else {
          fs.readFile(
            cachedIconPath,
            (readError, cachedIconData = Buffer.from("")) => {
              if (cachedIconData.length >= SMALLEST_PNG_SIZE) {
                resolve(bufferToUrl(cachedIconData));
              } else if (!readError) fs.unlink(cachedIconPath);
            },
          );
        }
      } else resolve("");
    });
  });

const getIconsFromCache = (fs: FSModule, path: string): Promise<string[]> =>
  new Promise((resolve) => {
    const iconCacheDirectory = join(ICON_CACHE, path);

    fs?.readdir(
      iconCacheDirectory,
      async (dirError, [firstIcon, ...otherIcons] = []) => {
        if (dirError) resolve([]);
        else {
          resolve(
            (
              await Promise.all(
                [firstIcon, otherIcons[otherIcons.length - 1]]
                  .filter((icon) => icon?.endsWith(ICON_CACHE_EXTENSION))
                  .map(
                    (cachedIcon): Promise<string> =>
                      new Promise((resolveIcon) => {
                        getCachedIconUrl(
                          fs,
                          join(iconCacheDirectory, cachedIcon),
                        ).then(resolveIcon);
                      }),
                  ),
              )
            ).filter(Boolean),
          );
        }
      },
    );
  });

export const getInfoWithoutExtension = (
  fs: FSModule,
  rootFs: RootFileSystem,
  path: string,
  isDirectory: boolean,
  hasNewFolderIcon: boolean,
  callback: (value: FileInfo) => void,
  lazy = true,
): void => {
  if (isDirectory) {
    const setFolderInfo = (
      icon: string,
      subIcons?: string[],
      getIcon?: () => Promise<void>,
    ): void =>
      callback({ getIcon, icon, pid: "FileExplorer", subIcons, url: path });
    const getFolderIcon = (): string => {
      if (isMountedFolder(rootFs?.mntMap[path])) {
        return MOUNTED_FOLDER_ICON;
      }
      if (hasNewFolderIcon) return NEW_FOLDER_ICON;
      return FOLDER_ICON;
    };
    const folderIcon = getFolderIcon();
    const getDynamicIcon = async (): Promise<void> => {
      const iconFromIni = await getIconFromIni(fs, path);

      if (iconFromIni) setFolderInfo(iconFromIni);
      else if (folderIcon === FOLDER_ICON) {
        const iconsFromCache = await getIconsFromCache(fs, path);

        if (iconsFromCache.length > 0) {
          setFolderInfo(FOLDER_BACK_ICON, [
            ...iconsFromCache,
            FOLDER_FRONT_ICON,
          ]);
        } else if (!lazy) {
          setFolderInfo(folderIcon, []);
        }
      }
    };

    if (lazy) {
      setFolderInfo(folderIcon, [], getDynamicIcon);
    } else {
      getDynamicIcon();
    }
  } else {
    callback({ icon: UNKNOWN_ICON_PATH, pid: "", url: path });
  }
};

const getDefaultFileViewer = (extension: string): string => {
  if (AUDIO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";
  if (VIDEO_FILE_EXTENSIONS.has(extension)) return "VideoPlayer";
  if (IMAGE_FILE_EXTENSIONS.has(extension)) return "Photos";

  return "";
};

export const getIconByFileExtension = (extension: string): string => {
  const { icon: extensionIcon = "", process: [defaultProcess = ""] = [] } =
    extension in extensions ? extensions[extension] : {};

  if (extensionIcon) return `/System/Icons/${extensionIcon}.png`;

  return (
    processDirectory[defaultProcess || getDefaultFileViewer(extension)]?.icon ||
    UNKNOWN_ICON_PATH
  );
};

export const getProcessByFileExtension = (extension: string): string => {
  const [defaultProcess = ""] =
    extension in extensions
      ? extensions[extension].process
      : [getDefaultFileViewer(extension)];

  return defaultProcess;
};

export const getInfoWithExtension = (
  fs: FSModule,
  path: string,
  extension: string,
  callback: (value: FileInfo) => void,
): void => {
  const subIcons: string[] = [];
  const getInfoByFileExtension = (
    icon?: string,
    getIcon?: true | ((signal: AbortSignal) => void | Promise<void>),
  ): void =>
    callback({
      getIcon,
      icon: icon || getIconByFileExtension(extension),
      pid: getProcessByFileExtension(extension),
      subIcons,
      url: path,
    });
  // const decodeImage = (): void =>
  //   getInfoByFileExtension(PHOTO_ICON, (signal) =>
  //     fs.readFile(path, async (error, contents = Buffer.from("")) => {
  //       if (!error && contents.length > 0 && !signal.aborted) {
  //         const { decodeImageToBuffer } = await import("utils/imageDecoder");

  //         if (!signal.aborted) {
  //           const image = await decodeImageToBuffer(extension, contents);

  //           if (image && !signal.aborted) {
  //             getInfoByFileExtension(imageToBufferUrl(extension, image));
  //           }
  //         }
  //       }
  //     }),
  //   );

  switch (extension) {
    case SHORTCUT_EXTENSION:
      {
        const handleShortcut = ({
          comment,
          icon,
          pid,
          url,
        }: FileInfo): void => {
          const urlExt = getExtension(url);

          if (pid !== "ExternalURL") subIcons.push(SHORTCUT_ICON);

          if (pid === "FileExplorer" && !icon) {
            const getIcon = (): void => {
              getIconFromIni(fs, url).then(
                (iniIcon) =>
                  iniIcon &&
                  callback({
                    comment,
                    icon: iniIcon,
                    pid,
                    subIcons,
                    url,
                  }),
              );
            };

            callback({
              comment,
              getIcon,
              icon: processDirectory[pid]?.icon,
              pid,
              subIcons,
              url,
            });
          } else if (
            DYNAMIC_EXTENSION.has(urlExt) ||
            DYNAMIC_PREFIX.some((prefix) => url.startsWith(prefix))
          ) {
            const isCachedUrl = DYNAMIC_EXTENSION.has(urlExt);
            const cachedIconPath = join(
              ICON_CACHE,
              `${isCachedUrl ? url : path}${ICON_CACHE_EXTENSION}`,
            );

            fs.lstat(cachedIconPath, (statError, cachedIconStats) => {
              if (!statError && cachedIconStats) {
                if (isExistingFile(cachedIconStats)) {
                  callback({
                    comment,
                    icon: cachedIconPath,
                    pid,
                    subIcons,
                    url,
                  });
                } else {
                  fs.readFile(cachedIconPath, (_readError, cachedIconData) =>
                    callback({
                      comment,
                      icon: bufferToUrl(cachedIconData as Buffer),
                      pid,
                      subIcons,
                      url,
                    }),
                  );
                }
              } else {
                getInfoWithExtension(fs, url, urlExt, (fileInfo) => {
                  const {
                    icon: urlIcon = icon,
                    getIcon,
                    subIcons: fileSubIcons = [],
                  } = fileInfo;

                  if (fileSubIcons.length > 0) {
                    subIcons.push(
                      ...fileSubIcons.filter(
                        (subIcon) => !subIcons.includes(subIcon),
                      ),
                    );
                  }

                  callback({
                    comment,
                    getIcon,
                    icon: urlIcon,
                    pid,
                    subIcons,
                    url,
                  });
                });
              }
            });
          } else {
            callback({
              comment,
              icon: icon || UNKNOWN_ICON_PATH,
              pid,
              subIcons,
              url,
            });
          }
        };

        fs.lstat(path, (statError, stats) => {
          if (statError) getInfoByFileExtension();
          else if (isExistingFile(stats)) {
            handleShortcut(getCachedShortcut(path));
          } else {
            fs.readFile(path, (readError, contents): void => {
              if (readError || !contents) getInfoByFileExtension();
              else handleShortcut(getShortcutInfo(contents));
            });
          }
        });
      }
      break;
    // case ".exe":
    //   getInfoByFileExtension("/System/Icons/executable.png", (signal) =>
    //     fs.readFile(path, async (error, contents = Buffer.from("")) => {
    //       if (!error && contents.length > 0 && !signal.aborted) {
    //         const { extractExeIcon } = await import(
    //           "components/system/Files/FileEntry/exeIcons"
    //         );
    //         const exeIcon = await extractExeIcon(contents);

    //         if (exeIcon && !signal.aborted) {
    //           getInfoByFileExtension(bufferToUrl(exeIcon));
    //         }
    //       }
    //     }),
    //   );
    //   break;
    // case ".mp3":
    //   getInfoByFileExtension(
    //     `/System/Icons/${extensions[".mp3"].icon as string}.png`,
    //     (signal) =>
    //       fs.readFile(path, (error, contents = Buffer.from("")) => {
    //         if (!error && !signal.aborted) {
    //           import("music-metadata-browser").then(
    //             ({ parseBuffer, selectCover }) => {
    //               if (signal.aborted) return;

    //               parseBuffer(
    //                 contents,
    //                 {
    //                   mimeType: MP3_MIME_TYPE,
    //                   size: contents.length,
    //                 },
    //                 { skipPostHeaders: true },
    //               ).then(({ common: { picture } = {} }) => {
    //                 if (signal.aborted) return;

    //                 const { data: coverPicture } = selectCover(picture) || {};

    //                 if (coverPicture) {
    //                   getInfoByFileExtension(bufferToUrl(coverPicture));
    //                 }
    //               });
    //             },
    //           );
    //         }
    //       }),
    //   );
    //   break;
    // case ".sav":
    //   getInfoByFileExtension(UNKNOWN_ICON_PATH, true);
    //   break;
    // case ".ani":
    // case ".cur":
    // case ".jxl":
    // case ".qoi":
    //   decodeImage();
    //   break;
    // case ".whtml":
    //   getInfoByFileExtension("/System/Icons/tinymce.png", (signal) =>
    //     fs.readFile(path, async (error, contents = Buffer.from("")) => {
    //       if (!error && contents.length > 0 && !signal.aborted) {
    //         const htmlToImage = await getHtmlToImage();
    //         const containerElement = document.createElement("div");

    //         containerElement.style.height = "600px";
    //         containerElement.style.width = "600px";
    //         containerElement.style.padding = "32px";
    //         containerElement.style.backgroundColor = "#fff";
    //         containerElement.style.zIndex = "-1";
    //         containerElement.style.overflow = "hidden";
    //         containerElement.style.opacity = "0";
    //         containerElement.style.userSelect = "none";
    //         // eslint-disable-next-line deprecation/deprecation
    //         containerElement.style.webkitUserSelect = "none";

    //         containerElement.innerHTML = contents.toString();

    //         document.body.append(containerElement);

    //         let documentImage: string | undefined;

    //         try {
    //           documentImage = await htmlToImage?.toPng(containerElement, {
    //             skipAutoScale: true,
    //             style: {
    //               opacity: "1",
    //             },
    //           });
    //         } catch {
    //           // Ignore failure to captrure
    //         }

    //         containerElement.remove();

    //         if (documentImage && documentImage.length > SMALLEST_PNG_SIZE) {
    //           getInfoByFileExtension(documentImage);
    //         }
    //       }
    //     }),
    //   );
    //   break;
    default:
      if (
        HEIF_IMAGE_FORMATS.has(extension) ||
        TIFF_IMAGE_FORMATS.has(extension)
      ) {
        // decodeImage();
      } else if (IMAGE_FILE_EXTENSIONS.has(extension)) {
        getInfoByFileExtension(PHOTO_ICON, (signal) =>
          fs.readFile(path, (error, contents = Buffer.from("")) => {
            if (!error && contents.length > 0 && !signal.aborted) {
              const imageIcon = new Image();
              imageIcon.addEventListener(
                "load",
                () => getInfoByFileExtension(imageIcon.src),
                { signal, ...ONE_TIME_PASSIVE_EVENT },
              );
              imageIcon.decoding = "async";
              imageIcon.src = imageToBufferUrl(extension, contents);
            }
          }),
        );
      } else if (AUDIO_FILE_EXTENSIONS.has(extension)) {
        getInfoByFileExtension(processDirectory.VideoPlayer.icon);
      } else if (VIDEO_FILE_EXTENSIONS.has(extension)) {
        subIcons.push(processDirectory.VideoPlayer.icon);
        getInfoByFileExtension(processDirectory.VideoPlayer.icon, (signal) =>
          fs.readFile(path, async (error, contents = Buffer.from("")) => {
            if (!error) {
              const video = document.createElement("video");
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d", {
                ...BASE_2D_CONTEXT_OPTIONS,
                willReadFrequently: true,
              });
              //* Create gif preview of video
              // const gif = await getGifJs();
              // let framesRemaining = ICON_GIF_FPS * ICON_GIF_SECONDS;
              // const getFrame = (
              //   second: number,
              //   firstFrame: boolean,
              // ): Promise<void> =>
              //   new Promise((resolve) => {
              //     video.currentTime = second;
              //     if ("seekToNextFrame" in video) {
              //       (video as VideoElementWithSeek)
              //         .seekToNextFrame?.()
              //         .catch(() => {
              //           // Ignore error during seekToNextFrame
              //         });
              //     } else if (firstFrame) {
              //       video.load();
              //     }
              //     const processFrame = (): void => {
              //       if (!context || !canvas.width || !canvas.height) return;
              //       context.drawImage(video, 0, 0, canvas.width, canvas.height);
              //       gif.addFrame(
              //         context.getImageData(0, 0, canvas.width, canvas.height),
              //         { copy: true, delay: 100 },
              //       );
              //       framesRemaining -= 1;
              //       if (framesRemaining === 0) {
              //         gif
              //           .on("finished", (blob) => {
              //             blobToBase64(blob).then(getInfoByFileExtension);
              //             gif.freeWorkers.forEach((worker) =>
              //               worker?.terminate(),
              //             );
              //           })
              //           .render();
              //       }
              //       resolve();
              //     };
              //     if ("requestVideoFrameCallback" in video) {
              //       video.requestVideoFrameCallback(processFrame);
              //     } else {
              //       (video as HTMLVideoElement).addEventListener(
              //         "canplaythrough",
              //         processFrame,
              //         { signal, ...ONE_TIME_PASSIVE_EVENT },
              //       );
              //     }
              //   });

              //* Create thumbnail preview of video
              const getThumbnailFrame = (split: number) => {
                if (split <= 0) return;
                const capturePoint = video.duration / split;
                if (signal.aborted) return;
                video.currentTime = capturePoint;
                const processFrame = () => {
                  if (!context || !canvas.width || !canvas.height) return;
                  context.drawImage(video, 0, 0, canvas.width, canvas.height);
                  if (isCanvasDrawn(canvas)) {
                    getInfoByFileExtension(canvas.toDataURL("image/jpeg"));
                  } else {
                    getThumbnailFrame(split - 2);
                  }
                };
                if ("requestVideoFrameCallback" in video) {
                  video.requestVideoFrameCallback(processFrame);
                } else {
                  (video as HTMLVideoElement).addEventListener(
                    "canplaythrough",
                    processFrame,
                    { signal, ...ONE_TIME_PASSIVE_EVENT },
                  );
                }
              };

              video.addEventListener(
                "loadeddata",
                () => {
                  canvas.height =
                    video.videoHeight > video.videoWidth
                      ? MAX_ICON_SIZE
                      : (MAX_ICON_SIZE * video.videoHeight) / video.videoWidth;
                  canvas.width =
                    video.videoWidth > video.videoHeight
                      ? MAX_ICON_SIZE
                      : (MAX_ICON_SIZE * video.videoWidth) / video.videoHeight;
                  //* Create gif preview of video
                  // const capturePoints = [
                  //   video.duration / 4,
                  //   video.duration / 2,
                  // ];
                  // const frameStep = 4 / ICON_GIF_FPS;
                  // const frameCount = framesRemaining / capturePoints.length;
                  // capturePoints.forEach(async (capturePoint, index) => {
                  //   if (signal.aborted) return;
                  //   for (
                  //     let frame = capturePoint;
                  //     frame < capturePoint + frameCount * frameStep;
                  //     frame += frameStep
                  //   ) {
                  //     if (signal.aborted) return;
                  //     const firstFrame = index === 0;
                  //     await getFrame(frame, firstFrame);
                  //     if (firstFrame && frame === capturePoint) {
                  //       getInfoByFileExtension(canvas.toDataURL("image/jpeg"));
                  //     }
                  //   }
                  // });

                  //* Create thumbnail preview of video
                  getThumbnailFrame(6);
                  //
                },
                { signal, ...ONE_TIME_PASSIVE_EVENT },
              );
              video.src = bufferToUrl(
                contents,
                isSafari()
                  ? getMimeType(path) || VIDEO_FALLBACK_MIME_TYPE
                  : undefined,
              );
            }
          }),
        );
      } else {
        getInfoByFileExtension();
      }
  }
};

export const iterateFileName = (name: string, iteration: number): string => {
  const extension = extname(name);
  const fileName = basename(name, extension);

  return `${fileName} (${iteration})${extension}`;
};

export const createFileReaders = async (
  files: DataTransferItemList | FileList | never[],
  directory: string,
  callback: NewPath,
): Promise<FileReaders> => {
  const fileReaders: FileReaders = [];
  const addFile = (file: File, subFolder = ""): void => {
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      ({ target }) => {
        if (target?.result instanceof ArrayBuffer) {
          callback(
            join(subFolder, file.name),
            Buffer.from(target.result),
            files.length === 1 ? COMPLETE_ACTION.UPDATE_URL : undefined,
          );
        }
      },
      ONE_TIME_PASSIVE_EVENT,
    );

    fileReaders.push([file, join(directory, subFolder), reader]);
  };
  const addEntry = async (
    fileSystemEntry: FileSystemEntry,
    subFolder = "",
  ): Promise<void> =>
    new Promise((resolve) => {
      if (fileSystemEntry?.isDirectory) {
        (fileSystemEntry as FileSystemDirectoryEntry)
          .createReader()
          .readEntries((entries) =>
            Promise.all(
              entries.map((entry) =>
                addEntry(entry, join(subFolder, fileSystemEntry.name)),
              ),
            ).then(() => resolve()),
          );
      } else {
        (fileSystemEntry as FileSystemFileEntry)?.file((file) => {
          addFile(file, subFolder);
          resolve();
        });
      }
    });

  if (files instanceof FileList) {
    [...files].forEach((file) => addFile(file));
  } else {
    await Promise.all(
      [...files].map(async (file) =>
        addEntry(file.webkitGetAsEntry() as FileSystemEntry),
      ),
    );
  }

  return fileReaders;
};

export type InputChangeEvent = Prettify<Event & { target: HTMLInputElement }>;

type EventData = {
  files: DataTransferItemList | FileList | never[];
  text?: string;
};

export const getEventData = (
  event: DragEvent | InputChangeEvent | never[] | React.DragEvent,
): EventData => {
  const dataTransfer =
    (event as React.DragEvent).nativeEvent?.dataTransfer ||
    (event as DragEvent).dataTransfer;
  let files =
    (event as InputChangeEvent).target?.files || dataTransfer?.items || [];
  const text = dataTransfer?.getData("application/json");

  if (Array.isArray(files)) {
    files = [...(files as unknown as DataTransferItemList)].filter(
      (item) => !("kind" in item) || item.kind === "file",
    ) as unknown as DataTransferItemList;
  }

  return { files, text };
};

export const handleFileInputEvent = (
  event: InputChangeEvent | React.DragEvent,
  callback: NewPath,
  directory: string,
  openTransferDialog: (
    fileReaders: FileReaders | ObjectReaders,
  ) => Promise<void>,
  hasUpdateId = false,
): void => {
  haltEvent(event);

  const { files, text } = getEventData(event);

  if (text) {
    try {
      const filePaths = JSON.parse(text) as string[];

      if (!Array.isArray(filePaths) || filePaths.length === 0) return;

      const isSingleFile = filePaths.length === 1;
      const objectReaders = filePaths.map<ObjectReader>((filePath) => {
        let aborted = false;

        return {
          abort: () => {
            aborted = true;
          },
          directory,
          name: filePath,
          operation: "Moving",
          read: async () => {
            if (aborted || dirname(filePath) === ".") return;

            await callback(
              filePath,
              undefined,
              isSingleFile ? COMPLETE_ACTION.UPDATE_URL : undefined,
            );
          },
        };
      });

      if (isSingleFile) {
        const [singleFile] = objectReaders;

        if (hasUpdateId) {
          callback(singleFile.name, undefined, COMPLETE_ACTION.UPDATE_URL);
        }
        if (hasUpdateId || singleFile.directory === singleFile.name) return;
      }

      if (
        filePaths.every((filePath) => dirname(filePath) === directory) ||
        filePaths.includes(directory)
      ) {
        return;
      }

      openTransferDialog(objectReaders);
    } catch {
      // Failed to parse text data to JSON
    }
  } else {
    createFileReaders(files, directory, callback).then(openTransferDialog);
  }
};

export const removeInvalidFilenameCharacters = (name = ""): string =>
  name.replace(/["*/:<>?\\|]/g, "");

export const createShortcut = (shortcut: Partial<InternetShortcut>): string =>
  encode(shortcut, {
    section: "InternetShortcut",
    whitespace: false,
  }).replace(/"/g, "");

export const getParentDirectories = (directory: string): string[] => {
  if (directory === "/") return [];

  const currentParent = dirname(directory);

  return [currentParent, ...getParentDirectories(currentParent)];
};
