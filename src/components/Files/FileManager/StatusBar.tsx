"use client";

import { useFileSystem } from "@/contexts/fileSystem";
import { FileDrop } from "../FileEntry/useFileDrop";
import { useEffect, useState } from "react";
import { UNKNOWN_SIZE } from "@/contexts/fileSystem/core";
import { getFormattedSize, haltEvent } from "@/lib/utils";
import { join } from "path";
import { useProcesses } from "@/contexts/process";
import colors from "@/lib/colors";

type StatusBarProps = {
  id?: string;
  count: number;
  directory: string;
  fileDrop: FileDrop;
  selected: string[];
};

const UNCALCULATED_SIZE = -2;

const StatusBar = ({
  id,
  count,
  directory,
  fileDrop,
  selected,
}: StatusBarProps) => {
  const {
    processes: { [id || ""]: process },
  } = useProcesses();
  const { statusbarColor, textColor } = process || {};
  const { exists, lstat, stat } = useFileSystem();
  const [selectedSize, setSelectedSize] = useState(UNKNOWN_SIZE);

  useEffect(() => {
    const updateSelectedSize = async (): Promise<void> =>
      setSelectedSize(
        await selected.reduce(async (totalSize, file) => {
          const currentSize = await totalSize;
          if (currentSize === UNCALCULATED_SIZE) return UNCALCULATED_SIZE;
          const path = join(directory, file);
          try {
            if (await exists(path)) {
              return (await lstat(path)).isDirectory()
                ? UNCALCULATED_SIZE
                : (currentSize === UNKNOWN_SIZE ? 0 : currentSize) +
                    (await stat(path)).size;
            }
          } catch {
            // Ignore errors getting file sizes
          }
          return totalSize;
        }, Promise.resolve(UNKNOWN_SIZE)),
      );
    updateSelectedSize();
  }, [directory, exists, lstat, selected, stat]);

  return (
    <footer
      style={
        {
          "--status-bar-background":
            statusbarColor || colors.statusBar.background,
          "--status-bar-text": textColor || colors.statusBar.text,
        } as React.CSSProperties
      }
      className="status-bar"
      onContextMenuCapture={haltEvent}
      {...fileDrop}
    >
      <div title="Total item count">
        {count} item{count === 1 ? "" : "s"}
      </div>
      {selected.length > 0 && (
        <div className="selected" title="Selected item count and size">
          {selected.length} item{selected.length === 1 ? "" : "s"} selected
          {selectedSize !== UNKNOWN_SIZE && selectedSize !== UNCALCULATED_SIZE
            ? `\u00A0\u00A0${getFormattedSize(selectedSize)}`
            : ""}
        </div>
      )}
    </footer>
  );
};

export default StatusBar;
