import type { Metadata } from "next";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { BillingSection } from "@/components/settings/billing-section";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const tenant = await requireTenant();

  const subscription = await prisma.subscription.findUnique({
    where: { organisationId: tenant.organisationId },
  });

  return (
    <div className="space-y-6">
      <Header
        title="Billing"
        description="Choose the plan that fits your team."
      />
      <BillingSection
        currentPlan={tenant.plan}
        status={subscription?.status ?? "ACTIVE"}
        currentPeriodEnd={
          subscription?.currentPeriodEnd
            ? subscription.currentPeriodEnd.toISOString()
            : null
        }
        canManage={tenant.role !== "MEMBER"}
      />
    </div>
  );
}
