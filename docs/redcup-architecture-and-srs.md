# RedCup Architecture and SRS

## Summary

The new RedCup is one Next.js 16 app with a public site and three dashboards (Brand, Creator, Admin), running on Supabase for login, database and file storage. Only the app's server touches the database; the browser never reads it directly. The full build is 60 pages, 93 components, 25 tables and about 267 files across MVP-1 to MVP-3.

| Decision | Choice | Where it came from |
| --- | --- | --- |
| Codebase | The existing RedCup Next.js 16 app (TypeScript, Tailwind v4, App Router). The old leaderboard pages are retired | Your answer |
| Dashboards | Three: Brand, Creator, Admin. Agencies use a brand account; brand team members arrive in MVP-3 | Your answer, Master Plan section 2 |
| Scope | MVP-1 to MVP-3, every page, table and requirement tagged with its phase | Your answer |
| Payments | One provider-neutral payment layer; Razorpay or Cashfree plugs in once chosen | Your answer |
| Database and login | Supabase (Postgres, OTP login, two-step for admins, file storage) | My recommendation, reasons in Backend |
| Data access | Drizzle ORM on the server over Supabase's Postgres connection | My recommendation, reasons in Backend |
| Background jobs | Supabase Cron calling job endpoints inside the Next.js app | My recommendation, reasons in Backend |
| Hosting | Vercel | Master Plan section 11 |

Where a page, table or rule is not in the Master Plan or Product Book, this doc says so and gives the reason. Anything the source docs leave open is listed under Open decisions instead of being guessed.

## System architecture

Everything runs inside one Next.js app on Vercel. Supabase holds identity, data and files, and four outside services carry views, money and messages.

&#91;embedded content: system architecture · 1 app, Supabase, 4 outside services\]

Every request enters through `proxy.ts`, and every data or money change passes through the services layer. Draft videos skip the app server and go straight to Storage.

| Layer | What lives there | Folder |
| --- | --- | --- |
| Pages | Public site and the three dashboards, server-rendered by default | `src/app` |
| Entry points | Server Actions for dashboard forms; Route Handlers for webhooks, the Instagram callback, job endpoints and upload links | `src/server/actions`, `src/app/api` |
| Guards | Session check, role check, admin two-step check, brand-membership and claim-ownership checks | `src/server/auth` |
| Services | Business rules per module: state machines, money math, ledger writes | `src/server/services` |
| Data | Drizzle schema and queries; one database transaction per business step | `src/server/db` |
| Adapters | One file per outside service (payments, Instagram, WhatsApp, email, storage, encryption) | `src/server/integrations` |

Five request paths cover everything the app does:

1. **Page view.** Browser → `proxy.ts` refreshes the login cookie → a server component calls a service → Drizzle → Postgres → HTML back to the browser.
2. **Form action** (for example, claim a slot). Browser → Server Action → guard checks the role → the service writes the claim and its reservation ledger entry in one transaction → the page refreshes.
3. **Outside event** (for example, payment captured). Payment partner → webhook route → signature checked → the service records the payment, writes funding entries and moves the bounty to Live.
4. **Scheduled work** (for example, view sync). Supabase Cron → job route with a secret header → the service pulls numbers from Instagram → snapshot rows saved.
5. **Video upload.** The server issues a signed upload link; the draft goes straight from the phone to Supabase Storage; the server then records the draft. Large videos never pass through the app server.

## Dashboards and authentication

RedCup has three signed-in dashboards, each with its own sign-in method, URL area and server-side role check. One account holds exactly one role (Master Plan section 2).

| Dashboard | URL area | Who uses it | Signs in with | Second step | What unlocks more |
| --- | --- | --- | --- | --- | --- |
| Brand | `/brand` | D2C brands, local businesses, agencies running a client's brand | Email or phone one-time code | None | GSTIN or basic KYC, approved by an admin before the first bounty goes live |
| Creator | `/creator` | Any Instagram creator | Phone one-time code | None | Instagram professional account, PAN and UPI ID → Verified; first clean bounty → Proven |
| Admin | `/admin` | Harsh, Om, later ops staff | Email one-time code | Authenticator-app code on every session | No public sign-up; an admin creates admin accounts |

### Sign-in, step by step

**Brand**

1. `/signup` → "I'm a brand" → email or phone → one-time code.
2. Supabase Auth checks the code and sets a secure session cookie.
3. The server creates the user record with role `brand`. The role is set by the server, never by the browser.
4. `/brand/onboarding`: business name, contact, city, category, website or Instagram. Browsing creators and results boards works straight away.
5. Before the first bounty goes live, the brand submits GSTIN or basic KYC and an admin approves it in the verification queue.
6. MVP-3: the owner invites colleagues by email with full or view-only access.

**Creator**

1. `/signup` → "I'm a creator" → phone → one-time code.
2. The server creates the user record with role `creator`; `/creator/onboarding` collects name, city, languages, categories and Instagram handle → **Listed**.
3. "Connect Instagram" uses Instagram Login with the `instagram_business_basic` and `instagram_business_manage_insights` permissions ([Meta](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/)). This links the account for data; it is not a way to sign in.
4. The server reads account type, followers, post count and posts, runs the Verified checks, and the creator adds PAN and UPI ID (stored encrypted).
5. An admin confirms in the verification queue → **Verified**: the creator can claim bounties.

Instagram's user fields do not include an account creation date ([Meta](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/get-started)), so the "at least 90 days old" rule needs a stand-in. See Open decisions.

**Admin**

1. `/login` → email → one-time code.
2. `/mfa` → authenticator-app code; the first sign-in enrols the authenticator. Basic multi-factor login is included on every Supabase plan ([Supabase pricing](https://supabase.com/pricing)).
3. Every `/admin` page and admin action requires the two-step session level.

### How every request is protected

Each request is checked at least twice, because a Server Action can be called without opening its page.

| Layer | What it checks | Why it sits there |
| --- | --- | --- |
| `proxy.ts` | A valid session exists; refreshes the cookie; sends signed-out visitors from `/brand`, `/creator`, `/admin` to `/login` | Next.js 16 runs `proxy.ts` before every route; Vercel advises keeping it fast with no database queries ([Vercel](https://vercel.com/academy/nextjs-foundations/proxy-basics)) |
| Dashboard layout | The role matches the area; admins also need the two-step level; onboarding and level gates | Stops a creator opening `/brand` pages |
| Every Server Action and Route Handler | Role again, plus ownership: the brand owns this bounty, the creator owns this claim, a view-only member cannot write | The real security boundary |
| Job endpoints | Secret header sent by Supabase Cron | No user session exists |
| Payment webhooks | The payment partner's signature | No user session exists |

### Who can do what

| Action | Visitor | Creator, Listed | Creator, Verified | Brand, view-only member (MVP-3) | Brand, owner or full | Admin |
| --- | --- | --- | --- | --- | --- | --- |
| Browse bounties, creators, results boards | Yes | Yes | Yes | Yes | Yes | Yes |
| Claim a bounty, upload a draft, submit the reel link | — | — | Yes, own claims | — | — | — |
| Create, fund or cancel a bounty | — | — | — | — | Yes | Managed campaigns (MVP-2) |
| Approve or send back a draft | — | — | — | — | Yes | — |
| See campaign results and invoices | — | — | — | Yes | Yes | Yes |
| Invite team members | — | — | — | — | Owner only | — |
| Verify accounts, decide flags and disputes, approve payouts, enter manual metrics | — | — | — | — | — | Yes |

## Pages and components

The app has 60 pages (42 in MVP-1, 13 in MVP-2, 5 in MVP-3) and 93 shared components (74, 8, 11). Phases follow the Master Plan's module and screen tables; where it sets none, the phase is marked *suggested*.

| Area | Pages | MVP-1 | MVP-2 | MVP-3 |
| --- | --- | --- | --- | --- |
| Public site | 24 | 14 | 8 | 2 |
| Sign-in | 4 | 4 | 0 | 0 |
| Brand dashboard | 13 | 8 | 3 | 2 |
| Creator dashboard | 8 | 6 | 1 | 1 |
| Admin console | 11 | 10 | 1 | 0 |
| **Total** | **60** | **42** | **13** | **5** |

### Public site (24 pages)

The sitemap has both "For creators" and "Creators", so the marketing pages live under `/for-brands` and `/for-creators`, and `/creators` is the directory.

| Page | URL | Phase |
| --- | --- | --- |
| Home | `/` | MVP-1 |
| For brands: how it works | `/for-brands` | MVP-1 |
| Pricing | `/for-brands/pricing` | MVP-1 |
| Case studies | `/for-brands/case-studies` | MVP-2, suggested: needs a finished campaign |
| For creators: how it works | `/for-creators` | MVP-1 |
| Earnings FAQ | `/for-creators/earnings-faq` | MVP-1 |
| Bounties list | `/bounties` | MVP-1 |
| Bounty page | `/bounties/[slug]` | MVP-1 |
| Results board | `/bounties/[slug]/results` | MVP-2 |
| Services | `/services` | MVP-2 |
| Managed package | `/services/managed` | MVP-2 |
| Growth package | `/services/growth` | MVP-2 |
| Partner work | `/services/partner-work` | MVP-2 |
| Creator directory | `/creators` | MVP-1 basic, search in MVP-3 |
| Creator profile | `/creators/[handle]` | MVP-1 basic, score and results in MVP-3 |
| Leaderboard (creators and brands) | `/leaderboard` | MVP-3 |
| Brand profile | `/brands/[slug]` | MVP-3 |
| About: vision and team | `/about` | MVP-1 |
| Blog | `/blog` | MVP-2, suggested |
| Blog post | `/blog/[slug]` | MVP-2, suggested |
| Contact | `/contact` | MVP-1 |
| Terms | `/terms` | MVP-1, added: payment-partner onboarding asks for it |
| Privacy policy | `/privacy` | MVP-1, added: same reason |
| Refund policy | `/refunds` | MVP-1, added: same reason |

### Sign-in (4 pages, MVP-1)

`/login`, `/signup` (pick brand or creator), `/verify` (enter the one-time code), `/mfa` (admin authenticator code).

### Brand dashboard (13 pages)

| Page | URL | What it does | Phase |
| --- | --- | --- | --- |
| Overview | `/brand` | Bounties by status, actions waiting (drafts to review) | MVP-1 |
| Onboarding | `/brand/onboarding` | Business details; GSTIN or KYC before the first bounty | MVP-1 |
| Bounty builder | `/brand/bounties/new` | Brief, rate, budget, cap, follower rule, cities, languages, categories, deadline, top-3 prize | MVP-1 |
| Edit bounty | `/brand/bounties/[id]/edit` | Only while the bounty is a Draft | MVP-1 |
| Checkout | `/brand/bounties/[id]/checkout` | Budget + fee + GST (+ prize) through the payment partner | MVP-1 |
| Bounty detail | `/brand/bounties/[id]` | State, claims, reserved and remaining budget | MVP-1 |
| Draft review | `/brand/bounties/[id]/drafts` | Approve, or send back once with a reason | MVP-1 |
| Settings | `/brand/settings` | Business details, KYC status | MVP-1 |
| Campaign dashboard | `/brand/bounties/[id]/results` | Live views, reach, spend, cost per 1,000 views, results board | MVP-2 |
| Invoices | `/brand/billing` | GST invoices per bounty | MVP-2 |
| Packages | `/brand/services` | Order Managed or Growth | MVP-2 |
| Find creators | `/brand/creators` | Directory search, invite top creators to a bounty | MVP-3 |
| Team | `/brand/team` | Invite colleagues, full or view-only | MVP-3 |

### Creator dashboard (8 pages)

| Page | URL | What it does | Phase |
| --- | --- | --- | --- |
| Bounty feed | `/creator` | Only bounties the creator qualifies for, plus brand invites (MVP-3) | MVP-1 |
| Onboarding | `/creator/onboarding` | Profile, Instagram connect, PAN, UPI ID; shows current level | MVP-1 |
| Bounty detail | `/creator/bounties/[id]` | Brief, rate, cap; claim a slot | MVP-1 |
| My claims | `/creator/claims` | All claims with status and timers | MVP-1 |
| Claim detail | `/creator/claims/[id]` | Reservation timer, draft upload, review result, posting instructions, reel link | MVP-1 |
| Settings | `/creator/settings` | Reconnect Instagram, update PAN and UPI ID | MVP-1 |
| Earnings | `/creator/earnings` | Live views per reel, pending and paid money, payout history | MVP-2 |
| Profile and score | `/creator/profile` | Public profile preview, RedCup Score, past results | MVP-3 |

### Admin console (11 pages)

The Master Plan names four admin screens. Seven more are added because a rule in the plan needs a screen to carry it out.

| Page | URL | What it does | Phase |
| --- | --- | --- | --- |
| Home | `/admin` | Queue counts in MVP-1; platform health (bounties live, fill rate, creators active, money held) in MVP-3 | MVP-1 |
| Verification queue | `/admin/verification` | Approve brands, check creator accounts | MVP-1 |
| Fraud and disputes | `/admin/cases` | Review flags and disputes, decide, record the reason | MVP-1 |
| Payout batches | `/admin/payouts` | Approve, hold or claw back payouts | MVP-1 |
| Manual metrics | `/admin/metrics` | Added: the plan's manual fallback has an admin type in views from screen recordings | MVP-1 |
| Bounties | `/admin/bounties` | Added: find any bounty to support a brand or creator | MVP-1 |
| Bounty detail | `/admin/bounties/[id]` | Added: claims, reels, Paid Partnership label check | MVP-1 |
| Users | `/admin/users` | Added: bans and inactive accounts need a place to happen | MVP-1 |
| User detail | `/admin/users/[id]` | Added: levels, flags, negative balances after clawback | MVP-1 |
| Ledger | `/admin/ledger` | Added: match ledger entries to payment-partner records | MVP-1 |
| Service orders | `/admin/services` | Added: admins run managed campaigns | MVP-2 |

### Components (93)

| Group | Folder | Total | MVP-1 | MVP-2 | MVP-3 | Components |
| --- | --- | --- | --- | --- | --- | --- |
| UI basics | `components/ui` | 22 | 22 | 0 | 0 | Button, Input, Textarea, Select, Checkbox, RadioGroup, Badge, Card, DataTable, Tabs, Dialog, Toast, Skeleton, EmptyState, Stepper, FileDropzone, OtpInput, MoneyInput, Countdown, StatusPill, Avatar, Pagination |
| Layout | `components/layout` | 7 | 7 | 0 | 0 | SiteHeader, SiteFooter, DashboardShell, DashboardNav (changes by role), PageHeader, WhatsAppHelpButton, SourceNote ("verified from Instagram") |
| Marketing | `components/marketing` | 10 | 10 | 0 | 0 | Hero, ProblemCards, HowItWorksSteps, BenefitGrid, WorkedExample, EarningsExample, PricingTable, FaqAccordion, CtaBand, LevelCards |
| Sign-in | `components/auth` | 4 | 4 | 0 | 0 | ContactForm (email or phone), OtpForm, RolePicker, MfaSetup |
| Bounty | `components/bounty` | 9 | 7 | 1 | 1 | BountyCard, BountyFilters, BountyBuilderForm, EligibilityFields, BudgetBreakdown, CheckoutSummary, BountyStatusBadge; TopBountiesStrip (MVP-2); InviteCreatorDialog (MVP-3) |
| Claim and draft | `components/claim` | 9 | 8 | 0 | 1 | ClaimButton, ClaimTimer, DraftUploader, DraftReviewPanel, RevisionReasonForm, PostingInstructions, ReelLinkForm, ClaimStatusTimeline; RateBrandForm (MVP-3) |
| Results | `components/results` | 7 | 0 | 3 | 4 | ResultsBoardTable, MetricsTiles, LiveNotFinalBanner (MVP-2); CreatorLeaderboard, BrandLeaderboard, ScoreBadge, BrandBadges (MVP-3) |
| Profiles | `components/profile` | 5 | 3 | 0 | 2 | CreatorCard, CreatorProfileHeader, LevelBadge; BrandProfileHeader, PastResultsList (MVP-3) |
| Money | `components/money` | 4 | 1 | 3 | 0 | LedgerTable; EarningsSummary, PayoutHistoryTable, InvoiceList (MVP-2) |
| Onboarding | `components/onboarding` | 5 | 5 | 0 | 0 | CreatorProfileForm, InstagramConnectCard, PanUpiForm, VerificationChecklist, BusinessKycForm |
| Admin | `components/admin` | 8 | 7 | 0 | 1 | QueueTable, VerificationReviewCard, CaseCard, DecisionForm (reason required), PayoutBatchTable, ManualMetricsForm, UserActionsPanel; HealthStats (MVP-3) |
| Brand extras | `components/brand` | 3 | 0 | 1 | 2 | ServicePackageCard (MVP-2); TeamMembersTable, CreatorSearchFilters (MVP-3) |
| **Total** |  | **93** | **74** | **8** | **11** |  |

## Backend and how it connects

The backend is the server half of the same Next.js app. Server Actions and Route Handlers call one service layer, and only that layer talks to Postgres, Storage and the outside services.

### Why these choices

| Choice | Why | What to watch |
| --- | --- | --- |
| Supabase for database, login and files | One account gives Postgres, phone and email one-time codes, authenticator two-step for admins, and storage for draft videos. Its Send SMS hook can route login codes through a regional SMS provider or WhatsApp ([Supabase](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook)) | Production needs the Pro plan at $25 a month. Free pauses after a week of inactivity, has no backups, and caps uploads at 50 MB, too small for draft reels ([pricing](https://supabase.com/pricing), [file limits](https://supabase.com/docs/guides/storage/uploads/file-limits)) |
| Drizzle ORM, server only | Money steps need real transactions: a claim's state change and its ledger entries succeed or fail together. The schema lives in the repo as typed code; migrations are SQL files | Use Supabase's pooled connection string, because every Vercel function opens its own connection |
| Supabase Cron for background jobs | Already inside Supabase; runs on a schedule and can call HTTP endpoints ([Supabase Cron](https://supabase.com/docs/guides/cron)). Vercel Cron on the Hobby plan runs only once a day, but view sync needs every 6 hours ([Vercel](https://vercel.com/docs/cron-jobs/usage-and-pricing)) | Each job must finish inside one function call, so jobs work in small batches |
| Upgrade path: Inngest | Retries, step-by-step runs and waits of up to 30 days; the free tier gives 50,000 executions a month with 24 hours of logs ([Inngest](https://www.inngest.com/pricing)) | One more account; move when job volume or failures justify it |

### How the parts connect

| From | To | How | Credential |
| --- | --- | --- | --- |
| Browser | Next.js app | HTTPS; the login session lives in a secure cookie | User session |
| Next.js server | Supabase Auth | Server Actions send and check one-time codes; `proxy.ts` refreshes the session | Public key, plus service key for creating admin accounts |
| Next.js server | Supabase Postgres | Drizzle over the pooled Postgres connection string | `DATABASE_URL`, server env only |
| Browser | Supabase Storage | Uploads one draft to a signed link the server issued | Signed upload link |
| Supabase Auth | SMS or WhatsApp provider | Send SMS hook delivers login codes | Provider key |
| Supabase Cron | Next.js job routes | HTTPS POST with a secret header | `CRON_SECRET` |
| Next.js server | Instagram API | Instagram Login, then each creator's long-lived token, stored encrypted | Meta app ID and secret, creator tokens |
| Next.js server | Payment partner API | Orders, payouts and refunds through the payment adapter | Partner key and secret |
| Payment partner | Next.js webhook route | Signed HTTPS POST for every payment, payout and refund event | Webhook secret |
| Next.js server | WhatsApp provider, email provider | Template messages (MVP-2) | Provider keys |

Row-level security is switched on for every table with no policies for the public roles, so Supabase's public key cannot read any table from a browser. All reads and writes go through the server connection.

### Service modules

| File | Master Plan module | Owns | Phase |
| --- | --- | --- | --- |
| `accounts.ts` | 1 Accounts and identity | Users, roles, brand team members | MVP-1, team MVP-3 |
| `verification.ts` | 2 Verification | Creator levels, Instagram checks, PAN and UPI ID, brand KYC | MVP-1 |
| `directory.ts` | 3 Creator directory | Creator and brand listings, search | MVP-1 basic, MVP-3 search |
| `bounties.ts` | 4 Bounty engine | Builder, eligibility, bounty states | MVP-1 |
| `claims.ts` | 4 Bounty engine | Claims, reservations, claim states | MVP-1 |
| `drafts.ts` | 4 Bounty engine | Upload links, review, one revision | MVP-1 |
| `tracking.ts` | 5 Instagram tracking | Reel matching, metric pulls, manual entries | MVP-1 |
| `results.ts` | 6 Results and score | Results boards and ranking | MVP-2 |
| `scores.ts` | 6 Results and score | RedCup Score, Brand Trust Score | MVP-3 |
| `ledger.ts` | 7 Payments and payouts | Append-only entries, bounty and creator balances | MVP-1 |
| `payouts.ts` | 7 Payments and payouts | Settlement, batches, refunds, clawbacks | MVP-1 |
| `fraud.ts` | 8 Fraud and trust | Flags, disputes, bans; automatic rules in MVP-3 | MVP-1 |
| `notifications.ts` | 9 Notifications | WhatsApp and email outbox | MVP-2 |
| `packages.ts` | 10 Services and packages | Managed and Growth orders | MVP-2 |
| `admin.ts` | 11 Admin console | Audit log of every decision, health stats | MVP-1 |

Three helpers sit beside them: `bounty-states.ts` and `claim-states.ts` hold the only allowed state moves from Master Plan section 6, and `money-math.ts` holds fee, GST, earning, commission, TDS and refund math in one place.

### Route Handlers (16)

| Route | Called by | Does | Phase |
| --- | --- | --- | --- |
| `/auth/callback` | Supabase Auth | Finishes an email sign-in link | MVP-1 |
| `/api/instagram/connect` | Creator | Starts Instagram Login | MVP-1 |
| `/api/instagram/callback` | Instagram | Swaps the code for a token, stores it encrypted, runs the Verified checks | MVP-1 |
| `/api/webhooks/payments/[provider]` | Payment partner | Payment captured or failed, payout paid or failed, refund done; each event processed once | MVP-1 |
| `/api/uploads/draft` | Creator dashboard | Issues a signed upload link for one draft | MVP-1 |
| `/api/health` | Uptime monitor | Checks the database and settings | MVP-1 |
| `/api/jobs/[name]` (10 routes) | Supabase Cron | See the jobs table | MVP-1 to MVP-3 |

### Background jobs (10)

Schedules are proposals. Every job picks only rows that are due, so a missed run catches up on the next one, running twice does no harm, and every run is logged.

| Job | Runs | Does | Phase |
| --- | --- | --- | --- |
| `reservations-expire` | Every 15 minutes | Claims past their reservation with no draft → Expired; money released; bounty can reopen | MVP-1 |
| `metrics-sync` | Hourly | Pulls each posted reel that is due (every 6 hours for 7 days) and saves a snapshot | MVP-1 |
| `tracking-close` | Hourly | Reels past day 7: final pull, claim → Verified or Flagged; last reel done → bounty Ranked | MVP-1 |
| `payout-prepare` | Daily | Settles Verified claims (earning, commission, TDS, prize) into a batch for admin approval | MVP-1 |
| `bounty-close` | Daily | Ranked bounties whose claims are all Paid, Removed or Expired → Closed; refunds unused budget with its fee and GST | MVP-1 |
| `instagram-token-refresh` | Daily | Renews creator tokens before expiry; marks disconnected accounts | MVP-1 |
| `notifications-send` | Every 5 minutes | Sends queued WhatsApp and email messages | MVP-2 |
| `fraud-rules` | Hourly | Spikes, odd audiences, reach-versus-views gaps → flags | MVP-3 |
| `scores-nightly` | Nightly | RedCup Score and Brand Trust Score | MVP-3 |
| `brand-stats-nightly` | Nightly | Totals for Top paying brands and Most creator-friendly | MVP-3 |

Meta says reel metrics can arrive up to 48 hours late and still marks `views` as in development ([Meta](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/)). That affects when the day-7 figure is final; see Open decisions.

### Payment layer

One interface, `PaymentProvider`, with five calls: create a funding order, verify a webhook, refund, create a UPI payout, and check a payout's status. `razorpay.ts` and `cashfree.ts` each implement it, and one setting picks which runs. The ledger stays the record of who is owed what; the partner's reference numbers are stored on payment orders and payouts so the two can be matched.

## Database

The database has 25 tables: the 18 the Master Plan defines and 7 added, each for a stated reason. 16 are needed in MVP-1, 4 in MVP-2 and 5 in MVP-3. Money is stored in paise as whole numbers; times are stored in UTC and shown in IST.

| Table | Key fields | Links to | Phase | Source |
| --- | --- | --- | --- | --- |
| `users` | id (same as the Supabase Auth user), role, phone, email, status, created\_at | creators or brands | MVP-1 | Plan |
| `creators` | user\_id, display\_name, city, languages, categories, level, PAN (encrypted), UPI ID (encrypted) | users, instagram\_accounts | MVP-1 | Plan |
| `instagram_accounts` | creator\_id, ig\_user\_id, handle, account\_type, followers, media\_count, oldest\_post\_at, token (encrypted), token\_expires\_at, last\_synced\_at | creators | MVP-1 | Plan; oldest\_post\_at replaces account\_created\_at, which the API does not return |
| `brands` | user\_id (owner), business\_name, slug, category, city, GSTIN, kyc\_status, website, spend\_display | users, bounties | MVP-1 | Plan; slug and spend\_display added for profile pages and boards |
| `bounties` | brand\_id, slug, title, brief, dos\_donts, rate\_per\_1000, budget, cap\_per\_creator, follower\_rule, cities, languages, categories, deadline, reservation\_hours, prize\_top3, status | brands, claims | MVP-1 | Plan; slug and reservation\_hours added |
| `claims` | bounty\_id, creator\_id, status, reserved\_amount, reserved\_until, posted\_at | bounties, creators, drafts, reels | MVP-1 | Plan |
| `drafts` | claim\_id, video\_path, caption, version (1 or 2), review\_status, review\_reason | claims | MVP-1 | Plan |
| `reels` | claim\_id, ig\_media\_id, permalink, posted\_at, has\_paid\_partnership\_label, label\_checked\_by, next\_sync\_at | claims, metric\_snapshots | MVP-1 | Plan; label\_checked\_by and next\_sync\_at added |
| `metric_snapshots` | reel\_id, taken\_at, views, reach, likes, comments, shares, saves, source (API or manual), entered\_by | reels | MVP-1 | Plan; source and entered\_by added for the manual fallback |
| `ledger_entries` | type, amount, bounty\_id, claim\_id, brand\_id, creator\_id, reverses\_entry\_id, created\_at | bounties, claims | MVP-1 | Plan |
| `payouts` | creator\_id, amount, ledger\_entry\_ids, partner\_reference, status, approved\_by, paid\_at | creators, ledger\_entries | MVP-1 | Plan |
| `fraud_flags` | reel\_id or creator\_id, rule, details, status, reviewed\_by | reels, creators | MVP-1 | Plan |
| `disputes` | claim\_id, raised\_by, reason, status, decision | claims | MVP-1 | Plan |
| `payment_orders` | bounty\_id, brand\_id, budget, fee, GST, prize, provider, provider\_order\_id, provider\_payment\_id, status | bounties, brands | MVP-1 | Added: checkout and webhooks need a record of every attempt, failed ones included |
| `admin_actions` | admin\_id, action, target\_type, target\_id, reason, created\_at | users | MVP-1 | Added: the plan says admins decide and record the reason |
| `job_runs` | job, started\_at, finished\_at, items\_done, error | none | MVP-1 | Added: shows whether scheduled work ran |
| `results` | bounty\_id, claim\_id, rank, final\_views, engagement\_rate, is\_final | bounties, claims | MVP-2 | Plan |
| `service_orders` | brand\_id, package, price, status, partner\_referral | brands | MVP-2 | Plan |
| `invoices` | brand\_id, bounty\_id, number, amounts, GST, pdf\_path, issued\_at | brands, bounties | MVP-2 | Added: a GST invoice for every bounty |
| `notifications` | user\_id, channel, template, payload, status, sent\_at | users | MVP-2 | Added: outbox for WhatsApp and email |
| `creator_scores` | creator\_id, score, performance, reliability, quality, trust, calculated\_at | creators | MVP-3 | Plan |
| `brand_stats` | brand\_id, period, category, total\_paid, bounties\_funded, largest\_bounty, best\_rate, trust\_score, review\_hours\_median | brands | MVP-3 | Plan |
| `brand_ratings` | claim\_id, brand\_id, creator\_id, clarity, fairness, created\_at | claims, brands, creators | MVP-3 | Plan |
| `brand_members` | brand\_id, user\_id, access (owner, full, view), invited\_by | brands, users | MVP-3 | Added: brand team accounts |
| `bounty_invites` | bounty\_id, creator\_id, brand\_id, status | bounties, creators | MVP-3 | Added: brands invite creators directly |

### Status lists

| List | Values |
| --- | --- |
| Role | brand, creator, admin |
| Creator level | listed, verified, proven |
| Brand KYC | not\_submitted, submitted, approved, rejected |
| Bounty | draft, verifying, live, slots\_full, tracking, ranked, closed, cancelled |
| Claim | claimed, draft\_sent, revision, approved, posted, tracking, verified, paid, expired, rejected, flagged, removed |
| Ledger entry | funding, fee, gst, prize\_funding, reservation, release, earning, commission, tds, prize, payout, refund, clawback |
| Payout | pending\_approval, approved, sent, paid, failed, held |
| Fraud flag | open, cleared, upheld |

The ledger list adds fee, gst and prize\_funding to the plan's ten types, so a refund can return exactly the fee and GST on unused budget.

### Ledger and data rules

- **Insert only.** A database trigger refuses any edit or delete on `ledger_entries`; a correction is a new entry pointing at the one it reverses.
- **Same transaction.** Every step that moves money writes its ledger entries in the same transaction as the state change.
- **Balances are sums, never stored.** Unreserved budget = budget − open reservations − settled earnings. A creator's balance = earnings + prizes − commission − TDS − payouts − clawbacks.
- **Claims stop** when unreserved budget is less than one creator's cap.
- **Clawback** leaves a negative balance; the creator cannot claim again until it is cleared.
- **Snapshots are kept**, never overwritten, because fraud checks need the history.
- **PAN, UPI IDs and Instagram tokens** are encrypted by the app before they are saved; the key lives only in server settings.
- **No hard deletes** for users with money history; they are marked inactive.

## Software requirements specification (SRS)

This SRS sets 69 functional requirements across the Master Plan's 12 modules and 10 non-functional requirements, each with an ID and a phase. Task-board cards can link to these IDs.

### 1. Purpose and scope

- **Purpose:** define what the RedCup web platform must do, for Om (who builds it) and Harsh (who owns users and money).
- **In scope:** public website; Brand, Creator and Admin dashboards; bounty engine; Instagram tracking; payments through a partner; results boards and scores; fraud review; notifications; service packages. MVP-1 to MVP-3.
- **Out of scope:** the Master Plan's "Later" items (AI brief writer, AI campaign builder, pay-per-customer tracking, Creator Pro, content licensing, YouTube Shorts); separate agency, referral and service-partner dashboards; native mobile apps.
- **Sources:** RedCup Product Book, RedCup Master Plan, RedCup for Brands and Agencies, RedCup for Creators (all dated Oct 10, 2026).

### 2. Definitions

| Term | Meaning |
| --- | --- |
| Bounty | A paid reel brief a brand funds upfront: rate per 1,000 views, total budget, cap per creator, eligibility rules, deadline |
| Claim | One creator's place on one bounty, from reservation to payout |
| Reservation | The creator's cap held from the bounty's unreserved budget for 48–72 hours after claiming |
| Verified views | The reel's view count from Instagram's data, after fraud checks |
| Results board | The public ranking of every creator who posted on a bounty |
| RedCup Score | A creator's 0–100 score from results, reliability, quality and trust |
| Ledger entry | One insert-only record of a money event |
| Listed, Verified, Proven | The three creator levels |

### 3. Users and operating environment

| User class | Can do | Signs in with |
| --- | --- | --- |
| Visitor | Read the public site, bounties, directory, results boards | Nothing |
| Creator: Listed / Verified / Proven | Listed browses; Verified claims and earns; Proven gets a score, leaderboard place and brand invites | Phone one-time code |
| Brand: owner, full, view-only | Post, fund and review bounties; view-only members see results only (MVP-3) | Email or phone one-time code |
| Admin | Verify, review fraud and disputes, approve payouts, enter manual metrics, run managed campaigns | Email code plus authenticator |

The product runs in mobile browsers first and desktop browsers second, hosted on Vercel and Supabase, for users in India, in rupees.

### 4. Functional requirements

**Module 1. Accounts and identity**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-1.1 | A user signs up as a brand or a creator. One account holds one role, and only the server sets it | MVP-1 |
| FR-1.2 | Brands sign in with an email or phone code; creators with a phone code; admins with an email code plus an authenticator code | MVP-1 |
| FR-1.3 | Admin accounts are created only by an admin; there is no admin sign-up | MVP-1 |
| FR-1.4 | Sessions persist on a device until sign-out or expiry | MVP-1 |
| FR-1.5 | A brand owner invites colleagues by email with full or view-only access; view-only members cannot change anything | MVP-3 |
| FR-1.6 | Users with money history are never deleted, only marked inactive | MVP-1 |

**Module 2. Verification**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-2.1 | A creator becomes Listed after giving name, phone, city, languages, categories and Instagram handle | MVP-1 |
| FR-2.2 | A creator connects an Instagram professional account; the system reads account type, followers, post count and posts | MVP-1 |
| FR-2.3 | The system checks the Verified rules (professional account, at least 10 posts, account at least 90 days old, no past fraud flags) and an admin confirms | MVP-1 |
| FR-2.4 | A creator adds PAN and UPI ID; both are stored encrypted and shown masked | MVP-1 |
| FR-2.5 | A creator becomes Proven after one bounty with verified results and no fraud flags | MVP-1 |
| FR-2.6 | A brand submits GSTIN or basic KYC before its first bounty goes live; an admin approves or rejects with a reason | MVP-1 |

**Module 3. Creator directory**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-3.1 | A public directory lists creators with city, languages, categories, followers and level | MVP-1 |
| FR-3.2 | Each creator has a public profile page; past results and score are added later | MVP-1 basic, MVP-3 full |
| FR-3.3 | The directory filters by city, language, category, followers and RedCup Score, with search | MVP-3 |
| FR-3.4 | A brand invites a creator to a bounty from the directory | MVP-3 |

**Module 4. Bounty engine**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-4.1 | A brand creates a bounty with title, brief, do's and don'ts, rate per 1,000 views, budget (at least ₹5,000), cap per creator, follower rule (open, 1K+, 5K+, 10K+), cities, languages, categories and deadline | MVP-1 |
| FR-4.2 | A brand can add a top-3 prize, funded upfront with the budget | MVP-1 |
| FR-4.3 | Bounties and claims move only through the states and moves in Master Plan section 6; any other move is refused | MVP-1 |
| FR-4.4 | A bounty goes Live only after brand KYC is approved and its funding is captured | MVP-1 |
| FR-4.5 | The creator feed shows only Live bounties the creator qualifies for | MVP-1 |
| FR-4.6 | A claim reserves the creator's cap from unreserved budget for the reservation window | MVP-1 |
| FR-4.7 | A bounty becomes Slots full when unreserved budget is below one cap, and reopens when a reservation is released | MVP-1 |
| FR-4.8 | A creator uploads a draft video and caption before the reservation ends; otherwise the claim expires and its money returns to the bounty | MVP-1 |
| FR-4.9 | The brand approves a draft or sends it back once with a written reason; a second rejection makes the claim Rejected | MVP-1 |
| FR-4.10 | A brand can reject only for breaking the brief; the creator can appeal once | MVP-1 |
| FR-4.11 | The creator posts the approved draft with the Paid Partnership label and submits the reel link; the system matches it to the claim | MVP-1 |
| FR-4.12 | A brand can cancel a bounty only before it is Live, with a full refund | MVP-1 |

**Module 5. Instagram tracking**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-5.1 | For each posted reel, the system pulls views, reach, likes, comments, shares and saves every 6 hours for 7 days, then once more for the final figure; every pull is kept | MVP-1 |
| FR-5.2 | Until Meta approves the app, an admin enters numbers from the creator's screen recording; the snapshot records who entered it | MVP-1 |
| FR-5.3 | If a reel is deleted or hidden before day 7, the system raises it for admin review | MVP-1 |
| FR-5.4 | An admin confirms the Paid Partnership label on each reel | MVP-1 |
| FR-5.5 | Creator Instagram tokens are renewed before they expire; a lost connection is shown to the creator | MVP-1 |

**Module 6. Results and scores**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-6.1 | Each bounty has a results board from the moment it goes live; a creator joins it once their reel is posted; rankings are marked "live — not final" until tracking ends | MVP-2 |
| FR-6.2 | The final board is published when the last reel finishes day 7, then frozen. Order: verified views on day 7, then engagement rate ((likes + comments + shares + saves) ÷ reach), then earlier post time | MVP-2 |
| FR-6.3 | Flagged reels, rejected drafts and reels not posted by the deadline are left off the board | MVP-2 |
| FR-6.4 | The board shows rank, name, handle, reel thumbnail and link, views, reach and engagement rate; earnings stay private | MVP-2 |
| FR-6.5 | Brand boards show Top bounties and Best rate on open bounties, overall and by category | MVP-2 |
| FR-6.6 | RedCup Score (0–100) is recalculated nightly: performance 50%, reliability 25%, quality 15%, trust 10%; shown once Proven, marked "new" until 3 bounties; raw parts kept | MVP-3 |
| FR-6.7 | Creator leaderboards overall, by category and by city; brand boards Top paying and Most creator-friendly; Brand Trust Score and badges; brand spend shown as a range by default | MVP-3 |
| FR-6.8 | A paid Featured slot, if sold, is always labelled and never counted on any board | MVP-3 |

**Module 7. Payments and payouts**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-7.1 | Checkout charges budget + platform fee + 18% GST on the fee + any prize, by UPI, card or net banking through the payment partner | MVP-1 |
| FR-7.2 | Every money event writes a ledger entry; entries are never edited or deleted, and corrections reverse the old entry | MVP-1 |
| FR-7.3 | Earning = verified views ÷ 1,000 × rate, up to the cap | MVP-1 |
| FR-7.4 | Payout = earning − commission − TDS + any prize | MVP-1 |
| FR-7.5 | An admin approves payouts in batches; the partner sends them by UPI; each payout is tracked to paid or failed | MVP-1 |
| FR-7.6 | When a bounty closes, unused budget plus the fee and GST on it is refunded to the brand | MVP-1 |
| FR-7.7 | A clawback leaves a negative balance the creator must clear before earning again | MVP-1 |
| FR-7.8 | Every bounty gets a GST invoice | MVP-2 |
| FR-7.9 | All partner calls go through one payment interface, so changing partner changes one adapter | MVP-1 |

**Module 8. Fraud and trust**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-8.1 | An admin can flag a claim during tracking or before payout; the claim becomes Flagged | MVP-1 |
| FR-8.2 | A cleared flag returns the claim to Verified; an upheld flag removes it, claws back any payout and bans the account | MVP-1 |
| FR-8.3 | Automatic rules flag sudden view spikes, odd audiences, reach-versus-views gaps and fake comments | MVP-3 |
| FR-8.4 | Creators can appeal a rejection once; an admin decides | MVP-1 |
| FR-8.5 | Every admin decision is stored with who, when and why | MVP-1 |

**Module 9. Notifications**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-9.1 | WhatsApp and email messages for new bounties, claims, approvals, results and payouts | MVP-2 |
| FR-9.2 | Until then, Harsh sends results and updates by hand | MVP-1 |

**Module 10. Services and packages**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-10.1 | A brand orders the Managed or Growth package; an admin runs managed campaigns | MVP-2 |
| FR-10.2 | Service orders record any partner-agency referral | MVP-2 |

**Module 11. Admin console**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-11.1 | Verification queue for brands and creators | MVP-1 |
| FR-11.2 | Fraud and disputes queue with a required reason on every decision | MVP-1 |
| FR-11.3 | Payout batches: approve, hold, claw back | MVP-1 |
| FR-11.4 | Manual metrics entry | MVP-1 |
| FR-11.5 | Platform health: bounties live, fill rate, creators active, money held | MVP-3 |

**Module 12. Website and content**

| ID | Requirement | Phase |
| --- | --- | --- |
| FR-12.1 | Public pages per the sitemap; every section leads to "Post a bounty" or "Join as a creator" | MVP-1 core |
| FR-12.2 | A WhatsApp help button on every screen | MVP-1 |
| FR-12.3 | Every number shown to a brand says where it came from ("verified from Instagram") | MVP-1 |
| FR-12.4 | Terms, privacy and refund pages | MVP-1 |
| FR-12.5 | Creator screens in Hindi | MVP-3 |

### 5. External interfaces

| Interface | Used for | Phase |
| --- | --- | --- |
| Instagram API with Instagram Login | Account checks and reel metrics | MVP-1, manual fallback until Meta approves |
| Payment partner (Razorpay or Cashfree) | Funding, UPI payouts, refunds | MVP-1 |
| Supabase Auth with an SMS or WhatsApp provider | Login codes | MVP-1 |
| Supabase Storage | Draft videos | MVP-1 |
| Email provider | Email login codes from MVP-1; alerts and invoices from MVP-2 | MVP-1 |
| WhatsApp Business provider | Alerts | MVP-2 |

### 6. Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-1 | Mobile first: every screen works on a phone before desktop |
| NFR-2 | Failure cases handled on every feature: payment fails, Instagram disconnects, upload breaks |
| NFR-3 | PAN, UPI IDs and Instagram tokens encrypted at rest, masked on screen, used only to verify and pay |
| NFR-4 | Admin access needs two-step login; secrets live only in server settings |
| NFR-5 | Ledger insert-only and enforced by the database; money stored in paise as whole numbers |
| NFR-6 | Every metric snapshot and admin decision kept for audit |
| NFR-7 | Webhooks and jobs are safe to run twice; each payment event is processed once |
| NFR-8 | Rupees shown with Indian grouping (₹1,00,000) and times in IST |
| NFR-9 | Every reel carries the Paid Partnership label, following ASCI guidelines |
| NFR-10 | Daily database backups (Supabase Pro keeps 7 days) |

### 7. Constraints and dependencies

- MVP-1 runs Oct 12 – Nov 1, 2026; the first paid campaign is Nov 9.
- Two-person team: Om builds, Harsh owns brands, creators and money.
- Meta App Review is the slowest step; the manual fallback covers the gap.
- The payment partner's KYC must be approved before real money moves.
- Supabase Pro is required before launch.
- Login codes sent by SMS in India must follow the SMS provider's sender and template registration.

### 8. Business rules

| Rule | Value | Status |
| --- | --- | --- |
| Brand platform fee | 15% of budget | Launch price; 12% or 15% still open in the Master Plan |
| GST on the fee | 18% | Set |
| Creator commission | 10% of each payout | Launch price; 5% or 10% still open |
| Minimum bounty | ₹5,000 | Set |
| Reservation | 48–72 hours | Exact value open |
| Tracking | 7 days, a pull every 6 hours | Set |
| Payout target | 7–8 days after posting | Set |
| Draft revisions | One, with a written reason | Set |
| Appeals | One per rejection | Set |
| RedCup Score weights | 50 / 25 / 15 / 10 | Starting point |
| Brand Trust Score weights | Creator ratings 40, review speed 20, fair approvals 20, consistency 20 | Starting point |
| Verified rules | 90 days old, 10 posts, professional account, no flags | Set |
| TDS | As the CA advises | Open |

Fees, rates and weights live in one settings file, so a pricing decision changes one value, not the code.

## User context diagram (DFD level 0)

The whole platform is one process with seven external entities around it. Brands and creators never exchange data directly; everything passes through RedCup.

&#91;embedded content: context diagram · DFD level 0 · 7 external entities\]

| External entity | Sends to RedCup | Gets from RedCup |
| --- | --- | --- |
| Brand | Sign-up and KYC, bounty briefs, funding payments, draft decisions | Drafts to review, live results and boards, GST invoices (MVP-2), refunds |
| Creator | Profile, Instagram link, PAN and UPI ID, claims, drafts, reel links, appeals | Bounties they qualify for, review outcomes, UPI payouts, rank and score |
| Admin | Verification decisions, fraud and dispute rulings, payout approvals, manual metrics | Queues, flags, ledger, platform health (MVP-3) |
| Visitor | Page requests | Public bounties, creator directory, results boards, leaderboards |
| Instagram API | Account details, reel metrics | Login and metric requests |
| Payment partner | Payment, payout and refund events by webhook | Funding orders, payout and refund instructions |
| Messaging providers | Not stated in the source docs | Login codes by SMS or WhatsApp; alerts and emails (MVP-2) |

## Data flow diagrams

Level 1 splits the platform into eight processes and eight data stores. Level 2 opens process 6.0, where every money event becomes a ledger entry.

### Level 1: the whole system

&#91;embedded content: DFD level 1 · 8 processes, 8 data stores\]

Read top to bottom: each process hands its results to the next through a data store, and no money moves outside process 6.0.

| Process | Reads | Writes | Phase |
| --- | --- | --- | --- |
| 1.0 Accounts and verification | Nothing; entities only | D1 | MVP-1 |
| 2.0 Bounties | D1 (brand KYC status) | D2 | MVP-1 |
| 3.0 Claims and drafts | D1, D2 | D3; asks 6.0 to reserve or release money | MVP-1 |
| 4.0 Reel tracking | D3 | D4 | MVP-1 |
| 5.0 Fraud and disputes | D3, D4 | D5; claim state in D3; asks 6.0 to claw back | MVP-1 |
| 6.0 Money and payouts | D2, D3, D4, D5 | D6; claim to Paid in D3; bounty to Closed in D2 | MVP-1 |
| 7.0 Results and scores | D3, D4 | D7 | MVP-2 boards, MVP-3 scores |
| 8.0 Notifications | D1, D3, D6, D7 | D8 | MVP-2 |

### Level 2: money and payouts (process 6.0)

&#91;embedded content: DFD level 2 · process 6.0, money and payouts\]

The amounts are the Master Plan's worked example: a ₹50,000 bounty at ₹50 per 1,000 views with a ₹5,000 cap. A creator with 64,000 verified views earns ₹3,200; RedCup keeps ₹320, and TDS comes off before the UPI payout.

## Files to be made

The build needs about 267 files: 213 in MVP-1, 31 in MVP-2 and 23 in MVP-3. The count assumes one file per page and per component and leaves out tests. Old leaderboard files are reworked or removed on top of this; the exact list needs a read of the current repo.

| Group | Folder | Total | MVP-1 | MVP-2 | MVP-3 | What |
| --- | --- | --- | --- | --- | --- | --- |
| Pages | `src/app/**/page.tsx` | 60 | 42 | 13 | 5 | One per page in Pages and components |
| Layouts | `layout.tsx` | 6 | 6 | 0 | 0 | Root (existing, changed), marketing, sign-in, brand, creator, admin |
| Loading and error screens | `loading.tsx`, `error.tsx`, `not-found.tsx` | 8 | 8 | 0 | 0 | Two per dashboard, plus site-wide error and not-found |
| Route Handlers | `src/app/api`, `src/app/auth` | 16 | 12 | 1 | 3 | 6 routes and 10 job routes |
| Proxy | `src/proxy.ts` | 1 | 1 | 0 | 0 | Session refresh and redirects |
| Components | `src/components` | 93 | 74 | 8 | 11 | See the components table |
| Server Actions | `src/server/actions` | 15 | 13 | 1 | 1 | One file per form area |
| Services | `src/server/services` | 18 | 14 | 3 | 1 | 15 modules and 3 helpers |
| Database schema | `src/server/db` | 13 | 12 | 1 | 0 | Client, index, status lists, 10 table files |
| Auth and Supabase clients | `src/server/auth`, `src/lib/supabase` | 5 | 5 | 0 | 0 | Session, guards, server, browser and service clients |
| Integrations | `src/server/integrations` | 7 | 5 | 2 | 0 | Payment interface and the chosen adapter, Instagram, storage, encryption; WhatsApp and email in MVP-2. A second payment adapter adds 1 |
| Job runner | `src/server/jobs` | 1 | 1 | 0 | 0 | Locking and run log shared by all jobs |
| Form validation | `src/lib/validation` | 6 | 6 | 0 | 0 | Sign-in, brand, bounty, creator, claim, admin |
| Shared lib and types | `src/lib` | 4 | 4 | 0 | 0 | Settings, pricing values, ₹ and IST formatting, shared types |
| Migrations | `supabase/migrations` | 10 | 6 | 2 | 2 | Tables, security rules, ledger trigger, cron schedules |
| Config | repo root, `supabase/` | 4 | 4 | 0 | 0 | `drizzle.config.ts`, `.env.example`, `config.toml`, `seed.sql` for admin accounts |
| **Total** |  | **267** | **213** | **31** | **23** |  |

```text
src/
  proxy.ts
  app/
    (marketing)/        24 public pages
    (auth)/             login, signup, verify, mfa
    brand/              13 pages
    creator/            8 pages
    admin/              11 pages
    auth/callback/      route.ts
    api/
      instagram/        connect, callback
      webhooks/payments/[provider]
      uploads/draft
      health
      jobs/             10 job routes
  components/           ui, layout, marketing, auth, bounty, claim,
                        results, profile, money, onboarding, admin, brand
  server/
    actions/  services/  db/  auth/  integrations/  jobs/
  lib/
    supabase/  validation/  env.ts  pricing.ts  format.ts  types.ts
supabase/
  migrations/  config.toml  seed.sql
```

## Open decisions and risks

Sixteen points need an answer before or during MVP-1; the first five change how claims, tracking and payouts are coded.

| # | Decision or risk | What it changes | Owner |
| --- | --- | --- | --- |
| 1 | What moves a bounty from Live or Slots full to Tracking? The Master Plan does not say; the posting deadline is the likely trigger | When late claims stop and when a bounty can be ranked | Om and Harsh |
| 2 | Reservation length: 48 hours, 72 hours, or set per bounty? | The claim timer and `reservation_hours` | Harsh |
| 3 | Instagram numbers can arrive up to 48 hours late. Take the final figure on day 7 (keeps the 7–8 day payout, may undercount) or after day 9 (counts fully, pays later than the decks promise)? | The payout promise in every deck | Om and Harsh |
| 4 | Meta's docs describe setting the Paid Partnership label when publishing through the API, not reading it back ([Meta](https://developers.facebook.com/blog/post/2026/04/22/instagram-api-updates-for-partnerships-metrics-collaboration-and-engagement/)). Keep the admin check per reel (current design), or let RedCup publish the approved draft for the creator, which also guarantees the posted reel matches the draft but needs the publishing permission in App Review | A manual step per reel, or a publishing feature | Om |
| 5 | "Account at least 90 days old": the API returns no creation date. Use the oldest post's date, or an admin check? | The Verified check | Harsh |
| 6 | Payment partner, and whether its product holds the money so "money never touches RedCup's account" stays true | Only the adapter changes in code; the decks' promise depends on it | Harsh |
| 7 | Brand fee 12% or 15%, creator commission 5% or 10%. Agency partners at 12% need a per-brand fee setting | Values in the settings file; one field on `brands` | Harsh |
| 8 | TDS rate and section | Payout math | Harsh with the CA |
| 9 | SMS or WhatsApp provider for login codes, and an email provider | Nobody can sign in without them | Om |
| 10 | One role per account means a person who is both creator and brand needs two phone numbers or emails. Acceptable? | The account model | Om and Harsh |
| 11 | Can a creator claim the same bounty more than once? The docs don't say | One uniqueness rule on claims | Harsh |
| 12 | A reel deleted before day 7: no pay, pay for views so far, or a fraud flag? | Settlement rule | Harsh |
| 13 | Earnings on boards (private by default), brand spend as range or exact, Featured slots sold or not | Board display | Harsh (still open in the Master Plan) |
| 14 | Supabase Pro ($25 a month) and a Vercel plan before launch | Running cost | Harsh |
| 15 | I have not read the current repo in this session; the old leaderboard files need a keep-or-delete pass | File count may shift | Om |
| 16 | MVP-1 is 213 files in about three weeks | Scope risk: the added admin screens can share components to cut files | Om |
