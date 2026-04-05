# Phase B-03 — Personalized Welcome Header Redesign

## Status: Complete

## Objective

Rebuild the Personalized Welcome Header into a stronger, more personal, more premium signature welcome surface using the Phase B shared top-band primitives.

---

## Implementation Summary

The welcome header is transformed from a generic card with flat text hierarchy into a signature greeting surface with clear editorial structure:

### Before
- `surface="hero"` (shared visual treatment with hero banner)
- Inline 4px left border (manually applied)
- Flat greeting heading at 1.5rem
- Support/context lines with inline body typography
- Basic alert section with minimal visual separation

### After
- `surface="welcome"` (distinct 4px left brand-accent from shared primitive)
- `HbcHomepageEyebrow` with `tone="muted"` establishing "HB Central" brand context
- Split greeting hierarchy: prefix at 1.125rem/400wt (e.g., "Good morning,") and name at 1.75rem/700wt (e.g., "Avery.") — creates dramatic visual hierarchy while preserving the full `h2` accessible name
- Cleaner support/context line separation with explicit font sizing
- Stronger alert section with subtle brand-tinted background (`rgba(34, 83, 145, 0.04)`) and rounded container

### Key visual improvements
1. **Greeting dominance** — the user's name is the largest, boldest element; the time-of-day greeting is lighter and smaller above it
2. **Brand signal** — `HbcHomepageEyebrow` with "HB Central" identifies the surface editorially
3. **Surface differentiation** — `surface="welcome"` gets a 4px left brand-accent border instead of the hero's 3px bottom border, creating clear visual identity
4. **Alert prominence** — tinted container with border-radius visually separates alert content from the greeting flow
5. **Removed unused imports** — `HBC_HOMEPAGE_BRAND_FOUNDATION`, `HBC_HOMEPAGE_TYPOGRAPHY`, and `hpGreetingHeading` are no longer needed

---

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.tsx` | **Modified** — rebuilt with split greeting hierarchy, HbcHomepageEyebrow, surface="welcome", stronger alert container |
| `apps/hb-webparts/package.json` | **Modified** — version 0.0.1 → 0.0.2 |
| `docs/architecture/plans/MASTER/spfx/homepage/phase-12/Phase-B-03-Personalized-Welcome-Header-Redesign.md` | **New** — implementation documentation |

---

## Key Decisions

1. **Split greeting into prefix + name** rather than changing the h2 structure. The h2 contains both spans, so its accessible name remains `"Good morning, Avery."` — all existing tests pass unchanged.
2. **Eyebrow says "HB Central"** rather than repeating the time-of-day context (which is already in the greeting prefix). This identifies the surface and reinforces the brand.
3. **Greeting prefix uses 400 weight / 1.125rem** while the name uses 700 weight / 1.75rem. This creates a 1.55x size ratio between prefix and name — enough for clear hierarchy without being theatrical.
4. **Alert container uses `rgba(34, 83, 145, 0.04)`** — the same brand blue at very low opacity, creating a subtle tinted surface without competing with the greeting.
5. **Removed inline left-border** — the `surface="welcome"` class on `HbcHomepageSurfaceCard` now provides the 4px left brand accent automatically.

## Assumptions

1. The `HbcHomepageEyebrow` component from Prompt 02 is available at `@hbc/ui-kit/homepage`.
2. The `surface="welcome"` variant on `HbcHomepageSurfaceCard` is available from Prompt 02.
3. The greeting resolution logic (`resolveWelcomeMessage`) is stable and does not need changes.
4. SharePoint canvas provides at least 280px for the welcome header column (matches existing `HP_LAYOUT.welcomeMinWidth`).

## Open Issues

None.

## Acceptance Evidence

- [x] Welcome header has materially stronger presence — split greeting with 1.75rem bold name
- [x] Greeting reads as personal and intentional — time-of-day prefix + bold first name
- [x] Supporting/context content is better organized — explicit font sizing, clear vertical rhythm
- [x] Surface no longer reads like a generic card — distinct welcome surface class + eyebrow + dramatic hierarchy
- [x] Accessibility preserved — h2 accessible name unchanged, role="status" for alerts, semantic heading order maintained
- [x] Responsive behavior preserved — grid layout with gap, no fixed widths
- [x] All 72 tests pass (including existing welcome header test)
- [x] check-types clean, lint clean, build clean (272 kB JS)
