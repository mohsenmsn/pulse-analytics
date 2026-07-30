"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/auth";
import { coerceRow } from "@/lib/utils";
import type { DataRowPayload } from "@/types";

const MAX_ROWS = 5000;

function normalizeRows(rows: Record<string, unknown>[]): DataRowPayload[] {
  return rows
    .filter((r) => r && typeof r === "object")
    .slice(0, MAX_ROWS)
    .map((r) => coerceRow(r));
}

async function persistSource(input: {
  organisationId: string;
  name: string;
  type: "CSV" | "MANUAL" | "REST_API";
  config: Record<string, unknown>;
  rows: DataRowPayload[];
}) {
  const source = await prisma.dataSource.create({
    data: {
      name: input.name.trim() || "Untitled source",
      type: input.type,
      config: input.config as Prisma.InputJsonValue,
      organisationId: input.organisationId,
      rows: {
        create: input.rows.map((data) => ({
          data: data as Prisma.InputJsonValue,
        })),
      },
    },
    select: { id: true },
  });
  return source.id;
}

export async function createCsvDataSource(input: {
  name: string;
  filename?: string;
  rows: Record<string, unknown>[];
}) {
  const tenant = await requireTenant();
  const rows = normalizeRows(input.rows);
  if (!rows.length) return { ok: false as const, error: "No rows to import." };

  const id = await persistSource({
    organisationId: tenant.organisationId,
    name: input.name,
    type: "CSV",
    config: { filename: input.filename ?? null, importedRows: rows.length },
    rows,
  });

  revalidatePath("/data-sources");
  revalidatePath("/dashboard");
  return { ok: true as const, id };
}

export async function createManualDataSource(input: {
  name: string;
  rows: Record<string, unknown>[];
}) {
  const tenant = await requireTenant();
  const rows = normalizeRows(input.rows);
  if (!rows.length)
    return { ok: false as const, error: "Add at least one row." };

  const id = await persistSource({
    organisationId: tenant.organisationId,
    name: input.name,
    type: "MANUAL",
    config: { rows: rows.length },
    rows,
  });

  revalidatePath("/data-sources");
  revalidatePath("/dashboard");
  return { ok: true as const, id };
}

export async function createRestDataSource(input: {
  name: string;
  url: string;
  dataPath?: string;
  fetchNow?: boolean;
}) {
  const tenant = await requireTenant();

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const absoluteUrl = input.url.startsWith("http")
    ? input.url
    : `${base}${input.url.startsWith("/") ? "" : "/"}${input.url}`;

  let payload: unknown;
  try {
    const res = await fetch(absoluteUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false as const,
        error: `Endpoint returned ${res.status}.`,
      };
    }
    payload = await res.json();
  } catch {
    return { ok: false as const, error: "Failed to fetch the endpoint." };
  }

  // Allow pointing at a nested array via a dot path (e.g. "data.results").
  let arr: unknown = payload;
  if (input.dataPath) {
    for (const key of input.dataPath.split(".")) {
      arr = (arr as Record<string, unknown> | undefined)?.[key];
    }
  }
  if (!Array.isArray(arr) && Array.isArray(payload)) arr = payload;

  if (!Array.isArray(arr)) {
    return {
      ok: false as const,
      error: "Response is not a JSON array of records.",
    };
  }

  const rows = normalizeRows(arr as Record<string, unknown>[]);
  if (!rows.length)
    return { ok: false as const, error: "No records returned." };

  const id = await persistSource({
    organisationId: tenant.organisationId,
    name: input.name,
    type: "REST_API",
    config: { url: absoluteUrl, dataPath: input.dataPath ?? null },
    rows,
  });

  revalidatePath("/data-sources");
  revalidatePath("/dashboard");
  return { ok: true as const, id };
}

export async function deleteDataSource(id: string) {
  const tenant = await requireTenant();

  const source = await prisma.dataSource.findFirst({
    where: { id, organisationId: tenant.organisationId },
    select: { id: true },
  });
  if (!source) return { ok: false as const, error: "Data source not found." };

  await prisma.dataSource.delete({ where: { id } });

  revalidatePath("/data-sources");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
