"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Loader2,
  Upload,
  Users,
  X,
} from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, coerceRow } from "@/lib/utils";
import { KPI_OPTIONS } from "@/types";
import {
  saveOnboardingStep,
  completeOnboarding,
  inviteTeamDuringOnboarding,
} from "@/app/actions/onboarding";
import { createCsvDataSource, createRestDataSource } from "@/app/actions/data-sources";

const STEPS = ["Connect data", "Choose KPIs", "Invite team"];

export function OnboardingWizard({
  initialName,
  initialKpis,
  initialStep,
}: {
  initialName: string;
  initialKpis: string[];
  initialStep: number;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(Math.min(Math.max(initialStep, 0), 2));
  const [name] = React.useState(initialName);
  const [kpis, setKpis] = React.useState<string[]>(initialKpis);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dataConnected, setDataConnected] = React.useState(false);
  const [sourceLabel, setSourceLabel] = React.useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [invites, setInvites] = React.useState<string[]>([]);

  function toggleKpi(id: string) {
    setKpis((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  }

  async function handleCsv(file: File) {
    setPending(true);
    setError(null);
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data.map((r) => coerceRow(r));
          const result = await createCsvDataSource({
            name: file.name.replace(/\.csv$/i, "") || "Uploaded CSV",
            filename: file.name,
            rows,
          });
          if (!result.ok) {
            setError(result.error ?? "Failed to upload CSV.");
            setPending(false);
            return;
          }
          setDataConnected(true);
          setSourceLabel(file.name);
          setPending(false);
        } catch (e) {
          setError(e instanceof Error ? e.message : "CSV parse failed.");
          setPending(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setPending(false);
      },
    });
  }

  async function connectMockApi() {
    setPending(true);
    setError(null);
    const result = await createRestDataSource({
      name: "Mock Metrics API",
      url: "/api/mock/metrics",
      fetchNow: true,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to connect mock API.");
      return;
    }
    setDataConnected(true);
    setSourceLabel("Mock Metrics API");
  }

  function addInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (invites.includes(email)) {
      setError("That email is already on the invite list.");
      return;
    }
    setError(null);
    setInvites((prev) => [...prev, email]);
    setInviteEmail("");
  }

  async function next() {
    setError(null);
    if (step === 0 && !dataConnected) {
      setError("Connect a data source, or skip for now.");
      return;
    }
    if (step === 1 && kpis.length === 0) {
      setError("Select at least one KPI to track.");
      return;
    }

    setPending(true);
    await saveOnboardingStep({ step: step + 1, selectedKpis: kpis });
    setPending(false);
    setStep((s) => Math.min(2, s + 1));
  }

  async function skipDataStep() {
    setPending(true);
    setError(null);
    await saveOnboardingStep({ step: 1 });
    setPending(false);
    setStep(1);
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function finish() {
    setPending(true);
    setError(null);
    if (invites.length) {
      await inviteTeamDuringOnboarding(invites);
    }
    const result = await completeOnboarding({ name, selectedKpis: kpis });
    if (!result.ok) {
      setPending(false);
      setError("Could not complete onboarding. Please try again.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </span>
        <span className="text-xl font-semibold tracking-tight">Pulse</span>
      </div>

      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                  i < step && "border-primary bg-primary text-primary-foreground",
                  i === step && "border-primary text-primary",
                  i > step && "border-border text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  i === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div className="h-px flex-1 bg-border" />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {step === 0 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Connect a data source</h2>
              <p className="text-sm text-muted-foreground">
                Upload a CSV or pull sample metrics from the mock REST API.
              </p>
            </div>

            {dataConnected ? (
              <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-accent p-4 text-sm">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Connected</p>
                  <p className="text-muted-foreground">{sourceLabel}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border p-6 text-center transition-colors hover:border-primary hover:bg-muted/40">
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Upload CSV</span>
                  <span className="text-xs text-muted-foreground">
                    Headers in the first row
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleCsv(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void connectMockApi()}
                  disabled={pending}
                  className="flex flex-col items-center gap-2 rounded-md border border-border p-6 text-center transition-colors hover:border-primary hover:bg-muted/40"
                >
                  <Database className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">Mock REST API</span>
                  <span className="text-xs text-muted-foreground">
                    Load sample SaaS metrics
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Choose your KPIs</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll create starter widgets for the metrics you pick.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {KPI_OPTIONS.map((kpi) => {
                const selected = kpis.includes(kpi.id);
                return (
                  <button
                    type="button"
                    key={kpi.id}
                    onClick={() => toggleKpi(kpi.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-md border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">
                        {kpi.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {kpi.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Invite your team</h2>
              <p className="text-sm text-muted-foreground">
                Add teammates now, or skip and invite them later from Settings.
                Enterprise unlocks unlimited seats.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="alex@company.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInvite();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={addInvite}
              >
                <Users className="h-4 w-4" />
                Add
              </Button>
            </div>
            {invites.length > 0 ? (
              <ul className="space-y-2">
                {invites.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setInvites((prev) => prev.filter((e) => e !== email))
                      }
                      aria-label={`Remove ${email}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No invites yet — you can continue solo.
              </p>
            )}
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={step === 0 || pending}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {step === 0 && !dataConnected ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void skipDataStep()}
                disabled={pending}
              >
                Skip
              </Button>
            ) : null}

            {step < 2 ? (
              <Button type="button" onClick={() => void next()} disabled={pending}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={() => void finish()} disabled={pending}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Go to dashboard
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
