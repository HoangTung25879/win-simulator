import { basename, dirname, extname, join } from "path";
import {
  DEFAULT_LOCALE,
  ICON_CACHE,
  ICON_PATH,
  ICON_RES_MAP,
  MAX_ICON_SIZE,
  MAX_RES_ICON_OVERRIDE,
  ONE_TIME_PASSIVE_EVENT,
  PREVENT_SCROLL,
  SUPPORTED_ICON_SIZES,
  TIMESTAMP_DATE_FORMAT,
  USER_ICON_PATH,
} from "./constants";
import {
  IconPosition,
  IconPositions,
  SortOrders,
} from "@/contexts/session/types";
import { DragPosition } from "@/app/components/Files/FileEntry/useDraggableEntries";
import dayjs from "dayjs";
import { Position } from "react-rnd";
import sizes from "./sizes";
import { Processes } from "@/contexts/process/types";
import GIF from "gif.js";

export const pxToNum = (value: number | string = 0): number =>
  typeof value === "number" ? value : Number.parseFloat(value);

export const createOffscreenCanvas = (
  containerElement: HTMLElement,
  devicePixelRatio = 1,
  size?: {
    width: number;
    height: number;
  },
): OffscreenCanvas => {
  const canvas = document.createElement("canvas");
  const height = Number(size?.height) || containerElement.offsetHeight;
  const width = Number(size?.width) || containerElement.offsetWidth;

  canvas.style.height = `${height}px`;
  canvas.style.width = `${width}px`;

  canvas.height = Math.floor(height * devicePixelRatio);
  canvas.width = Math.floor(width * devicePixelRatio);

  containerElement.append(canvas);

  return canvas.transferControlToOffscreen();
};

export const hasFinePointer = (): boolean =>
  window.matchMedia("(pointer: fine)").matches;

export const getExtension = (url: string): string => extname(url).toLowerCase();

const loadScript = (
  src: string,
  defer?: boolean,
  force?: boolean,
  asModule?: boolean,
): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedScripts = [...document.scripts];
    const currentScript = loadedScripts.find((loadedScript) =>
      loadedScript.src.endsWith(src),
    );

    if (currentScript) {
      if (!force) {
        resolve(new Event("Already loaded."));
        return;
      }
      currentScript.remove();
    }

    const script = document.createElement("script");

    script.async = false;
    if (defer) script.defer = true;
    if (asModule) script.type = "module";
    script.fetchPriority = "high";
    script.src = src;
    script.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
    script.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

    document.head.append(script);
  });

const loadStyle = (href: string): Promise<Event> =>
  new Promise((resolve, reject) => {
    const loadedStyles = [
      ...document.querySelectorAll("link[rel=stylesheet]"),
    ] as HTMLLinkElement[];

    if (loadedStyles.some((loadedStyle) => loadedStyle.href.endsWith(href))) {
      resolve(new Event("Already loaded."));
      return;
    }

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.fetchPriority = "high";
    link.href = href;
    link.addEventListener("error", reject, ONE_TIME_PASSIVE_EVENT);
    link.addEventListener("load", resolve, ONE_TIME_PASSIVE_EVENT);

    document.head.append(link);
  });

export const loadFiles = async (
  files?: string[],
  defer?: boolean,
  force?: boolean,
  asModule?: boolean,
): Promise<void> =>
  !files || files.length === 0
    ? Promise.resolve()
    : files.reduce(async (_promise, file) => {
        await (getExtension(file) === ".css"
          ? loadStyle(encodeURI(file))
          : loadScript(encodeURI(file), defer, force, asModule));
      }, Promise.resolve());

export const haltEvent = (
  event:
    | Event
    | React.DragEvent
    | React.FocusEvent
    | React.KeyboardEvent
    | React.MouseEvent,
): void => {
  try {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
  } catch {
    // Ignore failured to halt event
  }
};

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onloadend = () => resolve(fileReader.result as string);
  });

export const bufferToBlob = (buffer: Buffer, type?: string): Blob =>
  new Blob([new Uint8Array(buffer)], type ? { type } : undefined);

export const bufferToUrl = (buffer: Buffer, mimeType?: string): string =>
  mimeType
    ? `data:${mimeType};base64,${buffer.toString("base64")}`
    : URL.createObjectURL(bufferToBlob(buffer));

export const toSorted = <T>(
  array: T[],
  compareFn?: (a: T, b: T) => number,
): T[] => [...array].sort(compareFn);

export const imageToBufferUrl = (
  extension: string,
  buffer: Buffer | string,
): string =>
  extension === ".svg"
    ? `data:image/svg+xml;base64,${window.btoa(buffer.toString())}`
    : `data:image/${
        extension === ".ani" || extension === ".gif" ? "gif" : "png"
      };base64,${buffer.toString("base64")}`;

export const isDynamicIcon = (icon?: string): boolean =>
  typeof icon === "string" &&
  (icon.startsWith(ICON_PATH) ||
    (icon.startsWith(USER_ICON_PATH) && !icon.startsWith(ICON_CACHE)));

export const cleanUpBufferUrl = (url: string): void => URL.revokeObjectURL(url);

export const imageSrc = (
  imagePath: string,
  size: number,
  ratio: number,
  extension: string,
): string => {
  const imageName = basename(imagePath, ".png");
  const [expectedSize, maxIconSize] = MAX_RES_ICON_OVERRIDE[imageName] || [];
  const ratioSize = size * ratio;
  const imageSize = Math.min(
    MAX_ICON_SIZE,
    expectedSize === size ? Math.min(maxIconSize, ratioSize) : ratioSize,
  );

  return `${join(
    dirname(imagePath),
    `${ICON_RES_MAP[imageSize] || imageSize}x${
      ICON_RES_MAP[imageSize] || imageSize
    }`,
    `${imageName}${extension}`,
  ).replace(/\\/g, "/")}${ratio > 1 ? ` ${ratio}x` : ""}`;
};

export const imageSrcs = (
  imagePath: string,
  size: number,
  extension: string,
  failedUrls = [] as string[],
): string => {
  const srcs = [
    imageSrc(imagePath, size, 1, extension),
    imageSrc(imagePath, size, 2, extension),
    imageSrc(imagePath, size, 3, extension),
  ]
    .filter(
      (url) =>
        failedUrls.length === 0 || failedUrls.includes(url.split(" ")[0]),
    )
    .join(", ");

  return failedUrls?.includes(srcs) ? "" : srcs;
};

export const createFallbackSrcSet = (
  src: string,
  failedUrls: string[],
): string => {
  const failedSizes = new Set(
    new Set(
      failedUrls.map((failedUrl) => {
        const fileName = basename(src, extname(src));

        return Number(
          failedUrl
            .replace(`${ICON_PATH}/`, "")
            .replace(`${USER_ICON_PATH}/`, "")
            .replace(`/${fileName}.png`, "")
            .replace(`/${fileName}.webp`, "")
            .split("x")[0],
        );
      }),
    ),
  );
  const possibleSizes = SUPPORTED_ICON_SIZES.filter(
    (size) => !failedSizes.has(size),
  );

  return possibleSizes
    .map((size) => imageSrc(src, size, 1, extname(src)))
    .reverse()
    .join(", ");
};

const GRID_TEMPLATE_ROWS = "grid-template-rows";

const calcGridDropPosition = (
  gridElement: HTMLElement | null,
  { x = 0, y = 0 }: DragPosition,
): IconPosition => {
  if (!gridElement) return Object.create(null) as IconPosition;

  const gridComputedStyle = window.getComputedStyle(gridElement);
  const gridTemplateRows = gridComputedStyle
    .getPropertyValue(GRID_TEMPLATE_ROWS)
    .split(" ");
  const gridTemplateColumns = gridComputedStyle
    .getPropertyValue("grid-template-columns")
    .split(" ");
  const gridRowHeight = pxToNum(gridTemplateRows[0]);
  const gridColumnWidth = pxToNum(gridTemplateColumns[0]);
  const gridColumnGap = pxToNum(
    gridComputedStyle.getPropertyValue("grid-column-gap"),
  );
  const gridRowGap = pxToNum(
    gridComputedStyle.getPropertyValue("grid-row-gap"),
  );
  const paddingTop = pxToNum(gridComputedStyle.getPropertyValue("padding-top"));

  return {
    gridColumnStart: Math.min(
      Math.ceil(x / (gridColumnWidth + gridColumnGap)),
      gridTemplateColumns.length,
    ),
    gridRowStart: Math.min(
      Math.ceil((y - paddingTop) / (gridRowHeight + gridRowGap)),
      gridTemplateRows.length,
    ),
  };
};

export const updateIconPositionsIfEmpty = (
  url: string,
  gridElement: HTMLElement | null,
  iconPositions: IconPositions,
  sortOrders: SortOrders,
): IconPositions => {
  if (!gridElement) return iconPositions;

  const [fileOrder = []] = sortOrders[url] || [];
  const newIconPositions: IconPositions = {};
  const gridComputedStyle = window.getComputedStyle(gridElement);
  const gridTemplateRowCount = gridComputedStyle
    .getPropertyValue(GRID_TEMPLATE_ROWS)
    .split(" ").length;

  fileOrder.forEach((entry, index) => {
    const entryUrl = join(url, entry);
    if (!iconPositions[entryUrl]) {
      const gridEntry = [...gridElement.children].find((element) =>
        element.querySelector(`button[aria-label="${entry}"]`),
      );

      if (gridEntry instanceof HTMLElement) {
        const { x, y, height, width } = gridEntry.getBoundingClientRect();

        newIconPositions[entryUrl] = calcGridDropPosition(gridElement, {
          x: x - width,
          y: y + height,
        });
      } else {
        const position = index + 1;
        const gridColumnStart = Math.ceil(position / gridTemplateRowCount);
        const gridRowStart =
          position - gridTemplateRowCount * (gridColumnStart - 1);

        newIconPositions[entryUrl] = { gridColumnStart, gridRowStart };
      }
    }
  });

  return Object.keys(newIconPositions).length > 0
    ? { ...newIconPositions, ...iconPositions }
    : iconPositions;
};

const calcGridPositionOffset = (
  url: string,
  targetUrl: string,
  currentIconPositions: IconPositions,
  gridDropPosition: IconPosition,
  [, ...draggedEntries]: string[],
  gridElement: HTMLElement,
): IconPosition => {
  if (currentIconPositions[url] && currentIconPositions[targetUrl]) {
    return {
      gridColumnStart:
        currentIconPositions[url].gridColumnStart +
        (gridDropPosition.gridColumnStart -
          currentIconPositions[targetUrl].gridColumnStart),
      gridRowStart:
        currentIconPositions[url].gridRowStart +
        (gridDropPosition.gridRowStart -
          currentIconPositions[targetUrl].gridRowStart),
    };
  }

  const gridComputedStyle = window.getComputedStyle(gridElement);
  const gridTemplateRowCount = gridComputedStyle
    .getPropertyValue(GRID_TEMPLATE_ROWS)
    .split(" ").length;
  const {
    gridColumnStart: targetGridColumnStart,
    gridRowStart: targetGridRowStart,
  } = gridDropPosition;
  const gridRowStart =
    targetGridRowStart + draggedEntries.indexOf(basename(url)) + 1;

  return gridRowStart > gridTemplateRowCount
    ? {
        gridColumnStart:
          targetGridColumnStart +
          Math.ceil(gridRowStart / gridTemplateRowCount) -
          1,
        gridRowStart:
          gridRowStart % gridTemplateRowCount || gridTemplateRowCount,
      }
    : {
        gridColumnStart: targetGridColumnStart,
        gridRowStart,
      };
};

export const updateIconPositions = (
  directory: string,
  gridElement: HTMLElement | null,
  iconPositions: IconPositions,
  sortOrders: SortOrders,
  dragPosition: DragPosition,
  draggedEntries: string[],
  setIconPositions: React.Dispatch<React.SetStateAction<IconPositions>>,
  exists: (path: string) => Promise<boolean>,
): void => {
  if (!gridElement || draggedEntries.length === 0) return;
  const currentIconPositions = updateIconPositionsIfEmpty(
    directory,
    gridElement,
    iconPositions,
    sortOrders,
  );
  const gridDropPosition = calcGridDropPosition(gridElement, dragPosition);
  const conflictingIcon = Object.entries(currentIconPositions).find(
    ([, { gridColumnStart, gridRowStart }]) =>
      gridColumnStart === gridDropPosition.gridColumnStart &&
      gridRowStart === gridDropPosition.gridRowStart,
  );
  const processIconMove = (): void => {
    const targetFile =
      draggedEntries.find((entry) =>
        entry.startsWith(document.activeElement?.textContent || ""),
      ) || draggedEntries[0];
    const targetUrl = join(directory, targetFile);
    const adjustDraggedEntries = [
      targetFile,
      ...draggedEntries.filter((entry) => entry !== targetFile),
    ];
    const newIconPositions = Object.fromEntries(
      adjustDraggedEntries
        .map<[string, IconPosition]>((entryFile) => {
          const url = join(directory, entryFile);

          return [
            url,
            url === targetUrl
              ? gridDropPosition
              : calcGridPositionOffset(
                  url,
                  targetUrl,
                  currentIconPositions,
                  gridDropPosition,
                  adjustDraggedEntries,
                  gridElement,
                ),
          ];
        })
        .filter(
          ([, { gridColumnStart, gridRowStart }]) =>
            gridColumnStart >= 1 && gridRowStart >= 1,
        ),
    );

    setIconPositions({
      ...currentIconPositions,
      ...Object.fromEntries(
        Object.entries(newIconPositions).filter(
          ([, { gridColumnStart, gridRowStart }]) =>
            !Object.values(currentIconPositions).some(
              ({
                gridColumnStart: currentGridColumnStart,
                gridRowStart: currentRowColumnStart,
              }) =>
                gridColumnStart === currentGridColumnStart &&
                gridRowStart === currentRowColumnStart,
            ),
        ),
      ),
    });
  };

  if (conflictingIcon) {
    const [conflictingIconPath] = conflictingIcon;

    exists(conflictingIconPath).then((pathExists) => {
      if (!pathExists) {
        delete currentIconPositions[conflictingIconPath];
        processIconMove();
      }
    });
  } else {
    processIconMove();
  }
};

const rowBlank = (imageData: ImageData, width: number, y: number): boolean => {
  for (let x = 0; x < width; ++x) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
  }
  return true;
};

const columnBlank = (
  imageData: ImageData,
  width: number,
  x: number,
  top: number,
  bottom: number,
): boolean => {
  for (let y = top; y < bottom; ++y) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
  }
  return true;
};

export const trimCanvasToTopLeft = (
  canvas: HTMLCanvasElement,
): HTMLCanvasElement => {
  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true,
    willReadFrequently: true,
  });

  if (!ctx) return canvas;

  const { height, ownerDocument, width } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { height: bottom, width: right } = imageData;

  let top = 0;
  let left = 0;

  while (top < bottom && rowBlank(imageData, width, top)) ++top;
  while (left < right && columnBlank(imageData, width, left, top, bottom)) {
    ++left;
  }

  const trimmed = ctx.getImageData(left, top, right - left, bottom - top);
  const copy = ownerDocument.createElement("canvas");
  const copyCtx = copy.getContext("2d");

  if (!copyCtx) return canvas;

  copy.width = trimmed.width;
  copy.height = trimmed.height;
  copyCtx.putImageData(trimmed, 0, 0);

  return copy;
};

export const preloadLibs = (libs: string[] = []): void => {
  const scripts = [...document.scripts];
  const preloadedLinks = [
    ...document.querySelectorAll("link[rel=preload]"),
  ] as HTMLLinkElement[];
  libs.map(encodeURI).forEach((lib) => {
    if (
      scripts.some((script) => script.src.endsWith(lib)) ||
      preloadedLinks.some((preloadedLink) => preloadedLink.href.endsWith(lib))
    ) {
      return;
    }
    const link = document.createElement("link");
    link.fetchPriority = "high";
    link.rel = "preload";
    link.href = lib;
    switch (getExtension(lib)) {
      case ".css":
        link.as = "style";
        break;
      case ".htm":
      case ".html":
        link.rel = "prerender";
        break;
      case ".json":
      case ".wasm":
        link.as = "fetch";
        link.crossOrigin = "anonymous";
        break;
      default:
        link.as = "script";
        break;
    }

    document.head.append(link);
  });
};

let IS_FIREFOX: boolean;

export const isFirefox = (): boolean => {
  if (typeof window === "undefined") return false;
  if (IS_FIREFOX ?? false) return IS_FIREFOX;

  IS_FIREFOX = /firefox/i.test(window.navigator.userAgent);

  return IS_FIREFOX;
};

let IS_SAFARI: boolean;

export const isSafari = (): boolean => {
  if (typeof window === "undefined") return false;
  if (IS_SAFARI ?? false) return IS_SAFARI;

  IS_SAFARI = /^(?:(?!chrome|android).)*safari/i.test(
    window.navigator.userAgent,
  );

  return IS_SAFARI;
};

export const generatePrettyTimestamp = (): string =>
  dayjs().format("M_D_YYYY h_mm_ss A");

export const blobToBuffer = async (blob?: Blob | null): Promise<Buffer> =>
  blob ? Buffer.from(await blob.arrayBuffer()) : Buffer.from("");

export const sendMouseClick = (target: HTMLElement, count = 1): void => {
  if (count === 0) return;

  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  sendMouseClick(target, count - 1);
};

export const isYouTubeUrl = (url: string): boolean =>
  (url.includes("youtube.com/") || url.includes("youtu.be/")) &&
  !url.includes("youtube.com/@") &&
  !url.includes("/channel/") &&
  !url.includes("/c/");

const bytesInKB = 1024;
const bytesInMB = 1022976; // 1024 * 999
const bytesInGB = 1047527424; // 1024 * 1024 * 999
const bytesInTB = 1072668082176; // 1024 * 1024 * 1024 * 999

const formatNumber = (number: number): string => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: number < 1 ? 2 : 4,
    minimumSignificantDigits: number < 1 ? 2 : 3,
  }).format(Number(number.toFixed(4).slice(0, -2)));
  const [integer, decimal] = formattedNumber.split(".");
  if (integer.length === 3) return integer;
  if (integer.length === 2 && decimal.length === 2) {
    return `${integer}.${decimal[0]}`;
  }
  return formattedNumber;
};

export const getFormattedSize = (size = 0): string => {
  if (size === 1) return "1 byte";
  if (size < bytesInKB) return `${size} bytes`;
  if (size < bytesInMB) return `${formatNumber(size / bytesInKB)} KB`;
  if (size < bytesInGB) {
    return `${formatNumber(size / bytesInKB / bytesInKB)} MB`;
  }
  if (size < bytesInTB) {
    return `${formatNumber(size / bytesInKB / bytesInKB / bytesInKB)} GB`;
  }
  return `${size} bytes`;
};

export const getWindowViewport = (): Position => ({
  x: window.innerWidth,
  y: window.innerHeight - sizes.taskbar.height,
});

export const makeBoldString = (str: string, substr: string) => {
  return str.replace(new RegExp(`(${substr})`, "i"), "<b>$1</b>");
};

let visibleWindows: string[] = [];

export const toggleShowDesktop = (
  processes: Processes,
  stackOrder: string[],
  minimize: (id: string) => void,
): void => {
  const restoreWindows =
    stackOrder.length > 0 &&
    !stackOrder.some((pid) => !processes[pid]?.minimized);
  const allWindows = restoreWindows ? [...stackOrder].reverse() : stackOrder;

  if (!restoreWindows) visibleWindows = [];

  allWindows.forEach((pid) => {
    if (restoreWindows) {
      if (visibleWindows.includes(pid)) minimize(pid);
    } else if (!processes[pid]?.minimized) {
      visibleWindows.push(pid);
      minimize(pid);
    }
  });

  if (restoreWindows) {
    requestAnimationFrame(() =>
      processes[stackOrder[0]]?.componentWindow?.focus(PREVENT_SCROLL),
    );
  }
};

export const generatePeekElementId = (id: string) => `peek-${id}`;
export const generateTaskbarElementId = (id: string) => `taskbar-${id}`;
export const generateWindowElementId = (id: string) => `window-${id}`;

export const getPeekElement = (id: string) =>
  document.getElementById(generatePeekElementId(id));
export const getTaskbarElement = (id: string) =>
  document.getElementById(generateTaskbarElementId(id));
export const getWindowElement = (id: string) =>
  document.getElementById(generateWindowElementId(id));

export const isBeforeBg = (): boolean =>
  document.documentElement.style.getPropertyValue(
    "--before-background-opacity",
  ) === "1";

type GIFWithWorkers = GIF & { freeWorkers: Worker[] };

export const getGifJs = async (): Promise<GIFWithWorkers> => {
  const { default: GIFInstance } = await import("gif.js.optimized");
  return new GIFInstance({
    quality: 10,
    workerScript: "System/Gif.js/gif.worker.js",
    workers: Math.max(Math.floor(navigator.hardwareConcurrency / 4), 1),
  }) as GIFWithWorkers;
};

// Retrieving the pixel data from the canvas.
// Checking if any pixel has a value other than 0 (fully transparent) or 255 (fully opaque)
export const isCanvasDrawn = (canvas?: HTMLCanvasElement | null): boolean => {
  if (!(canvas instanceof HTMLCanvasElement)) return false;
  if (canvas.width === 0 || canvas.height === 0) return false;

  const { data: pixels = [] } =
    canvas
      .getContext("2d", { willReadFrequently: true })
      ?.getImageData(0, 0, canvas.width, canvas.height) || {};

  if (pixels.length === 0) return false;

  const bwPixels: Record<number, number> = { 0: 0, 255: 0 };

  for (const pixel of pixels) {
    if (pixel !== 0 && pixel !== 255) return true;

    bwPixels[pixel] += 1;
  }

  const isBlankCanvas =
    bwPixels[0] === pixels.length ||
    bwPixels[255] === pixels.length ||
    (bwPixels[255] + bwPixels[0] === pixels.length &&
      bwPixels[0] / 3 === bwPixels[255]);

  return !isBlankCanvas;
};

let idCounter = 0;
export const uniqueId = (prefix: string = "") => {
  const id = ++idCounter;
  return String(prefix) + id;
};

const wrapPromise = (promise: Promise<any>) => {
  let status = "pending";
  let result: any;
  let suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    },
  );
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    },
  };
};

export const fetchFakeData = () => {
  let userPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "John Doe",
      });
    }, 50);
  });
  return wrapPromise(userPromise);
};

export const getYouTubeUrlId = (url: string) => {
  try {
    const { pathname, searchParams } = new URL(url);
    return searchParams.get("v") || pathname.split("/").pop() || "";
  } catch {
    // URL parsing failed
  }
  return "";
};

export const isBrowserUrl = (url: string): boolean =>
  url.startsWith("http://") ||
  url.startsWith("https://") ||
  url.startsWith("chrome://");
