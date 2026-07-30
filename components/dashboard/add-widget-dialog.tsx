"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createWidget } from "@/app/actions/widgets";
import type { WidgetConfig, WidgetType } from "@/types";

type SourceOption = { id: string; name: string };

const WIDGET_TYPES: { value: WidgetType; label: string }[] = [
  { value: "STAT_CARD", label: "Stat card" },
  { value: "LINE_CHART", label: "Line chart" },
  { value: "BAR_CHART", label: "Bar chart" },
  { value: "PIE_CHART", label: "Pie chart" },
  { value: "TABLE", label: "Table" },
];

export function AddWidgetDialog({
  dataSources,
  disabled,
  disabledReason,
}: {
  dataSources: SourceOption[];
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState<WidgetType>("STAT_CARD");
  const [dataSourceId, setDataSourceId] = React.useState<string>(
    dataSources[0]?.id ?? ""
  );
  const [metric, setMetric] = React.useState("revenue");
  const [xKey, setXKey] = React.useState("date");
  const [yKey, setYKey] = React.useState("revenue");
  const [labelKey, setLabelKey] = React.useState("channel");
  const [valueKey, setValueKey] = React.useState("revenue");
  const [columns, setColumns] = React.useState("date,revenue,users");

  function reset() {
    setTitle("");
    setType("STAT_CARD");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const config: WidgetConfig = {};
    if (type === "STAT_CARD") config.metric = metric;
    if (type === "LINE_CHART" || type === "BAR_CHART") {
      config.xKey = xKey;
      config.yKey = yKey;
    }
    if (type === "PIE_CHART") {
      config.labelKey = labelKey;
      config.valueKey = valueKey;
    }
    if (type === "TABLE") {
      config.columns = columns
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    const result = await createWidget({
      title,
      type,
      dataSourceId: dataSourceId || null,
      config,
    });

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
      >
        <Plus className="h-4 w-4" />
        Add widget
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add widget</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="widget-title">Title</Label>
                <Input
                  id="widget-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly revenue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="widget-type">Type</Label>
                  <Select
                    id="widget-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as WidgetType)}
                  >
                    {WIDGET_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="widget-source">Data source</Label>
                  <Select
                    id="widget-source"
                    value={dataSourceId}
                    onChange={(e) => setDataSourceId(e.target.value)}
                  >
                    <option value="">All sources</option>
                    {dataSources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {type === "STAT_CARD" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="widget-metric">Metric field</Label>
                  <Input
                    id="widget-metric"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    placeholder="revenue"
                  />
                </div>
              ) : null}

              {type === "LINE_CHART" || type === "BAR_CHART" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="widget-x">X axis field</Label>
                    <Input
                      id="widget-x"
                      value={xKey}
                      onChange={(e) => setXKey(e.target.value)}
                      placeholder="date"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="widget-y">Y axis field</Label>
                    <Input
                      id="widget-y"
                      value={yKey}
                      onChange={(e) => setYKey(e.target.value)}
                      placeholder="revenue"
                    />
                  </div>
                </div>
              ) : null}

              {type === "PIE_CHART" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="widget-label">Label field</Label>
                    <Input
                      id="widget-label"
                      value={labelKey}
                      onChange={(e) => setLabelKey(e.target.value)}
                      placeholder="channel"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="widget-value">Value field</Label>
                    <Input
                      id="widget-value"
                      value={valueKey}
                      onChange={(e) => setValueKey(e.target.value)}
                      placeholder="revenue"
                    />
                  </div>
                </div>
              ) : null}

              {type === "TABLE" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="widget-columns">Columns (comma separated)</Label>
                  <Input
                    id="widget-columns"
                    value={columns}
                    onChange={(e) => setColumns(e.target.value)}
                    placeholder="date,revenue,users"
                  />
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create widget
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
