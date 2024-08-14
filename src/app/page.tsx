"use client";
import { MenuProvider } from "@/contexts/menu";
import Desktop from "./components/Desktop/Desktop";
import Taskbar from "./components/Taskbar";

export default function Page() {
  const ChildrenComponent = () => (
    <Desktop>
      <Taskbar />
    </Desktop>
  );
  return (
    <>
      <MenuProvider>
        <ChildrenComponent />
      </MenuProvider>
    </>
  );
}
