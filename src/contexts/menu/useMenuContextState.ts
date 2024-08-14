import { useCallback, useState } from "react";

export type MenuItem = {
  SvgIcon?: React.MemoExoticComponent<() => React.JSX.Element>;
  action?: () => void;
  checked?: boolean;
  disabled?: boolean;
  icon?: string;
  label?: string;
  menu?: MenuItem[];
  primary?: boolean;
  seperator?: boolean;
  toggle?: boolean;
  tooltip?: string;
};

export type MenuState = {
  items?: MenuItem[];
  staticX?: number;
  staticY?: number;
  x?: number;
  y?: number;
};

type MenuOptions = {
  staticX?: number;
  staticY?: number;
};

export type ContextMenuCapture = {
  onContextMenuCapture: (
    event?: React.MouseEvent,
    domRect?: DOMRect,
    options?: MenuOptions,
  ) => void;
};

type MenuContextState = {
  contextMenu: (
    getItems: (event?: React.MouseEvent) => MenuItem[],
  ) => ContextMenuCapture;
  menu: MenuState;
  setMenu: React.Dispatch<React.SetStateAction<MenuState>>;
};

const useMenuContextState = (): MenuContextState => {
  const [menu, setMenu] = useState<MenuState>(Object.create(null));

  const contextMenu = useCallback(
    (
      getItems: (event?: React.MouseEvent) => MenuItem[],
    ): ContextMenuCapture => {
      const onContextMenuCapture = (
        event?: React.MouseEvent,
        domRect?: DOMRect,
        options?: MenuOptions,
      ) => {
        let x = 0;
        let y = 0;

        if (event) {
          if (event.cancelable) event.preventDefault();

          ({ clientX: x, clientY: y } = event);
        } else if (domRect) {
          const { height, x: inputX, y: inputY } = domRect;

          x = inputX;
          y = inputY + height;
        }
        const items = getItems(event);

        setMenu({
          items: items.length > 0 ? items : undefined,
          staticX: options?.staticX,
          staticY: options?.staticY,
          x,
          y,
        });
      };
      return {
        onContextMenuCapture,
      };
    },
    [],
  );
  return { contextMenu, menu, setMenu };
};

export default useMenuContextState;
