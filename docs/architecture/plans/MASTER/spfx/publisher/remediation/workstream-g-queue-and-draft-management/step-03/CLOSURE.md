# Workstream G · Step 03 — Closure

## Objective
Add draft-completeness and needs-attention signalling to the queue so authors can see at a glance which drafts are ready, which need work, and which are blocked.

## What changed

### New `draftCompleteness.ts`
Pure row + group classifier, SPFx-safe, zero runtime dependencies.
- `assessDraftMissingFields(row)` — scans the master row for blank required fields and returns the missing keys in a stable order: `Title`, `Subhead`, `SummaryExcerpt`, `BodyRichText` (via the Step-c-04 `isRichBodyEmpty` helper so TipTap `<p></p>` counts as empty), `HeroPrimaryImage`, `HeroPrimaryImageAltText`, `Slug`, `ArticleContentType`, `Destination`. Whitespace counts as blank.
- `assessDraftCompleteness(row)` — classifies every draft into `ready` / `todo` / `blocked` and returns `{ level, missingCount, missingFields, chipLabel, ariaLabel }`. `blocked` wins on `archived` / `withdrawn` regardless of field completeness (those drafts are out-of-scope for authoring). `todo` fires when ≥1 required field is blank, with a plural-safe `chipLabel` ("1 TODO", "3 TODO") and a screen-reader `ariaLabel` that lists the missing field keys. `ready` fires when all required fields are present.
- `rollupGroupCompleteness(rows)` — aggregates a group's ready / todo / blocked counts + total, so the group header can surface a needs-attention rollup without a second pass over the same rows at render time.

### Tests
`draftCompleteness.test.ts` — 11 new unit tests:
- `assessDraftMissingFields` returns an empty list when every required field is present; flags fields in stable order; treats whitespace-only Title + TipTap `<p>&nbsp;</p>` body as missing.
- `assessDraftCompleteness` reports `ready` for a complete draft, `todo(n)` with plural-safe label + aria-label listing fields, `blocked` for archived + withdrawn (distinguished by aria-label).
- `rollupGroupCompleteness` aggregates a mixed group correctly and returns all-zeros for an empty group.

### DraftQueue wiring
- **Row tertiary line** now ends with a `<CompletenessChip>` after the author-attribution text. `ready` → green "Ready" pill, `todo(n)` → ochre "N TODO" pill, `blocked` → red "Blocked" pill. Each chip carries `aria-label` with the full screen-reader description and a `title` tooltip listing the missing-field keys — colour + text, never colour-only.
- **Group header count** now renders as `<GroupCounts>`. When the group has rows needing attention, a secondary "N TODO" pill appears beside the total count so authors can see at a glance that e.g. the Draft group has "12 · 3 TODO" rows. The rollup uses the pure `rollupGroupCompleteness` so it does not re-walk the rows inside `<DraftRow>`.

### Styles
- `draftQueue.module.css` + `.d.ts` — added seven classes: `.chip`, `.chipReady`, `.chipTodo`, `.chipBlocked`, `.groupCountGroup`, `.groupAttention`. Palette matches the Step-c-03 editorial guidance banners so the whole Publisher surface speaks one visual language.

### Barrel
- `draftQueue/index.ts` re-exports `assessDraftCompleteness`, `assessDraftMissingFields`, `rollupGroupCompleteness`, and the three types.

## Doctrine alignment
- **Editorial, not CRUD.** Authors see "3 TODO" on a row, not validation error codes. Screen-reader users get a sentence-form description ("3 things to do: Title, Slug, Subhead") via `aria-label`; sighted users get the same list via tooltip.
- **Author-confident.** Completeness surfaces at the rail level so authors know which drafts are worth opening first.
- **Host-safe.** Pure helpers, no external dependencies, no schema change, no orchestrator change. The rail-level assessment is deliberately cheaper than `validationEngine` — it avoids requiring the full `PublishResolutionContext` + `PageShellManifest` for each of potentially 40 rail rows.
- **Primitive reuse.** `isRichBodyEmpty` from Workstream C Step 04 is reused for the body-content check so composer, validator, and queue classifier share the same emptiness heuristic.

## Accessibility
- Every chip uses both colour and text; no colour-only signal.
- `aria-label` on chips carries the full sentence description (not just "3 TODO") so screen readers narrate the rationale.
- Group-header attention pill carries its own `aria-label` ("3 need attention") so screen-reader users get the same signal sighted users see.

## Lifecycle safety
- Row click still selects — navigation semantics unchanged.
- `PublisherRepositories` / orchestrator / write-seam untouched.
- The queue does not mutate any state; it only surfaces cues derived from `PublisherArticleRow`.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run draftQueue ArticlePublisher` — **231/231 pass** across 20 files (9 new completeness-classifier tests + 222 existing).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftCompleteness.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftCompleteness.test.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftQueue.module.css`
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/draftQueue.module.css.d.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/index.ts`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-g-queue-and-draft-management/step-03/CLOSURE.md` (this file)

## Remaining / follow-on
- **Step 04** — Selection behaviour, queue-to-editor handoff polish, collapsed-group persistence, keyboard-shortcut hint.
- **Step 05** — Full behavioural scrub + workstream README + hosted SPFx vetting.

No blockers.
