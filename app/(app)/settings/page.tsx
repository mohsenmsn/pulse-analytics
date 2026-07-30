import type { Metadata } from "next";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { TeamMembers } from "@/components/settings/team-members";
import { ApiKeys } from "@/components/settings/api-keys";
import { BillingSection } from "@/components/settings/billing-section";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const tenant = await requireTenant();

  const [user, memberships, apiKeys, subscription, org] = await Promise.all([
    prisma.user.findUnique({ where: { id: tenant.userId } }),
    prisma.membership.findMany({
      where: { organisationId: tenant.organisationId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.apiKey.findMany({
      where: { organisationId: tenant.organisationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({
      where: { organisationId: tenant.organisationId },
    }),
    prisma.organisation.findUnique({
      where: { id: tenant.organisationId },
      select: { pendingInvites: true },
    }),
  ]);

  const limits = getPlanLimits(tenant.plan);
  const canManage = tenant.role !== "MEMBER";

  const members = memberships.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    imageUrl: m.user.imageUrl,
    role: m.role,
  }));

  const keys = apiKeys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
    createdAt: k.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <Header
        title="Settings"
        description="Manage your profile, team, billing, and API access."
      />

      <SettingsTabs
        tabs={[
          {
            id: "profile",
            label: "Profile",
            content: (
              <ProfileForm
                name={user?.name ?? ""}
                email={tenant.email}
                workspaceName={tenant.organisationName}
                canEditWorkspace={canManage}
              />
            ),
          },
          {
            id: "team",
            label: "Team",
            content: (
              <TeamMembers
                members={members}
                pendingInvites={org?.pendingInvites ?? []}
                maxSeats={limits.maxSeats}
              />
            ),
          },
          {
            id: "billing",
            label: "Billing",
            content: (
              <BillingSection
                currentPlan={tenant.plan}
                status={subscription?.status ?? "ACTIVE"}
                currentPeriodEnd={
                  subscription?.currentPeriodEnd
                    ? subscription.currentPeriodEnd.toISOString()
                    : null
                }
                canManage={canManage}
              />
            ),
          },
          {
            id: "api-keys",
            label: "API Keys",
            content: <ApiKeys keys={keys} />,
          },
        ]}
      />
    </div>
  );
}
