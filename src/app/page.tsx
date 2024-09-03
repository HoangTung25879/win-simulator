"use client";
import { MenuProvider } from "@/contexts/menu";
import Desktop from "./components/Desktop/Desktop";
import Taskbar from "./components/Taskbar";
import { FileSystemProvider } from "@/contexts/fileSystem";
import { ProcessProvider } from "@/contexts/process";
import { SessionProvider } from "@/contexts/session";
import AppsLoader from "./components/Apps/AppsLoader";

export default function Page() {
  const ChildrenComponent = () => (
    <Desktop>
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
  return (
    <>
      <ProcessProvider>
        <FileSystemProvider>
          <SessionProvider>
            <MenuProvider>
              <ChildrenComponent />
            </MenuProvider>
          </SessionProvider>
        </FileSystemProvider>
      </ProcessProvider>
    </>
  );
}
