import {
  FullscreenDocument,
  FullscreenElement,
  NavigatorWithKeyboard,
} from "./useFullScreenContextState";

export const enterFullscreen = async (
  element: FullscreenElement,
  options: FullscreenOptions,
): Promise<void> => {
  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen(options);
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen(options);
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen(options);
    }
  } catch {
    // Ignore failure while entering fullscreen
  }
};

export const exitFullscreen = async (): Promise<void> => {
  const fullscreenDocument = document as FullscreenDocument;

  try {
    if (fullscreenDocument.exitFullscreen) {
      await fullscreenDocument.exitFullscreen();
    } else if (fullscreenDocument.mozCancelFullScreen) {
      await fullscreenDocument.mozCancelFullScreen();
    } else if (fullscreenDocument.webkitExitFullscreen) {
      await fullscreenDocument.webkitExitFullscreen();
    }
  } catch {
    // Ignore failure while exiting fullscreen
  }
};

const FULLSCREEN_LOCKED_KEYS = ["MetaLeft", "MetaRight", "Escape"];

export const toggleKeyboardLock = async (
  fullscreenElement: Element | null,
): Promise<void> => {
  try {
    if (fullscreenElement === document.documentElement) {
      await (navigator as NavigatorWithKeyboard)?.keyboard?.lock?.(
        FULLSCREEN_LOCKED_KEYS,
      );
    } else {
      (navigator as NavigatorWithKeyboard)?.keyboard?.unlock?.();
    }
  } catch {
    // Ignore failure to lock keys
  }
};
