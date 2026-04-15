# Publisher Backend Remediation Prompt Package · Updated

## Package purpose
This package is the narrowed, repo-truth replacement for the prior Publisher backend remediation package. It is based on the current `main` branch shape of `apps/hb-publisher`, not on historical closure claims.

## Execution order
1. `Prompt-01-Normalize-resolution-context-read-failures-and-error-observability.md`
2. `Prompt-02-Close-late-publish-split-state-windows-across-page-binding-master-and-history.md`
3. `Prompt-03-Redesign-archive-withdraw-failure-handling-for-fail-truthful-lifecycle-state.md`
4. `Prompt-04-Extract-and-harden-draft-save-orchestration-for-truthful-master-child-persistence.md`

## Operating rules for the local code agent
- Work in the live local HB Intel repo on `main`.
- Target the current standalone Publisher package at `apps/hb-publisher`.
- Treat current repo truth as authoritative over prior audit packages, closure notes, or historical assumptions.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Close one prompt completely before moving to the next unless the prompt explicitly requires a shared prerequisite.
- Do not represent partial completion as closure.
- Do not defer required work into “later,” “follow-on,” or “future hardening” if it is needed for truthful closure now.
- Update or add closure notes under `docs/architecture/plans/MASTER/spfx/publisher/closure/` for every prompt.
- Prefer targeted tests close to the changed seam, then run the narrowest useful integration proof that exercises the full path.
- Preserve existing valid behavior unless the prompt explicitly directs you to change the behavior model.

## Validation posture
The root repo test script is selective and does not, by itself, prove Publisher closure. For this package, each prompt must include targeted Publisher validation, and the final step in each prompt must state the exact commands run and the exact files covered.

## Recommended validation commands
Adjust only if repo drift requires it.

```bash
pnpm vitest run apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.test.ts apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts apps/hb-publisher/src/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts apps/hb-publisher/src/data/publisherAdapter/publisherWriters.test.ts
pnpm turbo run lint --filter=hb-publisher...
pnpm turbo run check-types --filter=hb-publisher...
```

## Package contents
- `Plan-Summary.md`
- `Package-Delta-Report.md`
- `Coverage-Matrix.md`
- `Repo-Truth-Crosswalk.md`
- `Research-Notes.md`
- 4 implementation prompts

## No-deferral statement
This package contains no required-work deferrals. Logical sequencing is allowed. Required closure work is not.
