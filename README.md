# Pulse Analytics

Pulse is a production-ready, multi-tenant SaaS analytics dashboard built with the
Next.js App Router. Teams create a workspace, connect data sources, compose
drag-and-drop dashboards, get AI-powered insights, and receive threshold-based
email alerts.

## Tech stack

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** with CSS-variable theming and dark mode (`next-themes`)
- **Prisma** + **PostgreSQL**
- **Clerk** for auth & organizations (multi-tenant)
- **Stripe** for subscriptions (Free / Pro / Enterprise)
- **Recharts** + **react-grid-layout** for visualizations
- **OpenAI (GPT-4o)** for streaming insights
- **Resend** for alert emails

## Features

- 🏢 Multi-tenant workspaces with roles (Owner / Admin / Member)
- 🧭 3-step onboarding wizard that seeds starter widgets
- 📊 Drag-and-drop, resizable dashboard widgets (line, bar, pie, stat card, table)
- 🔌 Data sources: CSV upload, manual entry, and JSON REST connector
- 🤖 Streaming AI insights (Pro+)
- 🔔 Threshold alerts delivered by email via an hourly cron
- 💳 Stripe checkout, billing portal, and webhook-driven plan sync
- 🔑 Hashed API keys, light/dark themes, responsive mobile navigation

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required services:

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Any PostgreSQL instance (Neon, Supabase, local, …) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | [Clerk dashboard](https://dashboard.clerk.com) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID` | [Stripe dashboard](https://dashboard.stripe.com) |
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | [Resend](https://resend.com) |
| `CRON_SECRET` | Any long random string |

> In Clerk, enable **Organizations** so the workspace switcher and multi-tenant
> logic work.

### 3. Set up the database

```bash
npm run db:push      # create tables from prisma/schema.prisma
npm run db:seed      # optional: seed a demo workspace with sample widgets
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, complete the
3-step onboarding (connect data → choose KPIs → invite team), and you'll land
on your dashboard. A sample CSV lives at `public/sample-metrics.csv`.

## Stripe setup

1. Create two recurring **Products/Prices** (Pro and Enterprise) and copy their
   price IDs into `STRIPE_PRO_PRICE_ID` / `STRIPE_ENTERPRISE_PRICE_ID`.
2. Add a webhook endpoint pointing to `/api/webhooks/stripe` and subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

For local testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Cron / alerts

`vercel.json` schedules an hourly job that calls `/api/cron/alerts`. The route
is protected by `CRON_SECRET` (sent by Vercel as `Authorization: Bearer …`).
It evaluates every active alert against the latest metric value and emails via
Resend when a threshold is breached (with a 6-hour cooldown per alert).

To trigger it manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/alerts
```

## Plans & limits

| Plan | Widgets | Seats | AI insights | Alerts |
| --- | --- | --- | --- | --- |
| Free | 3 | 1 | — | ✅ |
| Pro | Unlimited | 5 | ✅ | ✅ |
| Enterprise | Unlimited | Unlimited | ✅ | ✅ |

## Project structure

```
app/
  (auth)/           Clerk sign-in / sign-up
  (app)/            Authenticated shell: dashboard, data-sources, alerts,
                    settings, billing, onboarding
  actions/          Server actions ("use server")
  api/              insights (stream), webhooks/stripe, cron/alerts, mock/metrics
components/
  layout/           Sidebar, bottom nav, app shell, header
  dashboard/        Widget grid, renderer, widgets, AI panel, add-widget dialog
  data-sources/     CSV / manual / REST connectors + list
  alerts/           Alert form + list
  settings/         Profile, team, API keys, billing
  onboarding/       Wizard
  landing/          Marketing hero
  ui/               Tailwind primitives (button, card, input, …)
lib/                db, auth, data, stripe, openai, resend, crypto, utils
prisma/             schema + seed
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:push` | Push schema to the database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint |

## Deployment

Deploy to [Vercel](https://vercel.com). Set all environment variables in the
project settings, ensure the Postgres database is reachable, and the cron in
`vercel.json` will run automatically on the Hobby+ plans.
