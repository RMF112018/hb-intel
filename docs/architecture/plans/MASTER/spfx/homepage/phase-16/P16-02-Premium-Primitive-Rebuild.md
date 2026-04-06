# P16-02 — Shared Premium Primitive Rebuild — Closure Note

## What changed

Five new premium primitives were created using the Phase 16 dependency stack (cva, clsx, lucide-react, motion, @radix-ui). These primitives use CSS modules for styling, cva for typed variant composition, and real SVG icons — breaking the Fluent/Griffel pattern that trapped the homepage in enterprise-card styling.

## New Primitives

### 1. HbcPremiumSurface
**Replaces:** HbcHomepageSurfaceCard (mild card-weight variants)
**Uses:** cva + clsx + motion + CSS modules
**Variants:**
- `intent`: signature, command, editorial, operational, discovery — each with distinct background (gradients, tints), radius (10–16px), border treatment, and padding
- `elevation`: flat, raised, prominent — real depth via box-shadow
- `interactive`: boolean — motion-enhanced hover lift (y: -2px) via framer-motion

### 2. HbcPremiumIcon
**Replaces:** HbcHomepageIconFrame (Unicode characters in colored boxes)
**Uses:** cva + clsx + lucide-react + CSS modules
**Features:**
- Takes a `LucideIcon` component prop — renders real SVG icons
- Size variants: sm (28px), md (36px), lg (44px), xl (56px) with proportional icon sizing
- Tint variants: brand, warm, accent, neutral, subtle, danger, success — 7 purpose-built tints

### 3. HbcPremiumCta
**Replaces:** HbcHomepageCta (mild link/button/secondary variants)
**Uses:** cva + clsx + motion + lucide-react + CSS modules
**Features:**
- `variant`: primary (gradient-filled brand button with shadow), secondary (outlined), ghost (text-only), onDark (for gradient surfaces)
- `size`: sm, md, lg
- motion-enhanced hover (x: +2px when arrow is shown)
- Lucide ArrowRight/ExternalLink icons instead of Unicode arrows
- Gradient fills and box-shadows instead of flat brand-colored backgrounds

### 4. HbcPremiumBadge
**Replaces:** HbcStatusBadge (text-only pill badges)
**Uses:** cva + clsx + lucide-react + CSS modules
**Features:**
- `status`: success, warning, critical, info, pending, neutral
- Each status gets a paired lucide icon (CheckCircle2, AlertTriangle, AlertCircle, Info, Clock, Circle) — dual-channel encoding
- Size variants: sm, md

### 5. HbcPremiumSection
**Replaces:** HbcHomepageSectionShell (plain h2 with optional subtitle)
**Uses:** cva + clsx + lucide-react + @radix-ui/react-separator + CSS modules
**Features:**
- `accent`: brand, warm, neutral, danger — each with a lucide-icon-bearing header badge and gradient separator
- `icon` prop accepts a LucideIcon — rendered in a tinted 32px container in the header
- Radix Separator renders as a 2px gradient bar (fading from accent color to transparent)
- headerAction slot for trailing CTAs

## Exports

All five primitives and their types exported from `@hbc/ui-kit/homepage`:
- `HbcPremiumSurface`, `HbcPremiumSurfaceProps`, `SurfaceIntent`, `SurfaceElevation`
- `HbcPremiumIcon`, `HbcPremiumIconProps`, `PremiumIconSize`, `PremiumIconTint`
- `HbcPremiumCta`, `HbcPremiumCtaProps`, `PremiumCtaVariant`, `PremiumCtaSize`
- `HbcPremiumBadge`, `HbcPremiumBadgeProps`, `PremiumBadgeStatus`, `PremiumBadgeSize`
- `HbcPremiumSection`, `HbcPremiumSectionProps`, `PremiumSectionAccent`

Existing Phase 15 primitives remain exported for backward compatibility during migration.

## Files created

| File | Purpose |
|---|---|
| `packages/ui-kit/src/HbcPremiumSurface/index.tsx` | Surface component |
| `packages/ui-kit/src/HbcPremiumSurface/surface.module.css` | Surface styles |
| `packages/ui-kit/src/HbcPremiumSurface/surface.module.css.d.ts` | CSS type declarations |
| `packages/ui-kit/src/HbcPremiumIcon/index.tsx` | Icon component |
| `packages/ui-kit/src/HbcPremiumIcon/icon.module.css` | Icon styles |
| `packages/ui-kit/src/HbcPremiumIcon/icon.module.css.d.ts` | CSS type declarations |
| `packages/ui-kit/src/HbcPremiumCta/index.tsx` | CTA component |
| `packages/ui-kit/src/HbcPremiumCta/cta.module.css` | CTA styles |
| `packages/ui-kit/src/HbcPremiumCta/cta.module.css.d.ts` | CSS type declarations |
| `packages/ui-kit/src/HbcPremiumBadge/index.tsx` | Badge component |
| `packages/ui-kit/src/HbcPremiumBadge/badge.module.css` | Badge styles |
| `packages/ui-kit/src/HbcPremiumBadge/badge.module.css.d.ts` | CSS type declarations |
| `packages/ui-kit/src/HbcPremiumSection/index.tsx` | Section component |
| `packages/ui-kit/src/HbcPremiumSection/section.module.css` | Section styles |
| `packages/ui-kit/src/HbcPremiumSection/section.module.css.d.ts` | CSS type declarations |

## Dependency usage per primitive

| Primitive | cva | clsx | lucide-react | motion | @radix-ui |
|---|---|---|---|---|---|
| HbcPremiumSurface | ✓ | ✓ | — | ✓ (hover lift) | — |
| HbcPremiumIcon | ✓ | ✓ | ✓ (icon prop) | — | — |
| HbcPremiumCta | ✓ | ✓ | ✓ (ArrowRight, ExternalLink) | ✓ (hover x-shift) | — |
| HbcPremiumBadge | ✓ | ✓ | ✓ (status icons) | — | — |
| HbcPremiumSection | ✓ | ✓ | ✓ (icon prop) | — | ✓ (Separator) |

## Verification

- `@hbc/ui-kit` check-types: pass, build: pass
- `@hbc/spfx-hb-webparts` check-types: pass, build: pass (347 KB JS — no regression, new primitives are tree-shaken since not yet consumed), lint: pass
- `@hbc/spfx-hb-shell-extension` check-types: pass, build: pass (147 KB JS), test: 29/29 pass
