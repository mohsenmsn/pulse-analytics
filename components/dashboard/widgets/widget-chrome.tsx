"use client";

import * as React from "react";
import { BarChart3 } from "lucide-react";

export const CHART_PALETTE = [
  "#0d9488",
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#dc2626",
  "#10b981",
  "#db2777",
  "#0891b2",
];

/** Inline style for Recharts tooltips that adapts to the design tokens. */
export const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: 12,
  color: "hsl(var(--foreground))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export function EmptyWidget({
  message = "No data yet",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <BarChart3 className="h-8 w-8 opacity-40" />
      <p className="text-sm">{message}</p>
      <p className="text-xs opacity-70">
        Connect a data source to populate this widget.
      </p>
    </div>
  );
}
