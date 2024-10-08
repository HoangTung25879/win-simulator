"use client";
import { MenuProvider } from "@/contexts/menu";
import Desktop from "./components/Desktop/Desktop";
import Taskbar from "./components/Taskbar/Taskbar";
import { FileSystemProvider } from "@/contexts/fileSystem";
import { ProcessProvider } from "@/contexts/process";
import { SessionProvider } from "@/contexts/session";
import { SearchInputProvider } from "@/contexts/search";
import AppsLoader from "./components/Apps/AppsLoader";
import { FullScreenProvider } from "@/contexts/fullScreen";
import { WallpaperProvider } from "@/contexts/wallpaper";
import "simplebar-react/dist/simplebar.min.css";
import { NotificationProvider } from "@/contexts/notification";

export default function Page() {
  const ChildrenComponent = () => (
    <Desktop>
      <AppsLoader />
      <SearchInputProvider>
        <Taskbar />
      </SearchInputProvider>
    </Desktop>
  );
  return (
    <>
      <NotificationProvider>
        <FullScreenProvider>
          <ProcessProvider>
            <FileSystemProvider>
              <SessionProvider>
                <MenuProvider>
                  <WallpaperProvider>
                    <ChildrenComponent />
                  </WallpaperProvider>
                </MenuProvider>
              </SessionProvider>
            </FileSystemProvider>
          </ProcessProvider>
        </FullScreenProvider>
      </NotificationProvider>
    </>
  );
}
