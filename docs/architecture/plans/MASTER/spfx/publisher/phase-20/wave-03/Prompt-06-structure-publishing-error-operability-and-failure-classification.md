# Prompt 06 — Structure publishing-error operability and failure classification

## Objective

Harden the `HB Article Publishing Errors` surface so backend failure records are queryable by structured stage and subsystem rather than relying primarily on coarse `Operation` values plus prefixed Title/ErrorSummary prose.

This prompt is newly added because the attached package under-scoped a real backend operability gap.

## Why this matters technically

The live repo already records publish-side and lifecycle-side failures into `HB Article Publishing Errors`.
That is good.
But repo truth still shows a structurally weak error surface:

- the list schema is coarse
- `Operation` is intentionally narrow
- `publishOrchestrator.recordPublishingError(...)` has to prefix `Title` with `${context}.${stage}` to preserve detail
- detailed subsystem meaning lives mostly in prose inside `Title` and `ErrorSummary`

That is technically functional, but too weak for durable support operations, filtering, triage, and audit.

## Governing repo surfaces

At minimum inspect and keep aligned:

- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- any writer/schema/provisioning artifacts for `HB Article Publishing Errors`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current repo-truth reality you must preserve

The current system already has valuable behavior that must remain:

- failures are appended best-effort without masking the primary typed outcome
- publish vs lifecycle context is already distinguished in code
- late-failure compensation and reconciliation are already explicitly classified in orchestrator results and tests

Do not lose that behavior.
Structure it.

## Exact defect to close

Repo truth still depends on these weak patterns:

- stage detail is encoded into `Title` prefix text
- subsystem detail is inferred from `ErrorSummary` prose
- the tenant error list does not appear to carry structured fields for failure stage, subsystem, or lifecycle context
- support filtering therefore depends too heavily on text parsing and naming discipline

## Required end state

Implement a **structured publishing-error model** using the existing `HB Article Publishing Errors` list unless exhaustive review proves that list cannot carry the needed fields cleanly.

Required outcome:

1. failure stage is stored in a structured field
2. lifecycle/publish context is stored in a structured field
3. failure subsystem or source surface is stored in a structured field
4. any needed severity/retry-operability metadata is stored in structured form where it materially improves supportability
5. the orchestrator writes those fields directly
6. row mappers/repositories understand the new fields
7. tests prove the structured data is populated

## Minimum structured fields to consider

At minimum evaluate and add the fields needed for:

- failure stage (`resolution`, `validation`, `pagePublish`, `bindingWrite`, `articleSync`, `historyAppend`, `bindingLookup`, `pageUnpublish`, `bindingUpdate`, `articleUpdate`, etc.)
- context (`create`, `republish`, `preview`, `archive`, `withdraw`, `manualTransition`)
- subsystem (`templateRegistry`, `pageBinding`, `workflowHistory`, `articles`, `pageLifecycle`, `readModel`, or another bounded equivalent)
- actor email if that materially improves auditability on this surface
- retry handling metadata only if it materially strengthens current operability and remains bounded

Do not add fields casually.
Add the minimum structured set required to stop relying mainly on prose.

## Important design guidance

### Keep `Operation` only if still useful
If the existing coarse `Operation` field remains useful for compatibility or high-level grouping, preserve it.
But it must no longer be the only structured dimension.

### Preserve best-effort write semantics
A failure to append to the error list must still not mask the primary typed failure result.

### Do not widen into general analytics
This is about backend observability and supportability for the current publisher lifecycle, not about BI/reporting work.

## Non-negotiable rules

- do not stop at changing the `Title` format
- do not add new prose and call that “structured”
- do not create a whole new error platform if the existing list can be hardened cleanly
- do not regress current publish-orchestrator tests that prove stage classification; strengthen them to assert structured fields too

## Test requirements

Prove closure with tests covering at minimum:

1. a publish-side failure writes structured stage/context/subsystem data
2. a lifecycle failure writes structured stage/context/subsystem data
3. existing coarse operation behavior remains compatible if retained
4. failure append remains best-effort and does not mask the primary failure result
5. row mappers/repositories can read the hardened error rows correctly

## Closure notes required

Write concise closure notes that state:

- which structured fields were added and why
- how the orchestrator now classifies failure records
- whether `Operation` was preserved and how it is now used
- which tests prove the error surface no longer depends primarily on Title/ErrorSummary prose
