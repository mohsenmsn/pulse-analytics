"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SettingsTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function SettingsTabs({ tabs }: { tabs: SettingsTab[] }) {
  const [active, setActive] = React.useState(tabs[0]?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tabs.find((tab) => tab.id === active)?.content}
      </div>
    </div>
  );
}
