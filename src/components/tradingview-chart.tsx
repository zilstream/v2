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

interface TradingViewChartProps {
  pairAddress: string;
  pairName: string;
  initialPrice?: string;
}

export function TradingViewChart({
  pairAddress,
  pairName,
  initialPrice,
  className,
}: TradingViewChartProps & { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [libLoaded, setLibLoaded] = useState(false);

  useEffect(() => {
    if (!libLoaded || !containerRef.current || !window.TradingView) return;

    const widget = new window.TradingView.widget({
      // Debug
      debug: false,
      
      // Basic settings
      symbol: pairName,
      interval: "60", // Default interval
      container: containerRef.current,
      library_path: "/charting_library/",
      locale: "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: "https://saveload.tradingview.com",
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user_id",
      fullscreen: false,
      autosize: true,
      theme: "Dark", // Assuming dark mode based on project style
      
      // Datafeed
      datafeed: createDatafeed(pairAddress, {
        symbol: pairName,
        name: pairName,
        price: initialPrice,
      }),
      
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
      }
    };
  }, [libLoaded, pairAddress, pairName, initialPrice]);

  return (
    <div className={`relative w-full overflow-hidden bg-card text-card-foreground ${className || "h-[500px] rounded-xl border shadow"}`}>
      <Script
        src="/charting_library/charting_library.standalone.js"
        onLoad={() => setLibLoaded(true)}
      />
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
