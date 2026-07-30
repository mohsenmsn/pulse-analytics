import {
  LayoutDashboard,
  Database,
  Bell,
  Settings,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Data Sources", href: "/data-sources", icon: Database },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Billing", href: "/billing", icon: CreditCard },
];

/** Items surfaced in the compact mobile bottom nav. */
export const MOBILE_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter((item) =>
  ["/dashboard", "/data-sources", "/alerts", "/settings"].includes(item.href)
);
