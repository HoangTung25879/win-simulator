"use client";

import { useFileSystem } from "@/contexts/fileSystem";
import { ProcessArguments } from "@/contexts/process/types";
import Stats from "browserfs/dist/node/core/node_fs_stats";
import { useCallback, useEffect, useRef, useState } from "react";
import { fileType, getResultInfo, ResultInfo } from "./functions";
import { ROOT_NAME, SHORTCUT_EXTENSION, UNKNOWN_ICON } from "@/lib/constants";
import { basename, dirname, extname } from "path";
import { useSession } from "@/contexts/session";
import Icon from "../../Common/Icon/Icon";
import { isYouTubeUrl } from "@/lib/utils";
import { getModifiedTime } from "../../Files/FileManager/functions";
import dayjs from "dayjs";
import { OpenFolderIcon, OpenIcon } from "./Icons";
import SubIcons from "../../Common/Icon/SubIcons";

type ResultDetailsProps = {
  openApp: (pid: string, args?: ProcessArguments) => void;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  url: string;
};

const ResultDetails = ({ openApp, setActiveItem, url }: ResultDetailsProps) => {
  const { fs, stat } = useFileSystem();
  const [stats, setStats] = useState<Stats>();
  const [info, setInfo] = useState<ResultInfo>({
    icon: UNKNOWN_ICON,
  } as ResultInfo);
  const { updateRecentFiles } = useSession();
  const elementRef = useRef<HTMLDivElement>(null);
  const extension = extname(info?.url || url);
  const isYTUrl = info?.url ? isYouTubeUrl(info.url) : false;
  const isNostrUrl = info?.url ? info.url.startsWith("nostr:") : false;
  const isAppShortcut = info?.pid
    ? url === info.url && extname(url) === SHORTCUT_EXTENSION
    : false;
  const isDirectory =
    stats?.isDirectory() || (!extension && !isYTUrl && !isNostrUrl);
  const baseUrl = isYTUrl || isNostrUrl ? url : info?.url;
  const currentUrlRef = useRef(url);
  const name =
    baseUrl === "/"
      ? ROOT_NAME
      : baseUrl
        ? basename(baseUrl, SHORTCUT_EXTENSION)
        : "";

  const openFile = useCallback(() => {
    openApp(info?.pid, { url: info?.url });
    if (info?.url && info?.pid) updateRecentFiles(info?.url, info?.pid);
  }, [info?.pid, info?.url, openApp, updateRecentFiles]);

  useEffect(() => {
    stat(url).then(
      (newStats) => currentUrlRef.current === url && setStats(newStats),
    );
    getResultInfo(fs, url).then(
      (newInfo) => newInfo && currentUrlRef.current === url && setInfo(newInfo),
    );
  }, [fs, stat, url]);

  useEffect(() => {
    elementRef.current?.scrollTo({ behavior: "smooth", top: 0 });
    currentUrlRef.current = url;
  }, [url]);

  return (
    info?.url &&
    stats && (
      <div ref={elementRef} className="result-details">
        <Icon displaySize={64} imgSize={96} src={info?.icon} />
        <SubIcons
          icon={info?.icon}
          imgSize={64}
          name={name}
          showShortcutIcon={false}
          subIcons={info?.subIcons}
          view="icon"
        />
        <h1 onClick={openFile}>{name}</h1>
        <h2>
          {fileType(stats, extension, isYTUrl, isAppShortcut, isNostrUrl)}
        </h2>
        {!isAppShortcut && info?.url && (
          <table>
            <tbody>
              <tr>
                <th>Location</th>
                <td onClick={openFile}>{info.url}</td>
              </tr>
              {!isYTUrl && !isNostrUrl && !isDirectory && (
                <tr>
                  <th>Last modified</th>
                  <td>
                    {dayjs(getModifiedTime(baseUrl, stats)).format(
                      "M/D/YYYY, h:mm A",
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <ol>
          <li>
            <button onClick={openFile}>
              <OpenIcon />
              Open
            </button>
          </li>
          {dirname(baseUrl) !== "." && (
            <li>
              <button
                onClick={() =>
                  openApp("FileExplorer", {
                    url: dirname(baseUrl),
                  })
                }
              >
                <OpenFolderIcon />
                Open {isDirectory ? "folder" : "file"} location
              </button>
            </li>
          )}
        </ol>
      </div>
    )
  );
};

export default ResultDetails;
