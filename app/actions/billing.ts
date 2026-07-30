"use server";

import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import type { Plan } from "@/types";

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

async function getOrCreateCustomerId(organisationId: string, email: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { organisationId },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { organisationId },
  });

  await prisma.subscription.upsert({
    where: { organisationId },
    update: { stripeCustomerId: customer.id },
    create: {
      organisationId,
      plan: "FREE",
      status: "ACTIVE",
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

export async function createCheckoutSession(plan: Exclude<Plan, "FREE">) {
  const tenant = await requireTenant();

  if (tenant.role === "MEMBER") {
    return { ok: false as const, error: "Only admins can manage billing." };
  }

  const priceId = PLANS[plan]?.priceId;
  if (!priceId) {
    return {
      ok: false as const,
      error: "This plan is not configured. Set the Stripe price ID.",
    };
  }

  const customerId = await getOrCreateCustomerId(
    tenant.organisationId,
    tenant.email
  );

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: tenant.organisationId,
    metadata: { organisationId: tenant.organisationId, plan },
    subscription_data: {
      metadata: { organisationId: tenant.organisationId, plan },
    },
    allow_promotion_codes: true,
    success_url: appUrl("/billing?status=success"),
    cancel_url: appUrl("/billing?status=cancelled"),
  });

  if (!session.url) {
    return { ok: false as const, error: "Could not create checkout session." };
  }

  return { ok: true as const, url: session.url };
}

export async function createPortalSession() {
  const tenant = await requireTenant();

  if (tenant.role === "MEMBER") {
    return { ok: false as const, error: "Only admins can manage billing." };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { organisationId: tenant.organisationId },
  });

  if (!subscription?.stripeCustomerId) {
    return { ok: false as const, error: "No billing account found yet." };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: appUrl("/billing"),
  });

  return { ok: true as const, url: session.url };
}
