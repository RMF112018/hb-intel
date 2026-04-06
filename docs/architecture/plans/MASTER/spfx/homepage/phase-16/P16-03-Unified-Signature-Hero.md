# P16-03 — Unified Signature Hero — Closure Note

## What changed

The two-panel top band (PersonalizedWelcomeHeader + HbHeroBanner side by side) was replaced with a single `HbSignatureHero` component that integrates the personalized greeting directly inside a full-width premium hero surface using motion reveal choreography, lucide icon accents, and CSS module styling.

## Perception change

### Before
- Welcome and hero were two adjacent flex columns inside a shared container
- The greeting sat in a left panel with a gradient accent bar
- The hero sat in a right panel with its own gradient background
- Two separate visual languages sharing one wrapper
- No motion — static render

### After
- ONE unified gradient surface with layered ambient glow effects
- Greeting and headline live in a two-column layout inside the same hero gradient
- Name rendered at 2.25rem/800 weight with text-shadow — dominant personalization
- Headline at 1.75rem/700 — clear hierarchy below the name
- Primary CTA is a white/brand inverted button with box-shadow (not gradient-on-gradient)
- Lucide ArrowRight/ExternalLink icons in CTAs (not Unicode arrows)
- Lucide Calendar icon in context line, AlertTriangle in alert chip
- Alert rendered as a translucent pill chip (not a bordered box)
- HbcPremiumBadge for alert status (lucide icon + label)
- Motion reveal choreography: four staggered content regions (0ms, 100ms, 200ms, 300ms) with fade+slide-up animation
- Motion hover/tap on primary CTA (scale 1.02/0.98)
- Ambient glow: two radial-gradient decorative circles (warm top-right, cool bottom-left) + edge highlight strip
- Brand lockup and eyebrow in top row (eyebrow in pill border)

## Architecture change

### New component
`apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- Takes unified props: `identity`, `welcomeConfig`, `heroConfig`, `now`
- Internally normalizes both welcome and hero configs
- Renders one `<section>` with gradient background, ambient layer, and content layer
- All P16 dependencies consumed via `@hbc/ui-kit/homepage` re-exports

### New CSS module
`apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css`
- 280+ lines of purpose-built hero styling
- No Fluent, no Griffel, no inline-style objects
- Responsive flex-wrap layout (greeting column: 240px min, editorial column: 360px min)
- Reduced-motion blanket on CTA transitions

### Composition update
`ReferenceHomepageComposition.tsx` updated to use `HbSignatureHero` instead of `HomepageTopBandPair` + separate welcome/hero components.

### Homepage entrypoint update
`packages/ui-kit/src/homepage.ts` — added re-exports for P16 dependencies:
- `motion`, `AnimatePresence` from `motion/react`
- `clsx` from `clsx`
- `cva`, `VariantProps` from `class-variance-authority`
- 24 curated lucide icons + `LucideIcon` type

This allows webparts to consume P16 dependencies through the governed `@hbc/ui-kit/homepage` entrypoint without needing direct package.json dependencies.

### Preserved components
`PersonalizedWelcomeHeader` and `HbHeroBanner` remain in the codebase for backward compatibility. The `HomepageTopBandPair` remains available but is no longer used in the composition reference.

## Bundle impact

- Before: 347 KB JS (P16-02)
- After: 483 KB JS (+136 KB from motion and lucide-react tree-shaken in)
- CSS: 1.66 KB → 6.42 KB (+4.76 KB from signature-hero.module.css + premium primitive CSS)
- Within the 800 KB warning threshold

## Verification

- `@hbc/ui-kit` check-types: pass, build: pass
- `@hbc/spfx-hb-webparts` check-types: pass, build: pass (483 KB JS, 6.42 KB CSS), lint: pass
