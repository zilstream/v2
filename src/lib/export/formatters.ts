import { format } from "date-fns";
import { formatUnits } from "viem";
import * as XLSX from "xlsx";
import type { AddressEvent, Transaction } from "@/lib/api-client";
import type { DateRange, ExportData, PortfolioSnapshot } from "./types";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAmount(value: string | undefined, decimals = 18): string {
  if (!value || value === "0") return "";
  try {
    return formatUnits(BigInt(value), decimals);
  } catch {
    return value;
  }
}

function formatEventDate(timestamp: number): string {
  return format(new Date(timestamp * 1000), "yyyy-MM-dd HH:mm:ss");
}

function getEventDirection(event: AddressEvent): "buy" | "sell" | "other" {
  if (event.eventType !== "swap") return "other";
  const amount0Out = BigInt(event.amount0Out || "0");
  return amount0Out > 0n ? "buy" : "sell";
}

export function eventsToCSV(events: AddressEvent[]): string {
  const headers = [
    "Date",
    "Type",
    "Direction",
    "Token 0 Symbol",
    "Token 0 Amount",
    "Token 1 Symbol",
    "Token 1 Amount",
    "USD Value",
    "Pair Address",
    "Transaction Hash",
  ];

  const rows = events.map((e) => {
    const direction = getEventDirection(e);
    const amount0 =
      e.amount0In && e.amount0In !== "0"
        ? `-${formatAmount(e.amount0In)}`
        : formatAmount(e.amount0Out);
    const amount1 =
      e.amount1In && e.amount1In !== "0"
        ? `-${formatAmount(e.amount1In)}`
        : formatAmount(e.amount1Out);

    return [
      formatEventDate(e.timestamp),
      e.eventType,
      direction,
      e.token0Symbol,
      amount0,
      e.token1Symbol,
      amount1,
      e.amountUsd,
      e.pairAddress,
      e.transactionHash,
    ].map((v) => escapeCSV(String(v ?? "")));
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function transactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    "Date",
    "Hash",
    "From",
    "To",
    "Value",
    "Status",
    "Gas Used",
    "Gas Price",
    "Block Number",
  ];

  const rows = transactions.map((tx) => {
    return [
      formatEventDate(tx.timestamp),
      tx.hash,
      tx.fromAddress,
      tx.toAddress ?? "",
      formatAmount(tx.value),
      tx.status === 1 ? "Success" : "Failed",
      tx.gasUsed.toString(),
      tx.gasPrice,
      tx.blockNumber.toString(),
    ].map((v) => escapeCSV(String(v ?? "")));
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function portfolioToCSV(portfolio: PortfolioSnapshot): string {
  const headers = [
    "Token Address",
    "Token Symbol",
    "Token Name",
    "Balance",
    "Price USD",
    "Value USD",
  ];

  const rows = portfolio.balances.map((b) => {
    return [
      b.tokenAddress,
      b.tokenSymbol,
      b.tokenName,
      b.balance,
      b.priceUsd,
      b.valueUsd,
    ].map((v) => escapeCSV(String(v ?? "")));
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  return `# Portfolio Snapshot: ${format(new Date(portfolio.timestamp), "yyyy-MM-dd HH:mm:ss")}\n# Total Value: $${portfolio.totalValueUsd}\n\n${csv}`;
}

export function exportDataToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function exportDataToExcel(
  data: ExportData,
  dateRange: DateRange,
): Blob {
  const workbook = XLSX.utils.book_new();

  if (data.events && data.events.length > 0) {
    const eventsData = data.events.map((e) => {
      const direction = getEventDirection(e);
      return {
        Date: formatEventDate(e.timestamp),
        Type: e.eventType,
        Direction: direction,
        "Token 0": e.token0Symbol,
        "Token 0 Amount":
          e.amount0In && e.amount0In !== "0"
            ? -Number(formatAmount(e.amount0In))
            : Number(formatAmount(e.amount0Out)),
        "Token 1": e.token1Symbol,
        "Token 1 Amount":
          e.amount1In && e.amount1In !== "0"
            ? -Number(formatAmount(e.amount1In))
            : Number(formatAmount(e.amount1Out)),
        "USD Value": Number(e.amountUsd),
        "Pair Address": e.pairAddress,
        "Transaction Hash": e.transactionHash,
      };
    });
    const eventsSheet = XLSX.utils.json_to_sheet(eventsData);
    XLSX.utils.book_append_sheet(workbook, eventsSheet, "Events");
  }

  if (data.transactions && data.transactions.length > 0) {
    const txData = data.transactions.map((tx) => ({
      Date: formatEventDate(tx.timestamp),
      Hash: tx.hash,
      From: tx.fromAddress,
      To: tx.toAddress ?? "",
      Value: Number(formatAmount(tx.value)),
      Status: tx.status === 1 ? "Success" : "Failed",
      "Gas Used": tx.gasUsed,
      "Gas Price": tx.gasPrice,
      "Block Number": tx.blockNumber,
    }));
    const txSheet = XLSX.utils.json_to_sheet(txData);
    XLSX.utils.book_append_sheet(workbook, txSheet, "Transactions");
  }

  if (data.portfolio) {
    const portfolioData = data.portfolio.balances.map((b) => ({
      "Token Address": b.tokenAddress,
      Symbol: b.tokenSymbol,
      Name: b.tokenName,
      Balance: Number(b.balance),
      "Price USD": Number(b.priceUsd),
      "Value USD": Number(b.valueUsd),
    }));
    const portfolioSheet = XLSX.utils.json_to_sheet(portfolioData);
    XLSX.utils.book_append_sheet(workbook, portfolioSheet, "Portfolio");
  }

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  downloadBlob(blob, filename);
}

export function generateFilename(
  dataTypes: string[],
  exportFormat: string,
  dateRange: DateRange,
): string {
  const rangeStr = `${format(dateRange.start, "yyyyMMdd")}-${format(dateRange.end, "yyyyMMdd")}`;
  const dateStr = format(new Date(), "yyyyMMdd");
  const dataType = dataTypes.join("-");
  const extension =
    exportFormat === "excel"
      ? "xlsx"
      : exportFormat === "koinly"
        ? "csv"
        : exportFormat;

  return `zilstream-${dataType}-${rangeStr}-${dateStr}.${extension}`;
}
