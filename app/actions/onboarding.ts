"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/auth";
import { getPlanLimits } from "@/lib/utils";
import { sendInviteEmail } from "@/lib/resend";
import { KPI_OPTIONS } from "@/types";

const VALID_KPI_IDS = new Set<string>(KPI_OPTIONS.map((k) => k.id));

function sanitizeKpis(kpis: string[]): string[] {
  return Array.from(new Set(kpis.filter((k) => VALID_KPI_IDS.has(k))));
}

/** Persists progress for a single onboarding step without completing it. */
export async function saveOnboardingStep(input: {
  step: number;
  name?: string;
  selectedKpis?: string[];
}) {
  const tenant = await requireTenant();

  await prisma.organisation.update({
    where: { id: tenant.organisationId },
    data: {
      onboardingStep: Math.max(0, Math.min(3, input.step)),
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.selectedKpis
        ? { selectedKpis: sanitizeKpis(input.selectedKpis) }
        : {}),
    },
  });

  revalidatePath("/onboarding");
  return { ok: true as const };
}

/**
 * Stores pending invites on the organisation config and optionally emails
 * them via Resend. Full seat enforcement happens on membership creation.
 */
export async function inviteTeamDuringOnboarding(emails: string[]) {
  const tenant = await requireTenant();
  const cleaned = Array.from(
    new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@") && e.includes("."))
    )
  ).slice(0, 20);

  if (!cleaned.length) return { ok: true as const, invited: 0 };

  const org = await prisma.organisation.findUnique({
    where: { id: tenant.organisationId },
    select: { name: true, pendingInvites: true },
  });

  const merged = Array.from(
    new Set([...(org?.pendingInvites ?? []), ...cleaned])
  );

  await prisma.organisation.update({
    where: { id: tenant.organisationId },
    data: { pendingInvites: merged },
  });

  const inviteUrl = `${
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  }/sign-up`;

  for (const email of cleaned) {
    try {
      if (process.env.RESEND_API_KEY) {
        await sendInviteEmail({
          to: email,
          organisationName: org?.name ?? tenant.organisationName,
          inviteUrl,
        });
      }
    } catch (err) {
      console.error("Invite email failed:", err);
    }
  }

  return { ok: true as const, invited: cleaned.length };
}

/** Finalizes onboarding and seeds starter stat-card widgets for chosen KPIs. */
export async function completeOnboarding(input: {
  name: string;
  selectedKpis: string[];
}) {
  const tenant = await requireTenant();
  const kpis = sanitizeKpis(input.selectedKpis);

  await prisma.organisation.update({
    where: { id: tenant.organisationId },
    data: {
      name: input.name.trim() || tenant.organisationName,
      selectedKpis: kpis,
      onboardingStep: 3,
      onboardingDone: true,
    },
  });

  // Seed starter widgets on the primary dashboard (respecting plan limits).
  const existingDashboard = await prisma.dashboard.findFirst({
    where: { organisationId: tenant.organisationId },
    select: { id: true },
  });

  const dashboard =
    existingDashboard ??
    (await prisma.dashboard.create({
      data: { organisationId: tenant.organisationId, name: "Main Dashboard" },
      select: { id: true },
    }));

  const existingCount = await prisma.widget.count({
    where: { dashboardId: dashboard.id },
  });

  if (existingCount === 0 && kpis.length) {
    const limit = getPlanLimits(tenant.plan).maxWidgets;
    const toCreate = kpis.slice(0, Number.isFinite(limit) ? limit : kpis.length);
    const palette = ["#0d9488", "#2563eb", "#7c3aed", "#f59e0b"];

    for (let index = 0; index < toCreate.length; index += 1) {
      const kpi = toCreate[index];
      await prisma.widget.create({
        data: {
          title: KPI_OPTIONS.find((k) => k.id === kpi)?.label ?? kpi,
          type: "STAT_CARD",
          config: {
            metric: kpi,
            color: palette[index % palette.length],
          } as Prisma.InputJsonValue,
          dashboardId: dashboard.id,
          x: (index * 3) % 12,
          y: 0,
          w: 3,
          h: 2,
        },
      });
    }
  }

  revalidatePath("/dashboard");
  return { ok: true as const };
}
