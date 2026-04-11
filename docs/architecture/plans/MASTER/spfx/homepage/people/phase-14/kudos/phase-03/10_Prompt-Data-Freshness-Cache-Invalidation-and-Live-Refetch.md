# Prompt — Data Freshness, Cache Invalidation, and Live Refetch

## Objective
Fix the current stale-after-action behavior by adding explicit invalidation/refetch/reconciliation for the shared People & Culture data layer and the HB Kudos mutation flows.

## Repo truth
Work directly against the live repo:
- `https://github.com/RMF112018/hb-intel`

Do not re-read files that are already in your current context or memory.

## Governing authority
Use repo truth and at minimum:
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`


## Scope
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`

## Non-negotiable requirements
- Do not leave a 5-minute shared cache stale after governance actions.
- Support refresh after submit, celebrate, approve, reject, revision request, schedule, unschedule, pin, unpin, feature, unfeature, remove, restore, claim, and reassign.
- Avoid unnecessary full-page reloads.
- Keep the data model maintainable and explicit.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- cache invalidation or refetch mechanism
- mutation integration changes in employee and companion flows
- tests covering stale-data regression

## Verification
- prove queue/archive/detail state updates after successful mutations
- prove no stale moderation state remains visible after common actions
- run touched-scope tests
