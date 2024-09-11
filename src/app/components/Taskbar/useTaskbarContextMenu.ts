import { useFullScreen } from "@/contexts/fullScreen";
import { useMenu } from "@/contexts/menu";
import {
  ContextMenuCapture,
  MenuItem,
} from "@/contexts/menu/useMenuContextState";
import { useProcesses } from "@/contexts/process";
import { useProcessesRef } from "@/contexts/process/useProcessesRef";
import { useSession } from "@/contexts/session";
import { MENU_SEPERATOR } from "@/lib/constants";
import { toggleShowDesktop } from "@/lib/utils";
import { useMemo } from "react";

const useTaskbarContextMenu = (onStartButton = false): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { minimize, open } = useProcesses();
  const { stackOrder } = useSession();
  const processesRef = useProcessesRef();
  const { fullscreenElement, toggleFullscreen } = useFullScreen();

  return useMemo(
    () =>
      contextMenu?.(() => {
        const processArray = Object.entries(processesRef.current);
        const allWindowsMinimized =
          processArray.length > 0 &&
          !processArray.some(([, { minimized }]) => !minimized);
        const toggleLabel = allWindowsMinimized
          ? "Show open windows"
          : "Show the desktop";
        const menuItems: MenuItem[] = [
          {
            action: () =>
              toggleShowDesktop(processesRef.current, stackOrder, minimize),
            label: onStartButton ? "Desktop" : toggleLabel,
          },
        ];

        if (onStartButton) {
          menuItems.unshift(
            // {
            //   action: () => open("Terminal"),
            //   label: "Terminal",
            // },
            // MENU_SEPERATOR,
            {
              action: () => open("FileExplorer"),
              label: "File Explorer",
            },
            // {
            //   action: () => open("Run"),
            //   label: "Run",
            // },
            MENU_SEPERATOR,
          );
        } else {
          menuItems.unshift(
            {
              action: () => toggleFullscreen(),
              label:
                fullscreenElement === document.documentElement
                  ? "Exit full screen"
                  : "Enter full screen",
            },
            MENU_SEPERATOR,
          );
        }

        return menuItems;
      }),
    [
      contextMenu,
      fullscreenElement,
      minimize,
      onStartButton,
      open,
      processesRef,
      stackOrder,
      toggleFullscreen,
    ],
  );
};

export default useTaskbarContextMenu;
