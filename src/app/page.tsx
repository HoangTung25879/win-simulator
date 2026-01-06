"use client";
import { MenuProvider } from "@/contexts/menu";
import Desktop from "@/components/Desktop/Desktop";
import Taskbar from "@/components/Taskbar/Taskbar";
import { FileSystemProvider } from "@/contexts/fileSystem";
import { ProcessProvider } from "@/contexts/process";
import { SessionProvider } from "@/contexts/session";
import { SearchInputProvider } from "@/contexts/search";
import AppsLoader from "@/components/Apps/AppsLoader";
import { FullScreenProvider } from "@/contexts/fullScreen";
import { WallpaperProvider } from "@/contexts/wallpaper";
import "simplebar-react/dist/simplebar.min.css";
import { NotificationProvider } from "@/contexts/notification";
import { Suspense } from "react";
import localFont from "next/font/local";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EAppEnv } from "@/lib/types";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const SegoeUIFont = localFont({
  src: [
    {
      path: "../../public/System/Font/Segoe UI.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../..//public/System/Font/Segoe UI Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/System/Font/Segoe UI Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/System/Font/Segoe UI Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: Infinity,
      refetchOnMount: true, // Default
      refetchInterval: false, // Default
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function Page() {
  const ChildrenComponent = () => (
    <Desktop>
      <AppsLoader />
      <SearchInputProvider>
        <Taskbar />
      </SearchInputProvider>
    </Desktop>
  );
  console.log(process.env.NEXT_PUBLIC_ENV === EAppEnv.DEVELOPMENT, process.env.NEXT_PUBLIC_ENV, EAppEnv.DEVELOPMENT);
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${SegoeUIFont.style.fontFamily};
        }
      `}</style>
      <QueryClientProvider client={queryClient}>
        {process.env.NEXT_PUBLIC_ENV === EAppEnv.DEVELOPMENT && <ReactQueryDevtools buttonPosition="top-right" />}
        <NotificationProvider>
          <FullScreenProvider>
            <ProcessProvider>
              <FileSystemProvider>
                <SessionProvider>
                  <MenuProvider>
                    <WallpaperProvider>
                      <Suspense fallback={"Loading..."}>
                        <ChildrenComponent />
                      </Suspense>
                    </WallpaperProvider>
                  </MenuProvider>
                </SessionProvider>
              </FileSystemProvider>
            </ProcessProvider>
          </FullScreenProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </>
  );
}
