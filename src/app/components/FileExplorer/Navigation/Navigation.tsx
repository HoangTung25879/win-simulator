"use client";

import { useMenu } from "@/contexts/menu";
import { useProcesses } from "@/contexts/process";
import useHistory from "@/hooks/useHistory";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackIcon, DownIcon, ForwardIcon, UpIcon } from "./Icons";
import { basename, dirname } from "path";
import { ROOT_NAME } from "@/lib/constants";
import useResizeObserver from "@/hooks/useResizeObserver";
import { MenuState } from "@/contexts/menu/useMenuContextState";
import AddressBar from "./AddressBar";
import SearchBar from "./SearchBar";
import "./Navigation.scss";

type NavigationProps = {
  hideSearch: boolean;
  id: string;
};

const CONTEXT_MENU_OFFSET = 3;

const Navigation = forwardRef<HTMLInputElement, NavigationProps>(
  ({ hideSearch, id }, inputRef) => {
    const {
      url: changeUrl,
      processes: {
        [id]: { url = "" },
      },
    } = useProcesses();
    const { contextMenu, menu, setMenu } = useMenu();
    const { canGoBack, canGoForward, history, moveHistory, position } =
      useHistory(url, id);
    const [isRecentMenuOpen, setIsRecentMenuOpen] = useState(false);
    const [removeSearch, setRemoveSearch] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);
    const upTo = url === "/" ? "" : basename(dirname(url));

    const recentItemsMenu = useMemo(
      () =>
        history
          .map((historyUrl, index) => ({
            action: () => moveHistory(index - position),
            checked: position === index,
            label: basename(historyUrl) || ROOT_NAME,
            primary: position === index,
          }))
          .reverse(),
      [history, moveHistory, position],
    );

    const resizeCallback = useCallback<ResizeObserverCallback>(
      ([{ contentRect }]) => {
        const tooSmallForSearch = contentRect.width < 260;
        if (removeSearch && !tooSmallForSearch) {
          setRemoveSearch(false);
        } else if (!removeSearch && tooSmallForSearch) {
          setRemoveSearch(true);
        }
      },
      [removeSearch],
    );

    const { onContextMenuCapture } = useMemo(
      () => contextMenu?.(() => recentItemsMenu),
      [contextMenu, recentItemsMenu],
    );

    useEffect(() => {
      setIsRecentMenuOpen(recentItemsMenu === menu.items);
    }, [menu.items, recentItemsMenu]);

    useResizeObserver(navRef.current, resizeCallback);

    return (
      <div className="navigation">
        <button
          disabled={!canGoBack}
          onClick={() => moveHistory(-1)}
          title={
            canGoBack
              ? `Back to ${basename(history[position - 1]) || ROOT_NAME}`
              : "Back"
          }
        >
          <BackIcon />
        </button>
        <button
          disabled={!canGoForward}
          onClick={() => moveHistory(+1)}
          title={
            canGoForward
              ? `Forward to ${basename(history[position + 1]) || ROOT_NAME}`
              : "Forward"
          }
        >
          <ForwardIcon />
        </button>
        <button
          disabled={history.length === 1}
          onClick={(event) => {
            event.preventDefault();
            if (isRecentMenuOpen) setMenu(Object.create(null) as MenuState);
            else {
              const {
                height = 0,
                y = 0,
                x = 0,
              } = navRef.current?.getBoundingClientRect() || {};
              onContextMenuCapture(
                x && y && height
                  ? ({
                      pageX: x,
                      pageY: y + height - CONTEXT_MENU_OFFSET,
                    } as React.MouseEvent)
                  : event,
              );
            }
          }}
          title="Recent locations"
        >
          <DownIcon />
        </button>
        <button
          disabled={url === "/"}
          onClick={() => changeUrl(id, dirname(url))}
          title={
            url === "/"
              ? "Up one level"
              : `Up to "${upTo === "" ? ROOT_NAME : upTo}"`
          }
        >
          <UpIcon />
        </button>
        <AddressBar ref={inputRef} id={id} />
        {!hideSearch && !removeSearch && <SearchBar id={id} />}
      </div>
    );
  },
);

export default Navigation;
