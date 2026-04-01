# Prompt-1-03 — Add Regression Tests and Release Gates for Handler Wiring

## Objective

Add machine-checkable enforcement so the Backend Boundary Enforcement Gap cannot silently return.

## Context

The prior boundary tests proved:

- dedicated host imports only in-scope route families
- scoped Project Setup service factory exists and excludes CRUD services

But they did **not** prove:

- Project Setup handler modules actually use the scoped factory
- handler-level boundary enforcement remains true over time

This prompt closes that test-coverage gap.

## Required working rules

- Treat repo truth as authoritative.
- Do not widen the test scope unnecessarily.
- Prefer direct, intention-revealing regression guards.
- Do not rely only on docs or comments; add machine-checkable proof.

## Files to inspect and update

- `backend/functions/src/test/project-setup-host-boundary.test.ts`
- `backend/functions/src/test/release-gates.test.ts`
- any additional backend boundary or infra tests if truly necessary
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` if the manifest needs to reflect handler-level enforcement

## Required test additions

1. Add a handler-level assertion that the in-scope Project Setup handler modules do **not** import the monolithic `createServiceFactory()`.
2. Add a handler-level assertion that the in-scope Project Setup handler modules do use the chosen scoped or host-approved factory path.
3. If the chosen implementation uses host-aware resolution, add tests that explicitly verify the selection mechanism.
4. Add or extend release-gate coverage if this boundary should now be part of release gating.

## In-scope handler files for test enforcement

- `functions/projectRequests/index.ts`
- `functions/provisioningSaga/index.ts`
- `functions/acknowledgments/index.ts`
- `functions/cleanupIdempotency/index.ts`
- `functions/timerFullSpec/handler.ts`

## Required output

Update the implementation note:

`docs/architecture/reviews/project-setup-backend-boundary-remediation-implementation.md`

and add a new testing addendum section that records:

1. tests added
2. what each test proves
3. exact suite results
4. any remaining blind spots

## Acceptance criteria

- There is now a machine-checkable test that fails if Project Setup handlers regress back to the monolithic factory.
- The tests prove handler wiring, not just host artifact structure.
- Release-gate posture is updated if appropriate.
- Test evidence is documented.
