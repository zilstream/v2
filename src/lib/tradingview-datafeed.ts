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
      },
    ],
  };

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

        for (let i = 0; i < count; i++) {
          bars.push({
            time: data.t[i] * 1000, // Convert Unix seconds to milliseconds
            open: Number.parseFloat(data.o[i]),
            high: Number.parseFloat(data.h[i]),
            low: Number.parseFloat(data.l[i]),
            close: Number.parseFloat(data.c[i]),
            volume: Number.parseFloat(data.v[i]),
          });
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
      _resolution: string,
      // biome-ignore lint/suspicious/noExplicitAny: TV callback
      _onRealtimeCallback: (bar: any) => void,
      _subscriberUID: string,
      _onResetCacheNeededCallback: () => void,
    ) => {
      // Real-time updates not implemented in this version
      // Could poll the API here if needed
    },

    unsubscribeBars: (_subscriberUID: string) => {
      // Cleanup if polling was implemented
    },
  };
}
