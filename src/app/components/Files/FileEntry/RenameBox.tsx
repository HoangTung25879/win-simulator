"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { getTextWrapData } from "./functions";
import sizes from "@/lib/sizes";
import {
  DISBALE_AUTO_INPUT_FEATURES,
  MAX_FILE_NAME_LENGTH,
  PREVENT_SCROLL,
  SYSTEM_FONT,
} from "@/lib/constants";
import { extname } from "path";
import { haltEvent } from "@/lib/utils";
import clsx from "clsx";

type RenameBoxProps = {
  isDesktop?: boolean;
  name: string;
  path: string;
  renameFile: (path: string, name?: string) => void;
  setRenaming: React.Dispatch<React.SetStateAction<string>>;
};

const TEXT_HEIGHT_PADDING = 2;
const TEXT_WIDTH_PADDING = 22;

const RenameBox = ({
  isDesktop,
  name,
  path,
  renameFile,
  setRenaming,
}: RenameBoxProps) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const saveRename = () => renameFile(path, inputRef.current?.value);

  const updateDimensions = useCallback(
    (textArea: EventTarget | HTMLTextAreaElement | null): void => {
      if (textArea instanceof HTMLTextAreaElement) {
        const { width } = getTextWrapData(
          textArea.value,
          sizes.fileEntry.fontSize,
          SYSTEM_FONT,
        );

        // Force height to re-calculate
        textArea.setAttribute("style", "height: 1px");
        textArea.setAttribute(
          "style",
          `height: ${textArea.scrollHeight + TEXT_HEIGHT_PADDING}px; width: ${
            width + TEXT_WIDTH_PADDING
          }px`,
        );
      }
    },
    [],
  );

  useLayoutEffect(() => {
    requestAnimationFrame(() => updateDimensions(inputRef.current));
  }, [updateDimensions]);

  useLayoutEffect(() => {
    updateDimensions(inputRef.current);
    inputRef.current?.focus(PREVENT_SCROLL);
    inputRef.current?.setSelectionRange(0, name.length - extname(name).length);
  }, [name, updateDimensions]);

  return (
    <textarea
      className={clsx("rename-box", !isDesktop && "--dark")}
      ref={inputRef}
      defaultValue={name}
      onBlurCapture={saveRename}
      onClick={haltEvent}
      onDragStart={haltEvent}
      onKeyDown={({ key }) => {
        if (key === "Enter") saveRename();
        else if (key === "Escape") setRenaming("");
      }}
      onKeyUp={(event) => {
        updateDimensions(event.target);
        haltEvent(event);
      }}
      rows={1}
      maxLength={MAX_FILE_NAME_LENGTH}
      {...DISBALE_AUTO_INPUT_FEATURES}
    ></textarea>
  );
};

export default RenameBox;
