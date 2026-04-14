# Prompt 04 — Make archive/withdraw atomic and compensating

## Objective

Stabilize the archive/withdraw lifecycle so it does not leave page, binding, history, and master article state out of sync when a late-stage failure occurs.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`

## Files and code paths to inspect

- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `any lifecycle outcome types / tests impacted by archive-withdraw compensation`

## Exact defect to close

Archive/withdraw currently allows:
- page demotion
- binding update
- workflow-history append
- then article update

If the article update fails after the prior side effects succeed, the system is left split across page/binding/history/article. This is not operationally acceptable.

## Required implementation outcome

Refactor archive/withdraw toward the same discipline as the publish path.

Required outcome:
- the lifecycle must not write a false-forward history record ahead of master-state closure
- late-stage failures must either:
  1. be prevented by safer ordering, or
  2. be compensated with explicit rollback logic and surfaced clearly
- the final outcome type must accurately report what happened

You may reorder steps and/or add compensation, but keep the change bounded to archive/withdraw lifecycle integrity.

## Validation / proof of closure requirements

You must prove:
1. article update failure cannot leave a misleading success-shaped history trail
2. article, binding, and page outcomes are either consistent or explicitly compensated
3. failure results clearly state whether rollback was attempted and whether it succeeded
4. publish/republish path behavior was not regressed

Add tests that simulate:
- article update failure after binding/page work
- history append failure
- compensation success/failure where relevant

## Deliverables / closure docs to create

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/closure-make-archive-withdraw-atomic-and-compensating.md`
- include ordered sequence diagrams or step tables for old vs new lifecycle behavior

## Guardrails

- Work in the live local repo.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Conduct an exhaustive scrub of the affected code path before making changes.
- Prove closure of this issue before moving to the next prompt.
- Do not make unrelated changes.
