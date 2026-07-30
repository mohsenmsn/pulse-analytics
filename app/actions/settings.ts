"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/auth";
import { generateApiKey } from "@/lib/crypto";

export async function updateProfile(input: { name: string }) {
  const tenant = await requireTenant();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name cannot be empty." };

  await prisma.user.update({
    where: { id: tenant.userId },
    data: { name },
  });

  revalidatePath("/settings");
  return { ok: true as const };
}

export async function updateWorkspace(input: { name: string }) {
  const tenant = await requireTenant();
  if (tenant.role === "MEMBER") {
    return { ok: false as const, error: "Only admins can rename the workspace." };
  }
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name cannot be empty." };

  await prisma.organisation.update({
    where: { id: tenant.organisationId },
    data: { name },
  });

  revalidatePath("/settings");
  return { ok: true as const };
}

export async function createApiKey(input: { name: string }) {
  const tenant = await requireTenant();
  const name = input.name.trim() || "Default key";

  const { key, hash, prefix } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      name,
      keyHash: hash,
      keyPrefix: prefix,
      organisationId: tenant.organisationId,
      userId: tenant.userId,
    },
  });

  revalidatePath("/settings");
  // Raw key is returned exactly once so the client can display it.
  return { ok: true as const, key };
}

export async function revokeApiKey(id: string) {
  const tenant = await requireTenant();

  const key = await prisma.apiKey.findFirst({
    where: { id, organisationId: tenant.organisationId },
    select: { id: true },
  });
  if (!key) return { ok: false as const, error: "API key not found." };

  await prisma.apiKey.delete({ where: { id } });
  revalidatePath("/settings");
  return { ok: true as const };
}
