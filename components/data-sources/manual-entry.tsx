"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, PencilLine } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createManualDataSource } from "@/app/actions/data-sources";

type Column = { key: string };
type Row = Record<string, string>;

export function ManualEntry() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [columns, setColumns] = React.useState<Column[]>([
    { key: "date" },
    { key: "revenue" },
  ]);
  const [rows, setRows] = React.useState<Row[]>([{}, {}]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function updateColumn(index: number, value: string) {
    setColumns((prev) =>
      prev.map((c, i) => (i === index ? { key: value } : c))
    );
  }

  function addColumn() {
    setColumns((prev) => [...prev, { key: `column_${prev.length + 1}` }]);
  }

  function removeColumn(index: number) {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCell(rowIndex: number, key: string, value: string) {
    setRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, {}]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError(null);
    const keys = columns.map((c) => c.key.trim()).filter(Boolean);
    if (!keys.length) {
      setError("Add at least one column.");
      return;
    }

    const payload = rows
      .map((row) => {
        const obj: Record<string, string> = {};
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== "") obj[key] = row[key];
        }
        return obj;
      })
      .filter((r) => Object.keys(r).length > 0);

    if (!payload.length) {
      setError("Fill in at least one row.");
      return;
    }

    setPending(true);
    const result = await createManualDataSource({ name, rows: payload });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setRows([{}, {}]);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PencilLine className="h-4 w-4 text-primary" />
          Manual entry
        </CardTitle>
        <CardDescription>
          Define columns and type in rows for a quick dataset.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="manual-name">Source name</Label>
          <Input
            id="manual-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Manual sales log"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="p-1">
                    <div className="flex items-center gap-1">
                      <Input
                        value={col.key}
                        onChange={(e) => updateColumn(i, e.target.value)}
                        className="h-8"
                      />
                      {columns.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeColumn(i)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove column"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </th>
                ))}
                <th className="p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addColumn}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, i) => (
                    <td key={i} className="p-1">
                      <Input
                        value={row[col.key] ?? ""}
                        onChange={(e) =>
                          updateCell(rowIndex, col.key, e.target.value)
                        }
                        className="h-8"
                      />
                    </td>
                  ))}
                  <td className="p-1">
                    {rows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeRow(rowIndex)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4" />
          Add row
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div>
          <Button onClick={handleSave} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save dataset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
