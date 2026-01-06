import { useMenu } from "@/contexts/menu";
import {
  ContextMenuCapture,
  MenuItem,
} from "@/contexts/menu/useMenuContextState";
import useWindowActions from "../useWindowActions";
import { useProcesses } from "@/contexts/process";
import { useMemo } from "react";
import {
  CLOSE,
  MAXIMIZE,
  MAXIMIZE_DISABLED,
  MINIMIZE,
  MINIMIZE_DISABLED,
  RESTORE,
  RESTORE_DISABLED,
} from "./Icons";
import { MENU_SEPERATOR } from "@/lib/constants";

const useTitlebarContextMenu = (id: string): ContextMenuCapture => {
  const { contextMenu } = useMenu();
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const {
    processes: { [id]: process },
  } = useProcesses();
  const {
    allowResizing = true,
    hideMaximizeButton,
    hideMinimizeButton,
    maximized,
    minimized,
  } = process || {};

  return useMemo(
    () =>
      contextMenu?.(() => {
        const isMaxOrMin = maximized || minimized;
        const showMaxOrMin = !hideMaximizeButton || !hideMinimizeButton;

        return [
          showMaxOrMin && {
            action: () => {
              if (minimized) onMinimize();
              else onMaximize();
            },
            disabled: !isMaxOrMin,
            icon: isMaxOrMin ? RESTORE : RESTORE_DISABLED,
            label: "Restore",
          },
          !hideMinimizeButton && {
            action: onMinimize,
            disabled: minimized,
            icon: minimized ? MINIMIZE_DISABLED : MINIMIZE,
            label: "Minimize",
          },
          !hideMaximizeButton && {
            action: onMaximize,
            disabled: isMaxOrMin || !allowResizing,
            icon: isMaxOrMin ? MAXIMIZE_DISABLED : MAXIMIZE,
            label: "Maximize",
          },
          showMaxOrMin && MENU_SEPERATOR,
          {
            action: onClose,
            icon: CLOSE,
            label: "Close",
          },
        ].filter(Boolean) as MenuItem[];
      }),
    [
      allowResizing,
      contextMenu,
      hideMaximizeButton,
      hideMinimizeButton,
      maximized,
      minimized,
      onClose,
      onMaximize,
      onMinimize,
    ],
  );
};

export default useTitlebarContextMenu;
