import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { isPortfolioLockdown } from "@/lib/portfolio";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  if (isPortfolioLockdown()) {
    redirect("/access-restricted");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </span>
        <span className="text-xl font-semibold tracking-tight">Pulse</span>
      </Link>
      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
        appearance={{ elements: { rootBox: "mx-auto" } }}
      />
    </div>
  );
}
