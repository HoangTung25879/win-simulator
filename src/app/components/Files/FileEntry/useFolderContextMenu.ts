import { useFileSystem } from "@/contexts/fileSystem";
import { useMenu } from "@/contexts/menu";
import {
  ContextMenuCapture,
  MenuItem,
} from "@/contexts/menu/useMenuContextState";
import { useSession } from "@/contexts/session";
import { SortBy, SortByOrder } from "./useSortBy";
import { FolderActions } from "./useFolder";
import { dirname, join } from "path";
import { useCallback, useMemo } from "react";
import { useProcesses } from "@/contexts/process";
import {
  blobToBuffer,
  bufferToBlob,
  generatePrettyTimestamp,
  isFirefox,
  isSafari,
  updateIconPositions,
} from "@/lib/utils";
import { DESKTOP_PATH, FOLDER_ICON, MENU_SEPERATOR } from "@/lib/constants";
import fixWebmDuration from "fix-webm-duration";
import { useProcessesRef } from "@/contexts/process/useProcessesRef";
import { AllProcess } from "@/contexts/process/directory";

const CAPTURE_FPS = 30;
const MIME_TYPE_VIDEO_WEBM = "video/webm";
const MIME_TYPE_VIDEO_MP4 = "video/mp4";
const NEW_FOLDER = "New folder";

let currentMediaStream: MediaStream | undefined;
let currentMediaRecorder: MediaRecorder | undefined;

const updateSortBy =
  (value: SortBy, defaultIsAscending: boolean) =>
  ([sortBy, isAscending]: SortByOrder): SortByOrder => [
    value,
    sortBy === value ? !isAscending : defaultIsAscending,
  ];

const useFolderContextMenu = (
  url: string,
  {
    addToFolder,
    newPath,
    pasteToFolder,
    sortByOrder: [[sortBy, isAscending], setSortBy],
  }: FolderActions,
  isDesktop?: boolean,
  isStartMenu?: boolean,
): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const {
    exists,
    mapFs,
    pasteList = {},
    readFile,
    rootFs,
    writeFile,
    updateFolder,
  } = useFileSystem();
  const {
    iconPositions,
    // setForegroundId,
    setIconPositions,
    sortOrders,
    // updateRecentFiles,
    hideDesktopIcon,
    setHideDesktopIcon,
  } = useSession();
  const { minimize, open } = useProcesses();
  const processesRef = useProcessesRef();

  const updateSorting = useCallback(
    (value: SortBy | "", defaultIsAscending: boolean): void => {
      setIconPositions((currentIconPositions) =>
        Object.fromEntries(
          Object.entries(currentIconPositions).filter(
            ([entryPath]) => dirname(entryPath) !== url,
          ),
        ),
      );
      setSortBy(
        value === ""
          ? ([currentValue]) => [currentValue, defaultIsAscending]
          : updateSortBy(value, defaultIsAscending),
      );
    },
    [setIconPositions, setSortBy, url],
  );

  const canCapture = useMemo(
    () =>
      isDesktop &&
      typeof window !== "undefined" &&
      typeof navigator?.mediaDevices?.getDisplayMedia === "function" &&
      (window?.MediaRecorder?.isTypeSupported(MIME_TYPE_VIDEO_WEBM) ||
        window?.MediaRecorder?.isTypeSupported(MIME_TYPE_VIDEO_MP4)),
    [isDesktop],
  );

  const captureScreen = useCallback(async () => {
    if (currentMediaRecorder && currentMediaStream) {
      const { active: wasActive } = currentMediaStream;
      try {
        currentMediaRecorder.requestData();
        currentMediaStream.getTracks().forEach((track) => track.stop());
      } catch {
        // Ignore errors with MediaRecorder
      }
      currentMediaRecorder = undefined;
      currentMediaStream = undefined;
      if (wasActive) return;
    }
    const isFirefoxOrSafari = isFirefox() || isSafari();
    const displayMediaOptions: DisplayMediaStreamOptions &
      MediaStreamConstraints = {
      video: {
        frameRate: CAPTURE_FPS,
      },
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#browser_compatibility
      ...(!isFirefoxOrSafari && {
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
        systemAudio: "include",
      }),
    };
    currentMediaStream =
      await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    const [currentVideoTrack] = currentMediaStream.getVideoTracks();
    const { height, width } = currentVideoTrack.getSettings();
    const supportsWebm = MediaRecorder.isTypeSupported(MIME_TYPE_VIDEO_WEBM);
    const fileName = `Screen Capture ${generatePrettyTimestamp()}.${
      supportsWebm ? "webm" : "mp4"
    }`;
    currentMediaRecorder = new MediaRecorder(currentMediaStream, {
      bitsPerSecond: height && width ? height * width * CAPTURE_FPS : undefined,
      mimeType: supportsWebm ? MIME_TYPE_VIDEO_WEBM : MIME_TYPE_VIDEO_MP4,
    });
    const capturePath = join(DESKTOP_PATH, fileName);
    const startTime = Date.now();
    let hasCapturedData = false;
    currentMediaRecorder.start();
    currentMediaRecorder.addEventListener("dataavailable", async (event) => {
      const { data } = event;
      if (data?.size) {
        const bufferData = await blobToBuffer(data);
        await writeFile(
          capturePath,
          hasCapturedData
            ? Buffer.concat([await readFile(capturePath), bufferData])
            : bufferData,
          hasCapturedData,
        );
        if (
          supportsWebm &&
          !isFirefoxOrSafari &&
          (!currentMediaRecorder || currentMediaRecorder.state === "inactive")
        ) {
          fixWebmDuration(
            bufferToBlob(await readFile(capturePath)),
            Date.now() - startTime,
            async (capturedFile) => {
              await writeFile(
                capturePath,
                await blobToBuffer(capturedFile),
                true,
              );
              updateFolder(DESKTOP_PATH, fileName);
            },
          );
        } else {
          updateFolder(DESKTOP_PATH, fileName);
        }
        hasCapturedData = true;
      }
    });
  }, [readFile, updateFolder, writeFile]);

  const updateDesktopIconPositions = useCallback(
    (names: string[], event?: React.MouseEvent) => {
      if (event && isDesktop) {
        const { clientX: x, clientY: y } =
          "TouchEvent" in window && event.nativeEvent instanceof TouchEvent
            ? event.nativeEvent.touches[0]
            : (event.nativeEvent as MouseEvent);

        updateIconPositions(
          DESKTOP_PATH,
          event.target as HTMLElement,
          iconPositions,
          sortOrders,
          { x, y },
          names,
          setIconPositions,
          exists,
        );
      }
    },
    [exists, iconPositions, isDesktop, setIconPositions, sortOrders],
  );

  const newEntry = useCallback(
    async (
      entryName: string,
      data?: Buffer,
      event?: React.MouseEvent,
    ): Promise<void> =>
      updateDesktopIconPositions(
        [await newPath(entryName, data, "rename")],
        event,
      ),
    [newPath, updateDesktopIconPositions],
  );

  return useMemo(() => {
    return contextMenu?.((event) => {
      const { offsetX, offsetY, target } = (event as React.MouseEvent)
        .nativeEvent;
      const targetElement = target as HTMLElement;
      const ADD_FILE = {
        action: () =>
          addToFolder().then((files) => {
            updateDesktopIconPositions(files, event);
          }),
        label: "Add file(s)",
      };
      const FS_COMMANDS = [ADD_FILE];
      const SORT_BY: MenuItem = {
        label: "Sort by",
        menu: [
          {
            action: () => updateSorting("name", true),
            label: "Name",
            toggle: sortBy === "name",
          },
          {
            action: () => updateSorting("size", false),
            label: "Size",
            toggle: sortBy === "size",
          },
          {
            action: () => updateSorting("type", true),
            label: "Item type",
            toggle: sortBy === "type",
          },
          {
            action: () => updateSorting("date", false),
            label: "Date modified",
            toggle: sortBy === "date",
          },
        ],
      };
      const REFRESH: MenuItem = {
        action: () => updateFolder(url),
        label: "Refresh",
      };
      const PERSONALIZE: MenuItem = {
        label: "Personalize",
        action: () => {
          open(AllProcess.Settings, { settingType: "background" });
        },
        icon: "/System/Icons/personalized.webp",
      };
      const CAPTURE_SCREEN: MenuItem = {
        action: captureScreen,
        label: currentMediaStream?.active
          ? "Stop screen capture"
          : "Capture screen",
      };
      const PASTE: MenuItem = {
        action: () => pasteToFolder(event),
        disabled: Object.keys(pasteList).length === 0,
        label: "Paste",
      };
      const NEW: MenuItem = {
        label: "New",
        menu: [
          {
            action: () => newEntry(NEW_FOLDER, undefined, event),
            icon: FOLDER_ICON,
            label: "Folder",
          },
        ],
      };
      const VIEW: MenuItem = {
        label: "View",
        menu: [
          {
            action: () => setHideDesktopIcon(!hideDesktopIcon),
            label: "Show desktop icons",
            checked: !hideDesktopIcon,
          },
        ],
      };
      return [
        VIEW,
        SORT_BY,
        REFRESH,
        MENU_SEPERATOR,
        PASTE,
        CAPTURE_SCREEN,
        ...FS_COMMANDS,
        MENU_SEPERATOR,
        NEW,
        MENU_SEPERATOR,
        PERSONALIZE,
      ];
    });
  }, [
    addToFolder,
    canCapture,
    captureScreen,
    contextMenu,
    exists,
    isAscending,
    isDesktop,
    isStartMenu,
    mapFs,
    minimize,
    newEntry,
    open,
    pasteList,
    pasteToFolder,
    processesRef,
    rootFs?.mntMap,
    // setForegroundId,
    sortBy,
    updateDesktopIconPositions,
    updateFolder,
    // updateRecentFiles,
    updateSorting,
    url,
    writeFile,
    hideDesktopIcon,
    setHideDesktopIcon,
  ]);
};

export default useFolderContextMenu;
