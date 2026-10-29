# RedCup design reference — red-family palette

Researched 2026-10-29 (IST). Screenshots target: `/workspace/om-app/artifacts/red/`.

## Brief
Full red-family redesign of RedCup. No pure `#FF0000` / default Tailwind red. Accessible CTAs. Errors distinguishable from brand red. Keep Guapd-adapted layout rhythm from prior pass; swap green system for red.

## Reference sites (red-led)

| Site | Source | Palette takeaway |
|------|--------|------------------|
| **RED Company** | Awwwards SOTD | Black / white / coral `#DF6C4F` — restrained 3-colour red |
| **Red Collar** | Awwwards SOTD | Black / white / `#D14836` — agency crimson, high energy |
| **Emotive Feels** | Awwwards SOTD | `#DF6C4F` + `#D14836` on white — warm coral pair |
| **Don Molinico** | Awwwards SOTD Apr 25 2026 | Bold food red `#D70321` — too pure for us; use deeper |
| **LearnType / Blaze Type** | CSSDA WOTD | Iconic red on minimal type-led layout |
| **Caín** | FWA of the Day + CSSDA | Burgundy dining atmosphere — refined, not candy red |
| **Awwwards /websites/red** | Gallery | Red as accent or field; white canvas + one decisive red |
| **Lapa / A1 Gallery red** | Godly-adjacent galleries | Red CTAs on light grounds; restraint over flood |

**Reject:** pure `#FF0000`, neon pink-red, green CTAs, generic emerald success matching brand.

## Final palette (contrast checked)

| Token | Hex | Role | Contrast |
|-------|-----|------|----------|
| `--ink` | `#1A1214` | Headlines / primary text | 16.6:1 on paper |
| `--paper` | `#F7F2F1` | Warm paper canvas | — |
| `--sheet` | `#FFFFFF` | Cards | — |
| `--frame` | `#F0E9E8` | App shell outer | — |
| `--line` | `#E0D5D3` | Borders | — |
| `--muted` | `#6B5A5C` | Secondary text | 6.5:1 on white |
| `--cta` | `#C23B3B` | **Primary CTA** (warm crimson) | 5.27:1 white on CTA (AA) |
| `--cta-ink` | `#FFFFFF` | Text on CTA | same |
| `--cup` | `#9B2D3A` | Brand cranberry (logo) | 7.42:1 on white |
| `--cup-deep` | `#6E1F2A` | Logo / hover deep | 10+:1 |
| `--blush` | `#F3E4E2` | Soft red-tinted bands / chips | — |
| `--wine` | `#8E2F3C` | Links / secondary emphasis | ~7:1 on white |
| `--ok` | `#1F6B4A` | Success (green — not brand red) | 6.4:1 |
| `--warn` | `#8A5B0A` | Warnings | — |
| `--bad` | `#7A1F2E` | Errors (oxblood, darker than cup/CTA) | 10.2:1 |

**Rules:** CTA = `--cta` with white label. Logo “Red” + cup mark = `--cup`. Errors = `--bad` (never reuse `--cta`). Success stays green `--ok`. Soft sections use `--blush`, not mint green.

## Layout keep
Pill nav/CTAs, numbered steps, brand/creator split, dark ink band, Manrope, modest type — from Guapd-adapted structure. Colour system only shifts to red family.
