import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DataRowPayload, DatasetSummary, Plan, PlanLimits } from "@/types";
import { PLAN_LIMITS } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function summarizeDataset(
  rows: DataRowPayload[],
  sampleSize = 5
): DatasetSummary {
  if (rows.length === 0) {
    return { rowCount: 0, columns: [], numericStats: {}, sampleRows: [] };
  }

  const columns = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row)))
  );

  const numericStats: DatasetSummary["numericStats"] = {};

  for (const col of columns) {
    const values = rows
      .map((r) => r[col])
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

    if (values.length === 0) continue;

    const sum = values.reduce((a, b) => a + b, 0);
    numericStats[col] = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
      latest: values[values.length - 1],
    };
  }

  return {
    rowCount: rows.length,
    columns,
    numericStats,
    sampleRows: rows.slice(0, sampleSize),
  };
}

export function coerceRow(raw: Record<string, unknown>): DataRowPayload {
  const result: DataRowPayload = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined || value === "") {
      result[key] = null;
      continue;
    }
    if (typeof value === "boolean") {
      result[key] = value;
      continue;
    }
    if (typeof value === "number") {
      result[key] = value;
      continue;
    }
    const str = String(value).trim();
    const num = Number(str.replace(/,/g, ""));
    if (str !== "" && !Number.isNaN(num) && /^-?\d/.test(str)) {
      result[key] = num;
    } else {
      result[key] = str;
    }
  }
  return result;
}
