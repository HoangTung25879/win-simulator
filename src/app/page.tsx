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

export default function Page() {
  const ChildrenComponent = () => (
    <Desktop>
      <SearchInputProvider>
        <Taskbar />
      </SearchInputProvider>
      <AppsLoader />
    </Desktop>
  );
  return (
    <>
      <FullScreenProvider>
        <ProcessProvider>
          <FileSystemProvider>
            <SessionProvider>
              <MenuProvider>
                <ChildrenComponent />
              </MenuProvider>
            </SessionProvider>
          </FileSystemProvider>
        </ProcessProvider>
      </FullScreenProvider>
    </>
  );
}
