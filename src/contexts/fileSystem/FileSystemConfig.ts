import { type FileSystemConfiguration } from "browserfs";
import { fs9pToBfs } from "./core";

const index = fs9pToBfs();
const FileSystemConfig = (
  writeToIndexedDb = true,
): FileSystemConfiguration => ({
  fs: "MountableFileSystem",
  options: {
    "/": {
      fs: "OverlayFS",
      options: {
        readable: {
          fs: "HTTPRequest",
          options: { index },
        },
        writable: {
          fs: writeToIndexedDb ? "IndexedDB" : "InMemory",
          options: {},
        },
      },
    },
  },
});

export default FileSystemConfig;
