import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ShieldOff } from "lucide-react";

export const metadata: Metadata = { title: "Access restricted" };

export default function AccessRestrictedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-12 text-center">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </span>
        <span className="text-xl font-semibold tracking-tight">Pulse</span>
      </Link>
      <div className="mx-auto max-w-md space-y-3">
        <ShieldOff className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Portfolio demo is locked
        </h1>
        <p className="text-sm text-muted-foreground">
          This live deployment is invite-only so strangers cannot create accounts
          or burn API credits. Clone the repo and run it with your own keys to
          explore the full product.
        </p>
        <p className="pt-2">
          <Link
            href="https://github.com/mohsenmsn/pulse-analytics"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View source on GitHub
          </Link>
        </p>
      </div>
    </div>
  );
}
