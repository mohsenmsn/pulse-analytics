import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PulseClerkProvider } from "@/components/providers/clerk-provider";

export const metadata: Metadata = {
  title: {
    default: "Pulse — Analytics that keep pace",
    template: "%s · Pulse",
  },
  description:
    "Pulse is a multi-tenant SaaS analytics dashboard with customizable widgets, AI insights, and smart alerts.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PulseClerkProvider>{children}</PulseClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
