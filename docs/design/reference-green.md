# RedCup design reference — Guapd-adapted green + cranberry

Researched 2026-10-28 / 2026-10-29 (IST). Screenshots under `/workspace/om-app/artifacts/green/guapd/` and `awwwards/`.

## Brief
Redesign RedCup marketing + brand/creator/admin dashboards. Creator-led. Learn from Guapd patterns; do not copy assets, logo, or copy. Keep Taste Skill + elayadesign rules. Modest type. No AI-slop gradients/blobs. No fake stats.

## Guapd study (primary reference)
**Pages captured:** home, /brands, /creators, /signup/brand, careers, terms, privacy, login.

### Patterns to adapt (not clone)
1. **White / near-white canvas** with quiet body slate, near-black headlines.
2. **Pill navigation** (full radius) with quiet text links + one loud primary CTA.
3. **Primary CTA strength:** solid high-contrast pill — Guapd uses acid lime `#E8FF66` on ink, or solid ink pills. Buttons feel heavier (pad ~12×24, weight 700, radius 999).
4. **Product-in-product cards:** framed UI fragments showing deal/bounty steps, not stock photography.
5. **Audience split:** clear For brands / For creators panels with equal weight.
6. **Numbered steps (01–04):** Offer → Agree → Deliver → Paid rhythm; for RedCup: Fund → Apply → Award → Verify.
7. **Soft tinted bands** (Guapd mint/cream panels `#F3F4EE`, `#E9F7F0`) between white sections — flat colour, no gradients.
8. **Dark ink band** mid or late page for contrast break; lime/light type on ink.
9. **FAQ + final CTA** close the page; modest type, lots of air.
10. **Motion:** short fade/rise on section enter only; no blob animation. Respect reduced motion.

### Guapd tokens observed
- Body bg `#FFFFFF`; ink `#12151C`; muted slate ~`#4A4F58` / `#334155`
- Accent lime `#E8FF66`; soft greens `#E9F7F0`, `#EFFAF5`, `#F7FFE8`
- Display: Schibsted Grotesk; UI: Inter (we will **not** use Inter — Elaya bans it)
- Pill radius `999px` on nav shell and CTAs

## Award-site colour / CTA notes
| Source | Takeaway |
|--------|----------|
| **Vaayu** (Awwwards) | Chartreuse `#D7FF00` as sole loud accent — CTA areas punch hard against grey canvas |
| **Brandon Yasin** SOTD Oct 24 2026 | Olive `#505B44` + deep `#2C2922` — premium green family without generic emerald |
| **FORMAT / Signal-A** | Extreme B/W contrast; CTA clarity from weight + size, not rainbow |
| **Awwwards SOTD list Oct 2026** | Current winners favour restrained palettes + one decisive accent |

## Reference lock
**Primary:** Guapd layout rhythm + CTA weight + product-card demos.  
**Preserve:** white/mint canvas, pill CTAs, numbered steps, brand/creator split, modest body type, flat soft section tints, dark band break.  
**Borrow:** Vaayu/Brandon chartreuse-olive discipline (one green family, not emerald Tailwind).  
**Brand red:** RedCup name → refined cranberry accent only (logo + rare marks). Never pure `#FF0000` / default Tailwind red.  
**Reject:** indigo/violet, cream+serif editorial autopilot, gradient blobs, glassmorphism overload, fake metric walls, Inter font.

## Final palette (contrast checked)

| Token | Hex | Role | Contrast notes |
|-------|-----|------|----------------|
| `--ink` | `#121A16` | Headlines, primary text | 16.4:1 on paper, 17.7:1 on white |
| `--paper` | `#F5F7F2` | Page canvas (cool mint paper) | — |
| `--sheet` | `#FFFFFF` | Cards, sheets | — |
| `--frame` | `#EEF2EB` | App shell outer frame | — |
| `--line` | `#D5DDD4` | Borders | — |
| `--muted` | `#5C6A60` | Secondary text | 5.7:1 on white (AA) |
| `--cta` | `#C6EF3A` | **Primary CTA fill** (chartreuse green) | 13.3:1 with ink |
| `--cta-ink` | `#121A16` | Text on CTA | same |
| `--leaf` | `#1B6B48` | Links, success, secondary solid btn | 6.5:1 on white |
| `--mint` | `#E8F3E9` | Soft section / chip surface | — |
| `--cup` | `#9C3040` | **RedCup brand accent** (cranberry) — logo mark, rare chips | 7.2:1 on white (AA+) |
| `--cup-deep` | `#6F2230` | Hover / dark cranberry | 10.8:1 on white |
| `--ok` | `#1B6B48` | Success | = leaf |
| `--warn` | `#7A550E` | Warnings / TEST MODE | — |
| `--bad` | `#9C3040` | Errors (same cranberry family, not pure red) | — |

**Usage rule:** Green (`--cta` / `--leaf` / `--mint`) carries product and creator energy. Cranberry (`--cup`) appears on the wordmark cup glyph / “Red” emphasis and sparse status accents only — never as the default primary button fill.

## Type
- **Manrope** (Elaya/Taste: Geist or Manrope; no Inter, no IBM Plex for this pass).
- Modest scale: body 15–16px; h1 clamp ≤ ~36px (`text-3xl`/`text-4xl` max on marketing); dashboard titles smaller.
- `text-wrap: balance` on headings; no decorative italic word swaps.

## Component rules
- **Primary button:** `--cta` fill, `--ink` text, radius 999, weight 700, min-height 44–52px — stronger than old red cups.
- **Secondary:** ink outline pill or ghost on paper.
- **Cards:** white, 1px `--line`, radius 16px, soft shadow only when interactive; no card sprawl.
- **Nav:** floating or bottom-borderless row; marketing CTA = chartreuse pill.
- **Logo:** “RedCup” with cranberry cup mark or “Red” in `--cup`, “Cup” in `--ink`.
- **Dashboards:** mint `--frame` outer, white sheet, left nav as quiet pills; active nav uses mint + leaf text.
- **No** background gradients, blobs, or fake leaderboard numbers.

## Decision ledger
| Decision | Source | Why |
|----------|--------|-----|
| Chartreuse CTA `#C6EF3A` | Guapd lime + Vaayu chartreuse | Stronger CTAs; green family; not emerald |
| Cranberry `#9C3040` brand | User + RedCup name | Non-pure red, AA contrast, sparse use |
| Cool mint paper | Guapd soft greens + Brandon olive calm | Creator feel without cream editorial slop |
| Pill CTAs / nav | Guapd | Signature pattern to adapt |
| Manrope | Elaya B1 | Allowed sans; replaces Plex/Inter |
| Numbered 4-step + audience split | Guapd how-it-works | Clear product story without fake stats |
| Flat mint bands / ink band | Guapd section rhythm | Depth without gradients |

## Screens researched
- Guapd: see `artifacts/green/guapd/*.png`
- Awards: Vaayu, Brandon Yasin, Awwwards SOTD index (`artifacts/green/awwwards/`)
- RedCup before: `artifacts/green/before/`
