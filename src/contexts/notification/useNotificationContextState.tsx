"use client";

import toast, {
  Toast,
  ToastOptions,
  useToaster,
} from "@/components/Common/Notification/react-hot-toast";
import { useCallback, useEffect, useMemo, useRef } from "react";
import NotificationSound from "./notification-sound.mp3";
import CustomNotification from "@/components/Common/Notification/CustomNotification";
import WindowsIcon from "@/components/Taskbar/StartButton/Icons";

type ShowNotificationOptions = {
  processTitle?: string;
  title?: string;
  content?: string;
  opts?: ToastOptions;
};
type NotificationContextState = {
  notifications: Toast[];
  startPause: () => void;
  endPause: () => void;
  showNotification: (options: ShowNotificationOptions) => void;
  dismissNotification: (id?: string) => void;
  showErrorNotification: (message: string) => void;
};

export type Notification = Toast;

const useNotificationContextState = (): NotificationContextState => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canPlayAudio = useRef(false);

  const toastsWithoutInvisible = useMemo(
    () => toasts.filter((toast) => toast.visible),
    [toasts],
  );

  const showNotification = useCallback(
    ({
      processTitle = "System",
      title = "Cannot open file",
      content = "The file format is not supported yet.",
      opts,
    }: ShowNotificationOptions) => {
      canPlayAudio.current && audioRef.current?.play();
      toast(
        (notification: Toast) => (
          <CustomNotification
            notification={notification}
            processIcon={<WindowsIcon />}
            processTitle={processTitle}
            title={title}
            content={content}
          />
        ),
        opts,
      );
    },
    [],
  );

  const showErrorNotification = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const dismissNotification = useCallback((id?: string) => {
    toast.dismiss(id);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(NotificationSound);
    const checkCanPlayAudio = () => {
      canPlayAudio.current = true;
    };
    audioRef.current?.addEventListener("canplaythrough", checkCanPlayAudio);
    return () => {
      audioRef.current?.removeEventListener(
        "canplaythrough",
        checkCanPlayAudio,
      );
    };
  }, []);

  return {
    notifications: toastsWithoutInvisible,
    startPause,
    endPause,
    showNotification,
    dismissNotification,
    showErrorNotification,
  };
};

export default useNotificationContextState;
