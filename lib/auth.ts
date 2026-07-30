import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { TenantContext } from "@/types";
import { redirect } from "next/navigation";

export async function ensureUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find(
      (e: { id: string; emailAddress: string }) =>
        e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkId}@users.pulse.local`;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email.split("@")[0];

  return prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
  });
}

export async function getTenantContext(): Promise<TenantContext | null> {
  const { userId: clerkId, orgId } = await auth();
  if (!clerkId) return null;

  const user = await ensureUser();
  if (!user) return null;

  let organisation = orgId
    ? await prisma.organisation.findUnique({ where: { clerkOrgId: orgId } })
    : null;

  if (!organisation) {
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { organisation: true },
      orderBy: { createdAt: "asc" },
    });

    if (membership) {
      organisation = membership.organisation;
    } else {
      const baseSlug = slugify(user.name || user.email.split("@")[0] || "org");
      const slug = `${baseSlug}-${user.id.slice(-6)}`;
      organisation = await prisma.organisation.create({
        data: {
          name: `${user.name || "My"} Workspace`,
          slug,
          memberships: {
            create: { userId: user.id, role: "OWNER" },
          },
          subscription: {
            create: { plan: "FREE", status: "ACTIVE" },
          },
          dashboards: {
            create: { name: "Main Dashboard" },
          },
        },
      });
    }
  } else {
    await prisma.membership.upsert({
      where: {
        userId_organisationId: {
          userId: user.id,
          organisationId: organisation.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        organisationId: organisation.id,
        role: "MEMBER",
      },
    });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organisationId: {
        userId: user.id,
        organisationId: organisation.id,
      },
    },
  });

  const subscription = await prisma.subscription.findUnique({
    where: { organisationId: organisation.id },
  });

  return {
    userId: user.id,
    clerkId: user.clerkId,
    email: user.email,
    organisationId: organisation.id,
    organisationName: organisation.name,
    organisationSlug: organisation.slug,
    role: membership?.role ?? "MEMBER",
    plan: subscription?.plan ?? "FREE",
    onboardingDone: organisation.onboardingDone,
  };
}

export async function requireTenant(): Promise<TenantContext> {
  const tenant = await getTenantContext();
  if (!tenant) {
    redirect("/sign-in");
  }
  return tenant as TenantContext;
}

export async function requireOrgAccess(organisationId: string) {
  const tenant = await requireTenant();
  if (tenant.organisationId !== organisationId) {
    throw new Error("Forbidden: organisation mismatch");
  }
  return tenant;
}
