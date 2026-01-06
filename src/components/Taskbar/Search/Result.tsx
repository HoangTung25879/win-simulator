"use client";

import { ProcessArguments } from "@/contexts/process/types";
import { fileType, getResultInfo, ResultInfo } from "./functions";
import { SHORTCUT_EXTENSION, UNKNOWN_ICON } from "@/lib/constants";
import { useFileSystem } from "@/contexts/fileSystem";
import { useSession } from "@/contexts/session";
import { useEffect, useMemo, useRef, useState } from "react";
import Stats from "browserfs/dist/node/core/node_fs_stats";
import { basename, extname } from "path";
import clsx from "clsx";
import { isYouTubeUrl, makeBoldString } from "@/lib/utils";
import { getModifiedTime } from "../../Files/FileManager/functions";
import dayjs from "dayjs";
import { getShortcutInfo } from "@/contexts/fileSystem/utils";
import Icon from "../../Common/Icon/Icon";
import { RightArrowIcon } from "./Icons";
import { useIsVisible } from "@/hooks/useIsVisible";
import { SEARCH_PARENT_CLASS } from "./SearchMenu";
import SubIcons from "../../Common/Icon/SubIcons";

type ResultProps = {
  active?: boolean;
  details?: boolean;
  openApp: (pid: string, args?: ProcessArguments) => void;
  searchTerm: string;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  url: string;
};

const INITIAL_INFO = {
  icon: UNKNOWN_ICON,
} as ResultInfo;

const Result = ({
  active,
  details,
  openApp,
  searchTerm,
  setActiveItem,
  url,
}: ResultProps) => {
  const { fs, readFile, stat } = useFileSystem();
  const { updateRecentFiles } = useSession();
  const [stats, setStats] = useState<Stats>();
  const [info, setInfo] = useState<ResultInfo>(INITIAL_INFO);
  const [hovered, setHovered] = useState(false);
  const extension = extname(info?.url || url);
  const baseName = basename(url, SHORTCUT_EXTENSION);
  const isYTUrl = info?.url ? isYouTubeUrl(info.url) : false;
  const baseUrl = isYTUrl ? url : url || info?.url;
  const isDirectory = stats?.isDirectory() || (!extension && !isYTUrl);
  const isNostrUrl = info?.url ? info.url.startsWith("nostr:") : false;
  const name = useMemo(
    () => makeBoldString(baseName, searchTerm),
    [baseName, searchTerm],
  );
  const lastModified = useMemo(() => {
    return stats && !stats.isDirectory()
      ? `Last modified: ${dayjs(getModifiedTime(baseUrl, stats)).format("M/D/YYYY, h:mm A")}`
      : "";
  }, [baseUrl, stats]);
  const isAppShortcut = info?.pid
    ? url === info.url && extname(url) === SHORTCUT_EXTENSION
    : false;
  const elementRef = useRef<HTMLLIElement | null>(null);
  const abortController = useRef<AbortController>(null);
  const isVisible = useIsVisible(elementRef, `.${SEARCH_PARENT_CLASS}`);

  useEffect(() => {
    const activeEntry = details || hovered;
    if (!stats && activeEntry) stat(url).then(setStats);
    if (abortController.current) {
      if (!isVisible) {
        abortController.current.abort();
        abortController.current = null;
      }
    } else if ((activeEntry || isVisible) && info === INITIAL_INFO) {
      abortController.current = new AbortController();
      getResultInfo(fs, url, abortController.current.signal).then(
        (resultsInfo) => {
          if (resultsInfo) setInfo(resultsInfo);
          abortController.current = null;
        },
      );
    }
  }, [details, fs, hovered, info, isVisible, stat, stats, url]);

  useEffect(
    () => () => {
      try {
        abortController.current?.abort();
      } catch {
        // Failed to abort getResultInfo
      }
    },
    [],
  );

  return (
    <li
      ref={elementRef}
      aria-label={baseName}
      className={clsx("search-result", active ? "--active" : undefined)}
      onMouseOver={() => !details && setHovered(true)}
      title={lastModified ? `${baseUrl}\n\n${lastModified}` : baseUrl}
    >
      <figure
        className={clsx(details ? "" : "simple")}
        onClick={async () => {
          openApp(
            info?.pid,
            isAppShortcut
              ? undefined
              : {
                  url:
                    extname(baseUrl) === SHORTCUT_EXTENSION
                      ? getShortcutInfo(await readFile(baseUrl))?.url || baseUrl
                      : baseUrl,
                },
          );
          if (baseUrl && info?.pid) updateRecentFiles(baseUrl, info?.pid);
        }}
      >
        <Icon
          displaySize={details ? 32 : 16}
          imgSize={details ? 32 : 16}
          src={info?.icon}
        />
        <SubIcons
          icon={info?.icon}
          imgSize={details ? 32 : 16}
          name={name}
          showShortcutIcon={false}
          subIcons={info?.subIcons}
          view="icon"
        />
        <figcaption>
          <h1
            dangerouslySetInnerHTML={{
              __html: name,
            }}
          />
          {details && stats && (
            <>
              <h2>
                {fileType(stats, extension, isYTUrl, isAppShortcut, isNostrUrl)}
              </h2>
              {!isYTUrl && !isAppShortcut && !isDirectory && (
                <h2>{lastModified}</h2>
              )}
            </>
          )}
        </figcaption>
      </figure>
      {!active && (
        <div className="select" onClick={() => setActiveItem(url)}>
          <RightArrowIcon />
        </div>
      )}
    </li>
  );
};

export default Result;
