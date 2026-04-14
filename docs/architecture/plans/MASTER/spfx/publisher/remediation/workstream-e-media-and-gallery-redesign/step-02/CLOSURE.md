# Workstream E · Step 02 — Closure

## Objective
Replace the current blank-media-row insertion flow with a guided add-media experience and visual media cards.

## What changed

### New `mediaComposer/` module
`apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/`
- `buildMediaRow.ts` — pure helpers:
  - `createMediaRowFromDraft` builds a new `PublisherMediaRow`; `Title` is auto-derived from the URL pathname last segment (extension stripped, percent-decoded), falling back to the first 60 chars of alt text, falling back to the MediaId.
  - `mergeMediaRowWithDraft` edits an existing row; preserves `GalleryGroup` and any hand-authored `Title` that diverges from the derivation rule so legacy rows are never destructively migrated.
  - `draftFromRow` seeds the composer on edit and coerces legacy `hero` / `secondary` roles to `gallery` (those roles are authored elsewhere and surface here as a fallback only).
  - `isAllowedImageUrl` rejects http, protocol-relative, `data:`, `file:`, `javascript:`, and malformed URLs — https only.
- `buildMediaRow.test.ts` — 14 unit tests for derivation, whitespace handling, merge preservation, URL validation, and reverse projection.
- `mediaInvariants.ts` — pure helpers: `applyFeaturedGalleryInvariant` (mutually-exclusive gallery-featured), `restampMediaSortOrder`, `moveMediaRow` (signed-delta, clamps to ends).
- `mediaInvariants.test.ts` — 13 unit tests including reference stability, feature-one-clear-rest, grid-aware multi-step reorder, and end-clamping.
- `MediaComposer.tsx` — the flyout. Reuses `HbcKudosComposerFlyout` for chrome, hosts the URL field with inline https validation messaging, a real-time thumbnail preview pane with loading / ready / error states (`role="alert"` on load failure), a two-option role radio group (Gallery / Supporting), a required alt-text textarea with soft-125 counter + helper copy, an optional caption input with soft-140 counter, and a featured toggle. Save is disabled until a valid URL + alt text are present and the thumbnail has not failed to load.
- `GalleryPanel.tsx` — the thumbnail-grid surface. `<ol>` wrapper announces keyboard reorder via `aria-label`; each tile is a focusable chip button that opens the composer, with a star (`aria-pressed`) for featured toggle, ←/→ buttons for reorder, and a Remove action. Alt+Arrow keyboard reorder supports ArrowLeft / ArrowRight / ArrowUp / ArrowDown (grid-aware). Role badge renders only for non-gallery rows so the typical case stays quiet. Caption preview falls back to `<em>No caption</em>` when blank.
- `mediaComposer.module.css`, `galleryPanel.module.css`, and matching `.d.ts` files — all feature-scoped. No token duplication into shared UI.
- `index.ts` — barrel.

### `ArticlePublisher.tsx`
- Replaced the inline `GalleryPanel` (141 LoC) with the imported `GalleryPanel` from `mediaComposer/`. The Publisher file is now smaller and the six-input per-row grid is deleted.
- Removed the now-unused `MEDIA_ROLES` constant and `mediaRoleLabel` import.

## Doctrine alignment
- **Editorial, not CRUD.** Thumbnail grid with caption preview and real-time composer preview replaces the dense six-input row.
- **Author-confident.** Typos in URLs surface immediately via thumbnail-load error (with `role="alert"`). Save is disabled until the inputs are valid. Alt text is required at the UI level, closing the pre-existing validation hole from the author side.
- **Reusable primitives preserved.** `HbcKudosComposerFlyout` and `HbcEmptyState` are reused verbatim. No new shared primitive introduced; the thumbnail tile is feature-scoped composition.
- **Pure invariants.** Featured / SortOrder / reorder rules live in `mediaInvariants.ts`, shared between composer save and grid-level mutations — mirrors the proven `teamInvariants.ts` pattern from workstream-d.
- **Host-safe.** Local composition + local CSS. Schema unchanged; `media.replaceAllForArticle` remains the only write seam. No cross-package exports.
- **SharePoint vetting.** https-only URL validation prevents mixed-content issues on the hosted page.

## Lifecycle safety
- Publish / republish / archive / withdraw unchanged.
- `pageCompositor.composeGallery` continues to filter by `MediaRole === 'gallery'` and sort by `SortOrder`. No contract changes; the composer writes within the existing schema.
- `validationEngine` Rule 14 (gallery alt text required) continues to fire — the composer now prevents save without alt text, so the validator becomes belt-and-braces rather than the only defence.

## Accessibility
- Composer: `role="alert"` on URL validation + thumbnail failure; `aria-live="polite"` on alt / caption counters; alt-text required indicator in the label; `role="radiogroup"` on the role chooser.
- Grid: `<ol aria-label="Article images — use Alt+ArrowLeft or Alt+ArrowRight to reorder">`; tile button is a real `<button>` with image-scoped aria-label including featured state; star toggle is `aria-pressed` with explicit feature / unfeature labels; arrow buttons carry image-scoped labels.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run mediaComposer ArticlePublisher teamComposer` — 153/153 pass (adds 27 new media-composer tests; all existing Publisher + teamComposer tests still green).
- Manual scrub of touched files for stale comments, dead exports, and drift — none found. The Publisher-top-level `MEDIA_ROLES` constant and `mediaRoleLabel` import that were left unused after the inline panel's removal were deleted in this step.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/buildMediaRow.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/buildMediaRow.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/mediaInvariants.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/mediaInvariants.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/MediaComposer.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/mediaComposer.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/mediaComposer.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/galleryPanel.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/galleryPanel.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/index.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` (inline `GalleryPanel` removed; imports `GalleryPanel` from the composer module; dead `MEDIA_ROLES` + `mediaRoleLabel` import removed)
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-e-media-and-gallery-redesign/step-02/CLOSURE.md` (this file)

## Remaining / follow-on (per the Step 01 design)
- **Step 03** — Responsive grid refinement, inline broken-image replace affordance, final keyboard-reorder polish.
- **Step 04** — Persistence / preview / Team Viewer gallery-contract hardening with integration tests; validationEngine alt-text soft-length warning.
- **Step 05** — Full behavioural scrub, workstream README + closure, hosted SPFx vetting.

No blockers.
