# Prompt 05 — Harden archive and withdraw destination-page lifecycle

## Objective
Make archive and withdraw reliable visibility-control lifecycle actions rather than control-plane-only state changes.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts``

## Primary files to inspect and change
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`

## Problem to close
Archive and withdraw currently update article and binding state but leave the destination page live, which creates stale-public-visibility risk.

## Required work
- Define and implement the expected destination-page behavior on archive and withdraw.
- Prefer an actual platform action rather than a comment-only workaround if the SharePoint seam supports it.
- If a direct platform action is truly blocked, implement the strongest feasible automated control-plane behavior and document the exact hosted follow-up action required.
- Ensure binding state, article state, and workflow history remain consistent with the chosen archive/withdraw behavior.
- Do not leave archive/withdraw semantics ambiguous.

## Required tests
- Add or update the narrowest set of tests needed to prove this prompt is closed.
- Prefer existing test surfaces near the changed implementation.
- Do not rely on unproven manual reasoning where deterministic tests can be added.

## Constraints
- This is a bounded remediation task, not a general redesign.
- Do not make unrelated refactors.
- Do not preserve legacy behavior if it conflicts with tenant-schema truth or workflow correctness.
- Keep naming aligned with `Article Publisher` and the `HB Article*` list family.

## Acceptance criteria
- Archive and withdraw no longer leave the live destination page unintentionally exposed without an explicit documented reason.
- Control-plane records and destination-page lifecycle behavior match one another.
- Tests or bounded seam tests prove the chosen behavior.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/05-Closure-Archive-and-withdraw-destination-page-lifecycle.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks
