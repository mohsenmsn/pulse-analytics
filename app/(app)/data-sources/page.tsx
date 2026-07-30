import type { Metadata } from "next";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { CsvUpload } from "@/components/data-sources/csv-upload";
import { ManualEntry } from "@/components/data-sources/manual-entry";
import { RestConnector } from "@/components/data-sources/rest-connector";
import { SourcesList } from "@/components/data-sources/sources-list";

export const metadata: Metadata = { title: "Data Sources" };
export const dynamic = "force-dynamic";

export default async function DataSourcesPage() {
  const tenant = await requireTenant();

  const sources = await prisma.dataSource.findMany({
    where: { organisationId: tenant.organisationId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { rows: true } } },
  });

  const items = sources.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    rowCount: s._count.rows,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <Header
        title="Data Sources"
        description="Connect the data that powers your dashboards."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CsvUpload />
          <RestConnector />
        </div>
        <div className="space-y-6">
          <ManualEntry />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Connected sources
        </h2>
        <SourcesList sources={items} />
      </div>
    </div>
  );
}
