# Prompt-04 — Backend Safety Policy and Enforcement Rails

## Objective

Implement the backend-side safety enforcement substrate so risky admin actions cannot bypass Phase 11 controls through UI shortcuts or direct backend calls.

## Important execution rules

- Keep privileged enforcement in `backend/functions`.
- Do not turn this into a full generalized future control-plane rewrite.
- Reuse the provisioning/backend patterns already present where healthy.
- If a full Phase 10 live-config registry is not present, start with code-defined safety policy and document the seam for later governed overrides.

## Inputs

Use:
- Prompt-01 audit
- Prompt-02 doctrine docs
- Prompt-03 shared contracts
- `backend/functions/src/**` files relevant to auth, orchestration, request handling, and action execution

## Scope of work

Add the minimal reusable backend framework needed for:
- action manifest lookup / registry
- mapping action type to safety requirements
- server-side evaluation of whether preview is required
- server-side evaluation of whether dry-run is required/available
- server-side evaluation of whether confirmation is required
- enforcement of scope restrictions
- evidence capture hooks
- post-run validation and recovery-guidance hooks
- explicit refusal if an execution request skips required safety steps

This can be implemented as:
- middleware,
- service-layer guards,
- orchestrator helper(s),
- action registry helpers,
- or another repo-consistent pattern

Use the healthiest existing backend pattern you find.

## Deliverables

1. Backend enforcement code in `backend/functions/**`
2. Supporting tests
3. A new doc:
   - `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-backend-safety-enforcement.md`

## Required functional outcomes

The backend must be able to answer or enforce, for a given admin action:
- what risk tier it is,
- whether preview is mandatory,
- whether dry-run is required/available,
- whether explicit confirmation is required,
- whether the scope is too broad,
- what evidence must be recorded,
- what validation/recovery steps must follow execution.

## Boundary rules

- Do not embed UI concerns into backend policy.
- Do not make the backend trust an unverified client claim that preview already happened.
- Do not bypass the existing auth posture.

## Validation

Use the smallest credible backend validation set, likely including:
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`

Add more only if your touched scope requires it.

## Completion condition

Stop after backend enforcement rails, tests, docs, and validation are complete.
