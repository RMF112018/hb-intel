# Phase 10 · Prompt 01 closure — Normalize resolution-context read failures

## Summary
`buildPublishResolutionContext` no longer throws on infrastructure-level repository read failures. Every expected resolution-stage seam now returns a typed failure, giving `publishOrchestrator.run`, `useDraftLifecycle`, and `buildPublisherPreview` one uniform failure contract.

## Final failure union
```ts
export type BuildResolutionContextResult =
  | { ok: true; context: PublishResolutionContext }
  | { ok: false; reason: 'articleNotFound'; message: string }
  | {
      ok: false;
      reason: 'templateResolutionFailed';
      message: string;
      templateResolution?: Extract<TemplateResolutionResult, { ok: false }>;
    }
  | {
      ok: false;
      reason: 'repositoryReadFailed';
      failedRead: 'articles' | 'templateRegistry' | 'teamMembers' | 'media' | 'pageBindings';
      message: string;
      cause?: unknown;
    };
```

The `repositoryReadFailed.message` always contains the seam name and the underlying error text, so operators/developers can act on it directly.

## Seams now normalized
All five resolution reads are wrapped in a single local `safeRead` helper:
- `repositories.articles.getByArticleId(articleId)` → `failedRead: 'articles'`
- `repositories.templateRegistry.listActive()` → `failedRead: 'templateRegistry'`
- `repositories.teamMembers.listByArticle(articleId)` → `failedRead: 'teamMembers'`
- `repositories.media.listByArticle(articleId)` → `failedRead: 'media'`
- `repositories.pageBindings.getByArticleId(articleId)` → `failedRead: 'pageBindings'`

Existing typed paths (`articleNotFound`, `templateResolutionFailed`) are preserved exactly.

## Orchestrator behavior
`publishOrchestrator.run` maps any `!resolution.ok` outcome (including `repositoryReadFailed`) to:
- `ok: false`
- `stage: 'resolution'`
- human-usable `message` (seam-tagged for read failures)
- `HB Article Publishing Errors` append for non-preview modes, now enriched with `Title` / `Destination` from the pre-resolution article read when available (the milestone-gate pre-read). If that pre-read also failed or returned nothing, the append still records `ArticleId` + operation + error summary.
- Preview mode still performs zero writes — no page creation, no binding, no error-log row.

## Consumer impact
- `useDraftLifecycle.ts` reload already consumed `ctx.ok` / `ctx.message`; it now receives typed `repositoryReadFailed` instead of a thrown infrastructure exception, so the authoring-status banner surfaces a stable, seam-tagged message without depending on the generic outer `catch`.
- `previewBuilder.PreviewOutcomeFailure.reason` union was extended to include `'repositoryReadFailed'`.

## Changed files
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/preview/previewBuilder.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.test.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts`
- `apps/hb-publisher/config/package-solution.json` (version bump to 1.0.0.8)

## Tests added
Resolution builder (one per seam):
- articles throws → `repositoryReadFailed` / `failedRead: 'articles'` / message contains underlying error
- templateRegistry throws → `failedRead: 'templateRegistry'`
- teamMembers throws → `failedRead: 'teamMembers'`
- media throws → `failedRead: 'media'`
- pageBindings throws → `failedRead: 'pageBindings'`

Orchestrator:
- Non-preview resolution read failure returns `stage: 'resolution'` and appends an `HB Article Publishing Errors` row whose `Title` prefix contains the stage and whose `ErrorSummary` contains the failed seam; Title/Destination are populated from the pre-resolution article load.
- Preview-mode resolution read failure returns `stage: 'resolution'` with no writes to `HB Article Publishing Errors`, page creation, or binding upsert.

## Verification
- `npx vitest run src/data/publisherAdapter/publishResolutionContext.test.ts src/data/publisherAdapter/publishOrchestrator.test.ts` → 38/38 pass.
- `npx tsc --noEmit` in `apps/hb-publisher` → clean.
- Pre-existing 6 failures in `publisherEndToEnd.test.ts` exist on `main` prior to this change (verified by stashing this work) and are unrelated to the resolution contract.

## Proof that non-preview resolution failures are observable without raw throws
- `publishResolutionContext.test.ts` proves the builder returns a typed `repositoryReadFailed` for every seam rather than rejecting.
- `publishOrchestrator.test.ts` proves the orchestrator both surfaces `stage: 'resolution'` and writes an identifying row to `HB Article Publishing Errors` for non-preview modes, without leaking a raw exception.

## Non-goals (intentional)
- No changes to publish compensation logic.
- No changes to archive/withdraw lifecycle.
- No changes to validation or policy gating; this is purely failure-shape normalization.
