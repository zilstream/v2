import type { Token } from "./zilstream";

export type AlertCondition = "above" | "below";
export type AlertTimeframe = "24h" | "7d";

export interface ThresholdAlert {
  type: "threshold";
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  condition: AlertCondition;
  targetPrice: number;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
}

export interface PercentageAlert {
  type: "percentage";
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  percentageChange: number;
  timeframe: AlertTimeframe;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
}

export type PriceAlert = ThresholdAlert | PercentageAlert;

const STORAGE_KEY = "zilstream_price_alerts";

export function loadAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: PriceAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // Ignore storage errors
  }
}

export function generateAlertId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function evaluateAlert(alert: PriceAlert, token: Token): boolean {
  if (alert.triggered) return false;

  const price = Number.parseFloat(token.priceUsd ?? "0");
  if (price === 0) return false;

  if (alert.type === "threshold") {
    return alert.condition === "above"
      ? price >= alert.targetPrice
      : price <= alert.targetPrice;
  }

  if (alert.type === "percentage") {
    const change =
      alert.timeframe === "24h"
        ? Number.parseFloat(token.priceChange24h ?? "0")
        : Number.parseFloat(token.priceChange7d ?? "0");
    return Math.abs(change) >= alert.percentageChange;
  }

  return false;
}

export function showPriceAlertNotification(
  alert: PriceAlert,
  currentPrice: number,
): void {
  if (typeof window === "undefined" || Notification.permission !== "granted") {
    return;
  }

  let title: string;
  let body: string;

  if (alert.type === "threshold") {
    const direction = alert.condition === "above" ? "above" : "below";
    title = `${alert.tokenSymbol} Price Alert`;
    body = `${alert.tokenSymbol} is now ${direction} $${alert.targetPrice.toFixed(6)} (Current: $${currentPrice.toFixed(6)})`;
  } else {
    title = `${alert.tokenSymbol} Price Movement`;
    body = `${alert.tokenSymbol} has moved ${alert.percentageChange}%+ in the last ${alert.timeframe}`;
  }

  const notification = new Notification(title, {
    body,
    icon: "/logo.svg",
    tag: alert.id,
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = `/tokens/${alert.tokenAddress}`;
  };
}

export function formatAlertDescription(alert: PriceAlert): string {
  if (alert.type === "threshold") {
    return `${alert.condition === "above" ? "Above" : "Below"} $${alert.targetPrice}`;
  }
  return `${alert.percentageChange}% change in ${alert.timeframe}`;
}
