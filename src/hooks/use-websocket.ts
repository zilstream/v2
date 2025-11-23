import { useEffect, useRef } from "react";
import { useWebSocketContext } from "@/components/websocket-provider";
import {
  type Subscription,
  PublicationContext,
} from "centrifuge/build/protobuf";
import { type Pair, mapPair } from "@/lib/zilstream";
import type {
  BatchUpdate,
  PairUpdate,
  SwapEventData,
  WebSocketMessage,
} from "@/lib/websocket-types";

export function useSubscription<T = any>(
  channel: string,
  onData: (data: T) => void,
  enabled: boolean = true,
) {
  const { centrifuge, isConnected } = useWebSocketContext();
  const subscriptionRef = useRef<Subscription | null>(null);
  const onDataRef = useRef(onData);

  // Keep callback fresh
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    if (!centrifuge || !isConnected || !enabled || !channel) return;

    console.log(`Subscribing to ${channel}`);

    try {
      // Create subscription
      // Note: Centrifuge.newSubscription throws if subscription already exists
      // So we check if it exists first, or handle the error, or just get it.
      // However, the library manages subscriptions.
      // Ideally we should use getSubscription and if not exists newSubscription.

      let sub = centrifuge.getSubscription(channel);
      if (!sub) {
        sub = centrifuge.newSubscription(channel, {
          recoverable: true,
        });
      }

      subscriptionRef.current = sub;

      const onPublication = (ctx: PublicationContext) => {
        let data = ctx.data;
        if (data instanceof Uint8Array) {
          try {
            const decoder = new TextDecoder();
            const str = decoder.decode(data);
            data = JSON.parse(str);
          } catch (e) {
            console.error("Failed to decode/parse WebSocket message", e);
          }
        }
        onDataRef.current(data);
      };

      sub.on("publication", onPublication);
      sub.subscribe();

      return () => {
        if (sub) {
          sub.removeListener("publication", onPublication);
          sub.unsubscribe();
          centrifuge.removeSubscription(sub);
          subscriptionRef.current = null;
        }
      };
    } catch (err) {
      console.error(`Failed to subscribe to ${channel}:`, err);
    }
  }, [centrifuge, isConnected, channel, enabled]);
}

export function useBatchPairsSubscription(onUpdate: (pairs: Pair[]) => void) {
  useSubscription<BatchUpdate>("dex.pairs", (data) => {
    if (data.type === "pair.batch") {
      const pairs = data.items.map(mapPair);
      onUpdate(pairs);
    }
  });
}

export function usePairSubscription(
  pairAddress: string,
  onUpdate: (pair: Pair) => void,
  onEvent?: (event: SwapEventData, eventType: string) => void,
) {
  const channel = pairAddress ? `dex.pair.${pairAddress.toLowerCase()}` : "";

  useSubscription<WebSocketMessage>(
    channel,
    (data) => {
      if (data.type === "pair.update") {
        const pair = mapPair(data.pair);
        onUpdate(pair);
      } else if (
        data.type === "pair.event" &&
        ["swap", "mint", "burn"].includes(data.event_type)
      ) {
        onEvent?.(data.data, data.event_type);
      }
    },
    !!pairAddress,
  );
}
