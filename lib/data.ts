import { prisma } from "@/lib/db";
import type { DataRowPayload } from "@/types";
import { summarizeDataset } from "@/lib/utils";

export async function getOrganisationRows(organisationId: string) {
  const sources = await prisma.dataSource.findMany({
    where: { organisationId },
    include: { rows: { orderBy: { createdAt: "asc" } } },
  });

  return sources.flatMap((source) =>
    source.rows.map((row) => ({
      ...(row.data as DataRowPayload),
      __sourceId: source.id,
      __sourceName: source.name,
    }))
  );
}

export async function getDataSourceRows(dataSourceId: string) {
  const rows = await prisma.dataRow.findMany({
    where: { dataSourceId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => r.data as DataRowPayload);
}

export async function getOrgDatasetSummary(organisationId: string) {
  const rows = await getOrganisationRows(organisationId);
  return summarizeDataset(rows);
}

export function getMetricValue(
  rows: DataRowPayload[],
  metric: string
): number | null {
  if (rows.length === 0) return null;

  const values = rows
    .map((r) => r[metric])
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

  if (values.length === 0) return null;
  return values[values.length - 1];
}

export const MOCK_API_SAMPLE = [
  { date: "2026-01-01", revenue: 12400, users: 820, conversion: 3.2, churn: 1.1, mrr: 9800 },
  { date: "2026-01-08", revenue: 13250, users: 910, conversion: 3.5, churn: 1.0, mrr: 10200 },
  { date: "2026-01-15", revenue: 14100, users: 980, conversion: 3.8, churn: 0.9, mrr: 10850 },
  { date: "2026-01-22", revenue: 13800, users: 1040, conversion: 3.4, churn: 1.2, mrr: 11100 },
  { date: "2026-01-29", revenue: 15600, users: 1120, conversion: 4.1, churn: 0.8, mrr: 11900 },
  { date: "2026-02-05", revenue: 16200, users: 1210, conversion: 4.0, churn: 0.7, mrr: 12450 },
  { date: "2026-02-12", revenue: 17150, users: 1290, conversion: 4.3, churn: 0.9, mrr: 13100 },
  { date: "2026-02-19", revenue: 16800, users: 1340, conversion: 3.9, churn: 1.0, mrr: 13350 },
  { date: "2026-02-26", revenue: 18400, users: 1420, conversion: 4.5, churn: 0.6, mrr: 14100 },
  { date: "2026-03-05", revenue: 19200, users: 1510, conversion: 4.6, churn: 0.7, mrr: 14800 },
  { date: "2026-03-12", revenue: 20100, users: 1590, conversion: 4.8, churn: 0.5, mrr: 15500 },
  { date: "2026-03-19", revenue: 19850, users: 1640, conversion: 4.4, churn: 0.8, mrr: 15750 },
];
