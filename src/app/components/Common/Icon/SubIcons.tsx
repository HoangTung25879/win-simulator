import { memo, useMemo } from "react";
import { FileManagerViewNames } from "../../Files/FileEntry/useFileKeyboardShortcuts";
import { FileEntryIconSize } from "../../Files/FileEntry/constants";
import {
  FOLDER_BACK_ICON,
  FOLDER_FRONT_ICON,
  ICON_CACHE,
  SHORTCUT_ICON,
  YT_ICON_CACHE,
} from "@/lib/constants";
import Icon from "./Icon";

type IconProps = {
  icon: string;
  name: string;
  view: FileManagerViewNames;
};

type SharedSubIconProps = {
  imgSize?: 64 | 32 | 16;
  isDesktop?: boolean;
};

type SubIconProps = SharedSubIconProps &
  IconProps & {
    baseIcon: string;
    isFirstImage: boolean;
    totalSubIcons: number;
  };

type SubIconsProps = SharedSubIconProps &
  IconProps & {
    showShortcutIcon: boolean;
    subIcons?: string[];
  };

const WIDE_IMAGE_TRANSFORM = "matrix(0.5, 0.05, 0, 0.7, 2, 1)";
const WIDE_IMAGE_TRANSFORM_16 = "matrix(0.5, 0.05, 0, 0.8, 3.5, 2)";
const SHORT_IMAGE_TRANSFORM = "matrix(0.4, 0.14, 0, 0.7, -4, 2)";
const SHORT_IMAGE_TRANSFORM_16 = "matrix(0.4, 0.14, 0, 0.8, -0.5, 2)";

const SubIcon = ({
  baseIcon,
  icon,
  imgSize,
  isDesktop,
  isFirstImage,
  name,
  totalSubIcons,
  view,
}: SubIconProps) => {
  const iconView = useMemo(
    () =>
      FileEntryIconSize[
        ![SHORTCUT_ICON, FOLDER_FRONT_ICON].includes(icon) &&
        !icon.startsWith("blob:") &&
        !icon.startsWith(ICON_CACHE) &&
        !icon.startsWith(YT_ICON_CACHE)
          ? "sub"
          : view
      ],
    [icon, view],
  );

  const style = useMemo((): React.CSSProperties | undefined => {
    if (icon === FOLDER_FRONT_ICON) return { zIndex: 3 };
    if (baseIcon === FOLDER_BACK_ICON) {
      const hasMultipleSubIcons = totalSubIcons - 1 > 1;
      const isSmallImage = imgSize === 16;
      const shortTransform = isSmallImage
        ? SHORT_IMAGE_TRANSFORM_16
        : SHORT_IMAGE_TRANSFORM;
      const wideTransform = isSmallImage
        ? WIDE_IMAGE_TRANSFORM_16
        : WIDE_IMAGE_TRANSFORM;
      const transform = isFirstImage
        ? hasMultipleSubIcons
          ? shortTransform
          : wideTransform
        : wideTransform;
      return {
        objectFit: "cover",
        transform: `${transform} translateZ(0px)`,
        zIndex: isFirstImage ? 2 : 1,
      };
    }
    return undefined;
  }, [baseIcon, icon, imgSize, isFirstImage, totalSubIcons]);

  return (
    <Icon
      eager={isDesktop || icon === SHORTCUT_ICON}
      alt={name}
      src={icon}
      style={style}
      {...iconView}
    />
  );
};

const MemoizedSubIcon = memo(SubIcon);

const SubIcons = ({
  icon,
  imgSize,
  isDesktop,
  name,
  showShortcutIcon,
  subIcons,
  view,
}: SubIconsProps) => {
  const icons = useMemo(
    () =>
      showShortcutIcon
        ? subIcons?.filter((iconEntry) => iconEntry !== SHORTCUT_ICON)
        : subIcons,
    [showShortcutIcon, subIcons],
  );
  const filteredSubIcons = useMemo(
    () => icons?.filter((subIcon) => subIcon !== icon) || [],
    [icon, icons],
  );
  return (
    <>
      {filteredSubIcons.map((entryIcon, subIconIndex) => (
        <MemoizedSubIcon
          key={entryIcon}
          baseIcon={icon}
          icon={entryIcon}
          imgSize={imgSize}
          isDesktop={isDesktop}
          isFirstImage={subIconIndex === 0}
          name={name}
          totalSubIcons={filteredSubIcons.length}
          view={view}
        />
      ))}
    </>
  );
};

export default memo(SubIcons);
