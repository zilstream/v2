import type { AddressEvent, Transaction } from "@/lib/api-client";

export type ExportFormat = "csv" | "json" | "excel" | "koinly";

export type DataType = "events" | "transactions" | "portfolio";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ExportOptions {
  format: ExportFormat;
  dataTypes: DataType[];
  dateRange: DateRange;
  address: string;
}

export interface ExportProgress {
  phase: "fetching" | "transforming" | "generating";
  current: number;
  total: number;
  message: string;
}

export interface ExportData {
  events?: AddressEvent[];
  transactions?: Transaction[];
  portfolio?: PortfolioSnapshot;
}

export interface PortfolioSnapshot {
  address: string;
  timestamp: number;
  balances: PortfolioBalance[];
  totalValueUsd: string;
}

export interface PortfolioBalance {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  decimals: number;
  priceUsd: string;
  valueUsd: string;
}

export interface KoinlyTransaction {
  Date: string;
  "Sent Amount": string;
  "Sent Currency": string;
  "Received Amount": string;
  "Received Currency": string;
  "Fee Amount": string;
  "Fee Currency": string;
  "Net Worth Amount": string;
  "Net Worth Currency": string;
  Label: string;
  Description: string;
  TxHash: string;
}
