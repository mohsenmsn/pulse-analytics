import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await requireTenant();

  const pathname = headers().get("x-pathname") ?? "";
  const isOnboarding = pathname.startsWith("/onboarding");

  // Force incomplete tenants through onboarding, but never redirect while the
  // user is already on the onboarding route (avoids a redirect loop).
  if (!tenant.onboardingDone && !isOnboarding) {
    redirect("/onboarding");
  }

  // Onboarding renders full-screen without the app chrome.
  if (isOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        {children}
      </div>
    );
  }

  return <AppShell plan={tenant.plan}>{children}</AppShell>;
}
