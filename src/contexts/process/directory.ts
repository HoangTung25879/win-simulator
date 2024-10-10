import dynamic from "next/dynamic";
import { Processes } from "./types";
import { FOLDER_ICON } from "@/lib/constants";

export enum AllProcess {
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
  Settings = "Settings",
}

const defaultProcessStyle = {
  backgroundColor: "rgb(255, 255, 255)",
  titlebarColor: "rgb(255, 255, 255)",
  titlebarButtonColor: "rgb(0,0,0)",
  titlebarButtonHoverColor: "rgb(229, 229, 229)",
  textColor: "rgb(0,0,0)",
};

const directory: Processes = {
  FileExplorer: {
    Component: dynamic(
      () => import("@/app/components/FileExplorer/FileExplorer"),
    ),
    defaultSize: {
      height: 450,
      width: 600,
    },
    icon: FOLDER_ICON,
    title: "File Explorer",
    //* light theme, default is black theme
    titlebarBorderColor: "rgb(220 209 209)",
    navigationbarColor: "#fff",
    navigationbarButtonColor: "rgb(128, 128, 128)",
    navigationbarButtonHoverColor: "rgb(229, 243, 251)",
    navigationbarButtonDisabledColor: "rgb(223, 223, 223)",
    navigationbarBorderColor: "rgb(220 209 209)",
    statusbarColor: "rgb(255, 255, 255)",
    ...defaultProcessStyle,
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
  Settings: {
    Component: dynamic(() => import("@/app/components/Settings/Settings")),
    defaultSize: {
      height: 450,
      width: 600,
    },
    hideTitlebarIcon: true,
    singleton: true,
    icon: "/System/Icons/settings.png",
    title: "Settings",
    textColor: "rgb(0,0,0)",
    backgroundColor: "rgb(255, 255, 255)",
    titlebarColor: "rgb(230, 230, 230)",
    titlebarButtonColor: "rgb(0,0,0)",
    titlebarButtonHoverColor: "rgb(204,204,204)",
    titlebarBorderColor: "rgb(230, 230, 230)",
  },
  Transfer: {
    Component: dynamic(
      () => import("@/app/components/Dialogs/Transfer/Transfer"),
    ),
    allowResizing: false,
    backgroundColor: "#FFF",
    defaultSize: {
      height: 163,
      width: 400,
    },
    dialogProcess: true,
    icon: "/System/Icons/copying.png",
    title: "",
  },
  VideoPlayer: {
    Component: dynamic(
      () => import("@/app/components/Apps/VideoPlayer/VideoPlayer"),
    ),
    autoSizing: true,
    backgroundColor: "#000",
    defaultSize: {
      height: 390,
      width: 640,
    },
    maximized: true,
    icon: "/System/Icons/vlc.png",
    libs: [
      "/System/Video.js/video-js.min.css",
      "/System/Video.js/video.min.js",
      "/System/Video.js/Youtube.min.js",
    ],
    title: "Video Player",
  },
  PDF: {
    Component: dynamic(() => import("@/app/components/Apps/PDF/PDF")),
    backgroundColor: "#525659",
    icon: "/System/Icons/pdf.png",
    libs: ["/Program Files/PDF.js/pdf.js"],
    title: "PDF Viewer",
  },
};

export default directory;
