# Phase B-02 — Shared UI-Kit Top-Band Primitives

## Status: Complete

## Objective

Implement the shared `@hbc/ui-kit` additions and refinements needed to support a premium homepage top band for the welcome header and hero banner redesigns.

---

## Implementation Summary

Three scoped additions to the shared kit, all additive and non-breaking:

### 1. `HbcHomepageEyebrow` (new component)

Editorial kicker/metadata primitive for above headings. Establishes visual hierarchy by rendering small, uppercase, letter-spaced text above headline elements.

- **File:** `packages/ui-kit/src/HbcHomepageEyebrow/index.tsx`
- **Types:** `packages/ui-kit/src/HbcHomepageEyebrow/types.ts`
- **Tone variants:** `'default'` (neutral foreground), `'muted'` (reduced-emphasis), `'on-dark'` (white for gradient surfaces)
- **Usage:** Welcome header (time context), hero banner (editorial category)
- **Accessibility:** Inherits label typography scale, sufficient contrast in all tone variants

### 2. `HbcHomepageCta` — `size` prop (refinement)

Added `size?: 'default' | 'large'` prop to support hero-level CTA prominence without breaking existing consumers.

- **`'default'`** — unchanged padding (8px / 16px), standard font size, `HBC_RADIUS_MD`
- **`'large'`** — increased padding (16px / 24px), 0.9375rem font size, `HBC_RADIUS_LG`
- **Data attribute:** `data-hbc-cta-size` for testing/debugging
- **Non-breaking:** Defaults to `'default'`, all existing call sites unchanged

### 3. `HomepageSurfaceClass` — `'welcome'` surface (refinement)

Added `'welcome'` to the `HomepageSurfaceClass` type union and handled it in `HbcHomepageSurfaceCard`.

- **Weight:** `'primary'` (same as hero)
- **Visual treatment:** 4px solid left brand border (distinct from hero's 3px bottom border)
- **Purpose:** Differentiates the welcome greeting surface from the hero editorial surface at the shared primitive level
- **Non-breaking:** Existing `surface="hero"` consumers for the welcome header can migrate to `surface="welcome"` in Prompt 03

---

## Files Changed

| File | Change |
|------|--------|
| `packages/ui-kit/src/HbcHomepageEyebrow/index.tsx` | **New** — editorial eyebrow component |
| `packages/ui-kit/src/HbcHomepageEyebrow/types.ts` | **New** — eyebrow types |
| `packages/ui-kit/src/HbcHomepageCta/index.tsx` | **Modified** — added `size` prop, `large` style class |
| `packages/ui-kit/src/HbcHomepageCta/types.ts` | **Modified** — added `HomepageCtaSize` type, `size` prop |
| `packages/ui-kit/src/HbcHomepageSurfaceCard/index.tsx` | **Modified** — added `welcome` to weight map and styles |
| `packages/ui-kit/src/homepage.ts` | **Modified** — added `welcome` to `HomepageSurfaceClass`, added `HbcHomepageEyebrow` exports, added `HomepageCtaSize` type export, added `HbcHomepageEyebrow` to `HomepagePrimitiveName` |
| `packages/ui-kit/package.json` | **Modified** — version 2.5.0 → 2.5.1 |

---

## Key Decisions

1. **One new component, two refinements.** `HbcHomepageEyebrow` is the only new component — both the CTA and surface card additions are additive refinements to existing primitives.
2. **No CTA pair component.** Primary + secondary CTA layout is trivially expressed inline. A dedicated component would be premature abstraction.
3. **Welcome surface uses left border, hero uses bottom border.** This creates visual differentiation at the primitive level without requiring the components to manage their own accent borders.
4. **Large CTA uses `HBC_RADIUS_LG` (6px) instead of `HBC_RADIUS_MD` (4px).** Slightly more rounded at larger size maintains visual proportion.
5. **Eyebrow tone `'on-dark'` uses `rgba(255,255,255,0.85)`.** Slightly muted white rather than pure white — more premium, still exceeds 4.5:1 contrast on the brand gradient background.

## Assumptions

1. Prompt 03 (welcome header redesign) will migrate from `surface="hero"` to `surface="welcome"`.
2. Prompt 04 (hero banner redesign) will use `size="large"` on the primary CTA and `HbcHomepageEyebrow` with `tone="on-dark"`.
3. Existing consumers of `HbcHomepageCta` are not affected — `size` defaults to `'default'`.
4. Existing consumers of `HbcHomepageSurfaceCard` are not affected — no existing call site uses `surface="welcome"`.

## Open Issues

None.

## Acceptance Evidence

- [x] New `HbcHomepageEyebrow` primitive created with three tone variants
- [x] `HbcHomepageCta` enhanced with `size` prop (`'default'` | `'large'`)
- [x] `HomepageSurfaceClass` extended with `'welcome'` surface
- [x] `HbcHomepageSurfaceCard` handles `welcome` with distinct left-border treatment
- [x] All additions are additive — no existing consumer behavior changed
- [x] Homepage barrel exports updated with new component, types, and registry entry
- [x] Accessibility: eyebrow uses label typography, focus-visible on CTA preserved, reduced-motion on CTA preserved
- [x] Version bumped from 2.5.0 to 2.5.1
