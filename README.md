# RedCup

India's pay-for-results Instagram creator campaigns: brands fund a reel bounty, eligible creators apply, Fit Score shortlists, brands award, creators earn base + pay per verified views.

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind v4
- File-backed store by default (`data/store.json`); set `DATABASE_URL` (Neon) for Postgres later
- Vitest unit tests · Playwright e2e

## Docs in this repo

- `docs/PLAN.md` — launch plan from Om's Final Model + Eligibility Spec + SRS
- `docs/` — source PDFs/TXT/MD (safe to commit; no secrets)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run seed
npm run dev
```

Demo password for all seeded accounts: `redcup123`

| Role | Email |
| --- | --- |
| Admin | thenoteaditya@gmail.com |
| Brand | brand@demo.redcup |
| Creators | ananya.beauty@demo.redcup, rohiteats@demo.redcup, … |

## Scripts

- `npm test` — eligibility + money unit tests
- `npm run test:e2e` — Playwright happy path
- `npm run typecheck`
- `npm run build`

## Connect later (env)

Payment (Razorpay/Cashfree), Meta/Instagram, WhatsApp, Resend/SMS, Neon `DATABASE_URL`. Until keys exist the UI shows **Connect X** banners and uses demo capture / manual metrics.

## Product model

Apply → shortlist (Fit Score) → award — not the old claim-first / pay-to-rank prototype.
