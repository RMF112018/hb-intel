# Closure — Truthful first persistence and save readiness

**Scope:** `apps/hb-publisher` — `hb-publisher Feature 1.0.0.12`
**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-11/Prompt-01-Make-first-persistence-and-save-readiness-truthful.md`

## Defect that was closed
The publisher shell gated **Save draft** on a shallow `!!articleDraft && !busy && !unsupportedDestinationLoaded`. A brand-new draft seeded by `emptyArticle()` (default title `"Untitled article"`, empty `Subhead` / `SummaryExcerpt` / `BodyRichText` / `HeroPrimaryImage` / `HeroPrimaryImageAltText`, no `ProjectId` binding) could therefore be presented as saveable even though the tenant-required `HB Articles` master row was not plausibly ready to persist. Failures surfaced as opaque SharePoint rejections, and the shell advertised a casual "draft save" while the live persistence model was the required-field master list.

## Save-health model now enforced
New module: `apps/hb-publisher/src/webparts/articlePublisher/controllers/saveHealthModel.ts`.

Exported discriminated union `SaveHealth`:
- `noDraft`
- `busy`
- `unsupportedDestination` (message)
- `unsupportedContentType` (message — milestone legacy hard-block mirror)
- `missingFirstPersistenceFields` (`missing: readonly SaveBlockField[]`)
- `readyFirstPersistence`
- `readySubsequentPersistence`

Pure derivation `deriveSaveHealth(...)` resolves in strict priority order; `isSaveReady(...)` and `saveDisabledReason(...)` drive the shell. The first-persistence required-field set mirrors the tenant-truth MVP profile (`MONTHLY_REQUIRED` / `PROJECT_UPDATE_REQUIRED` in `data/publisherAdapter/validation/validationEngine.ts`) and the tenant schema report (`docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`):

| Block key                  | Tenant field                | Notes                                                                 |
|----------------------------|-----------------------------|-----------------------------------------------------------------------|
| `Title`                    | `Title`                     | Also blocks when title is the `emptyArticle()` sentinel `"Untitled article"`. |
| `ProjectBinding`           | `ProjectId` + `ProjectName` | Enforces the Project Spotlight identity binding before first save.    |
| `Subhead`                  | `Subhead`                   | Required by the Project Spotlight shell.                              |
| `SummaryExcerpt`           | `SummaryExcerpt`            | Required by the Project Spotlight shell.                              |
| `BodyRichText`             | `BodyRichText`              | Uses `isRichBodyEmpty` so empty TipTap docs (`<p></p>`) still block. |
| `HeroPrimaryImage`         | `HeroPrimaryImage`          | Required when the shell's banner slot is present.                     |
| `HeroPrimaryImageAltText`  | `HeroPrimaryImageAltText`   | Conditional: blocks only when `HeroPrimaryImage` is set.              |

Subsequent saves — any draft where the master row has already committed to `HB Articles` — short-circuit to `readySubsequentPersistence`, so partial-persistence recovery and normal field edits remain uninterrupted and the staged `DraftSaveOutcome` behavior is preserved unchanged.

## First-persistence rule enforced
- A draft is treated as *not yet persisted* after `handleCreateNew()` and only flips to persisted when either (a) `reloadSelected()` hydrates a server row or (b) `handleSave()` observes a committed master upsert (`outcome.ok === true` or `outcome.persisted.article === true` on the partial-persistence branch). This is tracked as `isPersisted` on `useDraftLifecycle`.
- While `isPersisted === false`, **Save draft** is disabled unless every tenant field in the table above is satisfied.
- While `isPersisted === true`, the first-persistence gate is skipped; only `busy` / `unsupportedDestination` / `unsupportedContentType` continue to gate save.

## Shell surfaces changed
- `useReadinessController` now accepts `isPersisted` and returns `saveHealth` plus `saveBlockedReason`. Existing `publishEnabled` / `republishEnabled` logic is unchanged.
- `ArticlePublisher.tsx` reads `saveHealth` / `saveBlockedReason` / `isPersisted`, renders a new "Finish these before saving" right-rail block (`aria-live="polite"`) that names each missing field with an action hint, and wires the Save draft and Recompose preview buttons to the new tooltip plus `aria-describedby` when blocked.
- `controllers/index.ts` re-exports the save-health public surface.

## Tests added / updated
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/saveHealthModel.test.ts` (new, 15 cases) — pins:
  - title-sentinel, per-field missing detection, empty-rich-body detection, conditional alt-text rule, fully-satisfied happy path.
  - priority order (noDraft → busy → unsupportedDestination → unsupportedContentType → missingFirstPersistenceFields → readyFirstPersistence → readySubsequentPersistence).
  - `saveDisabledReason` returns undefined for ready kinds and summarizes the missing-count message.
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.test.ts` extended with four new cases covering:
  - first-save blocked with the expected `missing` field set.
  - first-save enabled once required fields are satisfied (`readyFirstPersistence`).
  - `isPersisted: true` short-circuit to `readySubsequentPersistence` even with blank fields.
  - `busy` outranks missing-field detection.
- Existing milestone legacy hard-block cases continue to pass unchanged.

## Tenant-schema consistency
- First-persistence required fields are a strict subset of the `MONTHLY_REQUIRED` / `PROJECT_UPDATE_REQUIRED` sets already enforced by `validationEngine.ts` for publish validation. Save-readiness can never contradict publish-readiness; a save-enabled draft may still be publish-blocked by shell / binding / gallery rules the engine owns, which is the intended layering.
- Body emptiness reuses the adapter's `isRichBodyEmpty` so TipTap-serialized empty documents behave identically at save-gate and publish-gate boundaries.
- No schema changes, no new persistence layer, no second draft store. `draftSaveOrchestrator` and `publisherWriters` are untouched.

## Verification performed
- `pnpm --filter hb-publisher test` — 541 pass, 6 pre-existing failures in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` that also fail on main at ef1c7860 (unchanged by this prompt).
- `pnpm --filter hb-publisher check-types` — clean.
- `pnpm --filter hb-publisher lint` — pre-existing harness config issue (missing ESLint config) unchanged by this prompt.

## Versioning
- `apps/hb-publisher/config/package-solution.json`: `1.0.0.11` → `1.0.0.12` (both `solution.version` and the `hb-publisher Feature` entry).
