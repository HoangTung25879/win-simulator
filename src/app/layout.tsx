import type { Metadata } from "next";
import "../styles/globals.scss";
// import dayjs from "dayjs";
// import CustomParseFormat from 'dayjs/plugin/customParseFormat';

export const metadata: Metadata = {
  title: "Tung Web Desktop",
  description:
    "A web app that replicates the appearance and functionality of Windows OS",
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
    </html>
  );
}
