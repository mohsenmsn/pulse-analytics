import type {
  Alert,
  AlertCondition,
  DataSource,
  DataSourceType,
  MembershipRole,
  Plan,
  SubscriptionStatus,
  Widget,
  WidgetType,
} from "@prisma/client";

export type {
  Alert,
  AlertCondition,
  DataSource,
  DataSourceType,
  MembershipRole,
  Plan,
  SubscriptionStatus,
  Widget,
  WidgetType,
};

export type WidgetLayout = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type WidgetConfig = {
  metric?: string;
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
  color?: string;
  columns?: string[];
};

export type DataRowPayload = Record<string, string | number | boolean | null>;

/** Serializable widget shape passed from server components to client widgets. */
export type ClientWidget = {
  id: string;
  title: string;
  type: WidgetType;
  config: WidgetConfig;
  x: number;
  y: number;
  w: number;
  h: number;
  dataSourceId: string | null;
};

export type WidgetLayoutUpdate = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DatasetSummary = {
  rowCount: number;
  columns: string[];
  numericStats: Record<
    string,
    { min: number; max: number; avg: number; latest: number }
  >;
  sampleRows: DataRowPayload[];
};

export type OnboardingState = {
  step: number;
  done: boolean;
  selectedKpis: string[];
};

export type PlanLimits = {
  maxWidgets: number;
  maxSeats: number;
  aiInsights: boolean;
  alerts: boolean;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { maxWidgets: 3, maxSeats: 1, aiInsights: false, alerts: true },
  PRO: { maxWidgets: Infinity, maxSeats: 5, aiInsights: true, alerts: true },
  ENTERPRISE: {
    maxWidgets: Infinity,
    maxSeats: Infinity,
    aiInsights: true,
    alerts: true,
  },
};

export const KPI_OPTIONS = [
  { id: "revenue", label: "Revenue", description: "Track total and recurring revenue" },
  { id: "users", label: "Active Users", description: "Monitor DAU/MAU growth" },
  { id: "conversion", label: "Conversion Rate", description: "Funnel conversion metrics" },
  { id: "churn", label: "Churn Rate", description: "Customer retention health" },
  { id: "nps", label: "NPS Score", description: "Customer satisfaction" },
  { id: "mrr", label: "MRR", description: "Monthly recurring revenue" },
  { id: "arpu", label: "ARPU", description: "Average revenue per user" },
  { id: "sessions", label: "Sessions", description: "Product engagement sessions" },
] as const;

export type TenantContext = {
  userId: string;
  clerkId: string;
  email: string;
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  role: MembershipRole;
  plan: Plan;
  onboardingDone: boolean;
};
