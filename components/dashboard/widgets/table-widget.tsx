"use client";

import * as React from "react";
import type { DataRowPayload, WidgetConfig } from "@/types";
import { EmptyWidget } from "./widget-chrome";

function resolveColumns(
  config: WidgetConfig,
  rows: DataRowPayload[]
): string[] {
  const raw = config.columns as unknown;
  if (Array.isArray(raw) && raw.length) return raw as string[];
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return rows.length ? Object.keys(rows[0]).filter((k) => !k.startsWith("__")) : [];
}

export function TableWidget({
  data,
  config,
}: {
  data: DataRowPayload[];
  config: WidgetConfig;
}) {
  const columns = resolveColumns(config, data);

  if (!data.length || !columns.length) return <EmptyWidget />;

  return (
    <div className="h-full overflow-auto no-scrollbar">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-card">
          <tr className="border-b border-border text-left">
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-3 py-2 font-medium capitalize text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/60 last:border-0 hover:bg-muted/40"
            >
              {columns.map((col) => (
                <td key={col} className="whitespace-nowrap px-3 py-2">
                  {row[col] === null || row[col] === undefined
                    ? "—"
                    : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
