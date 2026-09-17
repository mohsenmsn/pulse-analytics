# Pulse Analytics

Multi-tenant SaaS analytics dashboard — portfolio project built with Next.js 14,
Prisma, Clerk, Stripe, OpenAI, and Resend.

> **Safe to explore:** this repository contains **no API keys or database
> passwords**. Secrets stay in each developer’s own `.env` / hosting dashboard.
> See [SECURITY.md](./SECURITY.md).

## Tech stack

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** with CSS-variable theming and dark mode (`next-themes`)
- **Prisma** + **PostgreSQL** (Supabase-ready, RLS lockdown script included)
- **Clerk** for auth & organizations (multi-tenant)
- **Stripe** for subscriptions (Free / Pro / Enterprise)
- **Recharts** + **react-grid-layout** for visualizations
- **OpenAI (GPT-4o)** for streaming insights
- **Resend** for alert emails

## Features

- Multi-tenant workspaces with roles (Owner / Admin / Member)
- 3-step onboarding wizard that seeds starter widgets
- Drag-and-drop, resizable dashboard widgets (line, bar, pie, stat card, table)
- Data sources: CSV upload, manual entry, and JSON REST connector (SSRF-hardened)
- Streaming AI insights (Pro+)
- Threshold alerts delivered by email via cron
- Stripe checkout, billing portal, and webhook-driven plan sync
- Hashed API keys, light/dark themes, responsive mobile navigation

## Getting started (your own keys only)

### 1. Install

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in credentials from **your** Clerk, Postgres/Supabase, Stripe, OpenAI, and
Resend dashboards. Never commit `.env`.

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Your Postgres (e.g. Supabase pooler + session URLs) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | [Clerk](https://dashboard.clerk.com) — enable Organizations |
| `STRIPE_*` | [Stripe](https://dashboard.stripe.com) (use **test** mode while learning) |
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com) |
| `RESEND_API_KEY` | [Resend](https://resend.com) |
| `CRON_SECRET` | Any long random string |

### 3. Database

```bash
npm run db:push      # create tables
npm run db:secure    # enable RLS + revoke anon/authenticated (Supabase)
npm run db:seed      # optional demo data
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Portfolio / public deploy lockdown

If you host a live demo on Vercel, set:

```bash
PORTFOLIO_LOCKDOWN=true
PORTFOLIO_ALLOWED_EMAILS=your.email@example.com
```

New visitors cannot register into **your** paid APIs. They should clone the repo
and use their own keys instead.

Also in Clerk (Production): prefer **Allowlist** or disable public sign-ups for
the demo instance.

## Stripe setup

1. Create two recurring Products/Prices (Pro / Enterprise); put IDs in env.
2. Webhook → `/api/webhooks/stripe` for:
   - `checkout.session.completed`
   - `customer.subscription.created|updated|deleted`
3. Local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Cron / alerts

Hobby Vercel cron runs daily (`0 0 * * *` in `vercel.json`).

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
  (app)/            Authenticated shell (dashboard, data, alerts, settings, billing)
  (onboarding)/     First-run wizard
  actions/          Server actions
  api/              insights, stripe webhook, cron, mock metrics
components/         UI + feature modules
lib/                db, auth, stripe, openai, resend, url-safety, portfolio
prisma/             schema, seed, supabase-security.sql
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Prisma generate + production build |
| `npm run db:push` | Push schema |
| `npm run db:secure` | Apply Supabase RLS / revoke script |
| `npm run db:seed` | Seed demo data |
| `npm run lint` | ESLint |

## License

MIT — use freely for learning and portfolio inspiration. Bring your own cloud
accounts and keys.
