import { PrismaClient, Prisma, WidgetType } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_ROWS = [
  { date: "2026-01-01", revenue: 12400, users: 820, conversion: 3.2, churn: 1.1, mrr: 9800, channel: "Organic" },
  { date: "2026-01-08", revenue: 13250, users: 910, conversion: 3.5, churn: 1.0, mrr: 10200, channel: "Paid" },
  { date: "2026-01-15", revenue: 14100, users: 980, conversion: 3.8, churn: 0.9, mrr: 10850, channel: "Referral" },
  { date: "2026-01-22", revenue: 13800, users: 1040, conversion: 3.4, churn: 1.2, mrr: 11100, channel: "Organic" },
  { date: "2026-01-29", revenue: 15600, users: 1120, conversion: 4.1, churn: 0.8, mrr: 11900, channel: "Paid" },
  { date: "2026-02-05", revenue: 16200, users: 1210, conversion: 4.0, churn: 0.7, mrr: 12450, channel: "Organic" },
  { date: "2026-02-12", revenue: 17150, users: 1290, conversion: 4.3, churn: 0.9, mrr: 13100, channel: "Referral" },
  { date: "2026-02-19", revenue: 16800, users: 1340, conversion: 3.9, churn: 1.0, mrr: 13350, channel: "Paid" },
  { date: "2026-02-26", revenue: 18400, users: 1420, conversion: 4.5, churn: 0.6, mrr: 14100, channel: "Organic" },
  { date: "2026-03-05", revenue: 19200, users: 1510, conversion: 4.6, churn: 0.7, mrr: 14800, channel: "Paid" },
  { date: "2026-03-12", revenue: 20100, users: 1590, conversion: 4.8, churn: 0.5, mrr: 15500, channel: "Referral" },
  { date: "2026-03-19", revenue: 19850, users: 1640, conversion: 4.4, churn: 0.8, mrr: 15750, channel: "Organic" },
];

async function main() {
  console.log("Seeding Pulse database...");

  await prisma.dataRow.deleteMany();
  await prisma.widget.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.dashboard.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      clerkId: "user_seed_demo_pulse",
      email: "demo@pulse.dev",
      name: "Demo User",
      imageUrl: null,
    },
  });

  const org = await prisma.organisation.create({
    data: {
      name: "Acme Analytics",
      slug: "acme-analytics",
      onboardingStep: 3,
      onboardingDone: true,
      selectedKpis: ["revenue", "users", "mrr", "churn"],
      memberships: {
        create: { userId: user.id, role: "OWNER" },
      },
      subscription: {
        create: { plan: "PRO", status: "ACTIVE" },
      },
    },
  });

  const dataSource = await prisma.dataSource.create({
    data: {
      name: "Weekly Metrics (Seed)",
      type: "CSV",
      organisationId: org.id,
      config: { filename: "seed-metrics.csv" },
      rows: {
        create: SAMPLE_ROWS.map((row) => ({ data: row })),
      },
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: {
      name: "Main Dashboard",
      organisationId: org.id,
    },
  });

  const widgets: {
    title: string;
    type: WidgetType;
    x: number;
    y: number;
    w: number;
    h: number;
    config: Record<string, unknown>;
  }[] = [
    {
      title: "Revenue",
      type: "STAT_CARD",
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      config: { metric: "revenue", color: "#0d9488" },
    },
    {
      title: "Active Users",
      type: "STAT_CARD",
      x: 3,
      y: 0,
      w: 3,
      h: 2,
      config: { metric: "users", color: "#2563eb" },
    },
    {
      title: "MRR",
      type: "STAT_CARD",
      x: 6,
      y: 0,
      w: 3,
      h: 2,
      config: { metric: "mrr", color: "#7c3aed" },
    },
    {
      title: "Churn",
      type: "STAT_CARD",
      x: 9,
      y: 0,
      w: 3,
      h: 2,
      config: { metric: "churn", color: "#dc2626" },
    },
    {
      title: "Revenue Trend",
      type: "LINE_CHART",
      x: 0,
      y: 2,
      w: 8,
      h: 4,
      config: { xKey: "date", yKey: "revenue", color: "#0d9488" },
    },
    {
      title: "Users by Week",
      type: "BAR_CHART",
      x: 8,
      y: 2,
      w: 4,
      h: 4,
      config: { xKey: "date", yKey: "users", color: "#2563eb" },
    },
    {
      title: "Channel Mix",
      type: "PIE_CHART",
      x: 0,
      y: 6,
      w: 4,
      h: 4,
      config: { labelKey: "channel", valueKey: "revenue" },
    },
    {
      title: "Raw Metrics",
      type: "TABLE",
      x: 4,
      y: 6,
      w: 8,
      h: 4,
      config: {
        columns: ["date", "revenue", "users", "conversion", "churn", "mrr", "channel"],
      },
    },
  ];

  for (const w of widgets) {
    await prisma.widget.create({
        data: {
          title: w.title,
          type: w.type,
          x: w.x,
          y: w.y,
          w: w.w,
          h: w.h,
          config: w.config as Prisma.InputJsonValue,
          dashboardId: dashboard.id,
          dataSourceId: dataSource.id,
        },
    });
  }

  await prisma.alert.create({
    data: {
      name: "High churn warning",
      metric: "churn",
      condition: "ABOVE",
      threshold: 1.5,
      email: user.email,
      organisationId: org.id,
      userId: user.id,
    },
  });

  console.log("Seed complete.");
  console.log({ userId: user.id, organisationId: org.id, dashboardId: dashboard.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
