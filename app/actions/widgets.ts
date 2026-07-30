"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/auth";
import { getPlanLimits } from "@/lib/utils";
import type { WidgetConfig, WidgetLayoutUpdate, WidgetType } from "@/types";

async function getPrimaryDashboardId(organisationId: string) {
  const existing = await prisma.dashboard.findFirst({
    where: { organisationId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.dashboard.create({
    data: { organisationId, name: "Main Dashboard" },
    select: { id: true },
  });
  return created.id;
}

const DEFAULT_SIZE: Record<WidgetType, { w: number; h: number }> = {
  STAT_CARD: { w: 3, h: 2 },
  LINE_CHART: { w: 6, h: 4 },
  BAR_CHART: { w: 6, h: 4 },
  PIE_CHART: { w: 4, h: 4 },
  TABLE: { w: 8, h: 4 },
};

export async function createWidget(input: {
  title: string;
  type: WidgetType;
  dataSourceId?: string | null;
  config?: WidgetConfig;
}) {
  const tenant = await requireTenant();

  const limits = getPlanLimits(tenant.plan);
  const widgetCount = await prisma.widget.count({
    where: { dashboard: { organisationId: tenant.organisationId } },
  });

  if (widgetCount >= limits.maxWidgets) {
    return {
      ok: false as const,
      error: `Your ${tenant.plan} plan allows up to ${limits.maxWidgets} widgets. Upgrade to add more.`,
    };
  }

  const dashboardId = await getPrimaryDashboardId(tenant.organisationId);

  // Validate the data source belongs to the tenant when provided.
  if (input.dataSourceId) {
    const source = await prisma.dataSource.findFirst({
      where: { id: input.dataSourceId, organisationId: tenant.organisationId },
      select: { id: true },
    });
    if (!source) {
      return { ok: false as const, error: "Invalid data source." };
    }
  }

  const size = DEFAULT_SIZE[input.type];

  const widget = await prisma.widget.create({
    data: {
      title: input.title.trim() || "Untitled widget",
      type: input.type,
      config: (input.config ?? {}) as Prisma.InputJsonValue,
      dashboardId,
      dataSourceId: input.dataSourceId ?? null,
      x: 0,
      y: 999,
      w: size.w,
      h: size.h,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true as const, widgetId: widget.id };
}

export async function updateWidgetLayouts(updates: WidgetLayoutUpdate[]) {
  const tenant = await requireTenant();
  if (!updates.length) return { ok: true as const };

  const ids = updates.map((u) => u.id);
  const owned = await prisma.widget.findMany({
    where: {
      id: { in: ids },
      dashboard: { organisationId: tenant.organisationId },
    },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((w) => w.id));

  await prisma.$transaction(
    updates
      .filter((u) => ownedIds.has(u.id))
      .map((u) =>
        prisma.widget.update({
          where: { id: u.id },
          data: { x: u.x, y: u.y, w: u.w, h: u.h },
        })
      )
  );

  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteWidget(widgetId: string) {
  const tenant = await requireTenant();

  const widget = await prisma.widget.findFirst({
    where: {
      id: widgetId,
      dashboard: { organisationId: tenant.organisationId },
    },
    select: { id: true },
  });

  if (!widget) {
    return { ok: false as const, error: "Widget not found." };
  }

  await prisma.widget.delete({ where: { id: widgetId } });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
