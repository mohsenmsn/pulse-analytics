import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Sparkles,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const FEATURES = [
  {
    icon: Layers,
    title: "Drag-and-drop dashboards",
    description:
      "Compose responsive dashboards with resizable widgets that persist per workspace.",
  },
  {
    icon: Sparkles,
    title: "AI-powered insights",
    description:
      "GPT-4o reads your data and surfaces anomalies and trends in plain language.",
  },
  {
    icon: BarChart3,
    title: "Flexible data sources",
    description:
      "Upload CSVs, enter data manually, or connect any JSON REST endpoint.",
  },
  {
    icon: Bell,
    title: "Smart alerts",
    description:
      "Threshold alerts email your team the moment a metric moves out of range.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-tenant by design",
    description:
      "Organizations, roles, and per-tenant isolation built in from day one.",
  },
  {
    icon: Activity,
    title: "Real-time feel",
    description:
      "A clean, fast analytics experience with light and dark themes.",
  },
];

export function Hero() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Pulse</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedOut>
              <Button asChild variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]"
        />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Analytics that keep pace with your product
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Your metrics,{" "}
            <span className="text-primary">beautifully in sync</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Pulse is a multi-tenant analytics dashboard for SaaS teams. Build
            custom dashboards, connect any data source, and let AI find what
            matters.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SignedOut>
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40"
              >
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Pulse Analytics. All rights reserved.</p>
          <p>Built with Next.js, Prisma, Clerk & Stripe.</p>
        </div>
      </footer>
    </div>
  );
}
