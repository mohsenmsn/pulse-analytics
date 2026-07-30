"use client";

import * as React from "react";
import { Check, Loader2, Sparkles, ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/app/actions/billing";

type PlanCard = {
  id: Plan;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
};

const PLAN_CARDS: PlanCard[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    description: "Get started with core analytics.",
    features: ["Up to 3 widgets", "1 team seat", "CSV upload", "Basic alerts"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 29,
    description: "Unlimited widgets and AI insights.",
    features: [
      "Unlimited widgets",
      "AI Insights",
      "Up to 5 team seats",
      "CSV + API connectors",
      "Email alerts",
    ],
    highlighted: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 99,
    description: "Unlimited seats and priority support.",
    features: [
      "Everything in Pro",
      "Unlimited team seats",
      "SSO & advanced security",
      "Dedicated support",
      "Custom data connectors",
    ],
  },
];

export function BillingSection({
  currentPlan,
  status,
  currentPeriodEnd,
  canManage,
}: {
  currentPlan: Plan;
  status: string;
  currentPeriodEnd: string | null;
  canManage: boolean;
}) {
  const [pending, setPending] = React.useState<Plan | "portal" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function upgrade(plan: Exclude<Plan, "FREE">) {
    setPending(plan);
    setError(null);
    const result = await createCheckoutSession(plan);
    if (!result.ok) {
      setError(result.error);
      setPending(null);
      return;
    }
    window.location.href = result.url;
  }

  async function manage() {
    setPending("portal");
    setError(null);
    const result = await createPortalSession();
    if (!result.ok) {
      setError(result.error);
      setPending(null);
      return;
    }
    window.location.href = result.url;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              Current plan
              <Badge className="capitalize">{currentPlan.toLowerCase()}</Badge>
            </CardTitle>
            <CardDescription>
              Status: <span className="capitalize">{status.toLowerCase()}</span>
              {currentPeriodEnd
                ? ` · renews ${new Date(currentPeriodEnd).toLocaleDateString()}`
                : ""}
            </CardDescription>
          </div>
          {currentPlan !== "FREE" && canManage ? (
            <Button variant="outline" onClick={manage} disabled={!!pending}>
              {pending === "portal" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Manage billing
            </Button>
          ) : null}
        </CardHeader>
        {error ? (
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_CARDS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col",
                plan.highlighted && "border-primary shadow-md"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.highlighted ? (
                    <Badge>
                      <Sparkles className="mr-1 h-3 w-3" /> Popular
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : plan.id === "FREE" ? (
                  <Button variant="outline" className="w-full" disabled>
                    Included
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    disabled={!canManage || !!pending}
                    onClick={() => upgrade(plan.id as Exclude<Plan, "FREE">)}
                  >
                    {pending === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {currentPlan === "FREE" ? "Upgrade" : "Switch"} to{" "}
                    {plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
