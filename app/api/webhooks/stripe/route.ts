import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type { Plan, SubscriptionStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "FREE";
  if (priceId === PLANS.PRO.priceId) return "PRO";
  if (priceId === PLANS.ENTERPRISE.priceId) return "ENTERPRISE";
  return "PRO";
}

function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    default:
      return "INCOMPLETE";
  }
}

async function resolveOrganisationId(
  subscription: Stripe.Subscription
): Promise<string | undefined> {
  if (subscription.metadata?.organisationId) {
    return subscription.metadata.organisationId;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const customer = await stripe.customers
    .retrieve(customerId)
    .catch(() => null);

  if (customer && !customer.deleted) {
    return (customer as Stripe.Customer).metadata?.organisationId ?? undefined;
  }
  return undefined;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const organisationId = await resolveOrganisationId(subscription);
  if (!organisationId) return;

  const priceId = subscription.items.data[0]?.price?.id ?? null;

  await prisma.subscription.upsert({
    where: { organisationId },
    update: {
      plan: planFromPriceId(priceId),
      status: mapStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      stripePriceId: priceId,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
    create: {
      organisationId,
      plan: planFromPriceId(priceId),
      status: mapStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      stripePriceId: priceId,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return new Response("Missing signature or webhook secret.", {
      status: 400,
    });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return new Response(
      `Webhook signature verification failed: ${
        err instanceof Error ? err.message : "unknown"
      }`,
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organisationId =
          session.metadata?.organisationId ?? session.client_reference_id;

        if (session.subscription && organisationId) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          // Ensure metadata carries the tenant for future events.
          if (!subscription.metadata?.organisationId) {
            subscription.metadata = {
              ...subscription.metadata,
              organisationId,
            };
          }
          await syncSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organisationId = subscription.metadata?.organisationId;
        const where = organisationId
          ? { organisationId }
          : { stripeSubscriptionId: subscription.id };

        await prisma.subscription
          .update({
            where,
            data: {
              plan: "FREE",
              status: "CANCELED",
              stripeSubscriptionId: null,
              stripePriceId: null,
              currentPeriodEnd: null,
            },
          })
          .catch(() => null);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    return new Response(
      `Webhook handler error: ${
        err instanceof Error ? err.message : "unknown"
      }`,
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
