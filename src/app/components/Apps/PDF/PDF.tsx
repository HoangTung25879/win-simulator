"use client";

import { useEffect } from "react";
import { ComponentProcessProps } from "../RenderComponent";
import ViewerHtml, { getViewerConfiguration } from "./ViewerHtml";
import { PDFViewerApplication } from "./lib/app";
import { AppOptions } from "./lib/app_options";

type PDFProps = {} & ComponentProcessProps;

const PDF = ({ id }: PDFProps) => {
  useEffect(() => {
    AppOptions.set("defaultUrl", "/System/PDF.js/test.pdf");
    const config = getViewerConfiguration();
    PDFViewerApplication.run(config);
  }, []);

  return (
    <div>
      <ViewerHtml />
    </div>
  );
};

export default PDF;
