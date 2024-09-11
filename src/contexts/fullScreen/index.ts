import contextFactory from "../contextFactory";
import useFullScreenContextState from "./useFullScreenContextState";

const { Provider, useContext } = contextFactory(useFullScreenContextState);

export { Provider as FullScreenProvider, useContext as useFullScreen };
