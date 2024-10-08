"use client";

import { AnimatePresence, motion } from "framer-motion";
import useNotificationTransition from "./useNotificationTransition";
import { CloseIcon } from "../../Window/Titlebar/Icons";
import { useNotification } from "@/contexts/notification";
import "./Notification.scss";

type NotificationProps = {};

// Example:
// showNotification((notification) => (
//   <CustomNotification
//     notification={notification}
//     processIcon={<WindowsIcon />}
//     processTitle="System"
//     title="Cannot open file"
//     content="The file format is not supported yet."
//   />
// ));

const Notification = ({}: NotificationProps) => {
  const { notifications, startPause, endPause, dismissNotification } =
    useNotification();
  const transition = useNotificationTransition();
  return (
    <AnimatePresence mode="popLayout">
      <div
        className="notification-wrapper"
        onMouseEnter={startPause}
        onMouseLeave={endPause}
      >
        {notifications.map((notification) => {
          if (typeof notification.message === "function") {
            return (
              <motion.div
                key={notification.id}
                className="notification"
                {...notification.ariaProps}
                {...transition}
              >
                {notification.message(notification)}
              </motion.div>
            );
          }
          return (
            <motion.div
              key={notification.id}
              className="notification"
              {...notification.ariaProps}
              {...transition}
            >
              <div className="flex items-center justify-between">
                {notification.message}
                <button
                  className="close-button"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <CloseIcon />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
};

export default Notification;
