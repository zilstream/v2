"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type PriceAlert,
  generateAlertId,
  loadAlerts,
  saveAlerts,
} from "@/lib/price-alerts";

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAlerts(loadAlerts());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveAlerts(alerts);
    }
  }, [alerts, isLoaded]);

  const addAlert = useCallback(
    (
      alert: Omit<PriceAlert, "id" | "createdAt" | "triggered" | "triggeredAt">,
    ) => {
      const newAlert: PriceAlert = {
        ...alert,
        id: generateAlertId(),
        createdAt: Date.now(),
        triggered: false,
      } as PriceAlert;

      setAlerts((prev) => [...prev, newAlert]);
      return newAlert;
    },
    [],
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const markTriggered = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, triggered: true, triggeredAt: Date.now() }
          : alert,
      ),
    );
  }, []);

  const clearTriggered = useCallback(() => {
    setAlerts((prev) => prev.filter((alert) => !alert.triggered));
  }, []);

  const getAlertsForToken = useCallback(
    (tokenAddress: string) => {
      return alerts.filter(
        (alert) =>
          alert.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
      );
    },
    [alerts],
  );

  const activeAlerts = alerts.filter((alert) => !alert.triggered);
  const triggeredAlerts = alerts.filter((alert) => alert.triggered);

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    isLoaded,
    addAlert,
    removeAlert,
    markTriggered,
    clearTriggered,
    getAlertsForToken,
  };
}
