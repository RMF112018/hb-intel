# Project Spotlight — Big UI Remediation Output

**Date:** 2026-04-06
**Status:** Complete

---

## 1. Design audit summary — what made the old surface flat

The old surface was a **white-background card with polite borders and restrained shadows** — the exact "thin-border white-card safety-zone" pattern the doctrine explicitly prohibits for flagship surfaces. Specific problems:

- **White `#ffffff` background** blended into the SharePoint canvas, making the surface invisible
- **Light gray borders** (`rgba(0,0,0,0.06)`) with minimal shadow created no depth authority
- **`#1a1a1a` text** on white was functional but lacked editorial drama
- **52% image zone** was too balanced — not assertive enough for a flagship
- **1.75rem title** was readable but not flagship-scale
- **Rail at 28%** with white background and subtle separators read as stacked list rows
- **Warm accent palette** was present but muted on white — no contrast authority
- **Overall posture**: safe enterprise card instead of editorial spotlight

---

## 2. Structural rebuild summary

### Core structural change: dark editorial surface

The single biggest change is replacing the white-card model with a **deep charcoal editorial surface** (`hsl(220, 14%, 12%)`). This:
- Creates immediate visual authority on the SharePoint canvas
- Makes the warm orange accent dramatically more visible
- Enables white-on-dark typography with natural hierarchy
- Makes the surface impossible to overlook
- Is structurally non-generic — no thin-border white-card pattern remains

### Composition model changes

| Element | Before | After |
|---------|--------|-------|
| Root background | `#ffffff` | `hsl(220, 14%, 12%)` deep charcoal |
| Root shadow | `0 1px 4px 0.07, 0 4px 16px 0.05` | `0 2px 8px 0.18, 0 8px 32px 0.14` |
| Root border | 4 thin borders with warm accent left | Single warm accent left border only |
| Text color | `#1a1a1a` | `rgba(255,255,255,0.95)` white hierarchy |
| Header | `1rem` title, black text | `0.8125rem` uppercase accent-colored section label |
| Separator | Warm gradient on white | Accent gradient on dark |
| Featured wrapper | 68% | 70% |
| Image zone | 52%, 320px min | 56%, 380px min — more dominant |
| Image background | `rgba(0,0,0,0.025)` | `hsl(220,12%,8%)` deep |
| Image scrim | `0.28` opacity, 65% | `0.55` opacity, full coverage — stronger |
| Content zone | 48%, 12px gap | 44%, 14px gap — more breathing room |
| Title | `1.75rem`, -0.03em | `2rem`, -0.035em — flagship scale |
| Headline color | `rgba(26,26,26,0.72)` | `rgba(255,255,255,0.70)` |
| Summary color | `rgba(26,26,26,0.50)` | `rgba(255,255,255,0.45)` |
| Metadata icons | 0.5 opacity, inherited | 0.6 opacity, warm accent color |
| Rail background | White (same as root) | `hsl(220,12%,16%)` raised dark |
| Rail border | Warm subtle separator | `rgba(255,255,255,0.08)` |
| Rail tile hover | Warm tint + shadow | Dark hover bg + 2px translateX slide |
| Rail thumbnails | 80×60, image radius | 88×66, card radius — larger gallery |
| Rail title color | `#1a1a1a` | `rgba(255,255,255,0.95)` |
| Rail header color | `rgba(26,26,26,0.36)` | `rgba(255,255,255,0.32)` |
| Team strip bg | `rgba(229,126,70,0.03)` | `rgba(255,255,255,0.04)` |
| Avatar border | White ring | Dark bg ring with white glow |
| Initials style | Blue tint | Warm accent tint |
| Featured motion | y:8, 0.4s ease | y:12, 0.5s expo out |
| Rail motion | opacity only | opacity + x:8 slide, expo out |
| Flyout shadow | `0 6px 20px 0.10` | `0 8px 32px 0.24` — stronger on dark |

---

## 3. Files changed

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | Full visual rebuild: dark palette, upgraded typography, enlarged image zone, premium rail, refined motion, dark-surface team strip. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | Version bumped to `0.0.10.0`. |

---

## 4. Premium-stack usage summary

| Package | Usage | Justification |
|---------|-------|---------------|
| `motion` (framer-motion) | Featured reveal (y:12 → 0), rail slide (x:8 → 0), bottom-sheet | Flagship entry animation with expo-out easing — visibly premium, restrained |
| `lucide-react` | Calendar, CheckCircle2, Users icons | Premium metadata and team iconography — already in use, no change |

No new packages added. The visual transformation is achieved through structural palette and composition changes, not through dependency additions.

---

## 5. Validation evidence

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4352 modules, 474.93 kB |
| Dark surface renders | Root bg `hsl(220,14%,12%)`, white text, accent left border — non-generic |
| Image dominance | 56% zone, 380px minHeight, stronger scrim — flagship authority |
| Title scale | 2rem desktop, -0.035em tracking — editorial, not dashboard |
| Rail gallery feel | Raised dark background, 88×66 thumbnails, slide hover, accent metadata |
| Authoring safety | Empty/loading/error states unchanged, runtime resilience preserved |
| No unrelated changes | No data model, list integration, CTA architecture, or shell changes |

---

## 6. Residual risk note

- The dark surface is a **material departure** from the previous white-card model. If SharePoint page authors place this webpart in a page section with a dark background, contrast may need section-level awareness in a future pass.
- Team flyout popover remains white (intentional — light overlay on dark parent) but the shadow was strengthened to ensure it reads as a distinct overlay layer.
- The dark palette values are inline constants. If other homepage webparts adopt dark surfaces in the future, these should be promoted to shared homepage tokens.
