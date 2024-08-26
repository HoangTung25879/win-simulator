import { basename, dirname, extname, join } from "path";
import {
  ICON_CACHE,
  ICON_PATH,
  ICON_RES_MAP,
  MAX_ICON_SIZE,
  MAX_RES_ICON_OVERRIDE,
  ONE_TIME_PASSIVE_EVENT,
  SUPPORTED_ICON_SIZES,
  USER_ICON_PATH,
} from "./constants";
import {
  IconPosition,
  IconPositions,
  SortOrders,
} from "@/contexts/session/types";
import { DragPosition } from "@/app/components/Files/FileEntry/useDraggableEntries";

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

export const bufferToBlob = (buffer: Buffer, type?: string): Blob =>
  new Blob([buffer], type ? { type } : undefined);

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
            .replace(`/${fileName}.png`, "")
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
  console.log("updateIconPositions", {
    directory,
    iconPositions,
    sortOrders,
    dragPosition,
    draggedEntries,
  });
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
