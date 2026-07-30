"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import { Pencil, Check, LayoutGrid } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { WidgetRenderer } from "./widget-renderer";
import { AddWidgetDialog } from "./add-widget-dialog";
import { updateWidgetLayouts, deleteWidget } from "@/app/actions/widgets";
import type { ClientWidget, DataRowPayload } from "@/types";

const ResponsiveGridLayout = WidthProvider(Responsive);

type SourceOption = { id: string; name: string };

export function WidgetGrid({
  widgets,
  dataById,
  allRows,
  dataSources,
  canAddWidget,
  addWidgetDisabledReason,
}: {
  widgets: ClientWidget[];
  dataById: Record<string, DataRowPayload[]>;
  allRows: DataRowPayload[];
  dataSources: SourceOption[];
  canAddWidget: boolean;
  addWidgetDisabledReason?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [items, setItems] = React.useState<ClientWidget[]>(widgets);

  React.useEffect(() => setItems(widgets), [widgets]);

  const layout: Layout[] = items.map((w) => ({
    i: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    minW: 2,
    minH: 2,
  }));

  const dataFor = React.useCallback(
    (widget: ClientWidget) =>
      widget.dataSourceId
        ? dataById[widget.dataSourceId] ?? []
        : allRows,
    [dataById, allRows]
  );

  async function persistLayout(next: Layout[]) {
    setItems((prev) =>
      prev.map((w) => {
        const l = next.find((n) => n.i === w.id);
        return l ? { ...w, x: l.x, y: l.y, w: l.w, h: l.h } : w;
      })
    );
    await updateWidgetLayouts(
      next.map((l) => ({ id: l.i, x: l.x, y: l.y, w: l.w, h: l.h }))
    );
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((w) => w.id !== id));
    await deleteWidget(id);
    router.refresh();
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-20 text-center">
        <LayoutGrid className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No widgets yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first widget to start visualizing your data.
          </p>
        </div>
        <AddWidgetDialog
          dataSources={dataSources}
          disabled={!canAddWidget}
          disabledReason={addWidgetDisabledReason}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={editing ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (editing) router.refresh();
            setEditing((v) => !v);
          }}
        >
          {editing ? (
            <>
              <Check className="h-4 w-4" /> Done
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" /> Edit layout
            </>
          )}
        </Button>
        <AddWidgetDialog
          dataSources={dataSources}
          disabled={!canAddWidget}
          disabledReason={addWidgetDisabledReason}
        />
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout, md: layout, sm: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={72}
        margin={[16, 16]}
        isDraggable={editing}
        isResizable={editing}
        draggableHandle=".widget-drag-handle"
        onDragStop={persistLayout}
        onResizeStop={persistLayout}
      >
        {items.map((widget) => (
          <div key={widget.id}>
            <WidgetRenderer
              widget={widget}
              data={dataFor(widget)}
              editing={editing}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
