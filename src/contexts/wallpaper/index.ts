import contextFactory from "../contextFactory";
import useWallpaperContextState from "./useWallpaperContextState";

const { Provider, useContext } = contextFactory(useWallpaperContextState);

export { Provider as WallpaperProvider, useContext as useWallpaper };
