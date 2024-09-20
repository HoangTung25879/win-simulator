import dynamic from "next/dynamic";
import { Processes } from "./types";
import { FOLDER_ICON } from "@/lib/constants";

enum AllProcess {
  BoxedWine = "BoxedWine",
  Browser = "Browser",
  ClassiCube = "ClassiCube",
  DXBall = "DXBall",
  DevTools = "DevTools",
  Emulator = "Emulator",
  FileExplorer = "FileExplorer",
  IRC = "IRC",
  JSDOS = "JSDOS",
  Marked = "Marked",
  Messenger = "Messenger",
  MonacoEditor = "MonacoEditor",
  OpenType = "OpenType",
  OpenWith = "OpenWith",
  PDF = "PDF",
  Paint = "Paint",
  Photos = "Photos",
  Properties = "Properties",
  Quake3 = "Quake3",
  Ruffle = "Ruffle",
  Run = "Run",
  SpaceCadet = "SpaceCadet",
  StableDiffusion = "StableDiffusion",
  Terminal = "Terminal",
  TinyMCE = "TinyMCE",
  Transfer = "Transfer",
  V86 = "V86",
  VideoPlayer = "VideoPlayer",
  Vim = "Vim",
  Webamp = "Webamp",
}

const directory: Processes = {
  FileExplorer: {
    Component: dynamic(
      () => import("@/app/components/FileExplorer/FileExplorer"),
    ),
    backgroundColor: "#202020",
    defaultSize: {
      height: 450,
      width: 600,
    },
    icon: FOLDER_ICON,
    title: "File Explorer",
  },
  Photos: {
    Component: dynamic(() => import("@/app/components/Apps/Photos/Photos")),
    backgroundColor: "rgb(39, 39, 39)",
    defaultSize: {
      height: 450,
      width: 600,
    },
    hideTitlebarIcon: true,
    icon: "/System/Icons/photos.png",
    title: "Photos",
  },
};

export default directory;
