# Workstream C · Step 04 — Closure

## Objective
Prove that the new rich-content output produced by the Story body editor is safe through preview, validation, and publish orchestration without breaking existing page composition.

## What changed

### Rich-body emptiness recognised by the validation engine
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
  - Added `isRichBodyEmpty(html)` — a pure, SPFx-safe check that strips the schema-permitted HTML tags and decoded entities and treats any markup-only or whitespace-only body as empty. This closes a real authoring hole: TipTap serialises an empty document as `<p></p>`, which the previous `str()` check would have accepted as a non-empty string and allowed through to publish.
  - Added `isFieldEffectivelyEmpty(article, key)` so the shared `requireField` path delegates to `isRichBodyEmpty` specifically for `BodyRichText` while every other field continues to use `str()`.
  - Rule 9/10 (body required when the shell exposes a body slot) and every template-profile required-field set that lists `BodyRichText` now use the rich-content check.
  - No behavioural change for any other field; `str()` is unchanged.

### Preview test suite: terminology drift closed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.test.ts`
  - Fixture updated from the stale `posts:` repository key to the current `articles:` key used by `PublisherRepositories`.
  - Failure-reason assertion updated from the legacy `'postNotFound'` to the current `'articleNotFound'`.
  - Drift assertions repaired: the builder always returns a `DriftBanner` object, so `expect(result.drift).toBe(false/true)` was asserting the wrong contract. Now asserts each drift flag individually.
  - Added two new rich-content tests:
    - Schema-compliant body HTML (headings, bold/italic, lists, `https://` link, blockquote) passes validation and is written verbatim into the body control — proving preview → compose preserves the author's HTML byte-for-byte.
    - An empty TipTap body (`<p></p>`) is reported as a validation error on `BodyRichText`.

### Validation unit tests: rich-body coverage
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.test.ts`
  - Added three tests:
    - Empty TipTap body (`<p></p>`) → `BodyRichText` missing-required error.
    - Whitespace-only body (`<p>&nbsp;</p><p><br /></p>`) → same error.
    - Schema-compliant rich body with headings, bold, lists, and an allowed `https://` link → no `BodyRichText` findings.

## Doctrine alignment
- **Preview-publish parity (operating-charter rule 8)** preserved. The rich-body check lives in `validationEngine`, which `previewBuilder` already delegates to; the same pipeline is used by `publishOrchestrator.preview` and the publish path, so preview and publish cannot diverge on this rule.
- **Host-safe for SPFx.** Pure string work; no DOM parsing, no new dependencies, no layout regressions. The compositor continues to pass the author's HTML into the body control verbatim (verified by the new test), keeping the existing SharePoint Pages REST contract intact.
- **Author-confident.** An empty body now fails fast with a typed, actionable finding instead of sailing through to a blank published page.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run validationEngine previewBuilder` — 22/22 pass.
- Full `pnpm vitest run` (hb-webparts) — 834 pass, 23 fail. All 23 failures are pre-existing and unrelated to this step (homepage bundle budgets, homepage webpart composition/rendering, publisher orchestrator `resolution`/`validation`/`policy` phase classification). Net suite health improved by +10 passing / −5 failing versus the previous baseline.

### Known pre-existing failures (not introduced or touched here)
- `src/homepage/__tests__/bundleBudget.test.ts` (2) — bundle-size thresholds.
- `src/homepage/__tests__/compositionPreview.test.tsx`, `discoveryWebpart.test.tsx`, `interactiveStates.test.ts`, `motionAndAccessibility.test.ts`, `mountDispatch.test.ts`, `operationalAwarenessWebparts.test.tsx`, `peopleCulturePublicRuntime.test.tsx`, `topBandWebparts.test.tsx`, `utilityWebparts.test.tsx` — homepage webpart drift, unrelated to publisher.
- `src/homepage/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` (6) — orchestrator outcome-phase naming drift; rich-content flow through the e2e path is not what is failing (no `BodyRichText`-field assertion regresses).

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.test.ts`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-c-rich-content-authoring/step-04/CLOSURE.md` (this file)

## Remaining / blockers
- None blocking this step. The pre-existing homepage and orchestrator-phase failures listed above are out-of-scope for rich-content authoring and belong to their own workstreams.
