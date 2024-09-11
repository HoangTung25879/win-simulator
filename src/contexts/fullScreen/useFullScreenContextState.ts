import { useEffect, useState } from "react";
import {
  enterFullscreen,
  exitFullscreen,
  toggleKeyboardLock,
} from "./functions";
import { isFirefox, isSafari } from "@/lib/utils";

export type ViewportContextState = {
  fullscreenElement: Element | null;
  toggleFullscreen: (
    element?: HTMLElement | null,
    navigationUI?: FullscreenNavigationUI,
  ) => Promise<void>;
};

export type FullscreenDocument = Document & {
  mozCancelFullScreen: () => Promise<void>;
  mozFullScreenElement: Element | null;
  webkitExitFullscreen: () => Promise<void>;
  webkitFullscreenElement: Element | null;
};

export type FullscreenElement = HTMLElement & {
  mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
};

export type NavigatorWithKeyboard = Navigator & {
  keyboard?: {
    lock?: (keys?: string[]) => Promise<void>;
    unlock?: () => void;
  };
};

const useFullScreenContextState = (): ViewportContextState => {
  const [fullscreenElement, setFullscreenElement] = useState<Element | null>(
    null,
  );

  const toggleFullscreen = async (
    element?: HTMLElement | null,
    navigationUI?: FullscreenNavigationUI,
  ): Promise<void> => {
    if (fullscreenElement && (!element || element === fullscreenElement)) {
      await exitFullscreen();
    } else {
      // Only Chrome switches full screen elements without exiting
      if (fullscreenElement && (isFirefox() || isSafari())) {
        await exitFullscreen();
      }
      await enterFullscreen(element || document.documentElement, {
        navigationUI: navigationUI || "hide",
      });
    }
  };

  useEffect(() => {
    const onFullscreenChange = (): void => {
      const { mozFullScreenElement, webkitFullscreenElement } =
        document as FullscreenDocument;
      const currentFullscreenElement =
        document.fullscreenElement ||
        mozFullScreenElement ||
        webkitFullscreenElement;
      toggleKeyboardLock(currentFullscreenElement).then(() =>
        setFullscreenElement(currentFullscreenElement),
      );
    };
    document.addEventListener("fullscreenchange", onFullscreenChange, {
      passive: true,
    });
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return { fullscreenElement, toggleFullscreen };
};

export default useFullScreenContextState;
