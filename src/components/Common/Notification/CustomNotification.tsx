"use client";
import { useNotification } from "@/contexts/notification";
import { CloseIcon } from "../../Window/Titlebar/Icons";
import { Notification } from "@/contexts/notification/useNotificationContextState";

interface CustomNotificationProps {
  notification: Notification;
  processIcon?: React.JSX.Element;
  processTitle?: string;
  title?: string;
  content?: string;
}
const CustomNotification = ({
  notification,
  processIcon,
  processTitle,
  title,
  content,
}: CustomNotificationProps) => {
  const { dismissNotification } = useNotification();
  return (
    <>
      <div className="process-title">
        <div className="process-info">
          {processIcon}
          {processTitle}
        </div>
        <button
          className="close-button"
          onClick={() => dismissNotification(notification.id)}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="title">{title}</div>
      <div className="content">{content}</div>
    </>
  );
};

export default CustomNotification;
