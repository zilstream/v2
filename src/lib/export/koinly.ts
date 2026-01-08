import { format } from "date-fns";
import { formatUnits } from "viem";
import type { AddressEvent } from "@/lib/api-client";
import type { KoinlyTransaction } from "./types";

function formatKoinlyDate(timestamp: number): string {
  return format(new Date(timestamp * 1000), "yyyy-MM-dd HH:mm:ss") + " UTC";
}

function formatAmount(value: string | undefined, decimals = 18): string {
  if (!value || value === "0") return "";
  try {
    return formatUnits(BigInt(value), decimals);
  } catch {
    return value;
  }
}

export function eventsToKoinly(events: AddressEvent[]): KoinlyTransaction[] {
  return events.map((event) => {
    const amount0In = BigInt(event.amount0In || "0");
    const amount0Out = BigInt(event.amount0Out || "0");
    const amount1In = BigInt(event.amount1In || "0");
    const amount1Out = BigInt(event.amount1Out || "0");

    if (event.eventType === "swap") {
      let sentAmount = "";
      let sentCurrency = "";
      let receivedAmount = "";
      let receivedCurrency = "";

      if (amount0In > 0n) {
        sentAmount = formatAmount(event.amount0In);
        sentCurrency = event.token0Symbol;
      }
      if (amount1In > 0n) {
        sentAmount = formatAmount(event.amount1In);
        sentCurrency = event.token1Symbol;
      }
      if (amount0Out > 0n) {
        receivedAmount = formatAmount(event.amount0Out);
        receivedCurrency = event.token0Symbol;
      }
      if (amount1Out > 0n) {
        receivedAmount = formatAmount(event.amount1Out);
        receivedCurrency = event.token1Symbol;
      }

      return {
        Date: formatKoinlyDate(event.timestamp),
        "Sent Amount": sentAmount,
        "Sent Currency": sentCurrency,
        "Received Amount": receivedAmount,
        "Received Currency": receivedCurrency,
        "Fee Amount": "",
        "Fee Currency": "",
        "Net Worth Amount": event.amountUsd || "",
        "Net Worth Currency": event.amountUsd ? "USD" : "",
        Label: "swap",
        Description: `Swap on ZilStream DEX`,
        TxHash: event.transactionHash,
      };
    }

    if (event.eventType === "mint") {
      const sent0 = amount0In > 0n ? formatAmount(event.amount0In) : "";
      const sent1 = amount1In > 0n ? formatAmount(event.amount1In) : "";

      return {
        Date: formatKoinlyDate(event.timestamp),
        "Sent Amount": sent0 || sent1,
        "Sent Currency": sent0 ? event.token0Symbol : event.token1Symbol,
        "Received Amount": "",
        "Received Currency": "",
        "Fee Amount": "",
        "Fee Currency": "",
        "Net Worth Amount": event.amountUsd || "",
        "Net Worth Currency": event.amountUsd ? "USD" : "",
        Label: "liquidity_in",
        Description: `Add liquidity on ZilStream DEX`,
        TxHash: event.transactionHash,
      };
    }

    if (event.eventType === "burn") {
      const received0 = amount0Out > 0n ? formatAmount(event.amount0Out) : "";
      const received1 = amount1Out > 0n ? formatAmount(event.amount1Out) : "";

      return {
        Date: formatKoinlyDate(event.timestamp),
        "Sent Amount": "",
        "Sent Currency": "",
        "Received Amount": received0 || received1,
        "Received Currency": received0
          ? event.token0Symbol
          : event.token1Symbol,
        "Fee Amount": "",
        "Fee Currency": "",
        "Net Worth Amount": event.amountUsd || "",
        "Net Worth Currency": event.amountUsd ? "USD" : "",
        Label: "liquidity_out",
        Description: `Remove liquidity on ZilStream DEX`,
        TxHash: event.transactionHash,
      };
    }

    return {
      Date: formatKoinlyDate(event.timestamp),
      "Sent Amount": "",
      "Sent Currency": "",
      "Received Amount": "",
      "Received Currency": "",
      "Fee Amount": "",
      "Fee Currency": "",
      "Net Worth Amount": event.amountUsd || "",
      "Net Worth Currency": event.amountUsd ? "USD" : "",
      Label: event.eventType,
      Description: `${event.eventType} on ZilStream DEX`,
      TxHash: event.transactionHash,
    };
  });
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function koinlyToCSV(transactions: KoinlyTransaction[]): string {
  const headers = [
    "Date",
    "Sent Amount",
    "Sent Currency",
    "Received Amount",
    "Received Currency",
    "Fee Amount",
    "Fee Currency",
    "Net Worth Amount",
    "Net Worth Currency",
    "Label",
    "Description",
    "TxHash",
  ];

  const rows = transactions.map((tx) =>
    [
      tx.Date,
      tx["Sent Amount"],
      tx["Sent Currency"],
      tx["Received Amount"],
      tx["Received Currency"],
      tx["Fee Amount"],
      tx["Fee Currency"],
      tx["Net Worth Amount"],
      tx["Net Worth Currency"],
      tx.Label,
      tx.Description,
      tx.TxHash,
    ].map((v) => escapeCSV(String(v ?? ""))),
  );

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
