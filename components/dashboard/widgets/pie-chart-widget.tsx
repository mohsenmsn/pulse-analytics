"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { DataRowPayload, WidgetConfig } from "@/types";
import { EmptyWidget, chartTooltipStyle, CHART_PALETTE } from "./widget-chrome";

export function PieChartWidget({
  data,
  config,
}: {
  data: DataRowPayload[];
  config: WidgetConfig;
}) {
  const labelKey = config.labelKey ?? "label";
  const valueKey = config.valueKey ?? config.metric ?? "value";

  const aggregated = React.useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of data) {
      const label = String(row[labelKey] ?? "Unknown");
      const value = Number(row[valueKey]);
      if (Number.isNaN(value)) continue;
      totals.set(label, (totals.get(label) ?? 0) + value);
    }
    return Array.from(totals, ([name, value]) => ({ name, value }));
  }, [data, labelKey, valueKey]);

  if (!aggregated.length) return <EmptyWidget />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={aggregated}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="45%"
          outerRadius="75%"
          paddingAngle={2}
        >
          {aggregated.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={CHART_PALETTE[index % CHART_PALETTE.length]}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={chartTooltipStyle} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value: string) => (
            <span className="text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
