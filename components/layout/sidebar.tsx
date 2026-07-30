"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { NAV_ITEMS } from "@/components/layout/nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types";

export function Sidebar({ plan }: { plan: Plan }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Pulse</span>
        <Badge variant="muted" className="ml-auto capitalize">
          {plan.toLowerCase()}
        </Badge>
      </div>

      <div className="border-b border-border px-4 py-3">
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-between rounded-md border border-border px-2 py-1.5",
            },
          }}
        />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-border px-4 py-4">
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "h-8 w-8" } }}
        />
        <ThemeToggle />
      </div>
    </aside>
  );
}
