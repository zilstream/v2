"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [containerReady, setContainerReady] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: Datafeed instance
  const datafeedRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: TradingView widget instance
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (window.TradingView) {
      setLibLoaded(true);
    }
  }, []);

  const checkContainerReady = useCallback(() => {
    if (!containerRef.current) return false;
    const { offsetWidth, offsetHeight } = containerRef.current;
    return offsetWidth > 0 && offsetHeight > 0;
  }, []);

  useEffect(() => {
    if (!libLoaded || !containerRef.current) return;

    if (checkContainerReady()) {
      setContainerReady(true);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerReady(true);
          observer.disconnect();
          break;
        }
      }
    });

    observer.observe(containerRef.current);

    const timeout = setTimeout(() => {
      if (checkContainerReady()) {
        setContainerReady(true);
      }
      observer.disconnect();
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [libLoaded, checkContainerReady]);

  useEffect(() => {
    if (
      !libLoaded ||
      !containerReady ||
      !containerRef.current ||
      !window.TradingView
    )
      return;

    const datafeed = createDatafeed(pairAddress, {
      symbol: pairName,
      name: pairName,
      price: initialPrice,
    });
    datafeedRef.current = datafeed;

    const widget = new window.TradingView.widget({
      debug: false,
      symbol: pairName,
      interval: "60",
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
      theme: "Dark",
      datafeed: datafeed,
      overrides: {
        "paneProperties.background": "#09090b",
        "paneProperties.vertGridProperties.color": "#27272a",
        "paneProperties.horzGridProperties.color": "#27272a",
        "scalesProperties.textColor": "#a1a1aa",
      },
    });

    widgetRef.current = widget;

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
        datafeedRef.current = null;
      }
    };
  }, [libLoaded, containerReady, pairAddress, pairName, initialPrice]);

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
