"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { createDatafeed } from "@/lib/tradingview-datafeed";

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: TradingView library is loaded globally
    TradingView: any;
  }
}

export interface ChartTrade {
  timestamp: number;
  price: number;
  volume: number;
}

interface TradingViewChartProps {
  pairAddress: string;
  pairName: string;
  initialPrice?: string;
  lastTrade?: ChartTrade | null;
}

export function TradingViewChart({
  pairAddress,
  pairName,
  initialPrice,
  className,
  lastTrade,
}: TradingViewChartProps & { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [libLoaded, setLibLoaded] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: Datafeed instance
  const datafeedRef = useRef<any>(null);

  useEffect(() => {
    // If the script is already loaded (e.g. from navigating back), set state immediately
    if (window.TradingView) {
      setLibLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!libLoaded || !containerRef.current || !window.TradingView) return;

    const datafeed = createDatafeed(pairAddress, {
      symbol: pairName,
      name: pairName,
      price: initialPrice,
    });
    datafeedRef.current = datafeed;

    const widget = new window.TradingView.widget({
      // Debug
      debug: false,

      // Basic settings
      symbol: pairName,
      interval: "60", // Default interval
      container: containerRef.current,
      library_path: "/charting_library/",
      locale: "en",
      disabled_features: [
        "use_localstorage_for_settings",
        "header_saveload",
        "study_templates",
      ],
      enabled_features: [],
      fullscreen: false,
      autosize: true,
      theme: "Dark", // Assuming dark mode based on project style

      // Datafeed
      datafeed: datafeed,

      // Customization
      overrides: {
        "paneProperties.background": "#09090b", // Match typical shadcn card bg
        "paneProperties.vertGridProperties.color": "#27272a",
        "paneProperties.horzGridProperties.color": "#27272a",
        "scalesProperties.textColor": "#a1a1aa",
      },
    });

    return () => {
      if (widget) {
        widget.remove();
        datafeedRef.current = null;
      }
    };
  }, [libLoaded, pairAddress, pairName, initialPrice]);

  // Handle realtime updates
  useEffect(() => {
    if (lastTrade && datafeedRef.current?.updateLastBar) {
      datafeedRef.current.updateLastBar(lastTrade);
    }
  }, [lastTrade]);

  return (
    <div
      className={`relative w-full overflow-hidden bg-card text-card-foreground ${className || "h-[500px] rounded-xl border shadow"}`}
    >
      <Script
        src="/charting_library/charting_library.standalone.js"
        onLoad={() => setLibLoaded(true)}
      />
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
