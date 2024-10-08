"use client";

import toast, {
  Message,
  Toast,
  ToastOptions,
  useToaster,
} from "@/app/components/Common/Notification/react-hot-toast";
import { useCallback, useEffect, useMemo, useRef } from "react";
import NotificationSound from "./notification-sound.mp3";

type NotificationContextState = {
  notifications: Toast[];
  startPause: () => void;
  endPause: () => void;
  showNotification: (message: Message, opts?: ToastOptions) => void;
  dismissNotification: (id?: string) => void;
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
    (message: Message, opts?: ToastOptions) => {
      canPlayAudio.current && audioRef.current?.play();
      toast(message, opts);
    },
    [],
  );

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
  };
};

export default useNotificationContextState;
