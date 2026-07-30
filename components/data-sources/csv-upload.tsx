"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { UploadCloud, FileSpreadsheet, Loader2, X } from "lucide-react";
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
import { createCsvDataSource } from "@/app/actions/data-sources";

export function CsvUpload() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = React.useState("");
  const [filename, setFilename] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Record<string, unknown>[]>([]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    setFilename(file.name);
    if (!name) setName(file.name.replace(/\.csv$/i, ""));

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setRows(results.data.filter((r) => r && Object.keys(r).length > 0));
      },
      error: () => setError("Could not parse this CSV file."),
    });
  }

  async function handleSave() {
    if (!rows.length) {
      setError("Choose a CSV file first.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await createCsvDataSource({
      name,
      filename: filename ?? undefined,
      rows,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setFilename(null);
    setRows([]);
    router.refresh();
  }

  const columns = rows.length ? Object.keys(rows[0]) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          CSV upload
        </CardTitle>
        <CardDescription>
          Import a spreadsheet. The first row must contain column headers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="csv-name">Source name</Label>
          <Input
            id="csv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q1 metrics"
          />
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border py-8 text-center transition-colors hover:bg-muted/50"
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Click to browse or drag a file</p>
          <p className="text-xs text-muted-foreground">.csv up to 5,000 rows</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {filename ? (
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              {filename}
              <span className="text-muted-foreground">
                · {rows.length} rows · {columns.length} columns
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setFilename(null);
                setRows([]);
              }}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button onClick={handleSave} disabled={pending || !rows.length}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Import CSV
        </Button>
      </CardContent>
    </Card>
  );
}
