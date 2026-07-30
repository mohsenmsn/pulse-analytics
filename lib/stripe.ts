import Stripe from "stripe";
import type { Plan } from "@prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  // Cast keeps us compatible across stripe SDK minor versions.
  apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion,
  typescript: true,
});

export const PLANS: Record<
  Exclude<Plan, "FREE">,
  {
    name: string;
    priceId: string;
    price: number;
    description: string;
    features: string[];
  }
> = {
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    price: 29,
    description: "Unlimited widgets and AI insights",
    features: [
      "Unlimited widgets",
      "AI Insights",
      "Up to 5 team seats",
      "CSV + API connectors",
      "Email alerts",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
    price: 99,
    description: "Unlimited seats and priority support",
    features: [
      "Everything in Pro",
      "Unlimited team seats",
      "SSO & advanced security",
      "Dedicated support",
      "Custom data connectors",
    ],
  },
};

export const FREE_PLAN = {
  name: "Free",
  price: 0,
  description: "Get started with core analytics",
  features: [
    "Up to 3 widgets",
    "1 team seat",
    "CSV upload",
    "Basic alerts",
  ],
};
