import {
  DESKTOP_PATH,
  MOUNTABLE_EXTENSIONS,
  PREVENT_SCROLL,
} from "@/lib/constants";
import { COMPLETE_ACTION, CompleteAction, NewPath } from "./useFolder";
import { useProcesses } from "@/contexts/process";
import { useProcessesRef } from "@/contexts/process/useProcessesRef";
import { useSession } from "@/contexts/session";
import { useFileSystem } from "@/contexts/fileSystem";
import useTransferDialog from "../../Dialogs/Transfer/useTransferDiaglog";
import { getExtension, haltEvent, updateIconPositions } from "@/lib/utils";
import { getEventData, handleFileInputEvent } from "../FileManager/functions";
import { DragPosition } from "./useDraggableEntries";
import { basename, extname, join, relative } from "path";
import { useCallback } from "react";

export type FileDrop = {
  onDragLeave?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
};

type FileDropProps = {
  callback?: NewPath;
  directory?: string;
  id?: string;
  onDragLeave?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent | React.DragEvent<HTMLElement>) => void;
  updatePositions?: boolean;
};

const useFileDrop = ({
  callback,
  directory = DESKTOP_PATH,
  id,
  onDragLeave,
  onDragOver,
  updatePositions,
}: FileDropProps): FileDrop => {
  const { url } = useProcesses();
  const processesRef = useProcessesRef();
  const { iconPositions, sortOrders, setIconPositions } = useSession();
  const { exists, mkdirRecursive, updateFolder, writeFile } = useFileSystem();
  const { openTransferDialog } = useTransferDialog();

  const updateProcessUrl = useCallback(
    async (
      filePath: string,
      fileData?: Buffer,
      completeAction?: CompleteAction,
    ): Promise<string> => {
      if (id) {
        if (fileData) {
          const tempPath = join(DESKTOP_PATH, filePath);
          await mkdirRecursive(DESKTOP_PATH);
          if (await writeFile(tempPath, fileData, true)) {
            if (completeAction === COMPLETE_ACTION.UPDATE_URL) {
              url(id, tempPath);
            }
            updateFolder(DESKTOP_PATH, filePath);
            return basename(tempPath);
          }
        } else if (completeAction === COMPLETE_ACTION.UPDATE_URL) {
          url(id, filePath);
        }
      }
      return "";
    },
    [id, mkdirRecursive, updateFolder, url, writeFile],
  );

  return {
    onDragLeave,
    onDragOver: (event) => {
      onDragOver?.(event);
      haltEvent(event);
    },
    onDrop: (event) => {
      if (MOUNTABLE_EXTENSIONS.has(getExtension(directory))) return;
      if (updatePositions && event.target instanceof HTMLElement) {
        const { files, text } = getEventData(event as React.DragEvent);
        if (files.length === 0 && text === "") return;
        const checkUpdatableIcons = async (): Promise<void> => {
          const dragPosition = {
            x: event.clientX,
            y: event.clientY,
          } as DragPosition;
          let fileEntries: string[] = [];
          if (text) {
            try {
              fileEntries = JSON.parse(text) as string[];
            } catch {
              // Ignore failed JSON parsing
            }
            if (!Array.isArray(fileEntries)) return;
            const [firstEntry] = fileEntries;
            if (!firstEntry) return;
            if (
              firstEntry.startsWith(directory) &&
              basename(firstEntry) === relative(directory, firstEntry)
            ) {
              return;
            }
            fileEntries = fileEntries.map((entry) => basename(entry));
          } else if (files instanceof FileList) {
            fileEntries = [...files].map((file) => file.name);
          } else {
            fileEntries = [...files]
              .map((file) => file.getAsFile()?.name || "")
              .filter(Boolean);
          }
          fileEntries = await Promise.all(
            fileEntries.map(async (fileEntry) => {
              let entryIteration = `${directory}/${fileEntry}`;
              if (
                !iconPositions[entryIteration] ||
                !(await exists(entryIteration))
              ) {
                return fileEntry;
              }
              let iteration = 0;
              do {
                iteration += 1;
                entryIteration = `${directory}/${basename(
                  fileEntry,
                  extname(fileEntry),
                )} (${iteration})${extname(fileEntry)}`;
              } while (
                iconPositions[entryIteration] &&
                (await exists(entryIteration))
              );
              return basename(entryIteration);
            }),
          );
          updateIconPositions(
            directory,
            event.target as HTMLElement,
            iconPositions,
            sortOrders,
            dragPosition,
            fileEntries,
            setIconPositions,
            exists,
          );
        };
        checkUpdatableIcons();
      }
      const hasUpdateId = typeof id === "string";
      if (hasUpdateId && !updatePositions && directory === DESKTOP_PATH) {
        processesRef.current[id]?.componentWindow?.focus(PREVENT_SCROLL);
      }
      handleFileInputEvent(
        event as React.DragEvent,
        callback || updateProcessUrl,
        directory,
        openTransferDialog,
        hasUpdateId,
      );
    },
  };
};

export default useFileDrop;
