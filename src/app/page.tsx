"use client";
import { MenuProvider } from "@/contexts/menu";
import Desktop from "./components/Desktop/Desktop";
import Taskbar from "./components/Taskbar";
import { FileSystemProvider } from "@/contexts/fileSystem";

export default function Page() {
  const ChildrenComponent = () => (
    <Desktop>
      <Taskbar />
    </Desktop>
  );
  return (
    <>
      <FileSystemProvider>
        <MenuProvider>
          <ChildrenComponent />
        </MenuProvider>
      </FileSystemProvider>
    </>
  );
}
