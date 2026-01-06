"use client";

import { useProcesses } from "@/contexts/process";
import { ComponentProcessProps } from "../../Apps/RenderComponent";
import { FileReaders, ObjectReaders, Operation } from "./useTransferDiaglog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Transfer.scss";
import { basename, dirname } from "path";
import { haltEvent } from "@/lib/utils";
import { FOCUSABLE_ELEMENT, ONE_TIME_PASSIVE_EVENT } from "@/lib/constants";

type TransferProps = {} & ComponentProcessProps;

const MAX_TITLE_LENGTH = 37;

const isFileReaders = (
  readers?: FileReaders | ObjectReaders,
): readers is FileReaders => Array.isArray(readers?.[0]);

const Transfer = ({ id }: TransferProps) => {
  const {
    argument,
    closeWithTransition,
    processes: { [id]: process } = {},
    title,
  } = useProcesses();
  const { closing, fileReaders, url } = process || {};
  const [currentTransfer, setCurrentTransfer] = useState<[string, File]>();
  const [cd = "", { name = "" } = {}] = currentTransfer || [];
  const [progress, setProgress] = useState<number>(0);
  const currentOperation = useRef<Operation | undefined>(undefined);
  const processing = useRef(false);

  const actionName = useMemo(() => {
    if (closing || !process) return currentOperation.current;
    let operation: Operation = "Copying";
    const { operation: objectOperation } =
      (fileReaders as ObjectReaders)?.[0] || {};
    if (objectOperation) {
      operation = objectOperation;
    } else if (url && !fileReaders) {
      operation = "Extracting";
    }
    currentOperation.current = operation;
    return operation;
  }, [closing, fileReaders, process, url]);

  const totalTransferSize = useMemo(
    () =>
      isFileReaders(fileReaders)
        ? fileReaders.reduce((acc, [{ size = 0 }]) => acc + size, 0)
        : fileReaders?.length || Number.POSITIVE_INFINITY,
    [fileReaders],
  );

  const completeTransfer = useCallback(() => {
    processing.current = false;
    closeWithTransition(id);
  }, [closeWithTransition, id]);

  const processFileReader = useCallback(
    ([[file, directory, reader], ...remainingReaders]: FileReaders) => {
      let fileProgress = 0;
      setCurrentTransfer([directory, file]);
      reader.addEventListener(
        "progress",
        ({ loaded = 0 }) => {
          const progressLoaded = loaded - fileProgress;
          setProgress((currentProgress) => currentProgress + progressLoaded);
          fileProgress = loaded;
        },
        { passive: true },
      );
      reader.addEventListener(
        "loadend",
        () => {
          if (remainingReaders.length > 0) {
            processFileReader(remainingReaders);
          } else {
            completeTransfer();
          }
        },
        ONE_TIME_PASSIVE_EVENT,
      );
      reader.readAsArrayBuffer(file);
    },
    [completeTransfer],
  );

  const processObjectReader = useCallback(
    ([reader, ...remainingReaders]: ObjectReaders) => {
      const isComplete = remainingReaders.length === 0;
      reader.read().then(() => {
        setProgress((currentProgress) => currentProgress + 1);
        if (isComplete) {
          reader.done?.();
          completeTransfer();
        } else {
          const [{ directory, name: nextName }] = remainingReaders;
          setCurrentTransfer([directory, { name: nextName } as File]);
        }
      });
      if (!isComplete) processObjectReader(remainingReaders);
    },
    [completeTransfer],
  );

  useEffect(() => {
    if (!processing.current) {
      if (fileReaders) {
        if (fileReaders?.length > 0) {
          processing.current = true;
          if (isFileReaders(fileReaders)) {
            processFileReader(fileReaders);
          } else {
            const [{ directory, name: firstName }] = fileReaders;
            setCurrentTransfer([directory, { name: firstName } as File]);
            processObjectReader(fileReaders);
          }
        } else {
          closeWithTransition(id);
        }
      } else if (url) {
        setCurrentTransfer([dirname(url), { name: basename(url) } as File]);
      }
    }
  }, [
    closeWithTransition,
    fileReaders,
    id,
    processFileReader,
    processObjectReader,
    url,
  ]);

  useEffect(() => {
    if (processing.current) {
      const progressPercent = Math.floor((progress / totalTransferSize) * 100);
      argument(id, "progress", progressPercent);
      title(id, `${progressPercent}% complete`);
    }
  }, [argument, id, progress, title, totalTransferSize]);

  useEffect(() => title(id, `${actionName}...`), [actionName, id, title]);

  useEffect(
    () => () => {
      if (closing && processing.current) {
        if (isFileReaders(fileReaders)) {
          fileReaders.forEach(([, , reader]) => reader.abort());
        } else {
          fileReaders?.forEach((reader) => reader.abort());
          fileReaders?.[0]?.done?.();
        }
      }
    },
    [closing, fileReaders],
  );

  const handleCloseOnEscape = useCallback<
    React.KeyboardEventHandler<HTMLElement>
  >(
    ({ key }) => {
      if (key === "Escape") {
        closeWithTransition(id);
      }
    },
    [closeWithTransition, id],
  );

  return (
    <div
      onContextMenu={haltEvent}
      className="transfer-dialog"
      onKeyDownCapture={handleCloseOnEscape}
      {...FOCUSABLE_ELEMENT}
    >
      <h1>
        {name
          ? `${actionName} '${
              name.length >= MAX_TITLE_LENGTH
                ? `${name.slice(0, MAX_TITLE_LENGTH)}...`
                : name
            }'`
          : ""}
      </h1>
      <div>
        <h2>{cd ? `To '${cd}'` : ""}</h2>
        <progress
          max={totalTransferSize}
          value={
            totalTransferSize === Number.POSITIVE_INFINITY
              ? undefined
              : progress
          }
        />
      </div>
      <nav>
        <button onClick={() => closeWithTransition(id)}>Cancel</button>
      </nav>
    </div>
  );
};

export default Transfer;
