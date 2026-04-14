# Closure — Workflow-history actor attribution (Phase-05 Prompt-04)

## Defect closed
Every workflow-history write in the publisher stamped `ActorEmail` from `articleDraft.AuthorEmail` / `context.article.AuthorEmail`. When an editor other than the article author clicked Publish / Republish / Archive / Withdraw / ran a generic state transition, the audit row still credited the original author. Closes Phase-05 Prompt-04.

## Plumbing added
1. `WebPartRendererContext.identity.email` already carried the SPFx current-user email (see `HomepageIdentityInput` in `src/homepage/helpers/identity.ts`) — no new auth surface.
2. `mount.tsx` forwards that `identity.email` into `<ArticlePublisher actorEmail={...} />` for the ArticlePublisher webpart entry.
3. `ArticlePublisherProps.actorEmail?: string` added.
4. UI now passes `actorEmail` (with back-compat fallback to `articleDraft.AuthorEmail`) into:
   - `orchestrator.run({ actorEmail })` for publish / republish / preview,
   - `orchestrator.archive({ actorEmail })` and `.withdraw({ actorEmail })` for lifecycle transitions,
   - the generic `newHistoryRow(..., actorEmail ?? articleDraft.AuthorEmail, ...)` call for non-archive/withdraw state flips.
5. `PublishRequest.actorEmail?: string` added on the orchestrator. The publish / republish code path now writes `ActorEmail: req.actorEmail ?? context.article.AuthorEmail` on the workflow-history row. `archive` / `withdraw` already took `actorEmail`; they now receive the operator email from the UI instead of the article author.

## Files changed
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts` — two new pins
- `apps/hb-webparts/config/package-solution.json` — version bump
- `docs/architecture/plans/MASTER/spfx/publisher/closure/04-closure-actor-attribution.md` — this doc

No list contracts changed — `HB Article Workflow History.ActorEmail` is already a string column, and both sources of the value were always emails. The prompt constraint "do not broaden into general auth redesign" is honored: no new tokens, no new identity services, just thread the existing `identity.email` into the existing `ActorEmail` slot.

## Proof
- `publishOrchestrator.test.ts` — new tests:
  - "stamps workflow-history ActorEmail with the acting operator, not the article author" — publishes with `AuthorEmail='alice.author@example.com'` + `actorEmail='bob.operator@example.com'`; asserts `history.ActorEmail === 'bob.operator@example.com'` and explicitly `!== 'alice.author@example.com'`.
  - "falls back to article AuthorEmail when the caller did not thread an operator (back-compat)" — omits `actorEmail`; asserts `history.ActorEmail` falls back to the article author. Pins the graceful-degradation path so existing callers / tests that predate the prop keep working.

## No regression
- `pnpm exec vitest run publishOrchestrator` — 17 passing + 2 pre-existing baseline failures (unchanged). +2 net new passing tests.
- `pnpm exec tsc --noEmit` — clean.

## Out of scope
Per the prompt's constraint, this is not a general auth redesign. The orchestrator intentionally keeps the author-fallback behavior so existing callers, older tests, and any future non-UI caller (automation, scheduled jobs) still produce a well-formed audit row.
