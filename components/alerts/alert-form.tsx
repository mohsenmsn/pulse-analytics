"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BellPlus, Loader2 } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { createAlert } from "@/app/actions/alerts";
import type { AlertCondition } from "@/types";

export function AlertForm({
  metrics,
  defaultEmail,
}: {
  metrics: string[];
  defaultEmail: string;
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [metric, setMetric] = React.useState(metrics[0] ?? "revenue");
  const [condition, setCondition] = React.useState<AlertCondition>("ABOVE");
  const [threshold, setThreshold] = React.useState("");
  const [email, setEmail] = React.useState(defaultEmail);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(threshold);
    if (Number.isNaN(value)) {
      setError("Threshold must be a number.");
      return;
    }
    setPending(true);
    const result = await createAlert({
      name,
      metric,
      condition,
      threshold: value,
      email,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setThreshold("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BellPlus className="h-4 w-4 text-primary" />
          New alert
        </CardTitle>
        <CardDescription>
          Get an email when a metric crosses your threshold.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="alert-name">Alert name</Label>
            <Input
              id="alert-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High churn warning"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="alert-metric">Metric</Label>
              {metrics.length ? (
                <Select
                  id="alert-metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                >
                  {metrics.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id="alert-metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder="revenue"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-condition">Condition</Label>
              <Select
                id="alert-condition"
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value as AlertCondition)
                }
              >
                <option value="ABOVE">Above</option>
                <option value="BELOW">Below</option>
                <option value="EQUALS">Equals</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-threshold">Threshold</Label>
              <Input
                id="alert-threshold"
                type="number"
                step="any"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="1.5"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alert-email">Notify email</Label>
            <Input
              id="alert-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create alert
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
