# P05 — Hardening Note: States, Sparse Data, and Authoring Resilience

**Date:** 2026-04-07
**Phase:** 11 / P05 — States, Sparse Data, and Authoring Hardening
**Version:** 0.0.15

---

## Tested States and Resulting Behavior

All 12 scenarios from the P01 State Matrix were audited against the rebuilt component:

| # | Scenario | Result |
|---|----------|--------|
| 1 | No data at all | Module-level `HomepageEmptyState` with authoring guidance |
| 2 | One kudos only | Kudos spotlight renders as module hero; generous padding reads as editorial restraint |
| 3 | One announcement only | Single compact card under module header; no empty chrome |
| 4 | Celebrations only | Avatar strip renders alone; no stub appearance |
| 5 | One announcement + no kudos | Announcements lead (Kudos suppressed); separator-free single region |
| 6 | One kudos + no announcements | Kudos spotlight leads; clean single region |
| 7 | Healthy all regions | Full focal sequence: Kudos → Announcements → Celebrations with separator rhythm |
| 8 | Sparse kudos + healthy rest | Spotlight only in Kudos (no recent section); other regions normal |
| 9 | Loading | Module-level `HomepageLoadingState` with ARIA `role="status"` |
| 10 | Invalid config | Try/catch fallback to `HomepageEmptyState`; console-safe |
| 11 | Edit mode | Normal rendering; no edit-mode-specific UI; SharePoint edit chrome wraps cleanly |
| 12 | Narrow responsive stress | Emergency compression below 280px: media hidden, avatars shrink to 24px, badges hidden, strip items narrowed |

---

## Hardening Changes

### 1. Emergency Compression (<280px)

Added `useNarrowStress()` hook detecting viewport width below 280px. When active:
- Kudos spotlight hides media (text-only rendering)
- Celebration avatars shrink from 32px to 24px, strip items narrow from 56px to 44px
- Announcement type badges are hidden (text label in card remains)
- Kudos spotlight forces column layout even in wide tier

### 2. prefers-reduced-motion Support

Added `useReducedMotion()` hook. When reduced motion is preferred:
- All CSS transitions set to `'none'` instead of timed easing
- Hover event handlers (background tint, box-shadow) are suppressed entirely
- Focus outline behavior preserved (non-motion accessibility requirement)

### 3. Sparse-Data Visual Quality

Added `countTotalItems()` and `isSparse` flag (total items ≤ 3). When sparse:
- Module body gets generous padding (`2xl` instead of `xl` on desktop, `xl` instead of `lg` on mobile)
- Minimum height of 80px prevents the module from collapsing to a sliver
- `data-hbc-sparse="true"` attribute for future CSS hook if needed

### 4. Defensive Guards

- `safeInitial()`: Returns `?` for empty/undefined person names instead of crashing on `.charAt(0)`
- `safeFirstName()`: Returns empty string for empty/undefined names instead of crashing on `.split(' ')`
- Both functions used in celebration initial-letter placeholder and first-name display

### 5. ARIA Landmarks

- Module body: `role="region" aria-label="{heading}"`
- Kudos region: `role="region" aria-label="Kudos recognition"`
- Announcements region: `role="region" aria-label="Announcements"`
- Celebrations region: `role="region" aria-label="This week celebrations"`
- Focus outline behavior preserved on all interactive elements

### 6. Data Attributes for Testing/Debugging

- `data-hbc-sparse` — indicates sparse content mode
- `data-hbc-narrow-stress` — indicates emergency compression mode
- `data-hbc-layout` — indicates current layout mode (rail/wide)
- `data-hbc-authoring-safe` — signals component is authoring-resilient

---

## What Was Not Changed

- Normalizer logic: untouched (all filtering, visibility, sorting preserved)
- Data contracts: untouched
- Region suppression rules: already correct from P03
- Module-level state handling (loading, no-data, invalid): already correct from P03
- CTA visibility rules: already correct from P03

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (538.93 kB JS, 24.84 kB CSS)
- `test`: 8 failures / 11 passed — all failures pre-existing (identical to baseline before P05 changes)
