import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFileSystem } from "../fileSystem";
import {
  IconPositions,
  RecentFiles,
  SessionContextState,
  SessionData,
  SortBy,
  SortOrders,
  WindowStates,
} from "./types";
import {
  DEFAULT_ASCENDING,
  DESKTOP_GRID_ID,
  DESKTOP_PATH,
  SESSION_FILE,
  SYSTEM_FILES,
  TRANSITIONS_IN_MS,
} from "@/lib/constants";
import defaultSession from "../../../public/session.json";
import { dirname } from "path";
import { updateIconPositionsIfEmpty } from "@/lib/utils";

const DEFAULT_SESSION = (defaultSession || {}) as unknown as SessionData;

const useSessionContextState = (): SessionContextState => {
  const { readdir, readFile, rootFs, writeFile, lstat } = useFileSystem();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const [cursor, setCursor] = useState("");
  const [windowStates, setWindowStates] = useState(
    Object.create(null) as WindowStates,
  );
  const [sortOrders, setSortOrders] = useState(
    Object.create(null) as SortOrders,
  );
  const [iconPositions, setIconPositions] = useState(
    Object.create(null) as IconPositions,
  );
  const [recentFiles, setRecentFiles] = useState<RecentFiles>([]);
  const initializedSession = useRef(false);
  const loadingDebounceRef = useRef(0);

  const setSortOrder = useCallback(
    (
      directory: string,
      order: string[] | ((currentSortOrder: string[]) => string[]),
      sortBy?: SortBy,
      ascending?: boolean,
    ): void =>
      setSortOrders((currentSortOrder = {}) => {
        const [currentOrder, currentSortBy, currentAscending] =
          currentSortOrder[directory] || [];
        const newOrder =
          typeof order === "function" ? order(currentOrder) : order;

        return {
          ...currentSortOrder,
          [directory]: [
            newOrder,
            sortBy ?? currentSortBy,
            ascending ?? currentAscending ?? DEFAULT_ASCENDING,
          ],
        };
      }),
    [],
  );

  const setAndUpdateIconPositions = useCallback(
    async (positions: SetStateAction<IconPositions>): Promise<void> => {
      if (typeof positions === "function") {
        return setIconPositions(positions);
      }

      const [firstIcon] = Object.keys(positions) || [];
      const isDesktop = firstIcon && DESKTOP_PATH === dirname(firstIcon);

      if (isDesktop) {
        const desktopGrid = document.getElementById(DESKTOP_GRID_ID);

        if (desktopGrid instanceof HTMLOListElement) {
          try {
            const { [DESKTOP_PATH]: [desktopFileOrder = []] = [] } =
              sortOrders || {};
            const newDesktopSortOrder = {
              [DESKTOP_PATH]: [
                [
                  ...new Set([
                    ...desktopFileOrder,
                    ...(await readdir(DESKTOP_PATH)).filter(
                      (entry) => !SYSTEM_FILES.has(entry),
                    ),
                  ]),
                ],
              ],
            } as SortOrders;

            return setIconPositions(
              updateIconPositionsIfEmpty(
                DESKTOP_PATH,
                desktopGrid,
                positions,
                newDesktopSortOrder,
              ),
            );
          } catch {
            // Ignore failure to update icon positions with directory
          }
        }
      }

      return setIconPositions(positions);
    },
    [readdir, sortOrders],
  );

  useEffect(() => {
    if (!initializedSession.current && rootFs) {
      const initSession = async (): Promise<void> => {
        initializedSession.current = true;

        try {
          let session: SessionData;

          try {
            session =
              (await lstat(SESSION_FILE)).blocks <= 0
                ? DEFAULT_SESSION
                : (JSON.parse(
                    (await readFile(SESSION_FILE)).toString(),
                  ) as SessionData);
          } catch {
            session = DEFAULT_SESSION;
          }

          if (session.cursor) setCursor(session.cursor);
          if (
            session.sortOrders &&
            Object.keys(session.sortOrders).length > 0
          ) {
            setSortOrders(session.sortOrders);
          }
          if (
            session.iconPositions &&
            Object.keys(session.iconPositions).length > 0
          ) {
            if (session !== DEFAULT_SESSION && DEFAULT_SESSION.iconPositions) {
              const defaultIconPositions = Object.entries(
                DEFAULT_SESSION.iconPositions,
              );

              Object.keys({
                ...DEFAULT_SESSION.iconPositions,
                ...session.iconPositions,
              }).forEach((iconPath) => {
                const sessionIconPosition = session.iconPositions?.[iconPath];

                if (sessionIconPosition) {
                  const [conflictingDefaultIconPath] =
                    defaultIconPositions.find(
                      ([defaultIconPath, { gridColumnStart, gridRowStart }]) =>
                        defaultIconPath !== iconPath &&
                        sessionIconPosition.gridColumnStart ===
                          gridColumnStart &&
                        sessionIconPosition.gridRowStart === gridRowStart,
                    ) || [];

                  if (
                    conflictingDefaultIconPath &&
                    session.iconPositions?.[conflictingDefaultIconPath]
                      .gridColumnStart ===
                      sessionIconPosition.gridColumnStart &&
                    session.iconPositions?.[conflictingDefaultIconPath]
                      .gridRowStart === sessionIconPosition.gridRowStart
                  ) {
                    delete session.iconPositions[iconPath];
                  }
                } else {
                  session.iconPositions[iconPath] =
                    DEFAULT_SESSION.iconPositions[iconPath];
                }
              });
            }
            setIconPositions(session.iconPositions);
          } else if (typeof session.iconPositions !== "object") {
            setIconPositions(
              DEFAULT_SESSION.iconPositions ||
                (Object.create(null) as IconPositions),
            );
          }
          if (
            session.windowStates &&
            Object.keys(session.windowStates).length > 0
          ) {
            setWindowStates(session.windowStates);
          }
          if (session.recentFiles && session.recentFiles.length > 0) {
            setRecentFiles(session.recentFiles);
          } else if (!Array.isArray(session.recentFiles)) {
            setRecentFiles(DEFAULT_SESSION?.recentFiles || []);
          }
        } catch (error) {
          // if ((error as ApiError)?.code === "ENOENT") {
          //   deletePath(SESSION_FILE);
          // }
        }

        loadingDebounceRef.current = window.setTimeout(() => {
          loadingDebounceRef.current = 0;
          window.sessionIsWriteable = true;
        }, TRANSITIONS_IN_MS.WINDOW * 2);

        setSessionLoaded(true);
      };

      initSession();
    }
  }, [lstat, readFile, rootFs]);

  return {
    // clockSource,
    cursor,
    // foregroundId,
    iconPositions,
    // prependToStack,
    recentFiles,
    // removeFromStack,
    // runHistory,
    sessionLoaded,
    // setClockSource,
    setCursor,
    // setForegroundId,
    // setHaltSession,
    setIconPositions: setAndUpdateIconPositions,
    // setRunHistory,
    setSortOrder,
    // setThemeName,
    // setWallpaper,
    setWindowStates,
    sortOrders,
    stackOrder,
    // themeName,
    // updateRecentFiles,
    // wallpaperFit,
    // wallpaperImage,
    windowStates,
  };
};

export default useSessionContextState;
