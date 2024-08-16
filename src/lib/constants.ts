export const TASKBAR_HEIGHT = 40;

export const CLOCK_CANVAS_BASE_WIDTH = 64;

export const ONE_TIME_PASSIVE_EVENT = {
  once: true,
  passive: true,
} as AddEventListenerOptions;

export const PREVENT_SCROLL = { preventScroll: true };

export const FOCUSABLE_ELEMENT = { tabIndex: -1 };

export const TRANSITIONS_IN_MS = {
  DOUBLE_CLICK: 500,
  LONG_PRESS: 500,
  MOUSE_IN_OUT: 300,
  TASKBAR_ITEM: 400,
  WINDOW: 250,
};

export const TRANSITIONS_IN_SECONDS = {
  TASKBAR_ITEM: 0.1,
  WINDOW: 0.25,
};

// File system

export const DEFAULT_MAPPED_NAME = "Share";

export const HOME = "/Users/Public";

export const ROOT_NAME = "My PC";

export const SYSTEM_PATH = "/System";

export const DESKTOP_PATH = `${HOME}/Desktop`;

export const START_MENU_PATH = `${HOME}/Start Menu`;

export const ROOT_SHORTCUT = `${ROOT_NAME}.url`;

export const ICON_PATH = `${SYSTEM_PATH}/Icons`;

export const USER_ICON_PATH = `${HOME}/Icons`;

export const ICON_CACHE = `${USER_ICON_PATH}/Cache`;

export const ICON_CACHE_EXTENSION = ".cache";

export const SESSION_FILE = "/session.json";

export const CLIPBOARD_FILE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png"]);

export const HEIF_IMAGE_FORMATS = new Set([
  ".heic",
  ".heics",
  ".heif",
  ".heifs",
  ".avci",
  ".avcs",
]);

export const TIFF_IMAGE_FORMATS = new Set([
  ".cr2",
  ".dng",
  ".nef",
  ".tif",
  ".tiff",
]);

export const IMAGE_FILE_EXTENSIONS = new Set([
  ...HEIF_IMAGE_FORMATS,
  ...TIFF_IMAGE_FORMATS,
  ".ani",
  ".apng",
  ".avif",
  ".bmp",
  ".cur",
  ".gif",
  ".ico",
  ".jfif",
  ".jif",
  ".jpe",
  ".jpeg",
  ".jpg",
  ".jxl",
  ".pjp",
  ".pjpeg",
  ".png",
  ".svg",
  ".qoi",
  ".webp",
  ".xbm",
]);
