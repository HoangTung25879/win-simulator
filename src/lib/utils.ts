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
