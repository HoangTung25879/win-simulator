import contextFactory from "../contextFactory";
import useFileSystemContextState from "./useFileSystemContextState";

const { Provider, useContext } = contextFactory(useFileSystemContextState);

export { Provider as FileSystemProvider, useContext as useFileSystem };
