import Stats from "browserfs/dist/node/core/node_fs_stats";
import extensions from "../../Files/extensions";
import { FSModule } from "browserfs/dist/node/core/FS";
import {
  FOLDER_FRONT_ICON,
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  TEXT_EDITORS,
  YT_ICON_CACHE,
} from "@/lib/constants";
import { FileInfo } from "../../Files/FileEntry/useFileInfo";
import { getExtension, isYouTubeUrl } from "@/lib/utils";
import {
  getCachedIconUrl,
  getInfoWithExtension,
  getInfoWithoutExtension,
} from "../../Files/FileManager/functions";
import { RootFileSystem } from "@/contexts/fileSystem/useAsyncFs";
import { join } from "path";

export type ResultInfo = {
  icon: string;
  pid: string;
  subIcons: string[];
  url: string;
};

export const fileType = (
  stats: Stats | undefined,
  extension: string,
  isYTUrl: boolean,
  isAppShortcut: boolean,
  isNostrUrl: boolean,
): string =>
  isNostrUrl
    ? "Nostr URI"
    : isAppShortcut
      ? "App"
      : isYTUrl
        ? "YouTube Video"
        : stats?.isDirectory() || !extension
          ? "File folder"
          : extensions[extension]?.type ||
            `${extension.toUpperCase().replace(".", "")} File`;

export const getResultInfo = async (
  fs: FSModule | undefined,
  url: string,
  signal?: AbortSignal,
): Promise<ResultInfo | undefined> => {
  if (!fs) return undefined;

  const {
    subIcons,
    icon,
    pid = TEXT_EDITORS[0],
    url: infoUrl,
  } = await new Promise<FileInfo>((resolve) => {
    fs.lstat(url, (err, stats) => {
      const isDirectory = !err && stats ? stats.isDirectory() : false;
      const extension = getExtension(url);

      if (extension && !isDirectory) {
        getInfoWithExtension(fs, url, extension, (fileInfo) =>
          resolve(fileInfo),
        );
      } else {
        getInfoWithoutExtension(
          fs,
          fs.getRootFS() as RootFileSystem,
          url,
          isDirectory,
          false,
          (fileInfo) => resolve(fileInfo),
          false,
        );
      }
    });
  });

  if (signal?.aborted) return undefined;

  const isYT = isYouTubeUrl(infoUrl);
  const cachedIcon = await getCachedIconUrl(
    fs,
    join(
      isYT ? YT_ICON_CACHE : ICON_CACHE,
      `${
        isYT ? new URL(infoUrl).pathname.replace("/", "") : infoUrl
      }${ICON_CACHE_EXTENSION}`,
    ),
  );

  return {
    icon: cachedIcon || icon,
    pid,
    subIcons: subIcons?.includes(FOLDER_FRONT_ICON) ? subIcons : [],
    url: infoUrl || url,
  };
};
