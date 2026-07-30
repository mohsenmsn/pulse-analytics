import type { Metadata } from "next";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { WidgetGrid } from "@/components/dashboard/widget-grid";
import { AiInsightsPanel } from "@/components/dashboard/ai-insights-panel";
import type { ClientWidget, DataRowPayload, WidgetConfig } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tenant = await requireTenant();

  const [dashboard, dataSources] = await Promise.all([
    prisma.dashboard.findFirst({
      where: { organisationId: tenant.organisationId },
      orderBy: { createdAt: "asc" },
      include: { widgets: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.dataSource.findMany({
      where: { organisationId: tenant.organisationId },
      orderBy: { createdAt: "asc" },
      include: { rows: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  const dataById: Record<string, DataRowPayload[]> = {};
  const allRows: DataRowPayload[] = [];
  for (const source of dataSources) {
    const rows = source.rows.map((r) => r.data as DataRowPayload);
    dataById[source.id] = rows;
    for (const row of rows) {
      allRows.push({ ...row, __sourceName: source.name });
    }
  }

  const widgets: ClientWidget[] = (dashboard?.widgets ?? []).map((w) => ({
    id: w.id,
    title: w.title,
    type: w.type,
    config: (w.config ?? {}) as WidgetConfig,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    dataSourceId: w.dataSourceId,
  }));

  const limits = getPlanLimits(tenant.plan);
  const canAddWidget = widgets.length < limits.maxWidgets;
  const sourceOptions = dataSources.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-6">
      <Header
        title="Dashboard"
        description={`${tenant.organisationName} · ${widgets.length} widget${
          widgets.length === 1 ? "" : "s"
        }`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <WidgetGrid
            widgets={widgets}
            dataById={dataById}
            allRows={allRows}
            dataSources={sourceOptions}
            canAddWidget={canAddWidget}
            addWidgetDisabledReason={`Your ${tenant.plan} plan allows up to ${limits.maxWidgets} widgets.`}
          />
        </div>
        <aside className="space-y-6">
          <AiInsightsPanel plan={tenant.plan} hasData={allRows.length > 0} />
        </aside>
      </div>
    </div>
  );
}
