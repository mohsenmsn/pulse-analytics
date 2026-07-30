import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import type { Plan } from "@/types";

export function AppShell({
  plan,
  children,
}: {
  plan: Plan;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar plan={plan} />
      <div className="flex min-h-screen flex-col md:pl-64">
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
