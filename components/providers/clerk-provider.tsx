"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";

/**
 * Wraps Clerk with theme-aware styling so its components inherit the Pulse
 * teal brand and respect dark mode.
 */
export function PulseClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
      appearance={{
        variables: {
          colorPrimary: "#0d9488",
          colorText: isDark ? "#e5edf0" : "#111c1a",
          colorBackground: isDark ? "#12181c" : "#ffffff",
          borderRadius: "0.65rem",
        },
        elements: {
          formButtonPrimary:
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "shadow-lg",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
