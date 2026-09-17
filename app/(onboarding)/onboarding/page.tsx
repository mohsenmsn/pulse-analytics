import type { Metadata } from "next";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const tenant = await requireTenant();

  const org = await prisma.organisation.findUnique({
    where: { id: tenant.organisationId },
    select: { name: true, selectedKpis: true, onboardingStep: true },
  });

  return (
    <OnboardingWizard
      initialName={org?.name ?? tenant.organisationName}
      initialKpis={org?.selectedKpis ?? []}
      initialStep={org?.onboardingStep ?? 0}
    />
  );
}
