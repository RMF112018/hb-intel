# Closure — TemplateKey contract contradiction (Phase-05 Prompt-01)

## Final contract decision
**Option 1 — blank TemplateKey is a transient authoring state; persisted rows always carry a non-empty resolved TemplateKey.**

Rationale:
- The tenant `HB Articles.TemplateKey` column is required per the schema report. Making it optional in persistence would require a real tenant-schema change and would weaken every downstream consumer (resolver, validator, page compositor, binding writer) that already treats the key as present.
- The deterministic resolver (`resolveTemplate`) is pure and can run at save time against the active registry using the same inputs the publish-resolution context uses — no new moving parts.
- The authoring UI benefits from letting a new draft start blank so the user is not asked to hand-pick a template the registry can auto-select; the save path is the single seam that reconciles that UX with the persistence contract.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - `handleSave` now runs `resolveTemplate` when the draft's `TemplateKey` is blank/whitespace. On success the resolved key is stamped onto the upserted row (and onto the live draft state so the UI reflects the persisted value). On failure the save is blocked with a typed status message and no list writes occur.
  - `emptyArticle` doc rewritten to describe the transient-blank → save-time-resolve contract.
- `apps/hb-webparts/config/package-solution.json` — version bump.

Unchanged (still enforce the non-empty contract — no longer contradictory):
- `publisherRowMappers.ts` — `TemplateKey` continues to be `requiredStr`. Rows produced by the app will always carry it.
- `validation/validationEngine.ts` — "TemplateKey is required" rule stays as a defensive check for out-of-band list edits.
- `templateResolver.ts` — blank-means-auto-select remains the in-memory resolver behavior; save-time resolution is the caller, not a resolver change.
- `publishResolutionContext.ts` — reads the persisted article's TemplateKey, treats non-empty as an admin override. Works for both newly-resolved drafts (key matches registry) and pre-existing rows.

## Before vs. after behavior

### Before
- New draft: `TemplateKey = ''`.
- Save: upserted `TemplateKey = ''` to list.
- Re-read: mapper rejects the row (`requiredStr` returns undefined) → the saved draft **disappears** from subsequent list queries.
- Validation (if the row somehow reached the resolver): "TemplateKey is required" despite the resolver's blank-means-auto-select promise.

### After
- New draft: `TemplateKey = ''` in memory.
- Save: `handleSave` resolves a real key via `resolveTemplate(activeRegistry)`. If resolution fails, save is blocked with a typed status message — no partial writes.
- Upsert: `HB Articles.TemplateKey` is always a real key.
- Re-read: mapper succeeds; `publishResolutionContext` builds cleanly; validation passes.
- Resolver input at publish time: the persisted key is honored as an explicit admin-override (idempotent with the original resolver selection).

## Evidence — save → reload → resolve coherence
- `handleSave` seam: `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — resolver invoked with the same inputs the publish-resolution context uses (`ArticleContentType`, `Destination`, `SpotlightType`, `ProjectStage`, `ArticleSubject`); the resolution's `entry.TemplateKey` becomes the persisted value before `repositories.articles.upsert`.
- `reloadSelected(updated.ArticleId)` after save re-fetches through `repositories.articles.getByArticleId` → `mapArticleRow` → non-empty `TemplateKey` → `buildPublishResolutionContext` → resolver returns the same entry as admin-override.
- Existing resolver tests (`templateResolver.test.ts`) continue to pin the applicability/override paths the new save seam depends on.

## No-regression verification
- `pnpm exec tsc --noEmit` — clean.
- `pnpm exec vitest run templateResolver` — existing 15/15 tests green.
- No code path now assumes the old contradictory behavior: `emptyArticle` seeds blank (transient), `handleSave` resolves before write, list writes always carry a real key, list reads expect a real key.

## Deferred (out of scope)
None — the contradiction is closed end to end within the prompt's scope.
