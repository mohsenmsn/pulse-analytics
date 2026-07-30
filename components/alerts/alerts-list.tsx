"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toggleAlert, deleteAlert } from "@/app/actions/alerts";
import type { AlertCondition } from "@/types";

export type AlertListItem = {
  id: string;
  name: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  email: string;
  isActive: boolean;
  lastTriggered: string | null;
};

const CONDITION_LABEL: Record<AlertCondition, string> = {
  ABOVE: "is above",
  BELOW: "is below",
  EQUALS: "equals",
};

export function AlertsList({ alerts }: { alerts: AlertListItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onToggle(id: string, next: boolean) {
    setPendingId(id);
    await toggleAlert(id, next);
    setPendingId(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    setPendingId(id);
    await deleteAlert(id);
    setPendingId(null);
    router.refresh();
  }

  if (!alerts.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No alerts yet</p>
          <p className="text-sm text-muted-foreground">
            Create an alert to be notified when metrics move.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{alert.name}</p>
                {alert.isActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="muted">Paused</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                When{" "}
                <span className="font-medium text-foreground">
                  {alert.metric}
                </span>{" "}
                {CONDITION_LABEL[alert.condition]}{" "}
                <span className="font-medium text-foreground">
                  {alert.threshold}
                </span>{" "}
                → {alert.email}
              </p>
              {alert.lastTriggered ? (
                <p className="text-xs text-muted-foreground">
                  Last triggered{" "}
                  {new Date(alert.lastTriggered).toLocaleString()}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={alert.isActive}
                disabled={pendingId === alert.id}
                onCheckedChange={(next) => onToggle(alert.id, next)}
                aria-label="Toggle alert"
              />
              <button
                type="button"
                onClick={() => onDelete(alert.id)}
                disabled={pendingId === alert.id}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete alert"
              >
                {pendingId === alert.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
