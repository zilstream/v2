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

export type WebSocketMessage = BatchUpdate | PairUpdate;
