import HoneycombLoader from "@/components/Common/Loading/HoneycombLoader";
import React from "react";

const AppLoading = () => {
  console.log("AppLoading");
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <HoneycombLoader />
    </div>
  );
};

export default AppLoading;
