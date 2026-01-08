"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatPriceUsd, formatUsd } from "@/lib/format";

interface PricePoint {
  timestamp: string;
  price: string;
  source: string;
}

interface ChartData {
  address: string;
  protocol: string;
  base_token: {
    address: string;
    symbol: string;
    decimals: number;
  };
  quote: string;
  timeframe: string;
  interval: string;
  points: PricePoint[];
}

interface TokenPriceChartProps {
  data: ChartData;
  symbol?: string;
}

const chartConfig = {
  price: {
    label: "Price",
  },
} satisfies ChartConfig;

export function TokenPriceChart({ data, symbol }: TokenPriceChartProps) {
  const { chartData, isUptrend } = useMemo(() => {
    const formatted = data.points.map((point) => ({
      timestamp: new Date(point.timestamp).getTime(),
      price: Number.parseFloat(point.price),
      displayDate: new Date(point.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

    const firstPrice = formatted[0]?.price ?? 0;
    const lastPrice = formatted[formatted.length - 1]?.price ?? 0;
    const uptrend = lastPrice >= firstPrice;

    return {
      chartData: formatted,
      isUptrend: uptrend,
    };
  }, [data.points]);

  const chartColor = isUptrend ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
        <CardDescription>
          {symbol ?? data.base_token.symbol} price over the last{" "}
          {data.timeframe}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatPriceUsd(value.toString())}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) {
                  return null;
                }

                const data = payload[0];
                const timestamp = data.payload.timestamp;
                const price = data.value;

                const date = new Date(timestamp);
                const dateStr = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const timeStr = date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {dateStr} at {timeStr}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: chartColor }}
                        >
                          {formatPriceUsd(price as number)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              dataKey="price"
              type="monotone"
              fill={chartColor}
              fillOpacity={0.2}
              stroke={chartColor}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
