# Project Spotlight — Featured Hero Hierarchy and Typography Polish Output

**Phase:** P06-04 — Featured hero hierarchy and typography polish
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Files changed

| File | Action | Purpose |
|------|--------|---------|
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | **Modified** | Upgraded featured/rail balance, image zone proportions, typography scale, surface depth, spacing rhythm, and motion. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | **Modified** | Version bumped to `0.0.4.0`. |

---

## 2. Before/after design summary

### A. Desktop hierarchy — 62/33 → 68/28

| Property | Before | After |
|----------|--------|-------|
| Featured wrapper flex | `1 1 62%` | `1 1 68%` |
| Featured minWidth | 400px | 420px |
| Rail wrapper flex | `1 1 33%` | `1 1 28%` |
| Rail minWidth | 240px | 220px |

The featured surface now occupies approximately 70% of the composition, establishing clear editorial dominance over the supporting rail.

### B. Featured image dominance

| Property | Before | After |
|----------|--------|-------|
| Desktop image zone flex | `0 0 48%` | `0 0 52%` |
| Desktop minHeight | 280px | 320px |
| Tablet image zone flex | `0 0 40%` | `0 0 44%` |
| Tablet minHeight | 240px | 280px |
| Mobile minHeight | 200px | 220px |
| Mobile maxHeight | 240px | 280px |
| Scrim gradient | `rgba(0,0,0,0.22)` to 60% | `rgba(0,0,0,0.28)` to 65% |
| Placeholder minHeight | 200/280 | 220/320 |
| Placeholder text | 0.75rem | 0.6875rem (quieter, more refined) |

The image zone is now the dominant visual anchor at all breakpoints. The scrim is strengthened for better readability if content overlays image edges.

### C. Typography hierarchy

| Element | Before | After | Effect |
|---------|--------|-------|--------|
| Section heading | 0.9375rem, -0.01em | 1rem, -0.015em | Stronger presence as section anchor |
| Featured title | 1.5rem / 1.25rem mobile, -0.025em | 1.75rem / 1.375rem mobile, -0.03em, lineHeight 1.12 | Clear flagship authority, tighter for editorial density |
| Highlight headline | 0.9375rem, color 0.78α | 1rem, color 0.72α, lineHeight 1.55, maxWidth 40ch | Clearer secondary line, slightly quieter to separate from title |
| Summary | 0.8125rem, color 0.55α, maxWidth 48ch | 0.8125rem, color 0.50α, lineHeight 1.65, maxWidth 50ch | Slightly quieter to reduce competition, better reading rhythm |

### D. Surface treatment

| Property | Before | After |
|----------|--------|-------|
| Border radius | `HP_RADIUS.editorial` (10px) | `HP_RADIUS.signature` (12px) |
| Box shadow | `0 1px 3px 0.06, 0 2px 8px 0.04` | `0 1px 4px 0.07, 0 4px 16px 0.05` |
| Content zone gap (desktop) | 10px | 12px |
| Content zone padding (desktop) | 24px | 28px 28px 32px |
| Content zone padding (tablet) | 24px | 24px 24px 28px |
| Content zone padding (mobile) | 16px | 16px 16px 20px |

Stronger depth shadow and signature-grade radius elevate the surface. Wider content gap and extra bottom padding give the composition breathing room.

### E. Motion refinement

| Property | Before | After |
|----------|--------|-------|
| Featured initial y offset | 6px | 8px |
| Featured transition duration | 0.35s | 0.4s |

Slightly more deliberate reveal for the flagship surface without over-animating.

---

## 3. Validation

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4351 modules, 473.39 kB |
| Featured dominance | 68/28 desktop split + 52% image zone creates clear editorial hierarchy at all breakpoints |
| Tablet hierarchy | 44% image zone with 280px minHeight ensures featured image remains dominant in single-column layout |
| No dashboard drift | Title at 1.75rem with 1.12 line-height, strong image proportion, and restrained metadata maintain story-module identity |
