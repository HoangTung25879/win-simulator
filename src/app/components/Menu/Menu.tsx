"use client";

import { useMenu } from "@/contexts/menu";
import { MenuState } from "@/contexts/menu/useMenuContextState";
import {
  FOCUSABLE_ELEMENT,
  ONE_TIME_PASSIVE_EVENT,
  PREVENT_SCROLL,
} from "@/lib/constants";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Position } from "react-rnd";
import "./Menu.scss";
import clsx from "clsx";
import { haltEvent } from "@/lib/utils";
import MenuItem from "./MenuItem";

type MenuProps = {
  subMenu?: MenuState;
};

export const topLeftPosition = (): Position => ({
  x: 0,
  y: 0,
});

const Menu = ({ subMenu }: MenuProps) => {
  const { menu, setMenu } = useMenu();
  const {
    items,
    staticX = 0,
    staticY = 0,
    x = 0,
    y = 0,
  } = subMenu || menu || {};
  const [offset, setOffset] = useState<Position>(topLeftPosition);
  const isSubMenu = Boolean(subMenu);

  const menuRef = useRef<HTMLElement | null>(null);
  const offsetCalculated = useRef<Partial<DOMRect>>({});

  const calculateOffset = useCallback(() => {
    if (
      !menuRef.current ||
      (offsetCalculated.current.x === x && offsetCalculated.current.y === y)
    ) {
      return;
    }

    offsetCalculated.current = { x, y };

    const {
      height = 0,
      width = 0,
      x: menuX = 0,
      y: menuY = 0,
    } = menuRef.current?.getBoundingClientRect() || {};
    const [vh, vw] = [window.innerHeight, window.innerWidth];

    const newOffset = { x: 0, y: 0 };

    if (!staticX) {
      const subMenuOffscreenX = isSubMenu && menuX + width > vw;

      newOffset.x =
        Math.round(Math.max(0, x + width - vw)) +
        (subMenuOffscreenX ? Math.round(width + (subMenu?.x || 0)) : 0);

      const adjustedOffsetX =
        subMenuOffscreenX && menuX - newOffset.x < 0
          ? newOffset.x - (newOffset.x - menuX)
          : 0;
      if (adjustedOffsetX > 0) newOffset.x = adjustedOffsetX;
    }

    if (!staticY) {
      const bottomOffset = y + height > vh ? vh - y : 0;
      const topAdjustedBottomOffset =
        bottomOffset + height > vh ? 0 : bottomOffset;
      const subMenuOffscreenY = isSubMenu && menuY + height > vh;

      newOffset.y =
        Math.round(Math.max(0, y + height - (vh - topAdjustedBottomOffset))) +
        (subMenuOffscreenY ? Math.round(height + (subMenu?.y || 0)) : 0);
    }
    setOffset(newOffset);
  }, [staticX, staticY, subMenu, x, y]);

  const menuCallbackRef = useCallback(
    (ref: HTMLDivElement) => {
      menuRef.current = ref;
      calculateOffset();
    },
    [calculateOffset],
  );

  const resetMenu = useCallback(
    ({ relatedTarget }: Partial<React.FocusEvent | React.MouseEvent> = {}) => {
      if (
        !(relatedTarget instanceof HTMLElement) ||
        !menuRef.current?.contains(relatedTarget)
      ) {
        setMenu(Object.create(null));
      }
    },
    [],
  );

  useEffect(() => {
    if ((subMenu || menu)?.items && (x || y)) calculateOffset();
  }, [menu, calculateOffset, subMenu, x, y]);

  useEffect(() => {
    if (items && !subMenu) {
      const focusedElement = document.activeElement;
      if (
        focusedElement instanceof HTMLElement &&
        focusedElement !== document.body
      ) {
        const options: AddEventListenerOptions = {
          capture: true,
          ...ONE_TIME_PASSIVE_EVENT,
        };
        const menuUnfocused = ({
          relatedTarget,
          type,
        }: FocusEvent | MouseEvent): void => {
          if (
            !(relatedTarget instanceof HTMLElement) ||
            !menuRef.current?.contains(relatedTarget)
          ) {
            resetMenu();
          }
          focusedElement.removeEventListener(
            type === "click" ? "blur" : "click",
            menuUnfocused,
            { capture: true },
          );
        };
        focusedElement.addEventListener("click", menuUnfocused, options);
        focusedElement.addEventListener("blur", menuUnfocused, options);
      } else {
        menuRef.current?.focus(PREVENT_SCROLL);
      }
    }
  }, [items, resetMenu, subMenu]);

  useEffect(() => {
    const resetOnEscape = ({ key }: KeyboardEvent): void => {
      if (key === "Escape") resetMenu();
    };
    if (items) {
      window.addEventListener("keydown", resetOnEscape, { passive: true });
    }
    return () => window.removeEventListener("keydown", resetOnEscape);
  }, [items, resetMenu]);

  return items ? (
    <motion.div
      role="menu"
      ref={menuCallbackRef}
      className={clsx("context-menu")}
      style={{
        transform: `translate(${staticX || x - offset.x}px, ${staticY || y - offset.y}px)`,
      }}
      onContextMenu={haltEvent}
      {...FOCUSABLE_ELEMENT}
    >
      {items.map((item, index) => (
        <MenuItem
          key={`${item.label || "item"}-${index}`}
          item={item}
          resetMenu={resetMenu}
        />
      ))}
    </motion.div>
  ) : null;
};

export default Menu;
