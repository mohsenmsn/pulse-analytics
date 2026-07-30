"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Database, Trash2, Loader2, FileSpreadsheet, Globe, PencilLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteDataSource } from "@/app/actions/data-sources";
import type { DataSourceType } from "@/types";

export type SourceItem = {
  id: string;
  name: string;
  type: DataSourceType;
  rowCount: number;
  createdAt: string;
};

const TYPE_META: Record<
  DataSourceType,
  { label: string; icon: typeof Database }
> = {
  CSV: { label: "CSV", icon: FileSpreadsheet },
  MANUAL: { label: "Manual", icon: PencilLine },
  REST_API: { label: "REST API", icon: Globe },
};

export function SourcesList({ sources }: { sources: SourceItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(id: string) {
    setPendingId(id);
    await deleteDataSource(id);
    setPendingId(null);
    router.refresh();
  }

  if (!sources.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Database className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No data sources yet</p>
          <p className="text-sm text-muted-foreground">
            Add a source using one of the connectors to start building widgets.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => {
        const meta = TYPE_META[source.type];
        const Icon = meta.icon;
        return (
          <Card key={source.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{source.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {source.rowCount} rows · added{" "}
                    {new Date(source.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{meta.label}</Badge>
                <button
                  type="button"
                  onClick={() => onDelete(source.id)}
                  disabled={pendingId === source.id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete data source"
                >
                  {pendingId === source.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
