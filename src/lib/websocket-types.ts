import type { PairResponse } from "./zilstream";

export interface BatchUpdate {
  type: "pair.batch";
  block_number: number;
  ts: number;
  items: PairResponse[];
}

export interface PairUpdate {
  type: "pair.update";
  block_number: number;
  ts: number;
  pair: PairResponse;
}

export interface SwapEventData {
  protocol: string;
  id: string;
  transaction_hash: string;
  timestamp: number;
  sender: string;
  recipient: string;
  amount0?: string;
  amount1?: string;
  amount0_in?: string;
  amount0_out?: string;
  amount1_in?: string;
  amount1_out?: string;
  amount_usd: string;
  sqrt_price_x96?: string;
  liquidity?: string;
  tick?: string;
}

export interface PairEventMessage {
  type: "pair.event";
  event_type: "swap" | "mint" | "burn";
  data: SwapEventData;
}

export type WebSocketMessage = BatchUpdate | PairUpdate | PairEventMessage;
