import { useProcesses } from "@/contexts/process";
import directory from "@/contexts/process/directory";
import { PROCESS_DELIMITER } from "@/lib/constants";
import { useCallback } from "react";

type Title = {
  appendFileToTitle: (url: string, unSaved?: boolean) => void;
  prependFileToTitle: (
    url: string,
    unSaved?: boolean,
    withoutDash?: boolean,
  ) => void;
};

const SAVE_TITLE_CHAR = "\u25CF";

const useTitle = (id: string): Title => {
  const { title } = useProcesses();
  const [pid] = id.split(PROCESS_DELIMITER);
  const { title: originalTitle } = directory[pid] || {};
  const appendFileToTitle = useCallback(
    (url: string, unSaved?: boolean) => {
      const appendedFile = url
        ? ` - ${url}${unSaved ? ` ${SAVE_TITLE_CHAR}` : ""}`
        : "";

      title(id, `${originalTitle}${appendedFile}`);
    },
    [id, originalTitle, title],
  );
  const prependFileToTitle = useCallback(
    (url: string, unSaved?: boolean, withoutDash?: boolean) => {
      const prependedFile = url
        ? `${unSaved ? `${SAVE_TITLE_CHAR} ` : ""}${url}${
            withoutDash ? " " : " - "
          }`
        : "";

      title(id, `${prependedFile}${originalTitle}`);
    },
    [id, originalTitle, title],
  );

  return {
    appendFileToTitle,
    prependFileToTitle,
  };
};

export default useTitle;
