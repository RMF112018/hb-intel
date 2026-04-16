# Prompt 05 — Structure binding lineage and regeneration audit

## Objective

Replace the remaining thin binding-lineage approach in which regenerate supersession is still preserved mainly as structured JSON embedded inside freeform workflow-history note text.

The live repo has already improved this area by explicitly capturing `supersededBinding` and stamping it into `ActionNote`.
That partial mitigation is real.
It is still not durable enough for closure-grade traceability.

## Why this matters technically

The current binding model is intentionally one-row authoritative per `ArticleId`.
That is acceptable.
But when regenerate replaces the current page identity, the prior binding/page identity needs durable structured retention.

Today repo truth still relies too heavily on:

- one-row authoritative overwrite in `HB Article Destination Pages`
- supersession data carried mainly through `HB Article Workflow History.ActionNote`
- downstream operators or tooling effectively having to parse prose/blob text to understand what was superseded

That is still too thin for durable audit and support.

## Governing repo surfaces

At minimum inspect and keep aligned:

- `apps/hb-publisher/src/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-publisher/src/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherContracts.ts`
- repo-truth provisioning/schema artifacts that own workflow history and related publisher lists
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Current repo-truth reality you must preserve

The live repo already has meaningful progress here:

- the current binding list is intentionally one authoritative row per `ArticleId`
- regenerate already captures prior binding identity before overwrite
- `publishOrchestrator.test.ts` already proves that prior identity is pushed into workflow-history note text
- archive/withdraw and in-place republish already have deliberate lifecycle behavior

Do not throw away those improvements.
Build on them.

## Exact defect to close

Repo truth still behaves like this on regenerate:

- previous binding identity is captured in code
- current binding row is overwritten in place
- durable history of the supersession lives mainly in freeform `ActionNote` text

That is still insufficiently structured.

## Required end state

Implement a **structured lineage model** for binding supersession.

Preferred posture:

1. first attempt to extend `HB Article Workflow History` with structured lineage fields
2. only introduce a dedicated binding-history child list if exhaustive repo-truth review proves the workflow-history surface cannot carry the required structure cleanly

Either way, the result must let operators and code query lineage without parsing opaque note text.

## Minimum structured lineage data to preserve

At minimum preserve these fields for regenerate supersession:

- article identity
- prior binding id
- prior page id
- prior page name
- prior page url
- new binding id
- new page id
- new page name
- new page url
- action timestamp
- actor identity if already available in the lifecycle surface

You may add more if needed, but do not omit the core before/after identity.

## Important design guidance

### Preserve the one-row current-binding model
Do not redesign `HB Article Destination Pages` into a full history table unless repo truth absolutely forces it.
This prompt is about lineage structure, not about replacing the current-binding table with a history store.

### Keep lifecycle truthfulness intact
Do not regress:
- create
- in-place republish
- regenerate
- archive
- withdraw
- late-failure compensation

### Backward compatibility
If freeform note text still carries a human-readable summary, that is acceptable as a secondary narrative.
It must no longer be the primary durable machine-readable lineage record.

## Non-negotiable rules

- do not leave structured lineage trapped only in `ActionNote`
- do not add speculative analytics or reporting architecture
- do not widen this into destination expansion work
- do not silently break existing regenerate test intent; replace it with stronger structured assertions

## Test requirements

Prove closure with tests covering at minimum:

1. regenerate writes structured prior/new binding identity, not only freeform note text
2. in-place republish does not falsely emit supersession lineage
3. create does not falsely emit supersession lineage
4. archive/withdraw still behave correctly after the schema/model change
5. any legacy human-readable note text is secondary, not the only durable source

## Closure notes required

Write concise closure notes that state:

- which structure was chosen
- why it was chosen over the alternatives
- what exact lifecycle events emit structured lineage
- which tests prove lineage is no longer trapped primarily in freeform note text
