import type { Metadata } from "next";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrgDatasetSummary } from "@/lib/data";
import { Header } from "@/components/layout/header";
import { AlertForm } from "@/components/alerts/alert-form";
import { AlertsList } from "@/components/alerts/alerts-list";

export const metadata: Metadata = { title: "Alerts" };
export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const tenant = await requireTenant();

  const [alerts, summary] = await Promise.all([
    prisma.alert.findMany({
      where: { organisationId: tenant.organisationId },
      orderBy: { createdAt: "desc" },
    }),
    getOrgDatasetSummary(tenant.organisationId),
  ]);

  const metrics = Object.keys(summary.numericStats);

  const items = alerts.map((a) => ({
    id: a.id,
    name: a.name,
    metric: a.metric,
    condition: a.condition,
    threshold: a.threshold,
    email: a.email,
    isActive: a.isActive,
    lastTriggered: a.lastTriggered ? a.lastTriggered.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <Header
        title="Alerts"
        description="Get notified by email when your metrics cross a threshold."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertForm metrics={metrics} defaultEmail={tenant.email} />
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Your alerts
          </h2>
          <AlertsList alerts={items} />
        </div>
      </div>
    </div>
  );
}
