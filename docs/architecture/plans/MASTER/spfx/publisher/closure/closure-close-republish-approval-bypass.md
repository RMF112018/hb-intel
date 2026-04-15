# Closure — Close republish approval bypass

**Phase:** `docs/architecture/plans/MASTER/spfx/publisher/phase-09`
**Prompt:** `Prompt-02-Close-republish-approval-bypass.md`
**Status:** Closed

## Defect

The Republish action was enabled by the UI whenever a binding existed and validation passed, without constraining the article's `WorkflowState`. That allowed any bound article — `draft`, `review`, or `approved` — to re-enter the publish pipeline and be re-stamped to `published`, bypassing the approval gate. The orchestrator itself accepted `mode: 'republish'` from any non-terminal article state because `decideRepublishAction` only blocked `archived` / `withdrawn`.

## Resolution

Apply defense-in-depth: gate Republish at the UI and enforce the same invariant in the orchestrator.

### UI gate

`apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts` — `republishEnabled` now additionally requires `articleDraft.WorkflowState === 'published'`. Authors cannot click Republish from draft / review / approved. The Publish button keeps its existing `WorkflowState === 'approved'` gate, so `approved` content still has a valid live-publish route through the ordinary Publish path.

### Orchestrator gate

`apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts` — after resolution and before composition, when `mode === 'republish'` and `context.article.WorkflowState !== 'published'`, the orchestrator returns `{ ok: false, stage: 'policy', decision: { action: 'blocked', reason: 'articleNotPublished' } }` and records a `HB Article Publishing Errors` row. No page-creation, binding-write, article-sync, or workflow-history writes occur.

A new `RepublishReason` value `articleNotPublished` was added to `republishPolicy.ts` to keep the decision/reason vocabulary consistent.

## Before / after

| State      | Binding | Action     | Before          | After                |
|------------|---------|------------|-----------------|----------------------|
| draft      | yes     | Republish  | allowed (bug)   | blocked — policy     |
| review     | yes     | Republish  | allowed (bug)   | blocked — policy     |
| approved   | yes     | Republish  | allowed (bug)   | blocked — policy     |
| approved   | —       | Publish    | allowed         | allowed (unchanged)  |
| published  | yes     | Republish  | allowed         | allowed (unchanged)  |
| archived   | yes     | Republish  | blocked         | blocked (unchanged)  |
| withdrawn  | yes     | Republish  | blocked         | blocked (unchanged)  |

## Files changed

- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts` — added the republish state gate (post-resolution, pre-composition) that blocks non-`published` republish with `reason: 'articleNotPublished'` and records a publishing-errors row.
- `apps/hb-publisher/src/data/publisherAdapter/republishPolicy.ts` — extended `RepublishReason` union with `'articleNotPublished'`.
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useReadinessController.ts` — `republishEnabled` now requires `WorkflowState === 'published'`.
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts` — updated existing republish tests to use `WorkflowState: 'published'` (their semantic intent) and added a new `describe('republish approval gate')` block with 5 tests covering draft/review/approved block, approved→Publish allow, and published→Republish allow.
- `apps/hb-publisher/src/data/publisherAdapter/articleSyncBack.test.ts` — updated the `inPlaceUpdate (republish) preserves PublishedDateUtc` test article to `WorkflowState: 'published'` to match the new invariant.
- `apps/hb-publisher/config/package-solution.json` — version bump `1.0.0.2 → 1.0.0.3` (solution + feature).

## Validation

New tests (`publishOrchestrator.test.ts`):

1. `blocks republish when the master article is in draft` — expects `stage: 'policy'`, `decision.reason: 'articleNotPublished'`, no page/binding writes.
2. `blocks republish when the master article is in review` — same invariants.
3. `blocks republish when the master article is in approved (must go through Publish, not Republish)` — same invariants.
4. `allows the ordinary Publish path from approved (control flow preserved)` — `mode: 'create'` from `approved` succeeds; `createOrUpdate` + `upsertBinding` each called once.
5. `allows republish from published (legitimately live content)` — `mode: 'republish'` from `published` produces `action: 'inPlaceUpdate'`.

Unchanged regression coverage:

- `blocks republish when the master article is archived` (pre-existing) — still blocked.
- `blocks publish when validation fails` — unchanged.
- `regenerate`, `inPlaceUpdate`, `noOp` paths — unchanged, now run on the published-state fixture.

Suite result: 489 passed / 6 pre-existing failures unchanged (same 6 failures observed before Prompt-01 in `publisherEndToEnd.test.ts`, unrelated to this change — they assert `stage === 'policy'` but the fixture returns `stage: 'resolution'`). +5 net new passes from the new gate tests.

`pnpm --filter @hbc/spfx-hb-publisher check-types` clean.

## Archive / withdraw scope

Archive and withdraw logic were not modified. `decideRepublishAction`'s existing `archived` / `withdrawn` branches are untouched; the orchestrator's `runLifecycleTransition` path and `archive` / `withdraw` entry points were not edited in this prompt.

## Remaining assumptions

- The state-machine invariant that `WorkflowState: 'published'` is only produced by the publish orchestrator (never by a manual transition) remains authoritative. The republish gate relies on that invariant — if a future change allowed a manual transition into `published`, republish would become reachable from a non-approved author action. Any such change would require revisiting this gate.
