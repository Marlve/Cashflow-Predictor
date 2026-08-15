"use client";

import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BalancePoint } from "@/lib/forecast";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/format";

interface BalanceChartProps {
  windowStart: string;
  monthStartBalance: number;
  currentBalance: number;
  checkpointDate: string | null;
  trajectory: BalancePoint[];
  dips: BalancePoint[];
}

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function BalanceChart({
  windowStart,
  monthStartBalance,
  currentBalance,
  checkpointDate,
  trajectory,
  dips,
}: BalanceChartProps) {
  const points: BalancePoint[] =
    trajectory[0]?.date === windowStart
      ? trajectory
      : [{ date: windowStart, balance: monthStartBalance }, ...trajectory];

  // Make sure the checkpoint date is always a vertex, even if no occurrence
  // happens to land on it, so the "actual" and "forecast" segments visibly
  // meet. Re-sorted afterward since the checkpoint can fall anywhere among
  // the now fully-shown historical points.
  const withCheckpoint =
    checkpointDate && !points.some((p) => p.date === checkpointDate)
      ? [...points, { date: checkpointDate, balance: currentBalance }].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      : points;

  const chartData = withCheckpoint.map((point) => ({
    date: point.date,
    actual: checkpointDate && point.date <= checkpointDate ? point.balance : undefined,
    forecast: !checkpointDate || point.date >= checkpointDate ? point.balance : undefined,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full sm:h-[280px] lg:h-[320px]">
      <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => formatDateShort(value)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={64}
          tickFormatter={(value: number) => formatCurrency(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatDate(String(value))}
              formatter={(value, name) =>
                `${name === "actual" ? "So far" : "Forecast"}: ${formatCurrency(Number(value))}`
              }
            />
          }
        />
        <defs>
          <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          dataKey="actual"
          type="monotone"
          fill="url(#fillBalance)"
          stroke="var(--color-balance)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          dataKey="forecast"
          type="monotone"
          fill="url(#fillBalance)"
          fillOpacity={0.35}
          stroke="var(--color-balance)"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <ReferenceLine
          y={currentBalance}
          stroke="var(--muted-foreground)"
          strokeDasharray="4 4"
          label={{
            value: "Current balance",
            position: "insideTopRight",
            fill: "var(--muted-foreground)",
            fontSize: 11,
          }}
        />
        {dips.map((dip) => (
          <ReferenceDot
            key={dip.date}
            x={dip.date}
            y={dip.balance}
            r={5}
            fill="var(--color-balance)"
            stroke="var(--background)"
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
