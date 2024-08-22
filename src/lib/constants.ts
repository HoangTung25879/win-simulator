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

export const DEFAULT_ASCENDING = true;

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

export const SYSTEM_SHORTCUT_DIRECTORIES = new Set([DESKTOP_PATH]);

export const MOUNTED_FOLDER_ICON = `${ICON_PATH}/mounted.webp`;

export const NEW_FOLDER_ICON = `${ICON_PATH}/new_folder.webp`;

export const FOLDER_ICON = `${ICON_PATH}/folder.webp`;

export const FOLDER_BACK_ICON = `${ICON_PATH}/folder_back.webp`;

export const FOLDER_FRONT_ICON = `${ICON_PATH}/folder_front.webp`;

export const UNKNOWN_ICON_PATH = `${ICON_PATH}/unknown.webp`;

export const SHORTCUT_EXTENSION = ".url";

export const SYSTEM_FILES = new Set(["desktop.ini"]);

export const SYSTEM_PATHS = new Set(["/.deletedFiles.log"]);

export const MOUNTABLE_EXTENSIONS = new Set([".iso", ".jsdos", ".wsz", ".zip"]);

export const SMALLEST_PNG_SIZE = 51;

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

export const TEXT_EDITORS = ["MonacoEditor", "Vim"];

export const EDITABLE_IMAGE_FILE_EXTENSIONS = new Set([
  ".bmp",
  ".gif",
  ".ico",
  ".jfif",
  ".jpe",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp",
]);

export const AUDIO_FILE_EXTENSIONS = new Set([".aac", ".oga", ".wav"]);

export const VIDEO_FILE_EXTENSIONS = new Set([
  ".m4v",
  ".mkv",
  ".mov",
  ".mp4",
  ".ogg",
  ".ogm",
  ".ogv",
  ".webm",
]);

export const SHORTCUT_ICON = `${ICON_PATH}/shortcut.webp`;

export const PHOTO_ICON = `${ICON_PATH}/photo.webp`;

export const DYNAMIC_PREFIX = ["nostr:"];

export const AUDIO_PLAYLIST_EXTENSIONS = new Set([".asx", ".m3u", ".pls"]);

export const DYNAMIC_EXTENSION = new Set([
  ...AUDIO_FILE_EXTENSIONS,
  ...AUDIO_PLAYLIST_EXTENSIONS,
  ...IMAGE_FILE_EXTENSIONS,
  ...TIFF_IMAGE_FORMATS,
  ...VIDEO_FILE_EXTENSIONS,
  ".ani",
  ".exe",
  ".mp3",
  ".sav",
  ".whtml",
]);
