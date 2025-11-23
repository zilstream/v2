import { API_BASE_URL } from "@/lib/zilstream";

// biome-ignore lint/suspicious/noExplicitAny: TradingView types are complex and not installed
export function createDatafeed(pairAddress: string, pairInfo: any) {
  const configurationData = {
    supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W"],
    exchanges: [
      {
        value: "ZilStream",
        name: "ZilStream",
        desc: "ZilStream Exchange",
      },
    ],
    symbols_types: [
      {
        name: "Crypto",
        value: "crypto",
        desc: "Crypto",
      },
    ],
  };

  // Store subscribers
  const subscribers = new Map<
    string,
    {
      // biome-ignore lint/suspicious/noExplicitAny: TV callback
      callback: (bar: any) => void;
      resolution: string;
    }
  >();

  // Track last bars per resolution to enable updates
  // biome-ignore lint/suspicious/noExplicitAny: Bar data
  const lastBars = new Map<string, any>();

  // Helper to calculate pricescale (decimals)
  const getPriceScale = (price: number) => {
    if (price < 0.000001) return 10000000000;
    if (price < 0.0001) return 100000000;
    if (price < 0.01) return 1000000;
    if (price < 1) return 10000;
    if (price < 100) return 100;
    return 100; // Default 2 decimals for larger numbers
  };

  // Try to estimate current price to set scale, fallback to 8 decimals
  // We can use the initial price from pairInfo if available
  const initialPrice = pairInfo?.price ? Number.parseFloat(pairInfo.price) : 0;
  const pricescale = initialPrice > 0 ? getPriceScale(initialPrice) : 100000000; // Default to 8 decimals if unknown

  const getIntervalSeconds = (resolution: string) => {
    if (resolution === "1D") return 86400;
    if (resolution === "1W") return 604800;
    const parsed = Number.parseInt(resolution);
    if (!Number.isNaN(parsed)) return parsed * 60;
    return 60;
  };

  return {
    // biome-ignore lint/suspicious/noExplicitAny: TV callback
    onReady: (callback: (config: any) => void) => {
      setTimeout(() => callback(configurationData), 0);
    },

    searchSymbols: (
      _userInput: string,
      _exchange: string,
      _symbolType: string,
      // biome-ignore lint/suspicious/noExplicitAny: TV callback
      onResultReadyCallback: (result: any[]) => void,
    ) => {
      // Not implemented as we only show the specific pair
      onResultReadyCallback([]);
    },

    resolveSymbol: (
      _symbolName: string,
      // biome-ignore lint/suspicious/noExplicitAny: TV callback
      onSymbolResolvedCallback: (symbolInfo: any) => void,
      _onResolveErrorCallback: (reason: string) => void,
    ) => {
      // Use the pair info passed to constructing the datafeed
      const symbolInfo = {
        name: pairInfo?.symbol || "PAIR",
        description: pairInfo?.name || "Pair Description",
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "ZilStream",
        minmov: 1,
        pricescale: pricescale,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: "streaming",
      };

      setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
    },

    getBars: async (
      // biome-ignore lint/suspicious/noExplicitAny: TV symbol info
      _symbolInfo: any,
      resolution: string,
      periodParams: { from: number; to: number; firstDataRequest: boolean },
      // biome-ignore lint/suspicious/noExplicitAny: TV callback
      onHistoryCallback: (bars: any[], meta: any) => void,
      onErrorCallback: (error: string) => void,
    ) => {
      const { from, to } = periodParams;

      try {
        // Construct URL
        // Use the API_BASE_URL from the config to ensure we hit the correct backend
        const url = `${API_BASE_URL}/pairs/${pairAddress}/ohlcv?from=${from}&to=${to}&resolution=${resolution}`;

        const response = await fetch(url);
        const json = await response.json();
        const data = json.data || json; // Handle both { data: { ... } } and { ... }

        if (data.s === "no_data") {
          onHistoryCallback([], { noData: true });
          return;
        }

        if (data.s !== "ok") {
          onErrorCallback(data.errmsg || "Error fetching data");
          return;
        }

        const bars = [];
        const count = data.t.length;
        const intervalSeconds = getIntervalSeconds(resolution);

        for (let i = 0; i < count; i++) {
          // Ensure time is aligned to bucket start
          const rawTime = data.t[i];
          const alignedTime =
            Math.floor(rawTime / intervalSeconds) * intervalSeconds * 1000;

          bars.push({
            time: alignedTime,
            open: Number.parseFloat(data.o[i]),
            high: Number.parseFloat(data.h[i]),
            low: Number.parseFloat(data.l[i]),
            close: Number.parseFloat(data.c[i]),
            volume: Number.parseFloat(data.v[i]),
          });
        }

        // Update lastBar for this resolution
        if (bars.length > 0) {
          const lastBar = bars[bars.length - 1];
          lastBars.set(resolution, lastBar);
        }

        onHistoryCallback(bars, { noData: false });
      } catch (error) {
        console.error("[getBars] Error:", error);
        onErrorCallback("Network error");
      }
    },

    subscribeBars: (
      // biome-ignore lint/suspicious/noExplicitAny: TV symbol info
      _symbolInfo: any,
      resolution: string,
      // biome-ignore lint/suspicious/noExplicitAny: TV callback
      onRealtimeCallback: (bar: any) => void,
      subscriberUID: string,
      _onResetCacheNeededCallback: () => void,
    ) => {
      subscribers.set(subscriberUID, {
        callback: onRealtimeCallback,
        resolution,
      });
    },

    unsubscribeBars: (subscriberUID: string) => {
      subscribers.delete(subscriberUID);
    },

    // Custom method to push updates
    // biome-ignore lint/suspicious/noExplicitAny: Trade data
    updateLastBar: (trade: any) => {
      subscribers.forEach(({ callback, resolution }) => {
        const intervalSeconds = getIntervalSeconds(resolution);
        let lastBar = lastBars.get(resolution);

        const tradeTime =
          Math.floor(trade.timestamp / intervalSeconds) * intervalSeconds * 1000;
        const tradePrice = Number(trade.price);
        const tradeVolume = Number(trade.volume || trade.amountUSD || 0);

        if (!lastBar) {
          // Initialize if missing (unlikely if getBars ran)
          lastBar = {
            time: tradeTime,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume,
          };
        } else if (tradeTime > lastBar.time) {
          // New bar
          lastBar = {
            time: tradeTime,
            open: lastBar.close,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume,
          };
        } else if (tradeTime === lastBar.time) {
          // Update existing bar
          lastBar = {
            ...lastBar,
            high: Math.max(lastBar.high, tradePrice),
            low: Math.min(lastBar.low, tradePrice),
            close: tradePrice,
            volume: lastBar.volume + tradeVolume,
          };
        } else {
            // Past trade, ignore
            return;
        }

        lastBars.set(resolution, lastBar);
        callback(lastBar);
      });
    },
  };
}
