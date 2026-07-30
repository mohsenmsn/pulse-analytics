"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DataRowPayload, WidgetConfig } from "@/types";
import { EmptyWidget, chartTooltipStyle } from "./widget-chrome";

export function BarChartWidget({
  data,
  config,
}: {
  data: DataRowPayload[];
  config: WidgetConfig;
}) {
  const xKey = config.xKey ?? "date";
  const yKey = config.yKey ?? config.metric ?? "value";
  const color = config.color ?? "#0d9488";

  if (!data.length) return <EmptyWidget />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#94a3b8"
          strokeOpacity={0.25}
          vertical={false}
        />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={chartTooltipStyle}
          cursor={{ fill: "#94a3b8", opacity: 0.08 }}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
