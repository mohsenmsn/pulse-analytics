"use client";

import * as React from "react";
import { GripVertical, Trash2 } from "lucide-react";
import type { ClientWidget, DataRowPayload } from "@/types";
import { LineChartWidget } from "./widgets/line-chart-widget";
import { BarChartWidget } from "./widgets/bar-chart-widget";
import { PieChartWidget } from "./widgets/pie-chart-widget";
import { StatCardWidget } from "./widgets/stat-card-widget";
import { TableWidget } from "./widgets/table-widget";
import { cn } from "@/lib/utils";

export function WidgetRenderer({
  widget,
  data,
  editing,
  onDelete,
}: {
  widget: ClientWidget;
  data: DataRowPayload[];
  editing: boolean;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {editing ? (
          <GripVertical className="widget-drag-handle h-4 w-4 shrink-0 text-muted-foreground" />
        ) : null}
        <h3 className="truncate text-sm font-medium">{widget.title}</h3>
        {editing ? (
          <button
            type="button"
            onClick={() => onDelete?.(widget.id)}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${widget.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className={cn("min-h-0 flex-1 p-3", widget.type === "TABLE" && "p-0")}>
        <WidgetBody widget={widget} data={data} />
      </div>
    </div>
  );
}

function WidgetBody({
  widget,
  data,
}: {
  widget: ClientWidget;
  data: DataRowPayload[];
}) {
  switch (widget.type) {
    case "LINE_CHART":
      return <LineChartWidget data={data} config={widget.config} />;
    case "BAR_CHART":
      return <BarChartWidget data={data} config={widget.config} />;
    case "PIE_CHART":
      return <PieChartWidget data={data} config={widget.config} />;
    case "STAT_CARD":
      return <StatCardWidget data={data} config={widget.config} />;
    case "TABLE":
      return (
        <div className="h-full p-3">
          <TableWidget data={data} config={widget.config} />
        </div>
      );
    default:
      return null;
  }
}
