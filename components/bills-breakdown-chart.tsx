"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Occurrence } from "@/lib/occurrences";
import { formatCurrency } from "@/lib/format";

interface BillsBreakdownChartProps {
  occurrences: Occurrence[];
}

// One hue, monotone lightness — rank-ordered by amount (biggest bill = darkest),
// not a categorical identity color, since bill order here is real (sorted by size).
const RAMP = [
  "var(--chart-bill-1)",
  "var(--chart-bill-2)",
  "var(--chart-bill-3)",
  "var(--chart-bill-4)",
  "var(--chart-bill-5)",
];
const OTHER_COLOR = "var(--muted-foreground)";
const MAX_SLICES = 5;

export function BillsBreakdownChart({ occurrences }: BillsBreakdownChartProps) {
  const totals = new Map<string, number>();
  for (const occ of occurrences) {
    if (occ.kind !== "bill") continue;
    totals.set(occ.name, (totals.get(occ.name) ?? 0) + occ.amount);
  }

  const sorted = [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const top = sorted.slice(0, MAX_SLICES);
  const restTotal = sorted.slice(MAX_SLICES).reduce((sum, item) => sum + item.amount, 0);

  const data = top.map((item, i) => ({ ...item, fill: RAMP[i] }));
  if (restTotal > 0) {
    data.push({ name: "Other", amount: restTotal, fill: OTHER_COLOR });
  }

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No bills in this window.</p>;
  }

  const chartConfig = Object.fromEntries(
    data.map((item) => [item.name, { label: item.name }])
  ) satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[240px] sm:max-h-[280px] lg:max-h-[320px]">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              nameKey="name"
              formatter={(value, name) => `${name}: ${formatCurrency(Number(value))}`}
            />
          }
        />
        <Pie data={data} dataKey="amount" nameKey="name" innerRadius={50} strokeWidth={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}
