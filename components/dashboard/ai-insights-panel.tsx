"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Loader2, Lock, RefreshCw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/types";

export function AiInsightsPanel({
  plan,
  hasData,
}: {
  plan: Plan;
  hasData: boolean;
}) {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [started, setStarted] = React.useState(false);

  const aiEnabled = plan !== "FREE";

  async function generate() {
    setLoading(true);
    setStarted(true);
    setError(null);
    setText("");

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok || !res.body) {
        const message = await res.text().catch(() => "");
        throw new Error(message || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            GPT-powered observations about your metrics.
          </CardDescription>
        </div>
        {aiEnabled ? (
          <Button
            size="sm"
            variant="outline"
            onClick={generate}
            disabled={loading || !hasData}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : started ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {started ? "Regenerate" : "Generate"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!aiEnabled ? (
          <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4 text-muted-foreground" />
              AI insights are a Pro feature
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade to automatically surface anomalies and trends across your
              dashboards.
            </p>
            <Button asChild size="sm">
              <Link href="/billing">Upgrade plan</Link>
            </Button>
          </div>
        ) : !hasData ? (
          <p className="text-sm text-muted-foreground">
            Connect a data source to generate insights.
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : text ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {text}
            {loading ? (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse-soft bg-primary align-middle" />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium">Generate</span> to analyze your
            latest data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
