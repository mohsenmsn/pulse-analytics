import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getOrganisationRows, getMetricValue } from "@/lib/data";
import { sendAlertEmail } from "@/lib/resend";
import type { AlertCondition, DataRowPayload } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Don't re-notify for the same alert more than once within this window.
const COOLDOWN_MS = 6 * 60 * 60 * 1000;

function isBreached(
  value: number,
  condition: AlertCondition,
  threshold: number
): boolean {
  switch (condition) {
    case "ABOVE":
      return value > threshold;
    case "BELOW":
      return value < threshold;
    case "EQUALS":
      return value === threshold;
    default:
      return false;
  }
}

export async function GET() {
  const authHeader = headers().get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { isActive: true },
    include: { organisation: { select: { name: true } } },
  });

  const rowCache = new Map<string, DataRowPayload[]>();
  const now = Date.now();
  let checked = 0;
  let triggered = 0;

  for (const alert of alerts) {
    checked += 1;

    if (
      alert.lastTriggered &&
      now - alert.lastTriggered.getTime() < COOLDOWN_MS
    ) {
      continue;
    }

    let rows = rowCache.get(alert.organisationId);
    if (!rows) {
      rows = await getOrganisationRows(alert.organisationId);
      rowCache.set(alert.organisationId, rows);
    }

    const value = getMetricValue(rows, alert.metric);
    if (value === null) continue;

    if (!isBreached(value, alert.condition, alert.threshold)) continue;

    try {
      await sendAlertEmail({
        to: alert.email,
        alertName: alert.name,
        metric: alert.metric,
        threshold: alert.threshold,
        currentValue: value,
        condition: alert.condition,
        organisationName: alert.organisation.name,
      });

      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastTriggered: new Date() },
      });
      triggered += 1;
    } catch (err) {
      console.error(`Failed to send alert ${alert.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, checked, triggered });
}
