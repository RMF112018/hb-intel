# P04 — Implementation Note: Webpart Wiring, Interaction, and UI Implementation

**Date:** 2026-04-07
**Phase:** 13 / P04 — Webpart Wiring, Interaction, and UI Implementation
**Version:** 0.0.27

---

## What Changed

### Modified files

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | Wired Kudos Composer: replaced 3 Give Kudos anchor CTAs with `GiveKudosButton` components, added `useKudosComposer` hook with `submitKudosDraft` callback, rendered `KudosComposerFlyout` with form/preview/footer, added `identity` prop for submitter metadata, added unsaved-changes guard on close |
| `apps/hb-webparts/src/mount.tsx` | Thread `identity` through to PeopleCultureMerged renderer |
| `apps/hb-webparts/package.json` | Version bump 0.0.26 → 0.0.27 |

---

## CTA Trigger Conversion

All 3 Give Kudos entry points converted from presentational anchors to real composer triggers:

| Location | Before | After |
|----------|--------|-------|
| HeroBanner | `<HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" />` | `<GiveKudosButton onClick={composerActions.open} variant="ghost" size="sm" />` |
| KudosSpotlight | `<HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" arrow />` | `<GiveKudosButton onClick={composerActions.open} variant="ghost" size="sm" arrow />` |
| SparseLayout | `<HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="secondary" size="md" arrow />` | `<GiveKudosButton onClick={composerActions.open} variant="secondary" size="md" arrow />` |

`GiveKudosButton` renders as `<button type="button">` with matching visual styling (ghost/secondary variants, proper focus, transition effects). Non-Kudos CTAs ("View All", "Celebrate", "View all") remain as `HbcPremiumCta` anchors.

---

## Composer Wiring

### State hook
`useKudosComposer(handleSubmit)` manages the full composer lifecycle with the real `submitKudosDraft` function as the async submit callback.

### Identity threading
`mount.tsx` now passes `identity` (displayName + email from SPFx `pageContext.user`) to `PeopleCultureMerged`, which threads it to:
- `submitKudosDraft` for SubmittedBy person field resolution
- `KudosComposerPreview` for submitter attribution display

### Flyout composition
The flyout renders inside the component's Fragment wrapper (after the `<section>`) with:
- **Header**: "Give Kudos" with warm brand gradient
- **Body**: Form + inline preview (editing/error/submitting states), success celebration (success state), error banner (error state)
- **Footer**: Cancel + Send Kudos (editing), Send Another + Done (success), with disabled/loading states

### UX behaviors implemented
- **Open**: Instant from any Give Kudos button, initial focus on first form field
- **Close**: Clean when draft empty, `window.confirm` unsaved-changes guard when dirty
- **Submit**: Validates required fields, shows "Sending…" state, prevents double submit
- **Success**: Celebratory CheckCircle2 icon, moderation notice, "Send Another" + "Done"
- **Error**: Red error banner preserves draft, shows actionable error message, allows retry

---

## What Was Not Changed

- `KudosComposerFlyout.tsx` — unchanged from P02
- `KudosComposerForm.tsx` — unchanged from P02
- `KudosComposerPreview.tsx` — unchanged from P02
- `useKudosComposer.ts` — unchanged from P02
- `peopleCultureSubmissionSource.ts` — unchanged from P03
- `communicationsContracts.ts` — no contract changes
- `communicationsConfig.ts` — normalizer unchanged

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (575.13 kB JS, 31.32 kB CSS — +18 kB from composer components now included)
- `test`: 13 failures, all pre-existing
