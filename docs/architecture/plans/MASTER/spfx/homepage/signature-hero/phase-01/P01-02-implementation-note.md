# P01-02 Implementation Note — Rebuild Flagship Hero From Zero

**Prompt:** `Prompt-02-Rebuild-Flagship-Hero-From-Zero.md`
**Date:** 2026-04-06
**Version:** 1.0.0.67

## What Was Built

A complete structural rebuild of the HbSignatureHero component. No code from the prior implementation was carried forward — the markup, CSS module, class vocabulary, and motion choreography are entirely new.

## Composition Model

The new hero is a premium identity plate with asymmetric left-anchored content:

- **Surface**: CSS Grid, full-width, `380px` min-height, `border-radius: 20px`
- **Content column**: capped at `56%` width on desktop, creating deliberate negative space on the right
- **Vertical flow**: brand lockup at top, tagline + greeting anchored at bottom via `justify-content: space-between`
- **Background**: simplified to three layers — authored photo (optional), readability scrim, material grain

### Key Structural Differences from Prior Version

| Aspect | Prior (Phase 18-04) | New (Phase 01-02) |
|--------|--------------------|--------------------|
| Min-height | 340px | 380px |
| Content max-width | 640px (fixed) | 56% (proportional) |
| Background layers | 5 (image, scrim, vignette, warm shift, edge highlight, grain) | 3 (photo, scrim, grain) |
| Tagline size | 2.75rem | 3.5rem |
| Logo height | 22px, 0.70 opacity | 18px, 0.55 opacity |
| Brand label | 0.6875rem, 0.58 opacity | 0.625rem, 0.45 opacity |
| Greeting prefix | 1rem, 0.62 opacity | 0.9375rem, 0.55 opacity |
| Greeting name | 1.75rem bold | 1.625rem semibold |
| Breakpoints | 1 (640px) | 2 (768px tablet, 480px phone) |
| Ambient decorations | Vignette + warm shift + edge highlight | None (clean surface) |
| CSS class vocabulary | Entirely different | Entirely different |
| Scrim direction | 180deg (top-to-bottom) | 170deg (diagonal, heavier at bottom) |
| Base color | hsl(220 12% 13%) | hsl(220 12% 11%) (darker) |
| Grain blend mode | Normal (0.035 opacity) | Overlay (0.032 opacity) |

## Visual Hierarchy

1. **Tagline** (3.5rem, weight 800) — dominant typographic statement, sets emotional tone
2. **Greeting name** (1.625rem, weight 600) — warm personal address, clearly subordinate
3. **Greeting prefix** (0.9375rem, weight 400, 0.55 opacity) — time-of-day context, whisper
4. **Brand lockup** (18px logo + 0.625rem label) — subtle top anchor, supports without overwhelming

## Background Strategy

- **Charcoal field**: `hsl(220 12% 11%)` — slightly darker than prior version for stronger contrast
- **Grain texture**: SVG fractal noise at `0.032` opacity with `mix-blend-mode: overlay` for richer surface interaction
- **Scrim**: 170deg diagonal gradient, heavier at bottom where text lives (0.82 opacity) and lighter at top (0.40) to let authored photography breathe
- **No vignette, warm shift, or edge highlight** — the prior ambient layer stack was decorative complexity without commensurate visual payoff

## Responsive Behavior

- **Desktop** (>768px): `56%` content width, `3.5rem` tagline, `2.5rem / 3.5rem` padding
- **Tablet** (≤768px): `72%` content width, `2.75rem` tagline, `2rem / 2.5rem` padding
- **Phone** (≤480px): `100%` content width, `2.125rem` tagline, `300px` min-height, compact padding

## Files Changed

- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx` — complete rewrite
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css` — complete rewrite
- `apps/hb-webparts/src/webparts/hbSignatureHero/signature-hero.module.css.d.ts` — updated to match new class vocabulary
- `tools/spfx-shell/config/package-solution.json` — version bump to `1.0.0.67`

## Files NOT Changed

- `index.ts` — export signature unchanged (`HbSignatureHero`, `HbSignatureHeroProps`)
- `HbSignatureHeroWebPart.manifest.json` — cleaned in P01-01, no further changes needed
- Helper functions (`welcomeMessage.ts`, `identity.ts`, `greeting.ts`) — reused as-is

## Validation

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| `eslint src/` | Pass |
| `vite build` | Pass (452.24 KB JS / 20.17 KB CSS — both decreased from prior) |
| `vitest run` | 13 pre-existing failures — none introduced by this change |
