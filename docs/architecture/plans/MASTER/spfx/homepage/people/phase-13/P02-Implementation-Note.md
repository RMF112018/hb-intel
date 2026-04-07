# P02 — Implementation Note: Composer Component Architecture and State Model

**Date:** 2026-04-07
**Phase:** 13 / P02 — Composer Component Architecture and State Model
**Version:** 0.0.25

---

## What Changed

### New files

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerFlyout.tsx` | Premium flyout shell — right-side sheet on desktop, full-screen on mobile, warm brand gradient header, focus trap, escape/backdrop close, reduced-motion safety |
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerForm.tsx` | Form body — recipient input, headline, message, optional details, inline validation with branded error states |
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerPreview.tsx` | Inline preview card — live-updating draft rendering matching the kudos spotlight visual language |
| `apps/hb-webparts/src/homepage/data/useKudosComposer.ts` | Composer state hook — 5-state machine (idle/editing/submitting/success/error), draft management, validation, pluggable submit callback, dirty detection |

### Modified files

| File | Change |
|------|--------|
| `apps/hb-webparts/package.json` | Version bump 0.0.24 → 0.0.25 |

---

## Architecture Decisions

### Import discipline compliance

`hb-webparts` prohibits imports from `@hbc/ui-kit` root. All UI components (`HbcPanel`, `HbcModal`, `useFocusTrap`) from the root package are unavailable. The flyout is built with inline styles and `motion`/`AnimatePresence` from `@hbc/ui-kit/homepage`, matching the existing `PeopleCultureMerged.tsx` pattern exactly.

### Focus trap

Simple inline implementation in the flyout: Tab/Shift+Tab cycle within focusable elements, auto-focus first input on open. No MutationObserver needed since form elements are static.

### State hook with pluggable submit

`useKudosComposer(onSubmit?)` accepts an optional async submit callback. P03 will provide the real SharePoint submission function. Until then, the hook works standalone for UI development.

### Recipient input

Simple comma-separated text input for individual recipients in this pass. A live SharePoint people-picker would require additional API seams beyond P02 scope. Recipients are parsed into `KudosRecipient[]` at submission time.

### Preview is inline, not a separate step

The preview card renders inline within the composer body, live-updating from the draft. No stepper or separate screen — keeps the experience fast and fluid.

---

## What Was Not Changed

- `PeopleCultureMerged.tsx` — wiring to be done in P04
- `communicationsContracts.ts` — existing `KudosEntry`, `KudosRecipient`, `PersonReference` types are sufficient
- `peopleCultureListSource.ts` — read path unchanged
- `usePeopleCultureData.ts` — read hook unchanged
- `mount.tsx` — unchanged

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (556.88 kB JS, 31.32 kB CSS — unchanged, new components tree-shaken until wired)
- `test`: 13 failures, all pre-existing
