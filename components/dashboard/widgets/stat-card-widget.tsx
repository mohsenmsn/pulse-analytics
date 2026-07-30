"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { DataRowPayload, WidgetConfig } from "@/types";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StatCardWidget({
  data,
  config,
}: {
  data: DataRowPayload[];
  config: WidgetConfig;
}) {
  const metric = config.metric ?? config.yKey ?? "value";
  const color = config.color ?? "#0d9488";

  const values = React.useMemo(
    () =>
      data
        .map((row) => Number(row[metric]))
        .filter((v) => !Number.isNaN(v)),
    [data, metric]
  );

  const latest = values.length ? values[values.length - 1] : null;
  const previous = values.length > 1 ? values[values.length - 2] : null;

  const delta =
    latest !== null && previous !== null && previous !== 0
      ? ((latest - previous) / Math.abs(previous)) * 100
      : null;

  const trendUp = delta !== null && delta > 0;
  const trendDown = delta !== null && delta < 0;

  return (
    <div className="flex h-full flex-col justify-between">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      </span>
      <div className="mt-2">
        <div className="text-3xl font-semibold tracking-tight">
          {latest !== null ? formatNumber(latest) : "—"}
        </div>
        {delta !== null ? (
          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-xs font-medium",
              trendUp && "text-success",
              trendDown && "text-destructive",
              !trendUp && !trendDown && "text-muted-foreground"
            )}
          >
            {trendUp ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : trendDown ? (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta).toFixed(1)}% vs previous
          </div>
        ) : (
          <div className="mt-1 text-xs text-muted-foreground">
            No prior data
          </div>
        )}
      </div>
    </div>
  );
}
