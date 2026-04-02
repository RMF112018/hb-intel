# Prompt-04 — Graph Service Expansion and Test Hardening

## Objective

Expand the backend Graph service from provisioning-era helpers into a Phase 9-capable Entra administration service with tests, mocks, and explicit boundary handling.

## Important execution rules

- Do not re-read files still in context unless necessary.
- Extend existing patterns instead of discarding them without cause.
- Prefer stable Microsoft Graph v1.0 APIs unless a documented exception is necessary.
- Keep the service boundary explicit: service = platform-specific execution adapter, not full workflow orchestration.

## Primary repo targets

Inspect and update as appropriate:
- `backend/functions/src/services/graph-service.ts`
- `backend/functions/src/services/graph-service.test.ts`
- `backend/functions/src/services/service-factory.ts`

Create adjacent supporting files only if needed and only where the repo’s existing backend pattern clearly supports them.

## Required implementation outcomes

### A. Expand the Graph service contract
Add phase-appropriate methods for:
- user lookup/search/read
- user create
- user update for approved property sets
- account enable/disable if phase-approved by Prompt-03
- user delete if phase-approved by Prompt-03
- group lookup/search/read
- group create
- group update
- group delete
- add/remove members
- any rollout-critical access setup helpers approved by the action catalog

### B. Keep the service boundary clean
The service must:
- normalize Graph requests/responses,
- centralize Graph fetch/auth behavior,
- centralize error normalization where appropriate,
- expose phase-appropriate typed methods,
- support mock mode / testability.

The service must **not** become:
- a UI-state manager,
- a full orchestration engine,
- or a catch-all business workflow object.

### C. Add or refine typed error categories
Add explicit errors or error metadata for categories such as:
- insufficient Graph permission / consent
- unsupported operation due to phase boundary
- protected / privileged / constrained target
- not found
- conflict / duplicate
- validation / bad request
- transient Graph failure

### D. Harden tests
Add or update focused unit tests covering:
- existing provisioning-oriented methods still working,
- new user/group methods,
- permission-gating or phase-gating behavior,
- error normalization,
- mock behavior / deterministic tests.

## Documentation requirement

If the Graph service contract becomes materially broader, update any directly relevant README or local guidance that describes backend service responsibilities.

## Validation

Run the smallest meaningful set, likely:
- focused service unit tests,
- TypeScript/build checks for touched areas.

Document what was run in your working notes / commit summary if that is your normal repo practice.

## Completion condition

Stop when the Graph service expansion is implemented, tested, and consistent with the Phase 9 action catalog and permission matrix.
Do not build orchestration/UI in this prompt.
