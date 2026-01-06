import contextFactory from "../contextFactory";
import useNotificationContextState from "./useNotificationContextState";
import Notification from "@/components/Common/Notification/Notification";

const { Provider, useContext } = contextFactory(
  useNotificationContextState,
  <Notification />,
);

export { Provider as NotificationProvider, useContext as useNotification };
