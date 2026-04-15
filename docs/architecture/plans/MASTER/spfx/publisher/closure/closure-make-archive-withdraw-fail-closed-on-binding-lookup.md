# Closure — Archive/withdraw fails closed on binding lookup

**Phase:** `docs/architecture/plans/MASTER/spfx/publisher/phase-09`
**Prompt:** `Prompt-03-Make-archive-withdraw-fail-closed-on-binding-lookup.md`
**Status:** Closed

## Defect

`runLifecycleTransition` (backing `orchestrator.archive` and `orchestrator.withdraw`) read the current binding via:

```ts
const existingBinding = await repositories.pageBindings
  .getByArticleId(article.ArticleId)
  .catch(() => undefined);
```

A thrown read (transient SharePoint error, permission failure, list outage) was silently converted to `undefined`, so the lifecycle took the "no binding exists" branch. Consequence: the master article was flipped to `archived` / `withdrawn`, a workflow-history row was appended, but the live destination page was never demoted via `SavePageAsDraft`. The page stayed publicly visible despite the article being archived/withdrawn.

## Resolution

Replace the swallowed-catch with a typed `bindingLookup` lifecycle failure. Absence is only accepted when the repository positively returns `undefined`.

### Before

```ts
const existingBinding = await repositories.pageBindings
  .getByArticleId(article.ArticleId)
  .catch(() => undefined);
// proceeds into the "no-binding" branch on any throw
```

### After

```ts
let existingBinding: PublisherPageBindingRow | undefined;
try {
  existingBinding = await repositories.pageBindings.getByArticleId(article.ArticleId);
} catch (err) {
  const message = err instanceof Error
    ? `Binding lookup failed during ${target}: ${err.message}`
    : `Binding lookup failed during ${target}.`;
  await recordPublishingError({ /* stage: 'bindingLookup', lifecycleAction, ... */ });
  return {
    ok: false,
    stage: 'bindingLookup',
    message,
    previousState,
    articleUpdated: false,
    bindingUpdated: false,
    pageUnpublished: false,
    historyAppended: false,
  };
}
```

A new `'bindingLookup'` stage is added to both the internal `FailureStage` union (for publishing-errors `Operation` mapping — `sync` under `lifecycleAction`) and the public `LifecycleOutcome` failure stage union.

## Failure-path trace

| Scenario                                        | Before                                                                 | After                                                                                 |
|-------------------------------------------------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `getByArticleId` throws during archive           | swallowed → treated as "no binding" → article stamped `archived`, page still live | `ok: false, stage: 'bindingLookup'`; article NOT stamped; page NOT unpublished; error row recorded |
| `getByArticleId` throws during withdraw          | same as above                                                          | `ok: false, stage: 'bindingLookup'` symmetric behavior                                |
| `getByArticleId` returns `undefined` (no row)    | "no binding" path runs; article stamped cleanly                        | identical — positive-absence path unchanged                                           |
| `getByArticleId` returns a row                   | normal path                                                            | identical                                                                             |

## Files changed

- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
  - `FailureStage` union: added `'bindingLookup'`.
  - `LifecycleOutcome` failure `stage` union: added `'bindingLookup'`.
  - `runLifecycleTransition`: replaced `.catch(() => undefined)` with an explicit `try`/`catch` that returns a typed `bindingLookup` failure and records a publishing-errors row (operation `sync` under the archive/withdraw lifecycle action).
- `apps/hb-publisher/src/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts`
  - Added `describe('lifecycle binding-lookup fail-closed')` block with 3 tests:
    - archive → thrown lookup → `stage: 'bindingLookup'`, no `unpublishLive`, no article upsert, no history append, error row tagged `archive.bindingLookup` / Operation `sync`.
    - withdraw → thrown lookup → symmetric `stage: 'bindingLookup'`.
    - archive → `undefined` lookup → positive-absence path still succeeds with `pageUnpublished=false`, `bindingUpdated=false`, `articleUpdated=true`, `historyAppended=true`.
- `apps/hb-publisher/config/package-solution.json` — version bump `1.0.0.3 → 1.0.0.4` (solution + feature).

## Validation

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 492 passed (+3 new), 6 pre-existing `publisherEndToEnd.test.ts` failures unchanged (same suite was failing before Prompt-01; unrelated to this change).

## Scope held tight

- No changes to lifecycle ordering, rollback, or page-unpublish semantics.
- No changes to the `decideRepublishAction` policy.
- No changes to archive/withdraw success shapes when the read succeeds.
- Republish approval gate (Prompt-02) untouched.

## Remaining assumptions

- Repository `getByArticleId` continues to distinguish "row absent" (`undefined`) from "read failed" (throw). If a repository implementation started returning `undefined` on transport errors, the gate would regress — repository contract discipline is the invariant this fix relies on.
