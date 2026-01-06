import { Processes } from "./types";
import { FOLDER_ICON } from "@/lib/constants";
import Photos from "@/components/Apps/Photos/Photos";
import FileExplorer from "@/components/FileExplorer/FileExplorer";
import Settings from "@/components/Settings/Settings";
import Transfer from "@/components/Dialogs/Transfer/Transfer";
import VideoPlayer from "@/components/Apps/VideoPlayer/VideoPlayer";
import PDF from "@/components/Apps/PDF/PDF";

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
    // Component: dynamic(
    //   () => import("@/components/FileExplorer/FileExplorer"),
    // ),
    Component: FileExplorer,
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
    // Component: dynamic(() => import("@/components/Apps/Photos/Photos")),
    Component: Photos,
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
    // Component: dynamic(() => import("@/components/Settings/Settings")),
    Component: Settings,
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
    // Component: dynamic(
    //   () => import("@/components/Dialogs/Transfer/Transfer"),
    // ),
    Component: Transfer,
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
    // Component: dynamic(
    //   () => import("@/components/Apps/VideoPlayer/VideoPlayer"),
    // ),
    Component: VideoPlayer,
    backgroundColor: "#000",
    autoSizing: true,
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
    // Component: dynamic(() => import("@/components/Apps/PDF/PDF")),
    Component: PDF,
    backgroundColor: "#525659",
    icon: "/System/Icons/pdf.png",
    title: "PDF Viewer",
    maximized: true,
    autoSizing: true,
  },
};

export default directory;
