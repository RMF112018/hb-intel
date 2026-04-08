# P05 — Implementation Note: Runtime Validation, Build, and Packaging

**Date:** 2026-04-07
**Phase:** 13 / P05 — Runtime Validation, Build, and Packaging
**Version:** 0.0.27

---

## Phase 13 Summary — Kudos Composer Implementation

A premium Kudos Composer flyout was added to the People & Culture homepage webpart, enabling homepage users to submit recognition directly from the PeopleCultureMerged surface into the live People Culture Kudos SharePoint list on HBCentral. The composer is brand-native (warm gradient header, orange accent styling, cream canvas), responsive (right-side 420px sheet on desktop, full-screen on mobile), accessible (focus trap, escape close, reduced-motion safe), and moderation-safe (all submissions enter pending state with HomepageEnabled=false).

---

## Files Changed Across Phase 13

### New files

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerFlyout.tsx` | Flyout shell — responsive side-sheet/full-screen, brand gradient header, focus trap, escape/backdrop close, AnimatePresence transitions |
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerForm.tsx` | Form body — recipient input, headline, message, optional details, branded validation |
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerPreview.tsx` | Inline preview card — live-updating draft rendered in kudos spotlight visual language |
| `apps/hb-webparts/src/homepage/data/useKudosComposer.ts` | Composer state hook — 5-state machine, draft management, validation, pluggable submit |
| `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts` | SharePoint REST write seam — creates Kudos list items with moderation defaults |

### Modified files

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | Replaced 3 Give Kudos anchor CTAs with GiveKudosButton, wired composer hook + flyout + submission |
| `apps/hb-webparts/src/mount.tsx` | Thread identity to PeopleCultureMerged for submitter metadata |
| `apps/hb-webparts/package.json` | Version 0.0.24 → 0.0.27 (across P02–P04) |

### Build artifacts

| File | Change |
|------|--------|
| `dist/sppkg/hb-webparts.sppkg` | Fresh package (2983 KB) |
| `tools/spfx-shell/release/assets/*` | Updated content-hashed bundles |
| `tools/spfx-shell/release/manifests/*.manifest.json` | Updated module references |

### Documentation

| File | Purpose |
|------|---------|
| `P01-Implementation-Note.md` | Repo-truth audit and composer directive |
| `P02-Implementation-Note.md` | Component architecture and state model |
| `P03-Implementation-Note.md` | SharePoint submission source and field mapping |
| `P04-Implementation-Note.md` | Webpart wiring and interaction |
| `P05-Implementation-Note.md` | This document — validation, build, packaging |

---

## SharePoint Submission Field Mapping

| SharePoint field | Source | Default |
|-----------------|--------|---------|
| `KudosId` | Generated `kudos-<ts36>-<rand>` | — |
| `Headline` | Draft headline | — |
| `Excerpt` | Draft message | — |
| `Details` | Draft details (optional) | null |
| `SubmittedById` | Resolved via `ensureUser(email)` | null if fails |
| `SubmittedDate` | Current ISO timestamp | — |
| `IsPinned` | — | `false` |
| `HomepageEnabled` | — | `false` |
| `CelebrateCount` | — | `0` |
| `ApprovedBy/Date` | — | null (moderator-set) |
| `PublishStart/End` | — | null (moderator-set) |

### Schema mismatches vs CSV export

- No dedicated `Status` column — pending state synthesized from absence of approval fields
- `IndividualRecipients` is Person (multi) requiring user IDs — cannot populate without people-picker; recipient names captured in text fields for moderator assignment
- Image upload deferred — `PrimaryImage`/`ImageAltText` not set on new submissions

---

## Fallback Behavior

| Scenario | Behavior |
|----------|----------|
| No SPFx site context (local dev) | `submitKudosDraft` returns `{ ok: false, error: "SharePoint site context is not available..." }` |
| List access denied | SharePoint REST error surfaced in flyout error banner, draft preserved |
| Request digest failure | Error surfaced, draft preserved |
| User resolution failure | Non-fatal — submission continues without SubmittedById, SharePoint records Created By |
| No identity prop | Preview shows "You", SubmittedBy field omitted |

---

## Validation Checklist

### A. Interaction

| Check | Status |
|-------|--------|
| All 3 Give Kudos actions open composer | Pass — GiveKudosButton at HeroBanner (L217), KudosSpotlight (L295), SparseLayout (L427) |
| No old `href="#give-kudos"` anchor behavior | Pass — all Give Kudos CTAs now `<button type="button">` |
| Form validation works | Pass — headline, message, recipients validated; errors clear on edit |
| Success state works | Pass — CheckCircle2 celebration, moderation notice, Send Another / Done |
| Error state preserves draft | Pass — error banner renders above form, draft fields retained |
| Close/unsaved guard works | Pass — `window.confirm` when closing dirty draft |

### B. Responsive

| Check | Status |
|-------|--------|
| Desktop: right-side 420px sheet | Pass — fixed position, right: 0, width: 420 |
| Mobile: full-screen sheet | Pass — `tier === 'mobile'` → `inset: 0` |
| Reduced motion | Pass — `usePrefersReducedMotion()` disables AnimatePresence transitions |
| Body scroll lock | Pass — `document.body.style.overflow = 'hidden'` while open |

### C. Regression

| Check | Status |
|-------|--------|
| PeopleCultureMerged visual hierarchy | Pass — only CTA trigger changes; all layout, palette, composition unchanged |
| Non-Kudos CTAs preserved | Pass — "View All", "Celebrate", "View all" remain as HbcPremiumCta anchors |
| Other homepage webparts | Pass — no imports or dependencies changed in other webpart files |

---

## Build / Package Status

| Step | Status |
|------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | Pass (clean) |
| `pnpm --filter @hbc/spfx-hb-webparts lint` | Pass (0 errors, 0 warnings) |
| `pnpm --filter @hbc/spfx-hb-webparts build` | Pass (575.13 kB JS, 31.32 kB CSS) |
| `pnpm --filter @hbc/spfx-hb-webparts test` | 13 failures, all pre-existing |
| `npx tsx tools/build-spfx-package.ts --domain hb-webparts` | Pass |
| gulp bundle --ship | Pass |
| gulp package-solution --ship | Pass |
| **Output** | `dist/sppkg/hb-webparts.sppkg` (2983 KB) |
| Content hash | `hb-webparts-app-6ad1f9d5.js` |
| Manifests compiled | 11 |
| Shell entries generated | 11 |
| People & Culture manifest | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` |
