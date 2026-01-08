"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { formatUnits } from "viem";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "./date-range-picker";
import { usePortfolioBalances } from "@/hooks/use-portfolio-balances";
import {
  fetchAllEventsInRange,
  fetchAllTransactionsInRange,
} from "@/lib/export/fetch-all-events";
import {
  eventsToCSV,
  transactionsToCSV,
  portfolioToCSV,
  exportDataToJSON,
  exportDataToExcel,
  downloadCSV,
  downloadJSON,
  downloadBlob,
  generateFilename,
} from "@/lib/export/formatters";
import { eventsToKoinly, koinlyToCSV } from "@/lib/export/koinly";
import type {
  ExportFormat,
  DataType,
  DateRange,
  ExportData,
  ExportProgress,
  PortfolioSnapshot,
} from "@/lib/export/types";

interface ExportsFormProps {
  address: string;
}

const currentYear = new Date().getFullYear();
const defaultDateRange: DateRange = {
  start: new Date(currentYear, 0, 1),
  end: new Date(currentYear, 11, 31),
};

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "csv",
    label: "CSV",
    description: "Comma-separated values",
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
  {
    value: "json",
    label: "JSON",
    description: "Structured data format",
    icon: <FileJson className="h-5 w-5" />,
  },
  {
    value: "excel",
    label: "Excel",
    description: "Microsoft Excel spreadsheet",
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
  {
    value: "koinly",
    label: "Koinly",
    description: "Crypto tax software format",
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
];

const DATA_TYPE_OPTIONS: {
  value: DataType;
  label: string;
  description: string;
}[] = [
  {
    value: "events",
    label: "Trading Events",
    description: "Swaps, liquidity adds/removes",
  },
  {
    value: "transactions",
    label: "Transactions",
    description: "All on-chain transactions",
  },
  {
    value: "portfolio",
    label: "Portfolio Snapshot",
    description: "Current token balances",
  },
];

export function ExportsForm({ address }: ExportsFormProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dataTypes, setDataTypes] = useState<DataType[]>(["events"]);
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const { data: portfolioBalances } = usePortfolioBalances();

  const toggleDataType = (type: DataType) => {
    setDataTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleExport = async () => {
    if (dataTypes.length === 0) {
      toast.error("Please select at least one data type to export");
      return;
    }

    setIsExporting(true);
    setProgress({
      phase: "fetching",
      current: 0,
      total: -1,
      message: "Starting export...",
    });

    try {
      const exportData: ExportData = {};

      if (dataTypes.includes("events")) {
        setProgress({
          phase: "fetching",
          current: 0,
          total: -1,
          message: "Fetching events...",
        });
        exportData.events = await fetchAllEventsInRange(
          address,
          dateRange,
          setProgress,
        );
      }

      if (dataTypes.includes("transactions")) {
        setProgress({
          phase: "fetching",
          current: 0,
          total: -1,
          message: "Fetching transactions...",
        });
        exportData.transactions = await fetchAllTransactionsInRange(
          address,
          dateRange,
          setProgress,
        );
      }

      if (dataTypes.includes("portfolio") && portfolioBalances) {
        exportData.portfolio = {
          address,
          timestamp: Date.now(),
          balances: portfolioBalances.map((b) => ({
            tokenAddress: b.address,
            tokenSymbol: b.symbol,
            tokenName: b.name,
            balance: formatUnits(b.balance, b.decimals),
            decimals: b.decimals,
            priceUsd: b.priceUsd.toString(),
            valueUsd: b.valueUsd.toFixed(2),
          })),
          totalValueUsd: portfolioBalances
            .reduce((sum, b) => sum + b.valueUsd, 0)
            .toFixed(2),
        } satisfies PortfolioSnapshot;
      }

      const totalItems =
        (exportData.events?.length || 0) +
        (exportData.transactions?.length || 0) +
        (exportData.portfolio?.balances.length || 0);

      if (totalItems === 0) {
        toast.error("No data found for the selected date range and data types");
        return;
      }

      setProgress({
        phase: "generating",
        current: 0,
        total: 1,
        message: "Generating file...",
      });

      const filename = generateFilename(dataTypes, format, dateRange);

      switch (format) {
        case "csv": {
          const parts: string[] = [];
          if (exportData.events?.length) {
            parts.push("# Trading Events\n" + eventsToCSV(exportData.events));
          }
          if (exportData.transactions?.length) {
            parts.push(
              "# Transactions\n" + transactionsToCSV(exportData.transactions),
            );
          }
          if (exportData.portfolio) {
            parts.push(portfolioToCSV(exportData.portfolio));
          }
          downloadCSV(parts.join("\n\n"), filename);
          break;
        }
        case "json": {
          downloadJSON(exportDataToJSON(exportData), filename);
          break;
        }
        case "excel": {
          const blob = exportDataToExcel(exportData, dateRange);
          downloadBlob(blob, filename);
          break;
        }
        case "koinly": {
          if (!exportData.events?.length) {
            toast.error("Koinly export requires trading events");
            return;
          }
          const koinlyTx = eventsToKoinly(exportData.events);
          downloadCSV(koinlyToCSV(koinlyTx), filename);
          break;
        }
      }

      toast.success(
        `Exported ${totalItems.toLocaleString()} items successfully`,
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Export Data</h1>
        <p className="text-muted-foreground">
          Export your trading history and portfolio data for tax reporting or
          personal records.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Date Range</CardTitle>
            <CardDescription>
              Select the time period for your export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Format</CardTitle>
            <CardDescription>
              Choose the file format for your export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormat(opt.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                    format === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        format === opt.value
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {opt.icon}
                    </span>
                    <span className="font-medium">{opt.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data to Export</CardTitle>
          <CardDescription>
            Select which data you want to include in the export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DATA_TYPE_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex items-start gap-3">
                <Checkbox
                  id={opt.value}
                  checked={dataTypes.includes(opt.value)}
                  onCheckedChange={() => toggleDataType(opt.value)}
                  disabled={format === "koinly" && opt.value !== "events"}
                />
                <div className="grid gap-0.5">
                  <label
                    htmlFor={opt.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {opt.label}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </div>
            ))}
            {format === "koinly" && (
              <p className="text-sm text-muted-foreground">
                Koinly format only supports trading events
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button
          size="lg"
          onClick={handleExport}
          disabled={isExporting || dataTypes.length === 0}
          className="min-w-[200px]"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {progress?.message || "Exporting..."}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
        {isExporting && progress && (
          <p className="text-sm text-muted-foreground">
            {progress.phase === "fetching" && progress.current > 0
              ? `Fetched ${progress.current.toLocaleString()} items...`
              : progress.message}
          </p>
        )}
      </div>
    </div>
  );
}
