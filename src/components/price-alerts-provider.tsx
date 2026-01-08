"use client";

import { useQueries } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { fetchTokenByAddress } from "@/lib/api-client";
import {
  type PriceAlert,
  evaluateAlert,
  showPriceAlertNotification,
} from "@/lib/price-alerts";
import { usePriceAlerts } from "@/hooks/use-price-alerts";
import { useNotificationPermission } from "@/hooks/use-notification-permission";

interface PriceAlertsContextValue {
  alerts: PriceAlert[];
  activeAlerts: PriceAlert[];
  triggeredAlerts: PriceAlert[];
  isLoaded: boolean;
  addAlert: (
    alert: Omit<PriceAlert, "id" | "createdAt" | "triggered" | "triggeredAt">,
  ) => PriceAlert;
  removeAlert: (id: string) => void;
  clearTriggered: () => void;
  getAlertsForToken: (tokenAddress: string) => PriceAlert[];
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  isNotificationSupported: boolean;
}

const PriceAlertsContext = createContext<PriceAlertsContextValue | null>(null);

export function usePriceAlertsContext() {
  const context = useContext(PriceAlertsContext);
  if (!context) {
    throw new Error(
      "usePriceAlertsContext must be used within a PriceAlertsProvider",
    );
  }
  return context;
}

export function PriceAlertsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    alerts,
    activeAlerts,
    triggeredAlerts,
    isLoaded,
    addAlert,
    removeAlert,
    markTriggered,
    clearTriggered,
    getAlertsForToken,
  } = usePriceAlerts();

  const {
    permission: notificationPermission,
    requestPermission: requestNotificationPermission,
    isSupported: isNotificationSupported,
  } = useNotificationPermission();

  // Get unique token addresses from active alerts
  const watchedTokenAddresses = useMemo(() => {
    const addresses = new Set(
      activeAlerts.map((alert) => alert.tokenAddress.toLowerCase()),
    );
    return Array.from(addresses);
  }, [activeAlerts]);

  // Track which alerts have been evaluated to prevent duplicate notifications
  const evaluatedAlertsRef = useRef<Set<string>>(new Set());

  // Fetch token data for all watched tokens
  const tokenQueries = useQueries({
    queries: watchedTokenAddresses.map((address) => ({
      queryKey: ["token", address],
      queryFn: () => fetchTokenByAddress(address),
      enabled: isLoaded && watchedTokenAddresses.length > 0,
      refetchInterval: 30_000, // Refetch every 30 seconds for active monitoring
      staleTime: 15_000,
    })),
  });

  // Build a map of token addresses to token data
  const tokenDataMap = useMemo(() => {
    const map = new Map<string, (typeof tokenQueries)[number]["data"]>();
    watchedTokenAddresses.forEach((address, index) => {
      const data = tokenQueries[index]?.data;
      if (data) {
        map.set(address.toLowerCase(), data);
      }
    });
    return map;
  }, [watchedTokenAddresses, tokenQueries]);

  // Evaluate alerts whenever token data changes
  useEffect(() => {
    if (!isLoaded || tokenDataMap.size === 0) return;

    for (const alert of activeAlerts) {
      // Skip if we've already evaluated this alert in this session
      if (evaluatedAlertsRef.current.has(alert.id)) continue;

      const token = tokenDataMap.get(alert.tokenAddress.toLowerCase());
      if (!token) continue;

      const shouldTrigger = evaluateAlert(alert, token);
      if (shouldTrigger) {
        evaluatedAlertsRef.current.add(alert.id);
        const currentPrice = Number.parseFloat(token.priceUsd ?? "0");
        showPriceAlertNotification(alert, currentPrice);
        markTriggered(alert.id);
      }
    }
  }, [activeAlerts, tokenDataMap, isLoaded, markTriggered]);

  // Clean up evaluated alerts when they're removed
  useEffect(() => {
    const currentAlertIds = new Set(alerts.map((a) => a.id));
    for (const id of evaluatedAlertsRef.current) {
      if (!currentAlertIds.has(id)) {
        evaluatedAlertsRef.current.delete(id);
      }
    }
  }, [alerts]);

  const handleAddAlert = useCallback(
    (
      alert: Omit<PriceAlert, "id" | "createdAt" | "triggered" | "triggeredAt">,
    ) => {
      return addAlert(alert);
    },
    [addAlert],
  );

  const value = useMemo<PriceAlertsContextValue>(
    () => ({
      alerts,
      activeAlerts,
      triggeredAlerts,
      isLoaded,
      addAlert: handleAddAlert,
      removeAlert,
      clearTriggered,
      getAlertsForToken,
      notificationPermission,
      requestNotificationPermission,
      isNotificationSupported,
    }),
    [
      alerts,
      activeAlerts,
      triggeredAlerts,
      isLoaded,
      handleAddAlert,
      removeAlert,
      clearTriggered,
      getAlertsForToken,
      notificationPermission,
      requestNotificationPermission,
      isNotificationSupported,
    ],
  );

  return (
    <PriceAlertsContext.Provider value={value}>
      {children}
    </PriceAlertsContext.Provider>
  );
}
