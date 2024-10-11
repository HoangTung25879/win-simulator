"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ComponentProcessProps } from "../RenderComponent";
import { useProcesses } from "@/contexts/process";
import useFileDrop from "../../Files/FileEntry/useFileDrop";
import clsx from "clsx";
import Loading from "../../Common/Loading/Loading";
import { useFileSystem } from "@/contexts/fileSystem";
import useTitle from "../../Window/useTitle";
import { basename } from "path";
import { useNotification } from "@/contexts/notification";
import { IFRAME_CONFIG } from "@/lib/constants";
import { AppOptions, EventBus } from "./types";
import "./PDF.scss";

type PDFProps = {} & ComponentProcessProps;

declare global {
  interface Window {
    PDFViewerApplication: {
      open: ({
        data,
        filename,
        url,
      }: {
        data: ArrayBuffer;
        filename?: string;
        url?: string;
      }) => void;
      eventBus: EventBus;
      initializedPromise: Promise<void>;
      baseUrl: string;
    };
    PDFViewerApplicationOptions: typeof AppOptions;
  }
}

const PDF = ({ id }: PDFProps) => {
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  const { readFile } = useFileSystem();
  const { prependFileToTitle } = useTitle(id);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pdfViewerRef = useRef<Window["PDFViewerApplication"] | null>(null);
  const isHandlingFileInput = useRef(false);

  const openPdf = useCallback(async () => {
    if (url) {
      containerRef.current?.classList.remove("drop");
      prependFileToTitle(basename(url));
      const fileData = await readFile(url);
      if (fileData.length === 0) {
        showNotification({
          processTitle: "PDF",
          title: "Error",
          content: "File is empty",
        });
        return;
      }
      pdfViewerRef.current?.open({ data: fileData, url: url });
    } else {
      containerRef.current?.classList.add("drop");
      prependFileToTitle("");
    }
  }, [url]);

  useEffect(() => {
    const loadPdf = async () => {
      if (iframeRef.current?.contentWindow?.PDFViewerApplication) {
        pdfViewerRef.current =
          iframeRef.current.contentWindow.PDFViewerApplication;
        await pdfViewerRef.current.initializedPromise;
        // Event listener in order
        pdfViewerRef.current.eventBus.on(
          "fileinputchange",
          async (event: unknown) => {
            // console.log("PDF-fileinputchange", event);
            if (!isHandlingFileInput.current) {
              isHandlingFileInput.current = true;
            }
          },
        );
        pdfViewerRef.current.eventBus.on(
          "documentloaded",
          async ({ source }: { source: Window["PDFViewerApplication"] }) => {
            // console.log("PDF-documentloaded", source);
            if (isHandlingFileInput.current) {
              containerRef.current?.classList.remove("drop");
              prependFileToTitle(basename(source?.baseUrl));
              isHandlingFileInput.current = false;
            }
          },
        );
        pdfViewerRef.current.eventBus.on(
          "documentinit",
          async ({ source }: { source: Window["PDFViewerApplication"] }) => {
            // console.log("PDF-documentinit", source);
          },
        );
        pdfViewerRef.current.eventBus.on(
          "documenterror",
          async ({
            source,
            message,
            reason,
          }: {
            source: Window["PDFViewerApplication"];
            message: string;
            reason: string;
          }) => {
            console.log("PDF-documenterror", message, reason);
            if (message || reason) {
              showNotification({
                processTitle: "PDF",
                title: "Error",
                content: message || reason,
              });
            }
          },
        );
        pdfViewerRef.current.eventBus.on(
          "metadataloaded",
          async (event: unknown) => {
            // console.log("PDF-metadataloaded", event);
          },
        );
        pdfViewerRef.current.eventBus.on(
          "pagerender",
          async (event: unknown) => {
            // console.log("PDF-pagerender", event);
          },
        );
        pdfViewerRef.current.eventBus.on(
          "pagerendered",
          async (event: unknown) => {
            // console.log("PDF-pagerendered", event);
          },
        );

        setLoading(false);
      }
    };
    document.addEventListener("webviewerloaded", loadPdf);
    return () => {
      document.addEventListener("webviewerloaded", loadPdf);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      openPdf();
    }
  }, [loading, url]);

  return (
    <>
      {loading && <Loading />}
      <div
        ref={containerRef}
        className={clsx("pdfjs-wrapper")}
        {...useFileDrop({ id })}
      >
        <iframe
          ref={iframeRef}
          height="100%"
          width="100%"
          src={"/System/Pdf.js/web/viewer.html"}
          loading="lazy"
          {...IFRAME_CONFIG}
        />
      </div>
    </>
  );
};

export default PDF;
