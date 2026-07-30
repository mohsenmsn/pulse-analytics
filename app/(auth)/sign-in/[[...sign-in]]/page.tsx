import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </span>
        <span className="text-xl font-semibold tracking-tight">Pulse</span>
      </Link>
      <SignIn
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{ elements: { rootBox: "mx-auto" } }}
      />
    </div>
  );
}
