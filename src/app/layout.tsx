import type { Metadata } from "next";
import "../styles/globals.scss";
import { GoogleAnalytics } from "@next/third-parties/google";
// import dayjs from "dayjs";
// import CustomParseFormat from 'dayjs/plugin/customParseFormat';

export const metadata: Metadata = {
  title: "Windows Simulator",
  description:
    "A web app that replicates the appearance and functionality of Windows OS",
  keywords: ["Next.js", "React", "JavaScript"],
};

// dayjs.extend(CustomParseFormat);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-CG0E9P877D" />
    </html>
  );
}
