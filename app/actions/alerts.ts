"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/auth";
import type { AlertCondition } from "@/types";

const VALID_CONDITIONS: AlertCondition[] = ["ABOVE", "BELOW", "EQUALS"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAllowedAlertEmail(
  email: string,
  tenantEmail: string,
  memberEmails: string[]
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) return false;
  if (normalized === tenantEmail.toLowerCase()) return true;
  return memberEmails.some((e) => e.toLowerCase() === normalized);
}

export async function createAlert(input: {
  name: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  email: string;
}) {
  const tenant = await requireTenant();

  if (!input.name.trim() || !input.metric.trim()) {
    return { ok: false as const, error: "Name and metric are required." };
  }
  if (!VALID_CONDITIONS.includes(input.condition)) {
    return { ok: false as const, error: "Invalid condition." };
  }
  if (Number.isNaN(input.threshold)) {
    return { ok: false as const, error: "Threshold must be a number." };
  }

  const members = await prisma.membership.findMany({
    where: { organisationId: tenant.organisationId },
    include: { user: { select: { email: true } } },
  });
  const memberEmails = members.map((m) => m.user.email);
  const email = (input.email.trim() || tenant.email).toLowerCase();

  if (!isAllowedAlertEmail(email, tenant.email, memberEmails)) {
    return {
      ok: false as const,
      error: "Alert email must belong to a workspace member.",
    };
  }

  await prisma.alert.create({
    data: {
      name: input.name.trim().slice(0, 120),
      metric: input.metric.trim().slice(0, 120),
      condition: input.condition,
      threshold: input.threshold,
      email,
      organisationId: tenant.organisationId,
      userId: tenant.userId,
    },
  });

  revalidatePath("/alerts");
  return { ok: true as const };
}

export async function toggleAlert(id: string, isActive: boolean) {
  const tenant = await requireTenant();

  const alert = await prisma.alert.findFirst({
    where: { id, organisationId: tenant.organisationId },
    select: { id: true },
  });
  if (!alert) return { ok: false as const, error: "Alert not found." };

  await prisma.alert.update({ where: { id }, data: { isActive } });
  revalidatePath("/alerts");
  return { ok: true as const };
}

export async function deleteAlert(id: string) {
  const tenant = await requireTenant();

  const alert = await prisma.alert.findFirst({
    where: { id, organisationId: tenant.organisationId },
    select: { id: true },
  });
  if (!alert) return { ok: false as const, error: "Alert not found." };

  await prisma.alert.delete({ where: { id } });
  revalidatePath("/alerts");
  return { ok: true as const };
}
