# Security policy

## What this repository contains

This is a **portfolio / open-source demo** of Pulse Analytics. The GitHub
repository is intentionally free of credentials:

- No `.env` files are committed (see `.gitignore`)
- `.env.example` only has placeholder values (`pk_test_xxx`, `sk_test_xxx`, …)
- Runtime secrets live only in your local `.env` and your own host (Vercel, etc.)

Anyone cloning this repo **cannot** access the author’s Supabase, Vercel,
Clerk, Stripe, OpenAI, or GitHub accounts from the source code alone.

## How to run it safely (for visitors)

1. Fork or clone the repo.
2. Create **your own** Clerk / Postgres / Stripe / OpenAI / Resend projects.
3. Copy `.env.example` → `.env` and fill in **your** keys.
4. Run `npm install`, `npm run db:push`, `npm run db:secure`, `npm run dev`.

Do **not** reuse someone else’s production keys.

## Live demo lockdown

The author’s deployed instance may set:

```bash
PORTFOLIO_LOCKDOWN=true
PORTFOLIO_ALLOWED_EMAILS=you@example.com
```

That blocks public sign-ups and prevents new accounts from using the live
OpenAI / email / database quotas. Clone the code to explore fully.

## Reporting a vulnerability

If you find a security issue in the code, open a private GitHub security
advisory (or contact the author) instead of filing a public issue with exploit
details.
