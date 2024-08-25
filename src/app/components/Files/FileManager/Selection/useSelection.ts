import { Size } from "@/contexts/session/types";
import { Position } from "react-rnd";
import { FocusEntryFunctions } from "../../FileEntry/useFocusableEntries";
import { useRef, useState } from "react";
import { useMenu } from "@/contexts/menu";
import { MenuState } from "@/contexts/menu/useMenuContextState";
import { createSelectionStyling } from "./function";

export type SelectionRect = Partial<Position> & Partial<Size>;

type Selection = {
  isSelecting: boolean;
  selectionEvents: {
    onMouseDown: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    onMouseMove?: React.MouseEventHandler<HTMLElement>;
    onMouseUp?: () => void;
  };
  selectionRect?: SelectionRect;
  selectionStyling: React.CSSProperties;
};

const useSelection = (
  containerRef: React.MutableRefObject<HTMLElement | null>,
  focusedEntries: string[],
  { blurEntry }: FocusEntryFunctions,
): Selection => {
  const { menu, setMenu } = useMenu();
  const [position, setPosition] = useState<Position>(
    () => Object.create(null) as Position,
  );
  const [size, setSize] = useState<Size>(() => Object.create(null) as Size);
  const { x, y } = position;
  const { height: h, width: w } = size;
  const animationRequestId = useRef(0);

  const onMouseMove: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
  }) => {
    if (animationRequestId.current) return;

    const { scrollTop = 0 } = containerRef.current || {};
    const { x: targetX = 0, y: targetY = 0 } =
      containerRef.current?.getBoundingClientRect() || {};

    setSize({
      height: clientY - targetY - (y || 0) + scrollTop,
      width: clientX - targetX - (x || 0),
    });

    animationRequestId.current = window.requestAnimationFrame(() => {
      animationRequestId.current = 0;
    });
  };

  const onMouseDown: React.MouseEventHandler<HTMLElement> = ({
    clientX,
    clientY,
    target,
  }) => {
    if ((target as HTMLElement) !== containerRef.current) return;

    const { scrollTop } = containerRef.current;
    const { x: targetX = 0, y: targetY = 0 } =
      containerRef.current.getBoundingClientRect();

    setSize(Object.create(null) as Size);
    setPosition({
      x: clientX - targetX,
      y: clientY - targetY + scrollTop,
    });

    if (menu && Object.keys(menu).length > 0) {
      setMenu(Object.create(null) as MenuState);
    }
    if (focusedEntries.length > 0) blurEntry();
  };

  const hasSize = typeof w === "number" && typeof h === "number";
  const hasPosition = typeof x === "number" && typeof y === "number";
  const isSelecting = hasSize && hasPosition && Object.keys(menu).length === 0;
  const selection: Selection = {
    isSelecting,
    selectionEvents: {
      onMouseDown,
    },
    selectionStyling: createSelectionStyling(isSelecting, h, w, x, y),
  };

  if (hasPosition) {
    const resetSelection = (): void => {
      setSize(Object.create(null) as Size);
      setPosition(Object.create(null) as Position);
    };

    selection.selectionEvents.onMouseLeave = resetSelection;
    selection.selectionEvents.onMouseMove = onMouseMove;
    selection.selectionEvents.onMouseUp = resetSelection;
  }

  if (isSelecting) {
    selection.selectionRect = Object.assign(
      Object.create(null) as SelectionRect,
      position,
      size,
    );
  }

  return selection;
};

export default useSelection;
