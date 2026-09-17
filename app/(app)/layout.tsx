import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await requireTenant();

  if (!tenant.onboardingDone) {
    redirect("/onboarding");
  }

  return <AppShell plan={tenant.plan}>{children}</AppShell>;
}
