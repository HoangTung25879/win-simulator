"use client";

import { MenuItem as Item } from "@/contexts/menu/useMenuContextState";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Position } from "react-rnd";
import Menu, { topLeftPosition } from "./Menu";
import clsx from "clsx";
import { FOCUSABLE_ELEMENT, TRANSITIONS_IN_MS } from "@/lib/constants";
import Icon from "../Icon/Icon";
import { Checkmark, ChevronRight, Circle } from "./Icons";
import { haltEvent } from "@/lib/utils";
import sizes from "@/lib/sizes";

type MenuItemProps = {
  item: Item;
  resetMenu: () => void;
};

const MenuItem = ({ item, resetMenu }: MenuItemProps) => {
  const {
    action,
    disabled,
    SvgIcon,
    checked,
    icon,
    label,
    menu,
    primary,
    seperator,
    toggle,
    tooltip,
  } = item;
  const [subMenuOffset, setSubMenuOffset] = useState<Position>(topLeftPosition);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const showSubMenuTimerRef = useRef<number>(0);

  const setDelayedShowSubMenu = useCallback((show: boolean) => {
    if (showSubMenuTimerRef.current) {
      window.clearTimeout(showSubMenuTimerRef.current);
      showSubMenuTimerRef.current = 0;
    }
    showSubMenuTimerRef.current = window.setTimeout(
      () => setShowSubMenu(show),
      TRANSITIONS_IN_MS.MOUSE_IN_OUT,
    );
  }, []);

  const onMouseEnter: React.MouseEventHandler = () => {
    setMouseOver(true);
    if (menu) setDelayedShowSubMenu(true);
  };

  const onMouseLeave: React.MouseEventHandler = ({ relatedTarget, type }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !itemRef.current?.contains(relatedTarget)
    ) {
      setMouseOver(false);

      if (type === "mouseleave") {
        setDelayedShowSubMenu(false);
      } else {
        setShowSubMenu(false);
      }
    }
  };

  const subMenuEvents = menu
    ? {
        onBlur: onMouseLeave as unknown as React.FocusEventHandler,
        onMouseEnter,
        onMouseLeave,
      }
    : {};

  const triggerAction = useCallback<React.MouseEventHandler>(
    (event) => {
      haltEvent(event);

      if (menu) setShowSubMenu(true);
      else {
        action?.();
        resetMenu();
      }
    },
    [action, menu, resetMenu],
  );

  useLayoutEffect(() => {
    if (menu && itemRef.current) {
      const { height, width } = itemRef.current.getBoundingClientRect();

      setSubMenuOffset({
        x: width - sizes.contextMenu.subMenuOffsetX,
        y: 0 - height - sizes.contextMenu.subMenuOffsetY,
      });
    }
  }, [menu]);

  return (
    <div
      role="menuitem"
      ref={itemRef}
      title={tooltip}
      className={clsx("menu-item", disabled ? "--disabled" : "")}
      {...FOCUSABLE_ELEMENT}
      {...subMenuEvents}
    >
      {seperator ? (
        <hr />
      ) : (
        <button
          className={clsx(
            "item-button",
            showSubMenu && mouseOver ? "--active" : "",
          )}
          onMouseUp={triggerAction}
          {...FOCUSABLE_ELEMENT}
        >
          {icon &&
            (/\p{Extended_Pictographic}/u.test(icon) ? (
              <span>{icon}</span>
            ) : (
              <Icon alt={label} imgSize={16} src={icon} />
            ))}
          {checked && <Checkmark className="left-2" />}
          {toggle && <Circle className="left-2" />}
          {SvgIcon && (
            <div className="icon">
              <SvgIcon />
            </div>
          )}
          <div className={clsx("item-label", primary ? "font-bold" : "")}>
            {label}
          </div>
          {menu && <ChevronRight className="right-2" />}
        </button>
      )}
      {showSubMenu && menu && (
        <Menu subMenu={{ items: menu, ...subMenuOffset }} />
      )}
    </div>
  );
};

export default MenuItem;
