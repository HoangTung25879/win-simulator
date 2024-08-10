"use client";
import "./Desktop.scss";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps) => {
  const a = 0;
  return (
    <div className="h-[calc(100vh-40px)] w-full bg-red-300">{children}</div>
  );
};

export default Desktop;
