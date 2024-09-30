import { IconProps } from "../../Common/Icon/Icon";
import { FileManagerViewNames } from "./useFileKeyboardShortcuts";

export const FileEntryIconSize: Record<
  FileManagerViewNames | "sub",
  IconProps
> = {
  icon: {
    imgSize: 48,
  },
  list: {
    displaySize: 24,
    imgSize: 48,
  },
  sub: {
    displaySize: 48,
    imgSize: 16,
  },
};
