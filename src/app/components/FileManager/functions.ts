export const handleFileInputEvent = (
  event: InputChangeEvent | React.DragEvent,
  callback: NewPath,
  directory: string,
  openTransferDialog: (
    fileReaders: FileReaders | ObjectReaders,
  ) => Promise<void>,
  hasUpdateId = false,
): void => {
  haltEvent(event);

  const { files, text } = getEventData(event);

  if (text) {
    try {
      const filePaths = JSON.parse(text) as string[];

      if (!Array.isArray(filePaths) || filePaths.length === 0) return;

      const isSingleFile = filePaths.length === 1;
      const objectReaders = filePaths.map<ObjectReader>((filePath) => {
        let aborted = false;

        return {
          abort: () => {
            aborted = true;
          },
          directory,
          name: filePath,
          operation: "Moving",
          read: async () => {
            if (aborted || dirname(filePath) === ".") return;

            await callback(
              filePath,
              undefined,
              isSingleFile ? COMPLETE_ACTION.UPDATE_URL : undefined,
            );
          },
        };
      });

      if (isSingleFile) {
        const [singleFile] = objectReaders;

        if (hasUpdateId) {
          callback(singleFile.name, undefined, COMPLETE_ACTION.UPDATE_URL);
        }
        if (hasUpdateId || singleFile.directory === singleFile.name) return;
      }

      if (
        filePaths.every((filePath) => dirname(filePath) === directory) ||
        filePaths.includes(directory)
      ) {
        return;
      }

      openTransferDialog(objectReaders);
    } catch {
      // Failed to parse text data to JSON
    }
  } else {
    createFileReaders(files, directory, callback).then(openTransferDialog);
  }
};
