# RedCup — Build Plan (from Om's docs, 28 Oct 2026)

## Docs found
Om Tandon (`omtandon000@gmail.com`) emailed **4 documents** (not 4 PDFs) to thenoteaditya@gmail.com at 11:59 IST:

1. `RedCup — Final Model.pdf` — product model (pay-for-results bounties)
2. `RedCup_Eligibility_Algorithm_Spec.pdf` — rings 1–4, Fit Score, shortlist/award
3. `RedCup Architecture and SRS.docx` (+ matching `.md`) — 60 pages, 25 tables, MVP-1…3
4. Note: update SRS/MD to match Final Model + Eligibility; repo `Pacman-ot/Redcup` is the old pay-to-rank prototype

## Product summary (one line)
RedCup is India's pay-for-results creator marketing platform: brands fund a reel bounty upfront, eligible creators apply, RedCup shortlists by Fit Score, the brand awards, creators earn a base for an approved live reel plus pay per verified 1,000 views.

## Launch scope (this build)
Ship the smallest product that runs a **real funded bounty end to end**, with Eligibility Spec rings 1–4, replacing the old claim-first model with **apply → shortlist → award**.

### In
- Public marketing site (home, for brands, for creators, bounties, bounty detail, creators directory, about, contact, terms, privacy, refunds)
- Auth: brand / creator / admin (demo session + OTP adapter behind env)
- Brand: onboarding, KYC submit, bounty builder with criteria presets + live eligible count, checkout (payment adapter), shortlist view, award, draft review
- Creator: onboarding, Instagram connect adapter, PAN/UPI, eligibility status on every campaign card, apply, draft upload, reel link
- Admin: verification queue, shortlist pin/remove, manual metrics, payout approve, bounty inspect
- Eligibility engine + Fit Score + money math + append-only ledger (fully tested)
- Payment / Instagram / WhatsApp / email / SMS adapters that show **Connect X** when keys missing

### Out of this 2h ship (stubs / later)
- Meta App Review live Instagram insights (manual metrics + connect stub)
- Real Razorpay/Cashfree capture (demo capture when keys missing)
- Automatic WhatsApp alerts (outbox + connect stub)
- Results boards automation (MVP-2), RedCup Score (MVP-3), agency teams (MVP-3)

## Architecture
- Next.js 16 App Router, TypeScript, Tailwind v4, Vercel
- Drizzle ORM + Neon Postgres when `DATABASE_URL` set; otherwise durable file-backed store for local/demo (same schema API)
- Server Actions + Route Handlers; browser never talks to DB
- Modules under `src/server/services` matching SRS; eligibility in `src/server/eligibility`
- Money in paise (integers); times UTC, display IST

## Data model (launch tables)
users, creators, creator_metrics, brands, campaigns (+ criteria jsonb, slots), eligibility_results, applications, shortlist_overrides, criteria_presets, drafts, reels, metric_snapshots, ledger_entries, payment_orders, payouts, fraud_flags, admin_actions, job_runs

## Pages (launch)
Public: `/` `/for-brands` `/for-creators` `/bounties` `/bounties/[slug]` `/creators` `/creators/[handle]` `/about` `/contact` `/terms` `/privacy` `/refunds`
Auth: `/login` `/signup` `/verify`
Brand: `/brand` `/brand/onboarding` `/brand/bounties/new` `/brand/bounties/[id]` `/brand/bounties/[id]/checkout` `/brand/bounties/[id]/shortlist` `/brand/bounties/[id]/drafts` `/brand/settings`
Creator: `/creator` `/creator/onboarding` `/creator/bounties/[id]` `/creator/applications` `/creator/applications/[id]` `/creator/settings`
Admin: `/admin` `/admin/verification` `/admin/bounties/[id]` `/admin/payouts` `/admin/metrics` `/admin/users`

## Design
- Taste Skill: marketing = editorial-report geometry (axis layout, solid colour blocks, product UI fragments as imagery); app = framed-sheet (tinted L-frame, white sheet)
- Elaya landing-page-design: Manrope/Geist (we use IBM Plex Sans for app clarity + modest sizes), no Inter, no italic UI, no hyphens in copy, type scale snapped
- Brand adaptation: cup red `#b91c1c` as sole accent (not hot pink); warm paper / ink; no gradients, glows, emoji icons, fake client logos or vanity stats
- Fonts modest: titles ≤ 30px mobile / 36px desktop; body 14–16px

## API keys / accounts needed from Aditya

| Key / account | Why | Free tier? |
| --- | --- | --- |
| Neon `DATABASE_URL` (or Vercel Postgres) | Production Postgres | Yes (Neon free) |
| Supabase URL + anon + service role (optional) | OTP auth + draft video storage | Free pauses after idle; Pro $25 for launch |
| Meta / Instagram App ID + Secret | Creator connect + insights | Free; App Review required for insights |
| Razorpay or Cashfree key + secret + webhook secret | Brand funding + UPI payouts | Test mode free |
| WhatsApp Business provider (Gupshup / Interakt / Meta) | Alerts to creators | Trial / paid |
| SMS provider (MSG91 / Twilio) for India OTP | Phone login codes | Trial |
| Resend or similar `RESEND_API_KEY` | Email OTP + transactional | Free 100/day |
| `ENCRYPTION_KEY` (32-byte) | Encrypt PAN, UPI, IG tokens | You generate |
| `CRON_SECRET` | Protect job routes | You generate |
| `ADMIN_BOOTSTRAP_EMAIL` | First admin (thenoteaditya@gmail.com) | n/a |

## Verification
- Unit tests: eligibility cases 1–9, money math, Fit Score
- Playwright e2e: signup → fund bounty → apply → shortlist → award → draft → approve at 390 and 1440
- Lighthouse mobile ≥ 90; no console errors
