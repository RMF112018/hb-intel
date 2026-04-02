# Prompt-04 — Straight-Through Saga Execution and Failure Model

## Objective

Refine the provisioning saga so it remains streamlined for normal execution while producing a clearer and more resilient failure model.

## Important execution rules

- Do not re-read files already in current context unless necessary.
- Preserve the current provisioning-saga foundation.
- Focus on hardening execution behavior, classification, and evidence — not on replacing the orchestration architecture.
- Keep “seamless unless failure occurs” as the controlling principle.

## Inputs

Use:
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/provisioningSaga/steps/**`
- `backend/functions/src/services/table-storage-service.ts`
- any provisioning models in `@hbc/models`
- Prompt-03 validation work
- the Phase 7 hardening baseline

## Scope of work

Refine the provisioning saga around:

- clearer step-level failure classification,
- explicit distinction between transient, retryable, deferred, and terminal states,
- better persistence of step outcomes and timing,
- better capture of retry/defer/escalation context,
- and cleaner propagation of failure reasons for downstream UI and run history usage.

## Required implementation outcomes

1. Step and run states are more intelligible for operators and docs.
2. Terminal failures retain enough evidence to support clear recovery guidance.
3. Deferred or retryable states are distinguishable from hard failures.
4. Normal runs still move straight through without unnecessary checkpoints.
5. The saga still honors idempotency and compensation expectations where already present.

## Documentation requirement

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/provisioning-failure-classification-and-run-state-model.md`

Document:
- state categories,
- status transitions,
- retry/defer/escalation semantics,
- and the intended meaning of each operator-visible provisioning state.

## Validation

Add/update targeted saga tests proving:
- healthy runs stay streamlined,
- retryable/deferred failures are classified correctly,
- terminal failures retain expected evidence,
- and regression does not break existing core flow.

## Completion condition

Stop after saga hardening, docs, and tests are complete.
Do not yet implement UI changes in this prompt.
