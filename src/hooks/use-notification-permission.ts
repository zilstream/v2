"use client";

import { useCallback, useEffect, useState } from "react";

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("denied");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return "denied" as NotificationPermission;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  return { permission, requestPermission, isSupported };
}
