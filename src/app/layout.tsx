import type { Metadata } from "next";
import "@styles/globals.scss";
import "@styles/loading.scss";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import localFont from "next/font/local";
// import dayjs from "dayjs";
// import CustomParseFormat from 'dayjs/plugin/customParseFormat';

export const metadata: Metadata = {
  title: "Windows Simulator",
  description:
    "A web app that replicates the appearance and functionality of Windows OS",
  keywords: ["Next.js", "React", "JavaScript"],
};

// dayjs.extend(CustomParseFormat);

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={SegoeUIFont.className}>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-CG0E9P877D" />
      <SpeedInsights />
    </html>
  );
}
