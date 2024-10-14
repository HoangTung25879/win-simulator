"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComponentProcessProps } from "../RenderComponent";
import Loading from "../../Common/Loading/Loading";
import { useProcesses } from "@/contexts/process";
import useFileDrop from "../../Files/FileEntry/useFileDrop";
import { useFileSystem } from "@/contexts/fileSystem";
import { SourceObjectWithUrl, YouTubePlayer, YouTubeTech } from "./types";
import useTitle from "../../Window/useTitle";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  isSafari,
  isYouTubeUrl,
  loadFiles,
} from "@/lib/utils";
import { basename } from "path";
import useWindowSize from "../../Window/useWindowSize";
import {
  videoConfig,
  CONTROL_BAR_HEIGHT,
  DEFAULT_QUALITY_SIZE,
  VideoResizeKey,
  YT_TYPE,
  ytQualitySizeMap,
} from "./config";
import { getMimeType } from "@/contexts/fileSystem/utils";
import { VIDEO_FALLBACK_MIME_TYPE } from "@/lib/constants";
import "./VideoPlayer.scss";
import { VideoJsPlayer } from "video.js";
import clsx from "clsx";

type VideoPlayerProps = {} & ComponentProcessProps;

const VideoPlayer = ({ id }: VideoPlayerProps) => {
  const {
    argument,
    linkElement,
    processes: { [id]: { url = "", closing = false, libs = [] } = {} },
  } = useProcesses();
  const { readFile } = useFileSystem();
  const { updateWindowSize } = useWindowSize(id);
  const { prependFileToTitle } = useTitle(id);
  const [player, setPlayer] = useState<VideoJsPlayer>();
  const [ytPlayer, setYtPlayer] = useState<YouTubePlayer>();
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const initializedUrlRef = useRef(false);
  const isYT = useMemo(() => isYouTubeUrl(url), [url]);

  const cleanUpSource = useCallback((): void => {
    const { src: sources = [] } = player?.getMedia() || {};
    if (Array.isArray(sources) && sources.length > 0) {
      const [{ src, url: sourceUrl }] = sources as SourceObjectWithUrl[];
      if (src.startsWith("blob:") && (sourceUrl !== url || closing)) {
        cleanUpBufferUrl(src);
      }
    }
  }, [closing, player, url]);

  const getSource = useCallback(async () => {
    cleanUpSource();
    const type = isYT ? YT_TYPE : getMimeType(url) || VIDEO_FALLBACK_MIME_TYPE;
    const src = isYT
      ? url
      : bufferToUrl(await readFile(url), isSafari() ? type : undefined);
    return { src, type, url };
  }, [cleanUpSource, isYT, readFile, url]);

  const loadPlayer = useCallback(() => {
    const videoElement = videoRef.current as HTMLVideoElement;
    const videoPlayer = window.videojs(videoElement, videoConfig, () => {
      if (initializedUrlRef.current) return;
      initializedUrlRef.current = true;
      const { ytPlayer: youTubePlayer } =
        (videoPlayer as YouTubeTech).tech_ || {};
      if (youTubePlayer) setYtPlayer(youTubePlayer);
      const [height, width] = youTubePlayer
        ? ytQualitySizeMap[youTubePlayer.getPlaybackQuality()] ||
          DEFAULT_QUALITY_SIZE
        : [videoPlayer.videoHeight(), videoPlayer.videoWidth()];
      const [vh, vw] = [window.innerHeight, window.innerWidth];
      if (height && width) {
        const heightWithControlBar =
          height + (youTubePlayer ? 0 : CONTROL_BAR_HEIGHT);
        if (heightWithControlBar > vh || width > vw) {
          updateWindowSize(vw * (heightWithControlBar / width), vw);
        } else {
          updateWindowSize(heightWithControlBar, width);
        }
      }
      const toggleFullscreen = (): void => {
        try {
          if (videoPlayer.isFullscreen()) videoPlayer.exitFullscreen();
          else videoPlayer.requestFullscreen();
        } catch {
          // Ignore fullscreen errors
        }
      };
      const togglePlayPause = (): void => {
        if (videoPlayer.paused()) videoPlayer.play();
        else videoPlayer.pause();
      };
      videoElement.addEventListener("click", togglePlayPause);
      videoElement.addEventListener("dblclick", toggleFullscreen);
      videoElement.addEventListener(
        "mousewheel",
        (event) => {
          videoPlayer.volume(
            videoPlayer.volume() +
              ((event as WheelEvent).deltaY > 0 ? -0.1 : 0.1),
          );
        },
        { passive: true },
      );
      videoElement.addEventListener("keydown", ({ key, altKey, ctrlKey }) => {
        if (altKey) {
          if (VideoResizeKey[key]) {
            updateWindowSize(
              videoPlayer.videoHeight() / VideoResizeKey[key],
              videoPlayer.videoWidth() / VideoResizeKey[key],
            );
          } else {
            const keyName = key?.toUpperCase();
            switch (keyName) {
              case "ENTER":
                toggleFullscreen();
                break;
              case "M":
                videoPlayer.muted(!videoPlayer.muted());
                break;
            }
          }
        } else if (!ctrlKey) {
          switch (key) {
            case " ":
              togglePlayPause();
              break;
            case "ArrowUp":
              videoPlayer.volume(videoPlayer.volume() + 0.1);
              break;
            case "ArrowDown":
              videoPlayer.volume(videoPlayer.volume() - 0.1);
              break;
            case "ArrowLeft":
              videoPlayer.currentTime(videoPlayer.currentTime() - 5);
              break;
            case "ArrowRight":
              videoPlayer.currentTime(videoPlayer.currentTime() + 5);
              break;
          }
        }
      });
      setPlayer(videoPlayer);
      setLoading(false);
      if (!isYT) linkElement(id, "peekElement", videoElement);
      argument?.(id, "play", () => videoPlayer.play());
      argument?.(id, "pause", () => videoPlayer.pause());
      argument?.(id, "paused", (callback?: (paused: boolean) => void) => {
        if (callback) {
          videoPlayer.on("pause", () => callback(true));
          videoPlayer.on("play", () => callback(false));
        }
        return videoPlayer.paused();
      });
    });

    videoPlayer.on("error", (event) => {
      containerRef.current?.classList.add("drop");
    });
  }, [
    argument,
    containerRef,
    id,
    isYT,
    linkElement,
    setLoading,
    updateWindowSize,
  ]);

  const maybeHideControlbar = useCallback((type?: string): void => {
    const controlBar = containerRef.current?.querySelector(".vjs-control-bar");
    if (controlBar instanceof HTMLElement) {
      if (type === YT_TYPE) {
        controlBar.classList.add("no-interaction");
      } else {
        controlBar.classList.remove("no-interaction");
      }
    }
  }, []);

  const loadVideo = useCallback(async () => {
    if (player && url) {
      try {
        containerRef.current?.classList.remove("drop");
        const source = await getSource();
        initializedUrlRef.current = false;
        player.src(source);
        maybeHideControlbar(source.type);
        prependFileToTitle(
          isYT ? ytPlayer?.videoTitle || "YouTube" : basename(url),
        );
      } catch {
        // Ignore player errors
      }
    }
  }, [getSource, isYT, player, prependFileToTitle, url, ytPlayer]);

  useEffect(() => {
    if (loading && !player) {
      loadFiles(libs).then(() => {
        if (typeof window.videojs === "function") {
          loadPlayer();
        }
      });
    }
    return () => {
      if (closing) {
        cleanUpSource();
        player?.dispose();
      }
    };
  }, [cleanUpSource, closing, libs, loadPlayer, loading, player]);

  useEffect(() => {
    if (!loading && !closing && player && url) loadVideo();
  }, [closing, loadVideo, loading, player, url]);

  return (
    <>
      {loading && <Loading />}
      <div
        ref={containerRef}
        className={clsx("video-player", "drop", isYT ? "youtube-view" : "")}
        style={{
          contain: "strict",
          visibility: loading ? "hidden" : "visible",
        }}
        {...useFileDrop({ id })}
      >
        <video ref={videoRef} className="video-js" />
      </div>
    </>
  );
};

export default VideoPlayer;
