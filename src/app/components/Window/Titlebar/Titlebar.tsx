"use client";

import { useProcesses } from "@/contexts/process";
import { useSession } from "@/contexts/session";
import useDoubleClick from "@/hooks/useDoubleClick";
import useWindowActions from "../useWindowActions";
import { useMenu } from "@/contexts/menu";
import rndDefaults from "../rndDefaults";
import { haltEvent } from "@/lib/utils";
import useTitlebarContextMenu from "./useTitlebarContextMenu";
import clsx from "clsx";
import colors from "@/lib/colors";
import sizes from "@/lib/sizes";
import { MenuState } from "@/contexts/menu/useMenuContextState";
import { PREVENT_SCROLL } from "@/lib/constants";
import Icon from "../../Common/Icon/Icon";
import { CloseIcon, MaximizedIcon, MaximizeIcon, MinimizeIcon } from "./Icons";

type TitlebarProps = {
  id: string;
};

const Titlebar = ({ id }: TitlebarProps) => {
  const {
    processes: { [id]: process },
  } = useProcesses();
  const {
    allowResizing = true,
    closing,
    componentWindow,
    titlebarColor,
    titlebarButtonColor,
    titlebarButtonHoverColor,
    titlebarBorderColor,
    textColor,
    hideMaximizeButton,
    hideMinimizeButton,
    hideTitlebarIcon,
    icon,
    title,
    maximized,
  } = process || {};
  const { foregroundId } = useSession();
  const isForeground = id === foregroundId;
  const { onClose, onMaximize, onMinimize } = useWindowActions(id);
  const onDoubleClickMaximize = useDoubleClick(onMaximize);
  const { menu, setMenu } = useMenu();
  const titlebarContextMenu = useTitlebarContextMenu(id);

  const IconWrapper = ({
    SvgComponent,
  }: {
    SvgComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }) => {
    return (
      <SvgComponent
        fill={
          isForeground ? colors.titleBar.text : colors.titleBar.buttonInactive
        }
        width={sizes.titleBar.buttonIconWidth}
      />
    );
  };

  return (
    <header
      style={
        {
          "--title-bar-background": titlebarColor || colors.titleBar.background,
          "--title-bar-text": textColor || colors.titleBar.text,
          "--title-bar-button": titlebarButtonColor || colors.titleBar.button,
          "--title-bar-button-hover":
            titlebarButtonHoverColor || colors.titleBar.buttonHover,
          "--title-bar-border": titlebarBorderColor || colors.titleBar.border,
        } as React.CSSProperties
      }
      className={clsx(
        "window-titlebar",
        isForeground ? "is-foreground" : "",
        rndDefaults.dragHandleClassName,
      )}
      onDragOver={haltEvent}
      onDrop={haltEvent}
      {...titlebarContextMenu}
    >
      <button
        onClick={
          !hideMaximizeButton && allowResizing && !closing
            ? onDoubleClickMaximize
            : undefined
        }
        onMouseDownCapture={({ button }) => {
          if (button === 0 && Object.keys(menu).length > 0) {
            setMenu(Object.create(null) as MenuState);
          }
        }}
        onMouseUpCapture={() => {
          if (componentWindow && componentWindow !== document.activeElement) {
            componentWindow.focus(PREVENT_SCROLL);
          }
        }}
      >
        <figure>
          {!hideTitlebarIcon && <Icon alt={title} imgSize={16} src={icon} />}
          <figcaption>{title}</figcaption>
        </figure>
      </button>
      <nav className="cancel">
        {!hideMinimizeButton && (
          <button
            className="minimize"
            onClick={() => onMinimize()}
            aria-label="Minimize"
            title="Minimize"
          >
            <IconWrapper SvgComponent={MinimizeIcon} />
          </button>
        )}
        {!hideMaximizeButton && (
          <button
            className="maximize"
            disabled={!allowResizing}
            onClick={onMaximize}
            aria-label={maximized ? "Restore Down" : "Maximize"}
            title={maximized ? "Restore Down" : "Maximize"}
          >
            <IconWrapper
              SvgComponent={maximized ? MaximizedIcon : MaximizeIcon}
            />
          </button>
        )}
        <button
          className="close"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <IconWrapper SvgComponent={CloseIcon} />
        </button>
      </nav>
    </header>
  );
};

export default Titlebar;
